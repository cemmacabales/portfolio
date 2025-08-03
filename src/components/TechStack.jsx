import React from 'react';
import { motion } from 'framer-motion';
import StackIcon from 'tech-stack-icons';
import './TechStack.css';

const TechStack = () => {
  const technologies = [
    {
      name: "React",
      iconName: "react",
      color: "#00D8FF",
      bgColor: "#0066CC",
      variant: "dark",
      glowColor: "#00D8FF"
    },
    {
      name: "js",
      iconName: "js",
      color: "#FFD600",
      bgColor: "#FFD600",
      variant: "original",
      glowColor: "#F7DF1E",
      customSvg: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100">
          <path fill="#F7DF1E" d="M100 0H0v100h100z"/>
          <path fill="#000" d="M67.175 78.125c2.014 3.29 4.634 5.707 9.27 5.707 3.893 0 6.38-1.946 6.38-4.635 0-3.222-2.555-4.364-6.84-6.238l-2.35-1.008c-6.781-2.89-11.286-6.508-11.286-14.159 0-7.047 5.37-12.413 13.762-12.413 5.975 0 10.27 2.08 13.365 7.524l-7.317 4.699c-1.612-2.89-3.35-4.027-6.048-4.027-2.752 0-4.497 1.746-4.497 4.027 0 2.819 1.746 3.96 5.778 5.706l2.35 1.006c7.983 3.424 12.491 6.915 12.491 14.762 0 8.46-6.646 13.096-15.571 13.096-8.727 0-14.365-4.16-17.124-9.61zm-33.196.815c1.477 2.619 2.82 4.833 6.048 4.833 3.087 0 5.035-1.208 5.035-5.905V45.916h9.397v32.08c0 9.73-5.705 14.158-14.032 14.158-7.524 0-11.881-3.894-14.097-8.583z"/>
        </svg>
      )
    },
    {
      name: "TypeScript",
      iconName: "typescript",
      color: "#007ACC",
      bgColor: "#004C99",
      variant: "dark",
      glowColor: "#007ACC"
    },
    {
      name: "Python",
      iconName: "python",
      color: "#FFD43B",
      bgColor: "#CC9900",
      variant: "dark",
      glowColor: "#FFD43B"
    },
    {
      name: "Node.js",
      iconName: "nodejs",
      color: "#68A063",
      bgColor: "#4A7A3F",
      variant: "dark",
      glowColor: "#68A063"
    },
    {
      name: "Express",
      iconName: "expressjs",
      color: "#6C757D",
      bgColor: "#6C757D",
      variant: "dark",
      glowColor: "#6C757D"
    },
    {
      name: "Django",
      iconName: "django",
      color: "#44B78B",
      bgColor: "#2E7A5F",
      variant: "dark",
      glowColor: "#44B78B"
    },
    {
      name: "PostgreSQL",
      iconName: "postgresql",
      color: "#336791",
      bgColor: "#1E3F5A",
      variant: "dark",
      glowColor: "#336791"
    },
    {
      name: "MongoDB",
      iconName: "mongodb",
      color: "#4DB33D",
      bgColor: "#2E7A2A",
      variant: "dark",
      glowColor: "#4DB33D"
    },
    {
      name: "Firebase",
      iconName: "firebase",
      color: "#FFCA28",
      bgColor: "#CC9900",
      variant: "dark",
      glowColor: "#FFCA28"
    },
    {
      name: "Git",
      iconName: "git",
      color: "#F05032",
      bgColor: "#FFE6E6",
      variant: "dark",
      glowColor: "#F05032"
    },
    {
      name: "Docker",
      iconName: "docker",
      color: "#2496ED",
      bgColor: "#FFFFFF",
      variant: "light",
      glowColor: "#2496ED"
    },
    {
      name: "AWS",
      iconName: "aws",
      color: "#FF9900",
      bgColor: "#FFFFFF",
      variant: "light",
      glowColor: "#FF9900"
    },
    {
      name: "HTML5",
      iconName: "html5",
      color: "#E34F26",
      bgColor: "#B33D1A",
      variant: "dark",
      glowColor: "#E34F26"
    },
    {
      name: "CSS3",
      iconName: "css3",
      color: "#1572B6",
      bgColor: "#0F4F7A",
      variant: "dark",
      glowColor: "#1572B6"
    },
    {
      name: "Tailwind CSS",
      iconName: "tailwindcss",
      color: "#38BDF8",
      bgColor: "#1A6BB3",
      variant: "dark",
      glowColor: "#38BDF8"
    },
    {
      name: "Material-UI",
      iconName: "materialui",
      color: "#0081CB",
      bgColor: "#005A8A",
      variant: "dark",
      glowColor: "#0081CB"
    },
    {
      name: "Figma",
      iconName: "figma",
      color: "#F24E1E",
      bgColor: "#CC3A1A",
      variant: "dark",
      glowColor: "#F24E1E"
    },
    {
      name: "Adobe After Effects",
      iconName: "ae",
      color: "#9999FF",
      bgColor: "#6666CC",
      variant: "dark",
      glowColor: "#9999FF"
    },
    {
      name: "Appwrite",
      iconName: "appwrite",
      color: "#FD366E",
      bgColor: "#CC1A4A",
      variant: "dark",
      glowColor: "#FD366E"
    },
    {
      name: "Bootstrap 5",
      iconName: "bootstrap5",
      color: "#7952B3",
      bgColor: "#5A3A8A",
      variant: "dark",
      glowColor: "#7952B3"
    },
    {
      name: "Canva",
      iconName: "canva",
      color: "#00C4CC",
      bgColor: "#009999",
      variant: "light",
      glowColor: "#00C4CC",
      customSvg: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100">
          <path fill="#7D2AE7" d="M50 100c27.614 0 50-22.387 50-50 0-27.615-22.386-50-50-50S0 22.384 0 50c0 27.613 22.386 50 50 50"/>
          <path fill="url(#a)" d="M50 100c27.614 0 50-22.387 50-50 0-27.615-22.386-50-50-50S0 22.384 0 50c0 27.613 22.386 50 50 50"/>
          <path fill="url(#b)" d="M50 100c27.614 0 50-22.387 50-50 0-27.615-22.386-50-50-50S0 22.384 0 50c0 27.613 22.386 50 50 50"/>
          <path fill="url(#c)" d="M50 100c27.614 0 50-22.387 50-50 0-27.615-22.386-50-50-50S0 22.384 0 50c0 27.613 22.386 50 50 50"/>
          <path fill="url(#d)" d="M50 100c27.614 0 50-22.387 50-50 0-27.615-22.386-50-50-50S0 22.384 0 50c0 27.613 22.386 50 50 50"/>
          <path fill="#fff" d="M71.586 60.256c-.412 0-.775.348-1.153 1.11-4.268 8.653-11.638 14.775-20.168 14.775-9.862 0-15.969-8.902-15.969-21.201 0-20.834 11.608-32.88 21.803-32.88 4.765 0 7.674 2.995 7.674 7.76 0 5.654-3.213 8.648-3.213 10.642 0 .895.557 1.438 1.661 1.438 4.437 0 9.644-5.098 9.644-12.3 0-6.982-6.078-12.115-16.273-12.115-16.85 0-31.824 15.622-31.824 37.236 0 16.73 9.553 27.786 24.294 27.786 15.646 0 24.693-15.567 24.693-20.62 0-1.118-.572-1.631-1.169-1.631"/>
          <defs>
            <radialGradient id="a" cx="0" cy="0" r="1" gradientTransform="rotate(-49.416 105.972 23.325)scale(77.3416)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6420FF"/>
              <stop offset="1" stopColor="#6420FF" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="b" cx="0" cy="0" r="1" gradientTransform="rotate(54.703 2.249 31.273)scale(87.2168)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00C4CC"/>
              <stop offset="1" stopColor="#00C4CC" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="c" cx="0" cy="0" r="1" gradientTransform="matrix(53.84252 -54.21027 24.93201 24.76288 19.315 88.63)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#6420FF"/>
              <stop offset="1" stopColor="#6420FF" stopOpacity="0"/>
            </radialGradient>
            <radialGradient id="d" cx="0" cy="0" r="1" gradientTransform="rotate(66.52 10.177 37.912)scale(78.7295 131.889)" gradientUnits="userSpaceOnUse">
              <stop stopColor="#00C4CC" stopOpacity=".726"/>
              <stop offset="0" stopColor="#00C4CC"/>
              <stop offset="1" stopColor="#00C4CC" stopOpacity="0"/>
            </radialGradient>
          </defs>
        </svg>
      )
    },
    {
      name: "Chrome",
      iconName: "chrome",
      color: "#4285F4",
      bgColor: "#2A5A9A",
      variant: "dark",
      glowColor: "#4285F4",
      customSvg: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 100 100">
          <g clipPath="url(#a)">
            <path fill="#fff" d="M50 74.989c13.807 0 25-11.193 25-25s-11.193-25-25-25-25 11.193-25 25 11.193 25 25 25"/>
            <path fill="url(#b)" d="M50 25h43.294a49.988 49.988 0 0 0-86.591.006L28.35 62.5l.02-.005A24.968 24.968 0 0 1 50 25"/>
            <path fill="#1A73E8" d="M50 69.792c10.93 0 19.792-8.861 19.792-19.792 0-10.93-8.861-19.792-19.792-19.792-10.93 0-19.792 8.861-19.792 19.792 0 10.93 8.861 19.792 19.792 19.792"/>
            <path fill="url(#c)" d="M71.649 62.506 50 100a49.99 49.99 0 0 0 43.29-74.993H49.999l-.006.019a24.97 24.97 0 0 1 21.657 37.48"/>
            <path fill="url(#d)" d="M28.351 62.507 6.704 25.013A49.988 49.988 0 0 0 50.005 100l21.647-37.494-.014-.014a24.969 24.969 0 0 1-43.287.015"/>
          </g>
          <defs>
            <linearGradient id="b" x1="6.703" x2="93.294" y1="31.25" y2="31.25" gradientUnits="userSpaceOnUse">
              <stop stopColor="#D93025"/>
              <stop offset="1" stopColor="#EA4335"/>
            </linearGradient>
            <linearGradient id="c" x1="43.171" x2="86.466" y1="99.332" y2="24.341" gradientUnits="userSpaceOnUse">
              <stop stopColor="#FCC934"/>
              <stop offset="1" stopColor="#FBBC04"/>
            </linearGradient>
            <linearGradient id="d" x1="55.413" x2="12.117" y1="96.878" y2="21.887" gradientUnits="userSpaceOnUse">
              <stop stopColor="#1E8E3E"/>
              <stop offset="1" stopColor="#34A853"/>
            </linearGradient>
            <clipPath id="a">
              <path fill="#fff" d="M0 0h100v100H0z"/>
            </clipPath>
          </defs>
        </svg>
      )
    },
    {
      name: "Google Colab",
      iconName: "colab",
      color: "#F9AB00",
      bgColor: "#CC8800",
      variant: "dark",
      glowColor: "#F9AB00"
    },
    {
      name: "GitHub",
      iconName: "github",
      color: "#181717",
      bgColor: "#FFFFFF",
      variant: "light",
      glowColor: "#181717"
    },
    {
      name: "Next.js",
      iconName: "nextjs",
      color: "#000000",
      bgColor: "#FFFFFF",
      variant: "light",
      glowColor: "#000000"
    },
    {
      name: "Safari",
      iconName: "safari",
      color: "#006CFF",
      bgColor: "#0055CC",
      variant: "dark",
      glowColor: "#006CFF"
    },
    {
      name: "Three.js",
      iconName: "threejs",
      color: "#000000",
      bgColor: "#FFFFFF",
      variant: "light",
      glowColor: "#000000"
    },
    {
      name: "Vite",
      iconName: "vitejs",
      color: "#646CFF",
      bgColor: "#4A4FCC",
      variant: "dark",
      glowColor: "#646CFF"
    },
    {
      name: "VS Code",
      iconName: "vscode",
      color: "#007ACC",
      bgColor: "#005A8A",
      variant: "dark",
      glowColor: "#007ACC"
    }
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
              {tech.customSvg ? (
                tech.customSvg
              ) : (
                <StackIcon name={tech.iconName} variant={tech.variant} />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default TechStack; 