import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
import { X, ArrowUpRight } from 'lucide-react';
import './ModelSelectionModal.css';

const MODEL_NOTES = {
  Llama3: 'Llama 3 8B Instruct, by Meta',
  Qwen3: 'Qwen3, by Alibaba',
  Phi3: 'Phi-3, by Microsoft',
};

const ModelSelectionModal = ({ isOpen, onClose, project }) => {
  const closeRef = useRef(null);
  const returnFocusRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;
    returnFocusRef.current = document.activeElement;
    const timer = setTimeout(() => closeRef.current?.focus(), 30);
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('keydown', onKey);
      returnFocusRef.current?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!project) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
        >
          <motion.div
            className="modal-content"
            role="dialog"
            aria-modal="true"
            aria-labelledby="model-modal-title"
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button ref={closeRef} className="modal-close" onClick={onClose} aria-label="Close">
              <X size={18} strokeWidth={1.8} />
            </button>

            <div className="modal-header">
              <h3 id="model-modal-title">Pick a model to try</h3>
              <p>
                Each one runs the same retrieval pipeline for {project.name} on its own
                Hugging Face Space. The first answer can take a moment while the Space wakes up.
              </p>
            </div>

            <ul className="model-grid">
              {project.models.map((model) => (
                <li key={model.name}>
                  <a
                    href={model.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="model-card"
                  >
                    <span className="model-info">
                      <span className="model-name">{model.name}</span>
                      {MODEL_NOTES[model.name] && (
                        <span className="model-note">{MODEL_NOTES[model.name]}</span>
                      )}
                    </span>
                    <span className="model-arrow" aria-hidden="true">
                      <ArrowUpRight size={18} strokeWidth={1.8} />
                    </span>
                    <span className="visually-hidden"> (opens in a new tab)</span>
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ModelSelectionModal;
