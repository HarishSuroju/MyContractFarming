import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';

const Chatbot = () => {
  // Load messages from localStorage on component mount
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('chatbotMessages');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const chatContainerRef = useRef(null);

  // Check if user is logged in
  const token = localStorage.getItem('token');
  
  // If user is not logged in, redirect to login
  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);
  
  // Clear chat history when user logs out
  useEffect(() => {
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken) {
        // User has logged out, clear chat history
        localStorage.removeItem('chatbotMessages');
        setMessages([]);
      }
    };
    
    // Listen for storage changes (which happens on logout)
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  // Scroll to bottom when messages change
  useEffect(() => {
    // Use setTimeout to ensure DOM has updated
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, [messages]);

  // Close chatbot when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatContainerRef.current && !chatContainerRef.current.contains(event.target)) {
        navigate(-1); // Go back to previous page
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [navigate]);

  const sendMessage = async (e, customMessage = null) => {
    if (e) e.preventDefault();
    const textToSend = customMessage || input;
    if (!textToSend.trim() || loading) return;

    setMessages(prev => {
      const newMessages = [...prev, { sender: "user", text: textToSend }];
      // Save to localStorage
      localStorage.setItem('chatbotMessages', JSON.stringify(newMessages));
      return newMessages;
    });
    setInput("");
    setLoading(true);

    try {
      const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      const res = await axios.post(`${API_BASE_URL}/chatbot`, { message: textToSend });
      setMessages(prev => {
        const newMessages = [...prev, { sender: "bot", text: res.data.reply }];
        // Save to localStorage
        localStorage.setItem('chatbotMessages', JSON.stringify(newMessages));
        return newMessages;
      });
    } catch (err) {
      setMessages(prev => {
        const newMessages = [...prev, { sender: "bot", text: "📡 *Connection issue. Check if backend is running.*" }];
        // Save to localStorage
        localStorage.setItem('chatbotMessages', JSON.stringify(newMessages));
        return newMessages;
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-canvas">
      <style>{expandedStyles}</style>
      
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="chat-overlay"
      >
        <motion.div 
          ref={chatContainerRef}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="glass-container"
          onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
        >
          <div className="chat-header">
            <div className="status-dot"></div>
            <h1>🌾 ACF Farming Assistant</h1>
          </div>

          <div className="chat-body">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`message-wrapper ${msg.sender}`}
                >
                  <div className="bubble">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {loading && <div className="typing">Assistant is analyzing...</div>}
            <div ref={messagesEndRef} />
          </div>

          <form className="input-bar" onSubmit={sendMessage}>
            <input 
              value={input} 
              onChange={(e) => setInput(e.target.value)} 
              placeholder="Ask anything about your crops..." 
            />
            <button type="submit">Send</button>
          </form>
        </motion.div>
      </motion.div>
    </div>
  );
};

const expandedStyles = `
  .app-canvas {
    min-height: 100vh;
    background: #ffffff;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  
  .chat-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  }
  
  .glass-container {
    width: 100%;
    max-width: 900px; 
    height: 90vh; 
    background: #ffffff;
    border-radius: 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0 20px 40px rgba(0,0,0,0.4);
  }

  .chat-header {
    padding: 25px;
    background: #2e7d32;
    color: white;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .status-dot { width: 12px; height: 12px; background: #81c784; border-radius: 50%; }
  .chat-header h1 { font-size: 1.4rem; margin: 0; }

  .chat-body { 
    flex: 1; 
    padding: 30px; 
    overflow-y: auto; 
    background: #f8fafc;
  }

  .message-wrapper { display: flex; margin-bottom: 20px; width: 100%; }
  .message-wrapper.user { justify-content: flex-end; }
  .message-wrapper.bot { justify-content: flex-start; }

  .bubble {
    padding: 15px 20px;
    border-radius: 15px;
    max-width: 75%; 
    font-size: 1rem;
    line-height: 1.6;
    box-shadow: 0 2px 5px rgba(0,0,0,0.05);
  }

  .user .bubble { background: #2e7d32; color: white; }
  .bot .bubble { background: white; color: #1e293b; border: 1px solid #e2e8f0; }

  /* Structured Content Scaling */
  .bubble table { width: 100%; border-collapse: collapse; margin: 15px 0; }
  .bubble th, .bubble td { border: 1px solid #cbd5e1; padding: 12px; text-align: left; }
  .bubble th { background: #f1f5f9; }

  .input-bar {
    padding: 25px;
    background: white;
    display: flex;
    gap: 15px;
    border-top: 1px solid #e2e8f0;
  }

  .input-bar input {
    flex: 1;
    padding: 15px;
    border: 2px solid #e2e8f0;
    border-radius: 10px;
    outline: none;
    font-size: 1rem;
  }

  .input-bar button {
    padding: 0 30px;
    background: #2e7d32;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    font-weight: bold;
  }

  /* Responsive for Mobile */
  @media (max-width: 768px) {
    .glass-container { height: 100vh; border-radius: 0; }
    .app-canvas { padding: 0; }
    .bubble { max-width: 90%; }
  }
`;

export default Chatbot;