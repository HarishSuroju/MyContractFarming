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
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

    <motion.div
      ref={chatContainerRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      onClick={(e) => e.stopPropagation()}
      className="w-full max-w-4xl h-[90vh] bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl flex flex-col overflow-hidden"
    >

      {/* Header */}
      <div className="px-6 py-4 bg-gradient-to-r from-green-700 to-green-800 text-white flex items-center gap-3">
        <div className="w-3 h-3 bg-green-300 rounded-full"></div>
        <h1 className="text-lg font-semibold">
          🌾 ACF Farming Assistant
        </h1>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 bg-gray-50 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: msg.sender === "user" ? 20 : -20 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex ${
                msg.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`px-4 py-3 rounded-2xl max-w-[75%] text-sm shadow-md ${
                  msg.sender === "user"
                    ? "bg-gradient-to-r from-green-600 to-green-700 text-white rounded-br-md"
                    : "bg-white border border-gray-200 text-gray-800 rounded-bl-md"
                }`}
              >
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="text-sm text-gray-500">
            Assistant is analyzing...
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={sendMessage}
        className="p-4 bg-white border-t border-gray-200 flex gap-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything about your crops..."
          className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-green-500 focus:ring-2 focus:ring-green-200 outline-none transition"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white font-semibold rounded-xl hover:opacity-90 transition"
        >
          Send
        </button>
      </form>
    </motion.div>
  </div>
);
};

export default Chatbot;