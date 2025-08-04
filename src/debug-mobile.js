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
  
  // Check stepper form elements
  const stepperProgress = document.querySelector('.stepper-progress');
  const stepperSteps = document.querySelectorAll('.stepper-step');
  const formActions = document.querySelectorAll('.form-actions');
  
  console.log('Stepper progress found:', !!stepperProgress);
  console.log('Stepper steps found:', stepperSteps.length);
  console.log('Form actions found:', formActions.length);
  
  if (stepperProgress) {
    console.log('Stepper progress styles:', {
      display: stepperProgress.style.display,
      flexDirection: stepperProgress.style.flexDirection,
      gap: stepperProgress.style.gap
    });
  }
  
  // Check success step elements
  const successStep = document.querySelector('.success-step');
  const successContent = document.querySelector('.success-content');
  const successIcon = document.querySelector('.success-icon');
  const successCheck = document.querySelector('.success-check');
  
  console.log('Success step found:', !!successStep);
  console.log('Success content found:', !!successContent);
  console.log('Success icon found:', !!successIcon);
  console.log('Success check found:', !!successCheck);
  
  if (successStep) {
    console.log('Success step styles:', {
      textAlign: successStep.style.textAlign,
      padding: successStep.style.padding,
      display: successStep.style.display
    });
  }
  
  if (successContent) {
    console.log('Success content styles:', {
      display: successContent.style.display,
      flexDirection: successContent.style.flexDirection,
      alignItems: successContent.style.alignItems,
      gap: successContent.style.gap
    });
  }
  
  if (successIcon) {
    console.log('Success icon styles:', {
      width: successIcon.style.width,
      height: successIcon.style.height,
      borderRadius: successIcon.style.borderRadius,
      background: successIcon.style.background,
      border: successIcon.style.border
    });
  }
  
  if (successCheck) {
    console.log('Success check styles:', {
      fontSize: successCheck.style.fontSize,
      fontWeight: successCheck.style.fontWeight,
      color: successCheck.style.color
    });
  }
  
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
  
  // Check mobile timeline cards
  const timelineCards = document.querySelectorAll('.mobile-timeline .timeline-card');
  console.log('Mobile timeline cards found:', timelineCards.length);
  
  timelineCards.forEach((card, index) => {
    console.log(`Timeline card ${index + 1} styles:`, {
      display: card.style.display,
      width: card.style.width,
      background: card.style.background,
      borderRadius: card.style.borderRadius,
      minHeight: card.style.minHeight
    });
    
    // Check card content
    const cardContent = card.querySelector('.timeline-card-content');
    const cardHeader = card.querySelector('.timeline-card-header');
    const cardImage = card.querySelector('.timeline-card-image');
    const cardDescription = card.querySelector('.timeline-card-description');
    
    console.log(`Timeline card ${index + 1} elements:`, {
      hasContent: !!cardContent,
      hasHeader: !!cardHeader,
      hasImage: !!cardImage,
      hasDescription: !!cardDescription
    });
    
    if (cardContent) {
      console.log(`Timeline card ${index + 1} content styles:`, {
        padding: cardContent.style.padding,
        overflow: cardContent.style.overflow,
        maxHeight: cardContent.style.maxHeight
      });
    }
  });
  
  // Check form buttons
  const formButtons = document.querySelectorAll('.form-actions .btn');
  console.log('Form buttons found:', formButtons.length);
  
  formButtons.forEach((btn, index) => {
    console.log(`Form button ${index + 1} styles:`, {
      width: btn.style.width,
      display: btn.style.display,
      className: btn.className
    });
  });
  
  // Check stepper steps
  stepperSteps.forEach((step, index) => {
    console.log(`Stepper step ${index + 1} styles:`, {
      display: step.style.display,
      flexDirection: step.style.flexDirection,
      gap: step.style.gap,
      textAlign: step.style.textAlign
    });
    
    const stepNumber = step.querySelector('.step-number');
    const stepLabel = step.querySelector('.step-label');
    
    console.log(`Stepper step ${index + 1} elements:`, {
      hasNumber: !!stepNumber,
      hasLabel: !!stepLabel,
      stepNumberText: stepNumber?.textContent,
      stepLabelText: stepLabel?.textContent
    });
  });
  
  // Check if mobile-fixes.css is loaded
  const mobileFixesLink = document.querySelector('link[href*="mobile-fixes.css"]');
  console.log('Mobile fixes CSS loaded:', !!mobileFixesLink);
  
  // Check if css-compatibility-fixes.css is loaded
  const compatibilityFixesLink = document.querySelector('link[href*="css-compatibility-fixes.css"]');
  console.log('CSS compatibility fixes loaded:', !!compatibilityFixesLink);
  
  // Check computed styles for critical elements
  if (mobileTimeline) {
    const computedStyle = window.getComputedStyle(mobileTimeline);
    console.log('Mobile timeline computed styles:', {
      display: computedStyle.display,
      width: computedStyle.width,
      padding: computedStyle.padding
    });
  }
  
  if (stepperProgress) {
    const computedStyle = window.getComputedStyle(stepperProgress);
    console.log('Stepper progress computed styles:', {
      display: computedStyle.display,
      flexDirection: computedStyle.flexDirection,
      gap: computedStyle.gap
    });
  }
  
  if (successStep) {
    const computedStyle = window.getComputedStyle(successStep);
    console.log('Success step computed styles:', {
      display: computedStyle.display,
      textAlign: computedStyle.textAlign,
      padding: computedStyle.padding
    });
  }
  
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