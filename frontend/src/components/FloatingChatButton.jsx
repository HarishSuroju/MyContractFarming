import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const FloatingChatButton = () => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/chatbot');
  };

  return (
    <motion.div
      className="fixed bottom-6 right-6 z-50 cursor-pointer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative">
        <img
          src="/assets/Photos/Chatbot Image.png"
          alt="Chatbot"
          className="w-16 h-16 md:w-20 md:h-20 rounded-full object-cover shadow-lg border-2 border-white hover:shadow-xl transition-shadow duration-300"
          onClick={handleClick}
        />
        {/* Online indicator dot */}
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
        
        {/* Tooltip on hover for larger screens */}
        <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none whitespace-nowrap">
          Ask Farming Questions
        </div>
      </div>
    </motion.div>
  );
};

export default FloatingChatButton;