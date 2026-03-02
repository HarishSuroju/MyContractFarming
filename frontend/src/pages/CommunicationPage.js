import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { profileAPI, messageAPI } from '../services/api';
import socket from '../socket';

const CommunicationPage = () => {
  const { t } = useTranslation();
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const typingTimeoutRef = useRef(null);
  const [callStatus, setCallStatus] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const [isCaller, setIsCaller] = useState(false);
  const [callType, setCallType] = useState(null); // 'audio' | 'video'
  const [incomingCall, setIncomingCall] = useState(null); // { from, offer, hasVideo }
  const [currentUserId, setCurrentUserId] = useState(null);

  console.log('CommunicationPage rendered with userId:', userId);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null);
  const localStreamRef = useRef(null);

  useEffect(() => {
    console.log('useEffect triggered with userId:', userId);
    if (userId) {
      fetchUserProfile();
    } else {
      console.log('userId is falsy, not fetching profile');
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setCurrentUserId(storedUserId);
      initialiseSocket(storedUserId);
      loadConversation();
    }

    return () => {
      endCallInternal(true);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (socket && socket.connected) {
        socket.off('incoming-call');
        socket.off('call-answered');
        socket.off('ice-candidate');
        socket.off('call-ended');
        socket.off('call-rejected');
        socket.off('receive-message');
        socket.off('user-typing');
        socket.off('message-delivered');
        socket.off('message-read-confirmation');
        socket.disconnect();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const loadConversation = async () => {
    if (!userId || !currentUserId) return;
    
    try {
      const response = await messageAPI.getConversation(userId);
      if (response.data && response.data.data && response.data.data.messages) {
        const formattedMessages = response.data.data.messages.map(msg => ({
          id: msg._id,
          text: msg.content,
          sender: msg.senderId._id === currentUserId ? 'me' : 'other',
          timestamp: new Date(msg.createdAt).toLocaleTimeString(),
          isRead: msg.isRead,
          readAt: msg.readAt
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      console.log('Fetching user profile for ID:', userId);
      const response = await profileAPI.getUserProfile(userId);
      console.log('API Response:', response);
      console.log('Response data:', response.data);
      
      // Check the correct path for user data based on API response structure
      if (response.data && response.data.data && response.data.data.user) {
        console.log('Setting user:', response.data.data.user);
        setUser(response.data.data.user);
      } else if (response.data && response.data.user) {
        // Fallback to old structure
        console.log('Setting user (fallback):', response.data.user);
        setUser(response.data.user);
      } else {
        console.log('No user data found in response');
        console.log('Response structure:', JSON.stringify(response.data, null, 2));
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !userId || !currentUserId) return;
    
    try {
      // Send via API
      const response = await messageAPI.sendMessage({
        receiverId: userId,
        content: message.trim()
      });
      
      if (response.data && response.data.data && response.data.data.message) {
        const newMessage = {
          id: response.data.data.message._id,
          text: response.data.data.message.content,
          sender: 'me',
          timestamp: new Date(response.data.data.message.createdAt).toLocaleTimeString(),
          isRead: false
        };
        
        setMessages(prev => [...prev, newMessage]);
        setMessage('');
        
        // Send via Socket.IO for real-time delivery
        socket.emit('send-message', {
          to: userId,
          from: currentUserId,
          content: message.trim(),
          messageId: response.data.data.message._id
        });
        
        // Stop typing indicator
        handleTyping(false);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Fallback to local message if API fails
      const fallbackMessage = {
        id: Date.now(),
        text: message.trim(),
        sender: 'me',
        timestamp: new Date().toLocaleTimeString(),
        isRead: false
      };
      setMessages(prev => [...prev, fallbackMessage]);
      setMessage('');
    }
  };

  const initialiseSocket = (userIdForSocket) => {
    if (!socket) return;
    if (!socket.connected) {
      socket.connect();
    }

    socket.once('connect', () => {
      socket.emit('join', userIdForSocket);
    });

    socket.on('incoming-call', (data) => {
      if (!data || !data.from || !data.offer) return;
      setIncomingCall({
        from: data.from,
        offer: data.offer,
        hasVideo: !!data.hasVideo,
      });
      setCallStatus('Incoming call...');
    });

    socket.on('call-answered', async (data) => {
      try {
        if (!peerConnectionRef.current) return;
        if (!data || !data.answer) return;
        await peerConnectionRef.current.setRemoteDescription(
          new RTCSessionDescription(data.answer)
        );
        setIsInCall(true);
        setCallStatus('Call connected');
      } catch (err) {
        console.error('Error handling call-answered:', err);
        setCallStatus('Error connecting call');
      }
    });

    socket.on('ice-candidate', async (data) => {
      try {
        if (!peerConnectionRef.current) return;
        if (!data || !data.candidate) return;
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(data.candidate)
        );
      } catch (err) {
        console.error('Error adding ICE candidate:', err);
      }
    });

    socket.on('call-ended', (data) => {
      endCallInternal(true);
      setCallStatus(data?.reason || 'Call ended by other user');
    });

    socket.on('call-rejected', () => {
      endCallInternal(true);
      setCallStatus(t('communication.callRejected'));
    });

    // Real-time messaging listeners
    socket.on('receive-message', (data) => {
      if (data.from === userId) {
        const newMessage = {
          id: data.messageId,
          text: data.content,
          sender: 'other',
          timestamp: new Date(data.timestamp).toLocaleTimeString(),
          isRead: false
        };
        setMessages(prev => [...prev, newMessage]);
        
        // Mark message as read
        markMessageAsRead(data.messageId);
      }
    });

    socket.on('user-typing', (data) => {
      if (data.from === userId) {
        setOtherUserTyping(data.isTyping);
        
        // Auto-hide typing indicator after timeout
        if (data.isTyping) {
          setTimeout(() => {
            setOtherUserTyping(false);
          }, 5000);
        }
      }
    });

    socket.on('message-delivered', (data) => {
      if (data.to === userId) {
        // Update message delivery status if needed
        console.log('Message delivered:', data.messageId);
      }
    });

    socket.on('message-read-confirmation', (data) => {
      if (data.from === userId) {
        // Update message read status if needed
        console.log('Message read:', data.messageId);
      }
    });
  };

  const markMessageAsRead = async (messageId) => {
    if (!messageId) return;
    
    try {
      await messageAPI.markAsRead(messageId);
      
      // Send read confirmation via Socket.IO
      socket.emit('message-read', {
        to: userId,
        from: currentUserId,
        messageId: messageId
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  const createPeerConnection = () => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
      ],
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && currentUserId && userId) {
        socket.emit('ice-candidate', {
          to: userId,
          from: currentUserId,
          candidate: event.candidate,
        });
      }
    };

    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    };

    peerConnectionRef.current = pc;
    return pc;
  };

  const startCall = async (type) => {
    if (!currentUserId || !userId) {
      setCallStatus('Unable to start call. Please log in again.');
      return;
    }

    try {
      setIsCaller(true);
      setCallType(type);
      setCallStatus('Calling...');

      const pc = createPeerConnection();
      const constraints = { audio: true, video: type === 'video' };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      socket.emit('call-user', {
        to: userId,
        from: currentUserId,
        offer,
        hasVideo: type === 'video',
      });
    } catch (err) {
      console.error('Error starting call:', err);
      setCallStatus('Error starting call');
      endCallInternal(true);
    }
  };

  const handleAudioCall = () => {
    startCall('audio');
  };

  const handleVideoCall = () => {
    startCall('video');
  };

  const handleFarmVisit = () => {
    alert(t('Farm Visit Requested'));
  };

  const handleTyping = async (typing) => {
    if (!userId || !currentUserId) return;
    
    setIsTyping(typing);
    
    try {
      // Send typing status via API
      await messageAPI.setTyping({
        receiverId: userId,
        isTyping: typing
      });
      
      // Send via Socket.IO
      socket.emit('typing', {
        to: userId,
        from: currentUserId,
        isTyping: typing
      });
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setMessage(value);
    
    // Handle typing indicator
    if (value.trim() && !isTyping) {
      handleTyping(true);
    } else if (!value.trim() && isTyping) {
      handleTyping(false);
    }
    
    // Reset typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        handleTyping(false);
      }, 2000); // Stop typing indicator after 2 seconds of inactivity
    }
  };

  const handleAgreement = () => {
    navigate(`/agreement-summary/${userId}`);
  };

  const acceptIncomingCall = async () => {
    if (!incomingCall || !incomingCall.from || !incomingCall.offer || !currentUserId) {
      return;
    }

    try {
      setIsCaller(false);
      setCallType(incomingCall.hasVideo ? 'video' : 'audio');
      setCallStatus('Connecting call...');

      const pc = createPeerConnection();
      const constraints = { audio: true, video: incomingCall.hasVideo };
      const localStream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = localStream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = localStream;
      }

      localStream.getTracks().forEach((track) => {
        pc.addTrack(track, localStream);
      });

      await pc.setRemoteDescription(new RTCSessionDescription(incomingCall.offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);

      socket.emit('answer-call', {
        to: incomingCall.from,
        from: currentUserId,
        answer,
      });

      setIsInCall(true);
      setIncomingCall(null);
    } catch (err) {
      console.error('Error accepting call:', err);
      setCallStatus('Error accepting call');
      endCallInternal(true);
    }
  };

  const rejectIncomingCall = () => {
    if (incomingCall && incomingCall.from && currentUserId) {
      socket.emit('reject-call', {
        to: incomingCall.from,
        from: currentUserId,
      });
    }
    setIncomingCall(null);
    setCallStatus(t('Call Rejected'));
  };

  const endCallInternal = (skipSignal = false) => {
    try {
      if (!skipSignal && currentUserId && userId) {
        socket.emit('end-call', {
          to: userId,
          from: currentUserId,
          reason: 'Call ended',
        });
      }
    } catch (err) {
      console.error('Error emitting end-call:', err);
    }

    if (peerConnectionRef.current) {
      peerConnectionRef.current.onicecandidate = null;
      peerConnectionRef.current.ontrack = null;
      peerConnectionRef.current.close();
      peerConnectionRef.current = null;
    }

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    if (localVideoRef.current) {
      localVideoRef.current.srcObject = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    setIsInCall(false);
    setIsCaller(false);
    setCallType(null);
  };

  const handleEndCallClick = () => {
    endCallInternal(false);
    setCallStatus('Call ended');
  };

  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-gray-600">{t('profileDetail.loading')}</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 pt-16 flex items-center justify-center">
        <div className="text-xl text-red-600">{t('User Not Found')}</div>
      </div>
    );
  }

  const isFarmer = user.role?.toLowerCase() === 'farmer';
  const roleClass = isFarmer ? 'farmer' : 'contractor';
  const roleGradient = isFarmer ? 'from-green-500 to-green-600' : 'from-blue-500 to-blue-600';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200 pt-20 pb-12">
      <div className="max-w-6xl mx-auto px-6">

        {/* ===== Header Card ===== */}
        <div className={`relative rounded-3xl p-12 text-center shadow-2xl bg-gradient-to-br ${roleGradient} text-white overflow-hidden`}>
          <div className="absolute inset-0 bg-black/10 backdrop-blur-sm"></div>

          <div className="relative z-10">
            <div className="w-28 h-28 mx-auto mb-6 rounded-full flex items-center justify-center text-4xl font-bold bg-white/20 backdrop-blur-md border border-white/30 shadow-xl">
              {getInitials(user.name)}
            </div>
            <h1 className="text-4xl font-bold tracking-wide">{user.name}</h1>
            <p className="mt-3 text-lg opacity-90">
              {user.role === 'farmer' ? "🌾 Farmer" : "🏢 Contractor"}
            </p>
          </div>
        </div>

        {/* ===== Layout ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-10">

          {/* ===== Left Panel (Actions) ===== */}
          <div className="lg:col-span-1">
            <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/40">
              <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">
                Communication Hub
              </h3>

              {callStatus && (
                <div className="mb-6 text-center text-sm font-medium text-indigo-600">
                  {callStatus}
                </div>
              )}

              <div className="space-y-6">

                {/* 3D Button */}
                <button
                  onClick={handleAudioCall}
                  className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-purple-500 to-purple-700 shadow-lg hover:shadow-purple-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  📞 Audio Call
                </button>

                <button
                  onClick={handleVideoCall}
                  className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-indigo-500 to-indigo-700 shadow-lg hover:shadow-indigo-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  🎥 Video Call
                </button>

                {isInCall && (
                  <button
                    onClick={handleEndCallClick}
                    className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-red-500 to-red-700 shadow-lg hover:shadow-red-500/40 hover:-translate-y-1 transition-all duration-300"
                  >
                    ✖ End Call
                  </button>
                )}

                <button
                  onClick={handleFarmVisit}
                  className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg hover:shadow-orange-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  🏡 Request Farm Visit
                </button>

                <button
                  onClick={handleAgreement}
                  className="w-full py-4 rounded-2xl font-semibold text-white bg-gradient-to-r from-green-500 to-green-700 shadow-lg hover:shadow-green-500/40 hover:-translate-y-1 transition-all duration-300"
                >
                  📄 Create Agreement
                </button>

              </div>
            </div>
          </div>

          {/* ===== Chat Section ===== */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 flex flex-col h-[650px]">

              {/* Header */}
              <div className="px-8 py-6 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-2xl font-bold text-slate-800">Secure Chat</h3>
                {callType && (
                  <span className="px-4 py-1 text-sm font-semibold rounded-full bg-green-100 text-green-700">
                    {callType === 'video' ? "In Video Call" : "In Audio Call"}
                  </span>
                )}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-8 py-6 bg-gradient-to-b from-slate-50 to-white space-y-4">

                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-slate-400">
                    Start your secure conversation
                  </div>
                ) : (
                  messages.map(msg => (
                    <div
                      key={msg.id}
                      className={`max-w-md px-5 py-3 rounded-2xl shadow-md text-sm ${
                        msg.sender === 'me'
                          ? "ml-auto bg-gradient-to-r from-green-500 to-green-600 text-white shadow-green-300/40"
                          : "mr-auto bg-slate-200 text-slate-800"
                      }`}
                    >
                      {msg.text}
                      <div className="text-xs mt-2 opacity-70">
                        {msg.timestamp}
                      </div>
                    </div>
                  ))
                )}

                {otherUserTyping && (
                  <div className="text-sm italic text-slate-500">
                    Typing...
                  </div>
                )}

              </div>

              {/* Input */}
              <div className="p-6 border-t border-slate-200 flex gap-4 bg-white">
                <input
                  type="text"
                  value={message}
                  onChange={handleInputChange}
                  placeholder="Type your message..."
                  className="flex-1 px-6 py-3 rounded-2xl border border-slate-300 focus:ring-2 focus:ring-green-500 outline-none shadow-sm"
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />

                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-300 ${
                    message.trim()
                      ? "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg hover:-translate-y-1 hover:shadow-green-400/40"
                      : "bg-slate-300 text-slate-500 cursor-not-allowed"
                  }`}
                >
                  Send
                </button>
              </div>

            </div>
          </div>
        </div>

        {/* Back */}
        <div className="mt-10 text-center">
          <button
            onClick={() => navigate(-1)}
            className="px-8 py-3 rounded-2xl bg-slate-200 hover:bg-slate-300 font-semibold shadow-md transition-all"
          >
            Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default CommunicationPage;