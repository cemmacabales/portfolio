// Debug utility for mobile view issues
export const debugMobileView = () => {
  const isMobile = window.innerWidth <= 768;
  
  console.log('=== Mobile Debug Info ===');
  console.log('Window width:', window.innerWidth);
  console.log('Is mobile:', isMobile);
  console.log('Body classes:', document.body.className);
  
  // Check timeline elements
  const desktopTimeline = document.querySelector('.desktop-timeline');
  const mobileTimeline = document.querySelector('.mobile-timeline');
  
  console.log('Desktop timeline display:', desktopTimeline?.style.display || 'not found');
  console.log('Mobile timeline display:', mobileTimeline?.style.display || 'not found');
  console.log('Timeline elements found:', {
    desktop: !!desktopTimeline,
    mobile: !!mobileTimeline
  });
  
  // Check background elements
  const backgroundContainer = document.querySelector('.background-container');
  const magnetLines = document.querySelector('.magnet-lines-bg');
  
  console.log('Background container display:', backgroundContainer?.style.display || 'not found');
  console.log('Magnet lines display:', magnetLines?.style.display || 'not found');
  
  // Check grid layouts
  const heroContent = document.querySelector('.hero-content');
  const aboutContent = document.querySelector('.about-content');
  
  console.log('Hero content grid:', heroContent?.style.gridTemplateColumns || 'not found');
  console.log('About content grid:', aboutContent?.style.gridTemplateColumns || 'not found');
  
  console.log('=== End Debug Info ===');
};

// Auto-run debug on load
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(debugMobileView, 1000);
  });
  
  window.addEventListener('resize', () => {
    setTimeout(debugMobileView, 100);
  });
} 