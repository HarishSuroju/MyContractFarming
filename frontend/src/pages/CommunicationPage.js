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
    <div className="min-h-screen bg-gray-50 pt-16 pb-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className={`rounded-3xl p-10 text-center relative overflow-hidden bg-gradient-to-br ${roleGradient} text-white`}>
          <div className="absolute inset-0 bg-black bg-opacity-10"></div>
          
          <div className="relative z-10">
            <div className={`w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center text-3xl font-bold shadow-lg ${isFarmer ? 'bg-green-400 bg-opacity-25' : 'bg-blue-400 bg-opacity-25'} border-4 border-white border-opacity-40`}>
              {getInitials(user.name)}
            </div>
            
            <h1 className="text-3xl font-bold mb-3">{user.name}</h1>
            <span className="inline-block px-6 py-2 rounded-full font-bold text-lg bg-white bg-opacity-25 backdrop-blur-sm">
              {user.role === 'farmer' ? t('Farmer') : t('Contractor')}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Communication Options */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <h3 className="text-xl font-bold text-gray-800 mb-6 text-center">
                {t('Communication Options')}
              </h3>

              {callStatus && (
                <div className="mb-4 text-center text-sm text-gray-700">
                  {callStatus}
                </div>
              )}

              <div className="space-y-4">
                <button
                  onClick={handleAudioCall}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-purple-500 to-purple-600 border-2 border-purple-500 hover:from-purple-600 hover:to-purple-700 flex items-center justify-center gap-3"
                >
                  <span>📞</span> {t('Audio Call')}
                </button>
                
                <button
                  onClick={handleVideoCall}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-indigo-500 to-indigo-600 border-2 border-indigo-500 hover:from-indigo-600 hover:to-indigo-700 flex items-center justify-center gap-3"
                >
                  <span>🎥</span> {t('Video Call')}
                </button>

                {isInCall && (
                  <button
                    onClick={handleEndCallClick}
                    className="w-full py-3 px-6 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-red-500 to-red-600 border-2 border-red-500 hover:from-red-600 hover:to-red-700 flex items-center justify-center gap-3"
                  >
                    <span>✖</span> {t('End Call')}
                  </button>
                )}
                
                <button
                  onClick={handleFarmVisit}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-orange-500 to-orange-600 border-2 border-orange-500 hover:from-orange-600 hover:to-orange-700 flex items-center justify-center gap-3"
                >
                  <span>🏡</span> {t('Farm Visit')}
                </button>
                
                <button
                  onClick={handleAgreement}
                  className="w-full py-4 px-6 rounded-xl font-bold text-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 bg-gradient-to-r from-green-500 to-green-600 border-2 border-green-500 hover:from-green-600 hover:to-green-700"
                >
                  {t('Create Agreement')}
                </button>
              </div>
              
              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm text-blue-700">
                <p>{t('Future Features Note')}</p>
              </div>
            </div>
          </div>
          
          {/* Chat & Call Interface */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 shadow-lg h-full flex flex-col">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800">
                  {t('Chat Title')}
                </h3>
                {callType && (
                  <span className="mt-2 md:mt-0 inline-block px-3 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                    {callType === 'video' ? t('In Video Call') : t('In Audio Call')}
                  </span>
                )}
              </div>

              {(isInCall || incomingCall) && (
                <div className="mb-4 bg-black rounded-xl overflow-hidden relative h-64 md:h-72 flex items-center justify-center">
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                  />
                  <video
                    ref={localVideoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-32 h-24 md:w-40 md:h-28 object-cover rounded-lg border-2 border-white absolute bottom-3 right-3 bg-black"
                  />
                  {!isInCall && incomingCall && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex flex-col items-center justify-center text-white px-4">
                      <p className="text-lg font-semibold mb-4">
                        {incomingCall.hasVideo ? t('Incoming Video Call') : t('Incoming Audio Call')}
                      </p>
                      <div className="flex gap-4">
                        <button
                          onClick={acceptIncomingCall}
                          className="px-4 py-2 rounded-full bg-green-500 hover:bg-green-600 font-bold"
                        >
                          {t('Accept')}
                        </button>
                        <button
                          onClick={rejectIncomingCall}
                          className="px-4 py-2 rounded-full bg-red-500 hover:bg-red-600 font-bold"
                        >
                          {t('Reject')}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex-grow bg-gray-50 rounded-xl p-4 mb-4 h-96 overflow-y-auto">
                {messages.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    {t('Start Conversation')}
                  </div>
                ) : (
                  <div className="space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`p-3 rounded-xl max-w-xs md:max-w-md ${
                          msg.sender === 'me'
                            ? 'bg-green-500 text-white ml-auto'
                            : 'bg-gray-200 text-gray-800 mr-auto'
                        }`}
                      >
                        <div className="text-sm">{msg.text}</div>
                        <div className={`text-xs mt-1 flex items-center ${
                          msg.sender === 'me' ? 'text-green-100' : 'text-gray-500'
                        }`}>
                          <span>{msg.timestamp}</span>
                          {msg.sender === 'me' && msg.isRead && (
                            <span className="ml-2 text-xs">✓✓</span>
                          )}
                        </div>
                      </div>
                    ))}
                    {otherUserTyping && (
                      <div className="bg-gray-200 text-gray-800 p-3 rounded-xl max-w-xs md:max-w-md mr-auto">
                        <div className="text-sm italic text-gray-500">{t('communication.typingIndicator')}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={handleInputChange}
                  placeholder={t('Message Placeholder')}
                  className="flex-grow px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-green-500"
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!message.trim()}
                  className={`px-6 py-3 rounded-xl font-bold ${
                    message.trim()
                      ? 'bg-green-500 text-white hover:bg-green-600'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }`}
                >
                  {t('Send')}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate(-1)}
            className="py-3 px-6 rounded-xl font-bold text-gray-800 bg-gray-200 shadow hover:shadow-md transition-all duration-300 border-2 border-gray-300 hover:bg-gray-300"
          >
            {t('Back')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunicationPage;