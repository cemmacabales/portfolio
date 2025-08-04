// Browser detection utility
export const detectBrowser = () => {
  const userAgent = navigator.userAgent;
  let browser = 'Unknown';
  let version = 'Unknown';

  // Chrome
  if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Edg') === -1) {
    browser = 'Chrome';
    version = userAgent.match(/Chrome\/(\d+)/)?.[1] || 'Unknown';
  }
  // Safari
  else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
    browser = 'Safari';
    version = userAgent.match(/Version\/(\d+)/)?.[1] || 'Unknown';
  }
  // Firefox
  else if (userAgent.indexOf('Firefox') > -1) {
    browser = 'Firefox';
    version = userAgent.match(/Firefox\/(\d+)/)?.[1] || 'Unknown';
  }
  // Edge
  else if (userAgent.indexOf('Edg') > -1) {
    browser = 'Edge';
    version = userAgent.match(/Edg\/(\d+)/)?.[1] || 'Unknown';
  }
  // Internet Explorer
  else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident') > -1) {
    browser = 'Internet Explorer';
    version = userAgent.match(/MSIE (\d+)/)?.[1] || userAgent.match(/rv:(\d+)/)?.[1] || 'Unknown';
  }

  return { browser, version, userAgent };
};

export const logBrowserInfo = () => {
  const { browser, version, userAgent } = detectBrowser();
  const isMacOS = navigator.platform.indexOf('Mac') !== -1;
  const isSafari = browser === 'Safari';
  const isChrome = browser === 'Chrome';
  
  console.log('=== Browser Detection ===');
  console.log('Browser:', browser);
  console.log('Version:', version);
  console.log('Platform:', navigator.platform);
  console.log('Is macOS:', isMacOS);
  console.log('Is Safari:', isSafari);
  console.log('Is Chrome:', isChrome);
  console.log('User Agent:', userAgent);
  console.log('Viewport Width:', window.innerWidth);
  console.log('Viewport Height:', window.innerHeight);
  console.log('Device Pixel Ratio:', window.devicePixelRatio);
  console.log('=== End Browser Detection ===');
  
  // Log macOS-specific issues
  if (isMacOS) {
    console.log('=== macOS Specific Info ===');
    console.log('macOS detected - applying specific fixes');
    if (isSafari) {
      console.log('Safari on macOS - known flexbox and backdrop-filter issues');
    }
    if (isChrome) {
      console.log('Chrome on macOS - known transform and transition issues');
    }
    console.log('=== End macOS Info ===');
  }
  
  return { browser, version, isMacOS, isSafari, isChrome };
};

// Auto-run browser detection
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    setTimeout(logBrowserInfo, 1000);
  });
} 