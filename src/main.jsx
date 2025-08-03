import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Force dark mode - Prevent any theme switching
document.documentElement.setAttribute('data-theme', 'dark');
document.documentElement.style.colorScheme = 'dark';
document.documentElement.style.backgroundColor = '#000000';
document.documentElement.style.color = '#ffffff';

// Override any theme changes
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'attributes' && mutation.attributeName === 'data-theme') {
      document.documentElement.setAttribute('data-theme', 'dark');
    }
  });
});

observer.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ['data-theme']
});

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
