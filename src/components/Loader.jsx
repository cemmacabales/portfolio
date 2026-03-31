import React from 'react';
import { motion } from 'framer-motion';
import TextType from './TextType';
import './Loader.css';

const LOADER_TEXT = ["hello world..."];
const LOADER_COLORS = ["var(--accent-primary)"];

const DOT_ANIMATE = { y: [0, -20, 0] };
const DOT_TRANSITION_1 = { duration: 0.6, repeat: Infinity, delay: 0 };
const DOT_TRANSITION_2 = { duration: 0.6, repeat: Infinity, delay: 0.2 };
const DOT_TRANSITION_3 = { duration: 0.6, repeat: Infinity, delay: 0.4 };

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
            text={LOADER_TEXT}
            typingSpeed={100}
            deletingSpeed={50}
            pauseDuration={2000}
            loop={true}
            showCursor={true}
            cursorCharacter="|"
            textColors={LOADER_COLORS}
          />
        </h2>
        <div className="dots-container">
          <motion.div
            className="dot"
            animate={DOT_ANIMATE}
            transition={DOT_TRANSITION_1}
          />
          <motion.div
            className="dot"
            animate={DOT_ANIMATE}
            transition={DOT_TRANSITION_2}
          />
          <motion.div
            className="dot"
            animate={DOT_ANIMATE}
            transition={DOT_TRANSITION_3}
          />
        </div>
      </div>
    </motion.div>
  );
};

export default Loader; 