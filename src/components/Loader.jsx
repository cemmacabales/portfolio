import React from 'react';
import { motion } from 'framer-motion';
import TextType from './TextType';
import './Loader.css';

const Loader = ({ onLoadingComplete }) => {
  return (
    <motion.div
      className="loader-container"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="loader-content">
        <h2 className="loader-title">
          <TextType 
            text={["brace yourself..."]}
            typingSpeed={100}
            deletingSpeed={50}
            pauseDuration={2000}
            loop={true}
            showCursor={true}
            cursorCharacter="|"
            textColors={["#64ffda"]}
          />
        </h2>
        <div className="dots-container">
          <motion.div
            className="dot"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0,
            }}
          />
          <motion.div
            className="dot"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.2,
            }}
          />
          <motion.div
            className="dot"
            animate={{
              y: [0, -20, 0],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: 0.4,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Loader; 