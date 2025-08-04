import { useState, useEffect } from 'react';

// Mobile detection utility
export const detectMobile = () => {
  // Check window width
  const isMobileByWidth = window.innerWidth <= 768;
  
  // Check user agent for mobile devices
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobileByAgent = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
  
  // Check if device has touch capability
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  // Check if device has a small screen
  const hasSmallScreen = window.screen.width <= 768 || window.screen.height <= 768;
  
  // Final mobile detection
  const isMobile = isMobileByWidth || isMobileByAgent || (hasTouch && hasSmallScreen);
  
  console.log('=== Mobile Detection ===');
  console.log('Window width:', window.innerWidth);
  console.log('Screen width:', window.screen.width);
  console.log('Screen height:', window.screen.height);
  console.log('User agent:', userAgent);
  console.log('Has touch:', hasTouch);
  console.log('Max touch points:', navigator.maxTouchPoints);
  console.log('Is mobile by width:', isMobileByWidth);
  console.log('Is mobile by agent:', isMobileByAgent);
  console.log('Has small screen:', hasSmallScreen);
  console.log('Final mobile detection:', isMobile);
  console.log('=== End Mobile Detection ===');
  
  return isMobile;
};

// Hook for React components
export const useMobileDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const checkMobile = () => {
      const mobile = detectMobile();
      setIsMobile(mobile);
      
      // Add/remove CSS class to body for additional CSS targeting
      if (mobile) {
        document.body.classList.add('mobile-view');
        document.body.classList.remove('desktop-view');
      } else {
        document.body.classList.add('desktop-view');
        document.body.classList.remove('mobile-view');
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

// Auto-detect on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(detectMobile, 1000);
  });
  
  window.addEventListener('resize', () => {
    setTimeout(detectMobile, 100);
  });
} 