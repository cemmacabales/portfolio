import React from 'react';
import { motion } from 'framer-motion';
import './TechStack.css';
import 'devicon/devicon.min.css';

const TechStack = () => {
  const technologies = [
    // Machine Learning Focused
    { name: "Python", icon: "devicon-python-plain", color: "#FFD43B", bgColor: "#0872f5ff", glowColor: "#FFD43B" }, // yellow → green
    { name: "TensorFlow", icon: "devicon-tensorflow-original", color: "#FF6F00", bgColor: "#1d030bff", glowColor: "#FF6F00" }, // orange → teal
    { name: "PyTorch", icon: "devicon-pytorch-original", color: "#EE4C2C", bgColor: "#00BCD4", glowColor: "#EE4C2C" }, // red → cyan
    { name: "scikit-learn", icon: "devicon-scikitlearn-plain", color: "#F7931E", bgColor: "#fbfbfbff", glowColor: "#F7931E" }, // orange → blue
    { name: "Keras", icon: "devicon-keras-plain", color: "#D00000", bgColor: "#ffffffff", glowColor: "#D00000" }, // red → green
    { name: "Pandas", icon: "devicon-pandas-plain-wordmark", color: "#d0ced6ff", bgColor: "#3700ffff", glowColor: "#150458" }, // dark blue → yellow
    { name: "NumPy", icon: "devicon-numpy-plain", color: "#1d97c0ff", bgColor: "#FFEB3B", glowColor: "#013243" }, // dark blue → yellow
    { name: "Matplotlib", icon: "devicon-matplotlib-plain", color: "#11557C", bgColor: "#FFB300", glowColor: "#11557C" }, // blue → orange
    { name: "Jupyter", icon: "devicon-jupyter-plain", color: "#F37626", bgColor: "#1976D2", glowColor: "#F37626" }, // orange → blue
    { name: "OpenCV", icon: "devicon-opencv-plain", color: "#922f2fff", bgColor: "#d4bed7ff", glowColor: "#5C3EE8" }, // purple → yellow
    { name: "Anaconda", icon: "devicon-anaconda-original", color: "#44A833", bgColor: "#2c7e3eff", glowColor: "#44A833" }, // green → yellow
    { name: "FastAPI", icon: "devicon-fastapi-plain", color: "#009688", bgColor: "#FFEB3B", glowColor: "#009688" }, // teal → yellow
    { name: "Flask", icon: "devicon-flask-original", color: "#000000", bgColor: "#FFFFFF", glowColor: "#000000" }, // black → white
    { name: "Django", icon: "devicon-django-plain", color: "#092E20", bgColor: "#FFEB3B", glowColor: "#092E20" }, // dark green → yellow
    { name: "MySQL", icon: "devicon-mysql-plain", color: "#4479A1", bgColor: "#2e6995ff", glowColor: "#4479A1" }, // blue → orange
    { name: "MongoDB", icon: "devicon-mongodb-plain", color: "#47A248", bgColor: "#298a63ff", glowColor: "#47A248" }, // green → yellow
    // SWE Essentials
    { name: "Git", icon: "devicon-git-plain", color: "#F05032", bgColor: "#ffffffff", glowColor: "#F05032" }, // orange → cyan
    { name: "Docker", icon: "devicon-docker-plain-wordmark", color: "#2496ED", bgColor: "#343131ff", glowColor: "#2496ED" }, // blue → orange
    { name: "PostgreSQL", icon: "devicon-postgresql-plain", color: "#336791", bgColor: "#ffffffff", glowColor: "#336791" }, // blue → yellow
    { name: "React", icon: "devicon-react-original", color: "#00D8FF", bgColor: "#2992a2ff", glowColor: "#00D8FF" }, // cyan → orange
    // More SWE icons
    { name: "JavaScript", icon: "devicon-javascript-plain", color: "#F7DF1E", bgColor: "#c1da90ff", glowColor: "#F7DF1E" }, // yellow → black
    { name: "TypeScript", icon: "devicon-typescript-plain", color: "#3178C6", bgColor: "#6796b4ff", glowColor: "#3178C6" }, // blue → yellow
    { name: "Node.js", icon: "devicon-nodejs-plain", color: "#339933", bgColor: "#437d46ff", glowColor: "#339933" }, // green → yellow
    { name: "HTML5", icon: "devicon-html5-plain", color: "#E34F26", bgColor: "#6b2626ff", glowColor: "#E34F26" }, // orange → yellow
    { name: "CSS3", icon: "devicon-css3-plain", color: "#1572B6", bgColor: "#8df2ffff", glowColor: "#1572B6" }, // blue → yellow
    { name: "VSCode", icon: "devicon-vscode-plain", color: "#007ACC", bgColor: "#50ede3ff", glowColor: "#007ACC" }, // blue → yellow
    { name: "GitHub", icon: "devicon-github-original", color: "#181717", bgColor: "#ffffffff", glowColor: "#181717" } // black → yellow
  ];

  return (
    <div className="tech-stack">
      <h3>Tech Stack</h3>
      <div className="tech-grid">
        {technologies.map((tech, index) => (
          <motion.div
            key={index}
            className="tech-item"
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ 
              scale: 1.05,
              y: -3,
              transition: { duration: 0.2 }
            }}
            style={{
              '--glow-color': tech.glowColor,
              '--bg-color': tech.bgColor
            }}
          >
            <div 
              className="tech-logo"
              style={{ backgroundColor: tech.bgColor }}
            >
              <i 
                className={tech.icon}
                style={{ 
                  fontSize: '2.5rem',
                  color: tech.color
                }}
              ></i>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TechStack;
