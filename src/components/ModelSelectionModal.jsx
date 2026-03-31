import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Cpu, Layers, ExternalLink, Zap } from 'lucide-react';
import './ModelSelectionModal.css';

const ModelSelectionModal = ({ isOpen, onClose, project }) => {
  if (!project) return null;

  const modelIcons = {
    Llama3: <Brain size={32} />,
    Qwen3: <Zap size={32} />,
    Phi3: <Layers size={32} />
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="modal-overlay" onClick={onClose}>
          <motion.div
            className="modal-content"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button className="modal-close" onClick={onClose} aria-label="Close modal">
              <X size={24} />
            </button>

            <div className="modal-header">
              <h3>Select a Model</h3>
              <p>Choose which version of {project.title} you'd like to experience.</p>
            </div>

            <div className="model-grid">
              {project.models.map((model, index) => (
                <motion.a
                  key={index}
                  href={model.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="model-card"
                  whileHover={{ 
                    y: -5, 
                    backgroundColor: 'var(--accent-hover)',
                    borderColor: 'var(--accent-primary)',
                    boxShadow: '0 10px 30px var(--shadow-primary)'
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="model-icon">
                    {modelIcons[model.name] || <Brain size={32} />}
                  </div>
                  <div className="model-info">
                    <h4>{model.name}</h4>
                    <span className="launch-text">
                      Launch Space <ExternalLink size={14} />
                    </span>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ModelSelectionModal;
