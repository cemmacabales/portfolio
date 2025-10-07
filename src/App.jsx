import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import emailjs from '@emailjs/browser'
import { gsap } from 'gsap'
import { 
  Github, 
  Linkedin, 
  Mail, 
  Phone, 
  MapPin, 
  ExternalLink,
  Code,
  Palette,
  Database,
  Globe,
  User, 
  Briefcase, 
  Award,
  Brain,
  Monitor,
  FolderOpen
} from 'lucide-react'
import TextType from './components/TextType'
import MagnetLines from './components/MagnetLines'
import Dock from './components/Dock'
import DecryptedText from './components/DecryptedText'
import './App.css'

/* Neon ripple effect for getResume button */
const neonRippleStyle = `
.neon-ripple {
  position: absolute;
  border-radius: 50%;
  pointer-events: none;
  width: 0;
  height: 0;
  opacity: 0.9;
  transform: translate(-50%, -50%);
  animation: neonRippleExpand 0.7s cubic-bezier(0.4,0,0.2,1) forwards;
  z-index: 1;
}
@keyframes neonRippleExpand {
  0% {
    width: 0;
    height: 0;
    opacity: 0.9;
    box-shadow: 0 0 0 0 #64ffda, 0 0 10px #4ecdc4;
  }
  60% {
    width: 180px;
    height: 180px;
    opacity: 0.7;
    box-shadow: 0 0 40px 10px #64ffda, 0 0 60px 20px #4ecdc4;
  }
  100% {
    width: 220px;
    height: 220px;
    opacity: 0;
    box-shadow: 0 0 60px 20px #64ffda, 0 0 80px 40px #4ecdc4;
  }
}
`;
if (typeof document !== 'undefined' && !document.getElementById('neon-ripple-style')) {
  const style = document.createElement('style');
  style.id = 'neon-ripple-style';
  style.innerHTML = neonRippleStyle;
  document.head.appendChild(style);
}
import SpotlightCard from './components/SpotlightCard'
import ScrambledText from './components/ScrambledText'
import { CareerTimeline } from './components/CareerTimeline'
import EarfquakeImage from './assets/earfquake.png';
import PetchinguImage from './assets/petchingu.png';
import MyAptImage from './assets/myapt.png';
import HeartRiskImage from './assets/heartrisk.png';
import JobPostingsImage from './assets/jobpostings.png';
import ReadMyFaceImage from './assets/readmyface.png';
import Loader from './components/Loader';
import Certificates from './components/Certificates';
import ProfileImage from './assets/me.jpeg';
import TechStack from './components/TechStack';
import { debugMobileView } from './debug-mobile';
import { useMobileDetection } from './mobile-detection';
import { validateFormData, sanitizeFormData, checkRateLimit } from './utils/validation';

// Custom hook for modern project card animations
const useProjectAnimations = () => {
  const projectGridRef = useRef(null)
  const projectCardsRef = useRef([])
  const [isTransitioning, setIsTransitioning] = useState(false)

  const clearCardRefs = () => {
    projectCardsRef.current = []
  }

  const animateProjectCards = (category) => {
    // Wait a bit for DOM to update
    setTimeout(() => {
      const cards = projectCardsRef.current
      console.log('Animating cards for category:', category, 'Cards found:', cards?.length)
      if (!cards || cards.length === 0) {
        console.log('No cards found, skipping animation')
        return
      }

      // Check if GSAP is available
      if (typeof gsap === 'undefined') {
        console.log('GSAP not available, using fallback animation')
        // Fallback: simple CSS transition
        cards.forEach((card, index) => {
          if (card) {
            card.style.opacity = '0'
            card.style.transform = 'translateY(30px) scale(0.95)'
            setTimeout(() => {
              card.style.transition = 'all 0.5s ease-out'
              card.style.opacity = '1'
              card.style.transform = 'translateY(0) scale(1)'
            }, index * 100)
          }
        })
        // Reset transitioning state after fallback animation
        setTimeout(() => {
          setIsTransitioning(false)
          console.log('Fallback animation completed, transitioning state reset')
        }, cards.length * 100 + 500)
        return
      }

      // Reset cards to initial state
      gsap.set(cards, {
        opacity: 0,
        y: 30,
        scale: 0.95,
        rotationY: -5
      })

      // Fast staggered entrance animation
      gsap.to(cards, {
        opacity: 1,
        y: 0,
        scale: 1,
        rotationY: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: "power2.out",
        onComplete: () => {
          console.log('Animation completed for category:', category)
          // Ensure transitioning state is reset
          setTimeout(() => {
            setIsTransitioning(false)
            console.log('Transitioning state reset to false')
          }, 100)
        }
      })
    }, 100)
  }

  const animateCategoryTransition = (oldCategory, newCategory) => {
    const cards = projectCardsRef.current
    console.log('Starting transition from', oldCategory, 'to', newCategory, 'Cards found:', cards?.length)
    
    if (!cards || cards.length === 0) {
      // If no cards to animate out, just animate in new ones
      console.log('No cards to animate out, animating new ones directly')
      setTimeout(() => {
        animateProjectCards(newCategory)
      }, 200)
      return
    }

    setIsTransitioning(true)
    console.log('Animating out', cards.length, 'cards')

    // Check if GSAP is available
    if (typeof gsap === 'undefined') {
      console.log('GSAP not available, using fallback transition')
      // Fallback: simple CSS transition
      cards.forEach((card, index) => {
        if (card) {
          card.style.transition = 'all 0.3s ease-in'
          card.style.opacity = '0'
          card.style.transform = 'translateY(-20px) scale(0.95)'
        }
      })
      setTimeout(() => {
        clearCardRefs()
        setTimeout(() => {
          animateProjectCards(newCategory)
        }, 200)
      }, 300)
      return
    }

    // Quick exit animation for old cards
    gsap.to(cards, {
      opacity: 0,
      y: -20,
      scale: 0.95,
      rotationY: 5,
      duration: 0.3,
      stagger: 0.03,
      ease: "power2.in",
      onComplete: () => {
        // Clear the refs after exit animation
        console.log('Exit animation completed, clearing refs')
        clearCardRefs()
        // Wait longer to ensure new content is rendered
        setTimeout(() => {
          console.log('Starting entrance animation for', newCategory)
          animateProjectCards(newCategory)
        }, 200)
      }
    })
  }

  const addCardRef = (el) => {
    if (el && !projectCardsRef.current.includes(el)) {
      projectCardsRef.current.push(el)
      console.log('Added card ref, total cards:', projectCardsRef.current.length)
    }
  }

  return {
    projectGridRef,
    addCardRef,
    animateProjectCards,
    animateCategoryTransition,
    isTransitioning,
    setIsTransitioning
  }
}

