import { useState } from 'react'
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
  Award
} from 'lucide-react'
import TextType from './components/TextType'
import MagnetLines from './components/MagnetLines'
import Dock from './components/Dock'
import DecryptedText from './components/DecryptedText'
import './App.css'

function App() {
  const [activeSection, setActiveSection] = useState('home')

  const scrollToSection = (sectionId) => {
    setActiveSection(sectionId)
    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' })
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
                textColors={["#64ffda", "#ff6b6b", "#4ecdc4"]}
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
            style={{ width: '100%', height: '100%', borderRadius: '50%'}} 
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
            <h2>About Me</h2>
            <p>Get to know me better</p>
          </motion.div>
          <div className="about-content">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true }}
              className="about-text"
            >
              <h3>Who I Am</h3>
            <p>
              I'm a 3rd-year student at Mapúa University specializing in Artificial Intelligence.  
              I enjoy working with machine learning and have experience in both backend and frontend 
              development, allowing me to build complete and functional digital solutions.  
            </p>
            <p>
              Outside of academics, I enjoy playing video games, coding, making things from scratch, 
              and solving challenging problems. I’m also passionate about exploring new technologies, 
              contributing to open-source projects, and sharing knowledge with the developer community.  
            </p>
              <div className="about-stats">
                <div className="stat">
                  <h4>400+</h4>
                  <p>Hours of Learning</p>
                </div>
                <div className="stat">
                  <h4>4</h4>
                  <p>Projects Completed</p>
                </div>
                <div className="stat">
                  <h4>20+</h4>
                  <p>Certificates Earned</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              viewport={{ once: true }}
              className="about-image"
            >
              <div className="about-placeholder">
                <Palette size={60} />
              </div>
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
            <h2>My Projects</h2>
            <p>Some of my recent work</p>
          </motion.div>
          <div className="projects-grid">
            {[
              {
                title: "E-Commerce Platform",
                description: "A full-stack e-commerce solution with React, Node.js, and MongoDB",
                tech: ["React", "Node.js", "MongoDB", "Stripe"],
                image: "🛒"
              },
              {
                title: "Task Management App",
                description: "A collaborative task management application with real-time updates",
                tech: ["React", "Firebase", "Material-UI"],
                image: "📋"
              },
              {
                title: "Weather Dashboard",
                description: "A beautiful weather application with location-based forecasts",
                tech: ["React", "OpenWeather API", "Chart.js"],
                image: "🌤️"
              },
              {
                title: "Portfolio Website",
                description: "A modern, responsive portfolio built with React and Framer Motion",
                tech: ["React", "Framer Motion", "CSS3"],
                image: "💼"
              },
              {
                title: "Chat Application",
                description: "Real-time chat application with user authentication",
                tech: ["React", "Socket.io", "Express"],
                image: "💬"
              },
              {
                title: "Blog Platform",
                description: "A content management system for bloggers and writers",
                tech: ["React", "GraphQL", "PostgreSQL"],
                image: "✍️"
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
                  <span className="project-emoji">{project.image}</span>
                </div>
                <div className="project-content">
                  <h3>{project.title}</h3>
                  <p>{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((tech, techIndex) => (
                      <span key={techIndex} className="tech-tag">{tech}</span>
                    ))}
                  </div>
                  <div className="project-links">
                    <button className="btn btn-small">
                      <ExternalLink size={16} />
                      Live Demo
                    </button>
                    <button className="btn btn-small btn-secondary">
                      <Github size={16} />
                      Code
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
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
            <h2>Skills & Technologies</h2>
            <p>Technologies I work with</p>
          </motion.div>
          <div className="skills-grid">
            {[
              { category: "Frontend", skills: ["React", "JavaScript", "TypeScript", "HTML/CSS", "Tailwind CSS", "Material-UI"] },
              { category: "Backend", skills: ["Node.js", "Express", "Python", "Django", "PostgreSQL", "MongoDB"] },
              { category: "Tools", skills: ["Git", "Docker", "AWS", "Firebase", "Figma", "Postman"] },
              { category: "Other", skills: ["REST APIs", "GraphQL", "Jest", "CI/CD", "Agile", "Responsive Design"] }
            ].map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="skill-category"
              >
                <h3>{category.category}</h3>
                <div className="skill-tags">
                  {category.skills.map((skill, skillIndex) => (
                    <span key={skillIndex} className="skill-tag">{skill}</span>
                  ))}
                </div>
              </motion.div>
            ))}
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
