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
import TechStack from './components/TechStack';
import Certificates from './components/Certificates';



function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [openCategory, setOpenCategory] = useState('ml')
  const [isLoading, setIsLoading] = useState(true)

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
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
            <img src="src/assets/me.jpeg" alt="Profile" className="profile-image"
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
                    <h4>4</h4>
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
                      githubUrl: "#",
                      paperUrl: "#"
                    },
                    {
                      title: "Job Trends Analysis from Google Postings",
                      description: "Analysis of job market trends and patterns using machine learning on Google job posting data.",
                      tech: ["Python"],
                      image: JobPostingsImage,
                      category: "ml",
                      githubUrl: "#",
                      paperUrl: "#"
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
            <h2>Get In Touch</h2>
            <p>Let's work together</p>
          </motion.div>
          <div className="contact-content">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="contact-info"
            >
              <h3>Let's Connect</h3>
              <p>
                I'm always interested in new opportunities and exciting projects. 
                Whether you have a question or just want to say hi, feel free to reach out!
              </p>
              <div className="contact-details">
                <div className="contact-item">
                  <Mail size={20} />
                  <span>your.email@example.com</span>
                </div>
                <div className="contact-item">
                  <Phone size={20} />
                  <span>+1 (555) 123-4567</span>
                </div>
                <div className="contact-item">
                  <MapPin size={20} />
                  <span>San Francisco, CA</span>
                </div>
              </div>
              <div className="social-links">
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://github.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
                >
                  <Github size={24} />
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="social-link"
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
              <form>
                <div className="form-group">
                  <input type="text" placeholder="Your Name" required />
                </div>
                <div className="form-group">
                  <input type="email" placeholder="Your Email" required />
                </div>
                <div className="form-group">
                  <input type="text" placeholder="Subject" required />
                </div>
                <div className="form-group">
                  <textarea placeholder="Your Message" rows="5" required></textarea>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  className="btn btn-primary"
                >
                  Send Message
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Your Name. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