// Use the new mobile detection hook
const useIsMobile = useMobileDetection;

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [openCategory, setOpenCategory] = useState('ml')
  const [isLoading, setIsLoading] = useState(true)
  const [formStep, setFormStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    projectType: '',
    budget: '',
    timeline: ''
  })
  const [formErrors, setFormErrors] = useState({})
  const [isValidating, setIsValidating] = useState(false)

  const isMobile = useIsMobile();
  
  // Initialize project animations
  const {
    projectGridRef,
    addCardRef,
    animateProjectCards,
    animateCategoryTransition,
    isTransitioning,
    setIsTransitioning
  } = useProjectAnimations();

  // Error boundary for debugging
  useEffect(() => {
    console.log('App component mounted');
    console.log('ReadMyFaceImage imported:', !!ReadMyFaceImage);
  }, []);

  // Trigger initial animation for current category
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        animateProjectCards(openCategory);
      }, 500);
    }
  }, [isLoading, openCategory, animateProjectCards]);

  // Clear refs when category changes to prevent stale references
  useEffect(() => {
    return () => {
      // Cleanup function to clear refs when component unmounts
      // Note: projectCardsRef is managed inside the hook, so no cleanup needed here
    };
  }, []);

  // Reset transitioning state when category changes
  useEffect(() => {
    const timer = setTimeout(() => {
      if (isTransitioning) {
        console.log('Resetting stuck transitioning state')
        setIsTransitioning(false)
      }
    }, 2000) // Reset after 2 seconds if stuck

    return () => clearTimeout(timer)
  }, [openCategory, isTransitioning])

  const handleCategoryChange = (newCategory) => {
    console.log('Category change requested:', newCategory, 'Current:', openCategory, 'Is transitioning:', isTransitioning)
    if (newCategory !== openCategory && !isTransitioning) {
      console.log('Starting category transition')
      animateCategoryTransition(openCategory, newCategory)
      setOpenCategory(newCategory)
    } else if (newCategory !== openCategory && isTransitioning) {
      // Force reset if transitioning state is stuck
      console.log('Category change blocked by transitioning state, forcing reset')
      setIsTransitioning(false)
      setTimeout(() => {
        console.log('Forcing category transition after reset')
        animateCategoryTransition(openCategory, newCategory)
        setOpenCategory(newCategory)
      }, 100)
    } else {
      console.log('Category change blocked - same category or transitioning')
    }
  }

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleRippleEffect = (event) => {
    const button = event.currentTarget;
    const ripple = button.querySelector('.ripple-effect');
    
    if (ripple) {
      // Reset ripple
      ripple.style.width = '0px';
      ripple.style.height = '0px';
      ripple.style.opacity = '1';
      
      // Get click position
      const rect = button.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      
      // Position ripple at click point
      ripple.style.left = x + 'px';
      ripple.style.top = y + 'px';
      
      // Trigger animation
      setTimeout(() => {
        ripple.style.width = '200px';
        ripple.style.height = '200px';
        ripple.style.opacity = '0';
        ripple.style.transform = 'translate(-50%, -50%)';
      }, 10);
    }
  }

  const handleMagneticEffect = (event) => {
    const button = event.currentTarget;
    const particles = button.querySelector('.magnetic-particles');
    
    if (particles) {
      // Create additional particles on click
      for (let i = 0; i < 5; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
          position: absolute;
          width: 6px;
          height: 6px;
          background: rgba(255, 255, 255, 0.9);
          border-radius: 50%;
          pointer-events: none;
          animation: magneticParticle 1s ease-out forwards;
        `;
        
        // Random position around the button
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        particle.style.left = x + '%';
        particle.style.top = y + '%';
        
        particles.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
          if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
          }
        }, 1000);
      }
    }
  }

  const handleFormInput = (field, value) => {
    // Sanitize input in real-time
    const sanitizedValue = value.trim()
    setFormData(prev => ({ ...prev, [field]: sanitizedValue }))
    
    // Clear specific field error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const nextStep = () => {
    if (formStep < 4) {
      setFormStep(formStep + 1)
    }
  }

  const prevStep = () => {
    if (formStep > 1) {
      setFormStep(formStep - 1)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsValidating(true)
    
    // Check rate limiting
    if (!checkRateLimit()) {
      setIsValidating(false)
      alert('Too many submissions. Please wait a minute before trying again.')
      return
    }
    
    // Sanitize form data
    const sanitizedData = sanitizeFormData(formData)
    
    // Validate form data
    const validation = validateFormData(sanitizedData)
    
    if (!validation.isValid) {
      setFormErrors(validation.errors)
      setIsValidating(false)
      return
    }
    
    // Clear any existing errors
    setFormErrors({})
    
    // Check environment variables
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY
    
    if (!serviceId || !templateId || !publicKey) {
      console.error('EmailJS configuration missing')
      setIsValidating(false)
      alert('Email service is not properly configured. Please try again later.')
      return
    }
    
    // Prepare template parameters with sanitized data
    const templateParams = {
      name: sanitizedData.name,
      email: sanitizedData.email,
      reply_to: sanitizedData.email,
      subject: sanitizedData.subject,
      projectType: sanitizedData.projectType,
      timeline: sanitizedData.timeline,
      budget: sanitizedData.budget,
      message: sanitizedData.message
    }
    
    // Send email using EmailJS
    setIsSubmitting(true)
    setIsValidating(false)
    
    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log('Email sent successfully:', response)
        setIsSubmitting(false)
        setIsSuccess(true)
        
        // Reset form after showing success
        setTimeout(() => {
          setFormData({
            name: '',
            email: '',
            subject: '',
            message: '',
            projectType: '',
            budget: '',
            timeline: ''
          })
          setFormErrors({})
          setFormStep(1)
          setIsSuccess(false)
        }, 3000)
      })
      .catch((error) => {
        console.error('Email send failed:', error)
        setIsSubmitting(false)
        alert('Sorry, there was an error sending your message. Please try again later.')
      })
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // 3 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  // Debug mobile view issues and apply Safari fixes
  useEffect(() => {
    if (!isLoading) {
      setTimeout(() => {
        debugMobileView();
        applySafariFixes();
      }, 1000);
    }
  }, [isLoading, isMobile])

  // Safari compatibility fixes
  const applySafariFixes = () => {
    // Force hardware acceleration for animations
    const projectCards = document.querySelectorAll('.project-card');
    projectCards.forEach(card => {
      card.style.transform = 'translateZ(0)';
      card.style.webkitTransform = 'translateZ(0)';
    });

    // Ensure proper stacking context
    const projectGrids = document.querySelectorAll('.projects-grid');
    projectGrids.forEach(grid => {
      grid.style.position = 'relative';
      grid.style.zIndex = '1';
    });

    // Fix any backdrop-filter issues
    const elementsWithBackdrop = document.querySelectorAll('.project-card, .skill-category, .contact-form');
    elementsWithBackdrop.forEach(el => {
      el.style.backdropFilter = 'none';
      el.style.webkitBackdropFilter = 'none';
    });
  };

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="App">
      {/* Background - Only show on desktop */}
      {!isMobile && (
        <div className="background-container">
          <MagnetLines 
            rows={20}
            columns={20}
            containerSize="100vw"
            lineColor="#ffffff"
            lineWidth="1px"
            lineHeight="clamp(25px, 2.5vw, 40px)"
            baseAngle={-10}
            className="magnet-lines-bg"
          />
        </div>
      )}

      {/* Mobile Background Fallback */}
      {isMobile && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)',
            zIndex: -1,
            pointerEvents: 'none'
          }}
        />
      )}
      

      
      {/* Dock Navigation */}
      <Dock 
        items={[
          { 
            icon: <User size={20} />, 
            label: 'About Me', 
            onClick: () => scrollToSection('about'),
            className: activeSection === 'about' ? 'active' : ''
          },
          { 
            icon: <Briefcase size={20} />, 
            label: 'Work', 
            onClick: () => scrollToSection('projects'),
            className: activeSection === 'projects' ? 'active' : ''
          },
          { 
            icon: <Award size={20} />, 
            label: 'Experience', 
            onClick: () => scrollToSection('skills'),
            className: activeSection === 'skills' ? 'active' : ''
          },
          { 
            icon: <Mail size={20} />, 
            label: 'Contact', 
            onClick: () => scrollToSection('contact'),
            className: activeSection === 'contact' ? 'active' : ''
          }
        ]}
        panelHeight={68}
        baseItemSize={50}
        magnification={70}
      />

      {/* Hero Section */}
      <section id="home" className="hero">
        <div className="hero-content">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="hero-text"
          >
            <h1>Hi, I'm <span className="highlight">
              <TextType 
                text={["Carl Emmanuel Macabales", "A Developer"]}
                typingSpeed={100}
                deletingSpeed={50}
                pauseDuration={1500}
                loop={true}
                showCursor={true}
                cursorCharacter="|"
                textColors={["#64ffda", "#8b5cf6", "#4ecdc4"]}
              />
            </span></h1>
            <h2>Computer Science Student</h2>
            <p>I specialize in Artificial Intelligence and Machine Learning, with a strong foundation in Software Engineering.</p>
            <div className="hero-buttons">
              <motion.button
                className="btn btn-primary magnetic-btn"
                onClick={(e) => {
                  handleMagneticEffect(e);
                  scrollToSection('projects');
                }}
                whileHover={{ 
                  scale: 1.1,
                  rotate: [0, -2, 2, 0],
                  transition: { 
                    duration: 0.3,
                    rotate: { duration: 0.2, repeat: 2, ease: "easeInOut" }
                  }
                }}
                whileTap={{ 
                  scale: 0.95,
                  rotate: 0
                }}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: 'linear-gradient(135deg, #64ffda 0%, #4ecdc4 100%)',
                  boxShadow: '0 8px 32px rgba(100, 255, 218, 0.3)',
                  border: 'none',
                  transform: 'perspective(1000px)',
                }}
              >
                <motion.span
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                >
                  <motion.div
                    animate={{ 
                      x: [0, 5, 0],
                      transition: { 
                        duration: 1.5, 
                        repeat: Infinity, 
                        ease: "easeInOut" 
                      }
                    }}
                  >
                    →
                  </motion.div>
                  View My Work
                </motion.span>
                <motion.div
                  className="magnetic-particles"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    pointerEvents: 'none'
                  }}
                />
              </motion.button>
              
<motion.button
  className="btn btn-secondary ripple-btn"
  onClick={async (e) => {
    // Neon ripple effect
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const ripple = document.createElement('span');
    ripple.className = 'neon-ripple';
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.style.background = 'linear-gradient(135deg, #64ffda 0%, #4ecdc4 100%)';
    button.appendChild(ripple);
    setTimeout(() => {
      ripple.remove();
    }, 700);
    // Download resume logic
    const link = document.createElement('a');
    link.href = '/MacabalesResume1.pdf';
    link.download = 'MacabalesResume.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }}
  whileHover={{ 
    scale: 1.05,
    boxShadow: '0 0 30px rgba(100, 255, 218, 0.6)',
    color: '#64ffda',
    backgroundColor: 'rgba(100, 255, 218, 0.1)',
    borderColor: '#4ecdc4',
    transition: { duration: 0.2 }
  }}
  whileTap={{ 
    scale: 0.98,
    transition: { duration: 0.1 }
  }}
  style={{
    position: 'relative',
    overflow: 'hidden',
    border: '2px solid #64ffda',
    backdropFilter: 'blur(10px)',
    background: 'rgba(100, 255, 218, 0.05)',
    color: '#ffffff'
  }}
>
  <motion.span
    style={{
      position: 'relative',
      zIndex: 2,
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    }}
  >
    <motion.div>
      📄
    </motion.div>
    getResume()
  </motion.span>
</motion.button>
            </div>
          </motion.div>
         <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="hero-image"
        >
          <div className="profile-placeholder">
            <img src={ProfileImage} alt="Profile" className="profile-image"
            style={{ 
              width: '100%', 
              height: '100%', 
              borderRadius: '50%',
              transition: 'all 0.3s ease'
            }} 
            />
          </div>
        </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="about">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <div className="section-title-group">
              <DecryptedText
                text="About Me"
                speed={50}
                maxIterations={999999}
                sequential={false}
                className="section-title-decrypted"
                parentClassName="section-title-wrapper"
              />
              <ScrambledText
                className="scrambled-text-demo"
                radius={100}
                duration={1.2}
                speed={0.5}
                scrambleChars=".:"
              >
                Get to know me better
              </ScrambledText>
            </div>
          </motion.div>
          <div className="about-content">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="about-text"
            >
              <div className="about-text-group">
                <DecryptedText
                  text="Who I am"
                  speed={50}
                  maxIterations={999999}
                  sequential={false}
                  className="about-subtitle-decrypted"
                  parentClassName="about-subtitle-wrapper"
                />
                <ScrambledText
                  className="scrambled-text-demo"
                  radius={100}
                  duration={1.2}
                  speed={0.5}
                  scrambleChars=".:"
                >
                  I'm a 3rd-year student at Mapúa University specializing in Artificial Intelligence. I enjoy working with machine learning and have experience in both backend and frontend development, allowing me to build complete and functional digital solutions.
                </ScrambledText>
              </div>
              <ScrambledText
                className="scrambled-text-demo"
                radius={100}
                duration={1.2}
                speed={0.5}
                scrambleChars=".:"
              >
                Outside of academics, I enjoy playing video games, coding, making things from scratch, and solving challenging problems. I'm also passionate about exploring new technologies, contributing to open-source projects, and sharing knowledge with the developer community.
              </ScrambledText>
                <div className="about-stats">
                  <SpotlightCard className="stat" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <h4>400+</h4>
                    <p>Hours of Learning</p>
                  </SpotlightCard>
                  <SpotlightCard className="stat" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <h4>10</h4>
                    <p>Projects Completed</p>
                  </SpotlightCard>
                  <SpotlightCard className="stat" spotlightColor="rgba(0, 229, 255, 0.2)">
                    <h4>20+</h4>
                    <p>Certificates Earned</p>
                  </SpotlightCard>
                </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="about-journey"
            >
              <CareerTimeline />
            </motion.div>
          </div>
        </div>
      </section>


      {/* Projects Section */}
      <section id="projects" className="projects">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <div className="section-title-group">
              <DecryptedText
                text="My Projects"
                speed={50}
                maxIterations={999999}
                sequential={false}
                className="section-title-decrypted"
                parentClassName="section-title-wrapper"
              />
              <ScrambledText
                className="scrambled-text-demo"
                radius={100}
                duration={1.2}
                speed={0.5}
                scrambleChars=".:"
              >
                Some of my recent work
              </ScrambledText>
            </div>
          </motion.div>
                    <div className="projects-section">
            <div className="category-buttons">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`category-btn ${openCategory === 'ml' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('ml')}
              >
                <Brain size={24} />
                <span>Artificial Intelligence</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`category-btn ${openCategory === 'software' ? 'active' : ''}`}
                onClick={() => handleCategoryChange('software')}
              >
                <Monitor size={24} />
                <span>Software Development</span>
              </motion.button>
            </div>

            {/* Software Development Projects */}
            <AnimatePresence mode="wait">
              {openCategory === 'software' && (
                <motion.div
                  key="software"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="project-category"
                >
                  <div className="projects-grid">
                    {[
                      {
                        title: "Apartment Dashboard Management App",
                        description: "A comprehensive dashboard for managing apartment properties with real-time data visualization and tenant management features. Test accounts: test@test.com / test123",
                        tech: ["Firebase", "React", "JavaScript", "SCSS", "HTML"],
                        image: MyAptImage,
                        category: "software",
                        githubUrl: "https://github.com/cemmacabales/myapt-july8-2025-main.git",
                        demoUrl: "https://myapthome.netlify.app"
                      },
                      {
                        title: "Petchingu (Pet Management App)",
                        description: "A complete pet management application for tracking pet health, appointments, and daily care routines.",
                        tech: ["Appwrite", "React", "TypeScript", "JavaScript", "CSS"],
                        image: PetchinguImage,
                        category: "software",
                        githubUrl: "https://github.com/cemmacabales/petchinguuu.git"
                      }
                    ].map((project, index) => (
                      <motion.div
                        key={index}
                        ref={addCardRef}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.1,
                          ease: "easeOut"
                        }}
                        className="project-card modern-card"
                        whileHover={{ 
                          y: -8, 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                      >
                      <div className="project-image">
                        <img 
                          src={project.image} 
                          alt={project.title}
                          style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                      <div className="project-content">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="project-tech">
                          {project.tech.map((tech, techIndex) => (
                            <span 
                              key={techIndex} 
                              className={`tech-tag ${tech.toLowerCase()}`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="project-links">
                          {project.demoUrl ? (
                            <a 
                              href={project.demoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-small"
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <ExternalLink size={16} />
                              Live Demo
                            </a>
                          ) : (
                            <button 
                              className="btn btn-small"
                              onClick={() => alert('🚧 This project is currently under maintenance. Please check back later!')}
                            >
                              <ExternalLink size={16} />
                              Live Demo
                            </button>
                          )}
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-small btn-secondary"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <Github size={16} />
                            Code
                          </a>
                          {project.paperUrl && (
                            <a 
                              href={project.paperUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-small btn-secondary"
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              📄 Paper
                            </a>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Artificial Intelligence Projects */}
            <AnimatePresence mode="wait">
              {openCategory === 'ml' && (
                <motion.div
                  key="ml"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="project-category"
                >
                  <div className="projects-grid">
                    {[
                      {
                        title: "Read My Face (Real-time Emotion Detector)",
                        description: "AI emotion detector built with face-api.js, React, and GSAP featuring dynamic visual feedback.",
                        tech: ["React", "face-api.js", "GSAP", "JavaScript"],
                        image: ReadMyFaceImage,
                        category: "ml",
                        githubUrl: "https://github.com/cemmacabales/emotion-detector.git",
                        demoUrl: "https://readmyfaceai.netlify.app"
                      },
                      {
                        title: "Earfquake (Earthquake Prediction Analysis Tool)",
                        description: "A machine learning tool for analyzing earthquake data and predicting seismic activities using advanced algorithms and data visualization.",
                        tech: ["Streamlit", "Python"],
                        image: EarfquakeImage,
                        category: "ml",
                        githubUrl: "https://github.com/cemmacabales/EARFQUAKE.git",
                        demoUrl: "https://earfquake-atjsxhtyuvwrcjwyfbjyx2.streamlit.app/"
                      },
                      {
                        title: "Heart Disease Risk Detection",
                        description: "A machine learning model for predicting heart disease risk using various medical parameters and features.",
                        tech: ["Python", "IEEE"],
                        image: HeartRiskImage,
                        category: "ml",
                        githubUrl: "https://colab.research.google.com/drive/1WWMiKOgj0mgGbMcYkxGDD1R4AI16Up3e?usp=sharing",
                        paperUrl: "https://docs.google.com/document/d/1ebPPdUOa1kIigPMNj5VT8ZQLbPQN_qA6TuOsBJkDGPc/edit?usp=sharing"
                      },
                      {
                        title: "Job Trends Analysis from Google Postings",
                        description: "Analysis of job market trends and patterns using machine learning on Google job posting data.",
                        tech: ["Python"],
                        image: JobPostingsImage,
                        category: "ml",
                        githubUrl: "https://docs.google.com/document/d/1QzUtiWnslEQZGL-OhD9xSigACunkt0uV/edit?usp=sharing&ouid=101381750453907377125&rtpof=true&sd=true",
                        paperUrl: "https://docs.google.com/document/d/1QzUtiWnslEQZGL-OhD9xSigACunkt0uV/edit?usp=sharing&ouid=101381750453907377125&rtpof=true&sd=true"
                      }
                    ].map((project, index) => (
                      <motion.div
                        key={index}
                        ref={addCardRef}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.5, 
                          delay: index * 0.1,
                          ease: "easeOut"
                        }}
                        className="project-card modern-card"
                        whileHover={{ 
                          y: -8, 
                          scale: 1.02,
                          transition: { duration: 0.2 }
                        }}
                      >
                      <div className="project-image">
                        {typeof project.image === 'string' && project.image.length <= 2 ? (
                          <div style={{
                            width: '100%',
                            height: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '4rem',
                            background: 'rgba(255, 255, 255, 0.05)'
                          }}>
                            {project.image}
                          </div>
                        ) : (
                          <img 
                            src={project.image} 
                            alt={project.title}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover'
                            }}
                          />
                        )}
                      </div>
                      <div className="project-content">
                        <h3>{project.title}</h3>
                        <p>{project.description}</p>
                        <div className="project-tech">
                          {project.tech.map((tech, techIndex) => (
                            <span 
                              key={techIndex} 
                              className={`tech-tag ${tech.toLowerCase()}`}
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                        <div className="project-links">
                          {project.demoUrl ? (
                            <a 
                              href={project.demoUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="btn btn-small"
                              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                            >
                              <ExternalLink size={16} />
                              Live Demo
                            </a>
                          ) : (
                            <button 
                              className="btn btn-small"
                              onClick={() => alert('🚧 This project is currently under maintenance. Please check back later!')}
                            >
                              <ExternalLink size={16} />
                              Live Demo
                            </button>
                          )}
                          <a 
                            href={project.githubUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-small btn-secondary"
                            style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                          >
                            <Github size={16} />
                            Code
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
            </AnimatePresence>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" className="skills">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <div className="section-title-group">
              <DecryptedText
                text="Skills & Technologies"
                speed={50}
                maxIterations={999999}
                sequential={false}
                className="section-title-decrypted"
                parentClassName="section-title-wrapper"
              />
              <ScrambledText
                className="scrambled-text-demo"
                radius={100}
                duration={1.2}
                speed={0.5}
                scrambleChars=".:"
              >
                My technical expertise and achievements
              </ScrambledText>
            </div>
          </motion.div>
          <div className="skills-content">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="skills-column"
            >
              <TechStack />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="skills-column"
            >
              <Certificates />
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="contact">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="section-header"
          >
            <div className="section-title-group">
              <DecryptedText
                text="Get In Touch"
                speed={50}
                maxIterations={999999}
                sequential={false}
                className="section-title-decrypted"
                parentClassName="section-title-wrapper"
              />
              <ScrambledText
                className="scrambled-text-demo"
                radius={100}
                duration={1.2}
                speed={0.5}
                scrambleChars=".:"
              >
                Let's work together
              </ScrambledText>
            </div>
          </motion.div>
          <div className="contact-content">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="contact-info"
            >
              <div className="contact-text-group">
                <DecryptedText
                  text="Make Projects With Me"
                  speed={50}
                  maxIterations={999999}
                  sequential={false}
                  className="contact-title-decrypted"
                  parentClassName="contact-title-wrapper"
                />
                <ScrambledText
                  className="scrambled-text-demo"
                  radius={100}
                  duration={1.2}
                  speed={0.5}
                  scrambleChars=".:"
                >
                  I'm always interested in new opportunities and exciting projects. 
                  Whether you have a question or just want to say hi, feel free to reach out!
                </ScrambledText>
              </div>
              <div className="contact-details">
                <motion.div 
                  className="contact-item"
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Mail size={20} />
                  <a href="mailto:carlmacabales31@gmail.com" className="contact-link">
                    carlmacabales31@gmail.com
                  </a>
                </motion.div>
                <motion.div 
                  className="contact-item"
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <Phone size={20} />
                  <a href="tel:+639563893104" className="contact-link">
                    +63 956 389 3104
                  </a>
                </motion.div>
                <motion.div 
                  className="contact-item"
                  whileHover={{ scale: 1.05, x: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  <MapPin size={20} />
                  <span>Valenzuela, PH</span>
                </motion.div>
              </div>
              <div className="social-links">
                <motion.a
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://github.com/cemmacabales"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="GitHub Profile"
                >
                  <Github size={24} />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://www.linkedin.com/in/carl-emmanuel-macabales-a78742311/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                  title="LinkedIn Profile"
                >
                  <Linkedin size={24} />
                </motion.a>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="contact-form"
            >
              {/* Stepper Progress */}
              <div className="stepper-progress" style={isMobile ? {
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              } : {}}>
                {isMobile && <style>{`
                  .stepper-progress::before {
                    display: none !important;
                  }
                `}</style>}
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className={`stepper-step ${formStep >= step ? 'active' : ''}`} style={isMobile ? {
                    display: 'flex',
                    flexDirection: 'row',
                    gap: '1rem',
                    textAlign: 'left'
                  } : {}}>
                    <div className="step-number">{step}</div>
                    <div className="step-label" style={isMobile ? { fontSize: '0.9rem' } : {}}>
                      {step === 1 && 'Basic Info'}
                      {step === 2 && 'Project Details'}
                      {step === 3 && 'Timeline & Budget'}
                      {step === 4 && 'Message'}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {formStep === 1 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="form-step"
                  >
                    <h3>Let's start with your basic information</h3>
                    <div className={`form-group ${formErrors.name ? 'error' : ''}`}>
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        value={formData.name}
                        onChange={(e) => handleFormInput('name', e.target.value)}
                        required 
                      />
                      {formErrors.name && <span className="form-error">{formErrors.name}</span>}
                    </div>
                    <div className={`form-group ${formErrors.email ? 'error' : ''}`}>
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        value={formData.email}
                        onChange={(e) => handleFormInput('email', e.target.value)}
                        required 
                      />
                      {formErrors.email && <span className="form-error">{formErrors.email}</span>}
                    </div>
                    <div className={`form-group ${formErrors.subject ? 'error' : ''}`}>
                      <input 
                        type="text" 
                        placeholder="Subject" 
                        value={formData.subject}
                        onChange={(e) => handleFormInput('subject', e.target.value)}
                        required 
                      />
                      {formErrors.subject && <span className="form-error">{formErrors.subject}</span>}
                    </div>
                    <div className="form-actions" style={isMobile ? {
                      display: 'flex',
                      flexDirection: 'column'
                    } : {}}>
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="btn btn-primary"
                        style={isMobile ? { width: '100%' } : {}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!formData.name || !formData.email || !formData.subject}
                      >
                        Next Step
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Project Details */}
                {formStep === 2 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="form-step"
                  >
                    <h3>Tell me about your project</h3>
                    <div className="form-group">
                      <select 
                        value={formData.projectType}
                        onChange={(e) => handleFormInput('projectType', e.target.value)}
                        required
                      >
                        <option value="">Select Project Type</option>
                        <option value="web-development">Web Development</option>
                        <option value="mobile-app">Mobile App</option>
                        <option value="machine-learning">Machine Learning</option>
                        <option value="data-analysis">Data Analysis</option>
                        <option value="consultation">Consultation</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className={`form-group ${formErrors.message ? 'error' : ''}`}>
                      <textarea 
                        placeholder="Describe your project requirements..." 
                        rows="4"
                        value={formData.message}
                        onChange={(e) => handleFormInput('message', e.target.value)}
                        required
                      />
                      {formErrors.message && <span className="form-error">{formErrors.message}</span>}
                    </div>
                    <div className="form-actions" style={isMobile ? {
                      display: 'flex',
                      flexDirection: 'column'
                    } : {}}>
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="btn btn-secondary"
                        style={isMobile ? { width: '100%' } : {}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Previous
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="btn btn-primary"
                        style={isMobile ? { width: '100%' } : {}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!formData.projectType || !formData.message}
                      >
                        Next Step
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Timeline & Budget */}
                {formStep === 3 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="form-step"
                  >
                    <h3>Timeline and Budget</h3>
                    <div className="form-group">
                      <select 
                        value={formData.timeline}
                        onChange={(e) => handleFormInput('timeline', e.target.value)}
                        required
                      >
                        <option value="">Select Timeline</option>
                        <option value="1-2-weeks">1-2 weeks</option>
                        <option value="1-month">1 month</option>
                        <option value="2-3-months">2-3 months</option>
                        <option value="3-6-months">3-6 months</option>
                        <option value="6-months-plus">6+ months</option>
                        <option value="flexible">Flexible</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <select 
                        value={formData.budget}
                        onChange={(e) => handleFormInput('budget', e.target.value)}
                        required
                      >
                        <option value="">Select Budget Range</option>
                        <option value="under-5k">Under ₱5,000</option>
                        <option value="5k-10k">₱5,000 - ₱10,000</option>
                        <option value="10k-25k">₱10,000 - ₱25,000</option>
                        <option value="25k-50k">₱25,000 - ₱50,000</option>
                        <option value="50k-100k">₱50,000 - ₱100,000</option>
                        <option value="100k-plus">₱100,000+</option>
                        <option value="free-collab">Free Collaboration</option>
                        <option value="discuss">Let's discuss</option>
                      </select>
                    </div>
                    <div className="form-actions" style={isMobile ? {
                      display: 'flex',
                      flexDirection: 'column'
                    } : {}}>
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="btn btn-secondary"
                        style={isMobile ? { width: '100%' } : {}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Previous
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="btn btn-primary"
                        style={isMobile ? { width: '100%' } : {}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={!formData.timeline || !formData.budget}
                      >
                        Next Step
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Step 4: Final Message */}
                {formStep === 4 && !isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="form-step"
                  >
                    <h3>Additional Message (Optional)</h3>
                    <div className={`form-group ${formErrors.message ? 'error' : ''}`}>
                      <textarea 
                        placeholder="Any additional details, questions, or specific requirements..." 
                        rows="4"
                        value={formData.message}
                        onChange={(e) => handleFormInput('message', e.target.value)}
                      />
                      {formErrors.message && <span className="form-error">{formErrors.message}</span>}
                    </div>
                    <div className="form-summary">
                      <h4>Summary</h4>
                      <div className="summary-item">
                        <strong>Name:</strong> {formData.name}
                      </div>
                      <div className="summary-item">
                        <strong>Email:</strong> {formData.email}
                      </div>
                      <div className="summary-item">
                        <strong>Project:</strong> {formData.projectType}
                      </div>
                      <div className="summary-item">
                        <strong>Timeline:</strong> {formData.timeline}
                      </div>
                      <div className="summary-item">
                        <strong>Budget:</strong> {formData.budget}
                      </div>
                    </div>
                    <div className="form-actions" style={isMobile ? {
                      display: 'flex',
                      flexDirection: 'column'
                    } : {}}>
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="btn btn-secondary"
                        style={isMobile ? { width: '100%' } : {}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Previous
                      </motion.button>
                      <motion.button
                        type="submit"
                        className="btn btn-primary"
                        style={isMobile ? { width: '100%' } : {}}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Message'}
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                {/* Success Step */}
                {isSuccess && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="form-step success-step"
                    style={{
                      textAlign: 'center',
                      padding: '2rem',
                      display: 'block'
                    }}
                  >
                    <div className="success-content" style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '1.5rem'
                    }}>
                      <div className="success-icon" style={{
                        width: isMobile ? '60px' : '80px',
                        height: isMobile ? '60px' : '80px',
                        borderRadius: '50%',
                        background: 'rgba(100, 255, 218, 0.1)',
                        border: '3px solid #64ffda',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '1rem'
                      }}>
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                          className="success-check"
                          style={{
                            fontSize: isMobile ? '1.5rem' : '2rem',
                            fontWeight: 'bold',
                            color: '#64ffda'
                          }}
                        >
                          ✓
                        </motion.div>
                      </div>
                      <h3 style={{
                        color: '#ffffff',
                        fontSize: isMobile ? '1.3rem' : '1.5rem',
                        fontWeight: '700',
                        marginBottom: '0.5rem'
                      }}>Message Sent Successfully!</h3>
                      <p style={{
                        color: '#a0a0a0',
                        fontSize: isMobile ? '0.9rem' : '1rem',
                        lineHeight: '1.6'
                      }}>Thank you for your message. I'll get back to you soon!</p>
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="success-details"
                        style={{
                          marginTop: '1rem',
                          padding: '1rem',
                          background: 'rgba(100, 255, 218, 0.05)',
                          borderRadius: '8px',
                          border: '1px solid rgba(100, 255, 218, 0.2)'
                        }}
                      >
                        <p style={{
                          color: '#64ffda',
                          fontSize: '0.9rem',
                          margin: '0'
                        }}>You'll receive a confirmation email shortly.</p>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>if you made it this far, you deserve a cookie</p>
        </div>
      </footer>
    </div>
  )
}

export default App
