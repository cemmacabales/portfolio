import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
  Monitor
} from 'lucide-react'
import TextType from './components/TextType'
import MagnetLines from './components/MagnetLines'
import Dock from './components/Dock'
import DecryptedText from './components/DecryptedText'
import './App.css'
import SpotlightCard from './components/SpotlightCard'
import ScrambledText from './components/ScrambledText'
import { CareerTimeline } from './components/CareerTimeline'
import EarfquakeImage from './assets/earfquake.png';
import PetchinguImage from './assets/petchingu.png';
import MyAptImage from './assets/myapt.png';
import HeartRiskImage from './assets/heartrisk.png';
import JobPostingsImage from './assets/jobpostings.png';
import Loader from './components/Loader';
import Certificates from './components/Certificates';
import ProfileImage from './assets/me.jpeg';
import TechStack from './components/TechStack'; 



function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [openCategory, setOpenCategory] = useState('ml')
  const [isLoading, setIsLoading] = useState(true)
  const [formStep, setFormStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
    projectType: '',
    budget: '',
    timeline: ''
  })

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleFormInput = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
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
    // Handle form submission here
    console.log('Form submitted:', formData)
    alert('Thank you for your message! I\'ll get back to you soon.')
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: '',
      projectType: '',
      budget: '',
      timeline: ''
    })
    setFormStep(1)
  }

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 3000) // 3 seconds loading time

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Loader />
  }

  return (
    <div className="App">
      {/* Background */}
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
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-primary"
                onClick={() => scrollToSection('projects')}
              >
                View My Work
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="btn btn-secondary"
                onClick={() => scrollToSection('contact')}
              >
                Get In Touch
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
                Outside of academics, I enjoy playing video games, coding, making things from scratch, and solving challenging problems. I’m also passionate about exploring new technologies, contributing to open-source projects, and sharing knowledge with the developer community.
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
                onClick={() => setOpenCategory('ml')}
              >
                <Brain size={24} />
                <span>Machine Learning</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`category-btn ${openCategory === 'software' ? 'active' : ''}`}
                onClick={() => setOpenCategory('software')}
              >
                <Monitor size={24} />
                <span>Software Development</span>
              </motion.button>
            </div>

            {/* Software Development Projects */}
            {openCategory === 'software' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="project-category"
              >
                <div className="projects-grid">
                  {[
                    {
                      title: "Apartment Dashboard Management App",
                      description: "A comprehensive dashboard for managing apartment properties with real-time data visualization and tenant management features.",
                      tech: ["Firebase", "React", "JavaScript", "SCSS", "HTML"],
                      image: MyAptImage,
                      category: "software",
                      githubUrl: "https://github.com/clivebixby0/myapt-july8-2025-main.git"
                    },
                    {
                      title: "Petchingu (Pet Management App)",
                      description: "A complete pet management application for tracking pet health, appointments, and daily care routines.",
                      tech: ["Appwrite", "React", "TypeScript", "JavaScript", "CSS"],
                      image: PetchinguImage,
                      category: "software",
                      githubUrl: "https://github.com/clivebixby0/petchinguuu.git"
                    }
                  ].map((project, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="project-card"
                      whileHover={{ y: -10 }}
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
                          <button 
                            className="btn btn-small"
                            onClick={() => alert('🚧 This project is currently under maintenance. Please check back later!')}
                          >
                            <ExternalLink size={16} />
                            Live Demo
                          </button>
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

            {/* Machine Learning Projects */}
            {openCategory === 'ml' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="project-category"
              >
                <div className="projects-grid">
                  {[
                    {
                      title: "Earfquake (Earthquake Prediction Analysis Tool)",
                      description: "A machine learning tool for analyzing earthquake data and predicting seismic activities using advanced algorithms and data visualization.",
                      tech: ["Streamlit", "Python"],
                      image: EarfquakeImage,
                      category: "ml",
                      githubUrl: "https://github.com/clivebixby0/EARFQUAKE.git"
                    },
                    {
                      title: "Heart Disease Risk Detection",
                      description: "A machine learning model for predicting heart disease risk using various medical parameters and features.",
                      tech: ["Python", "IEEE"],
                      image: HeartRiskImage,
                      category: "ml",
                      githubUrl: "https://docs.google.com/document/d/1ebPPdUOa1kIigPMNj5VT8ZQLbPQN_qA6TuOsBJkDGPc/edit?usp=sharing",
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
                      initial={{ opacity: 0, y: 50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.8, delay: index * 0.1 }}
                      viewport={{ once: true }}
                      className="project-card"
                      whileHover={{ y: -10 }}
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
                          <button 
                            className="btn btn-small"
                            onClick={() => alert('🚧 This project is currently under maintenance. Please check back later!')}
                          >
                            <ExternalLink size={16} />
                            Live Demo
                          </button>
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
                  text="Let's Connect"
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
                  href="https://github.com/clivebixby0"
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
              <div className="stepper-progress">
                {[1, 2, 3, 4].map((step) => (
                  <div key={step} className={`stepper-step ${formStep >= step ? 'active' : ''}`}>
                    <div className="step-number">{step}</div>
                    <div className="step-label">
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
                    <div className="form-group">
                      <input 
                        type="text" 
                        placeholder="Your Name" 
                        value={formData.name}
                        onChange={(e) => handleFormInput('name', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="email" 
                        placeholder="Your Email" 
                        value={formData.email}
                        onChange={(e) => handleFormInput('email', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-group">
                      <input 
                        type="text" 
                        placeholder="Subject" 
                        value={formData.subject}
                        onChange={(e) => handleFormInput('subject', e.target.value)}
                        required 
                      />
                    </div>
                    <div className="form-actions">
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="btn btn-primary"
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
                    <div className="form-group">
                      <textarea 
                        placeholder="Describe your project requirements..." 
                        rows="4"
                        value={formData.message}
                        onChange={(e) => handleFormInput('message', e.target.value)}
                        required
                      />
                    </div>
                    <div className="form-actions">
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="btn btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Previous
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="btn btn-primary"
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
                    <div className="form-actions">
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="btn btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Previous
                      </motion.button>
                      <motion.button
                        type="button"
                        onClick={nextStep}
                        className="btn btn-primary"
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
                {formStep === 4 && (
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                    className="form-step"
                  >
                    <h3>Additional Message (Optional)</h3>
                    <div className="form-group">
                      <textarea 
                        placeholder="Any additional details, questions, or specific requirements..." 
                        rows="4"
                        value={formData.message}
                        onChange={(e) => handleFormInput('message', e.target.value)}
                      />
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
                    <div className="form-actions">
                      <motion.button
                        type="button"
                        onClick={prevStep}
                        className="btn btn-secondary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Previous
                      </motion.button>
                      <motion.button
                        type="submit"
                        className="btn btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Send Message
                      </motion.button>
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
