import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Award } from 'lucide-react';
import './Certificates.css';

const Certificates = () => {
  const certificates = [
    {
      title: "Machine Learning for All",
      issuer: "Coursera",
      date: "2024",
      url: "#",
      image: "https://images.credly.com/size/680x680/images/0e284e3f-5164-4b21-8660-0d84737941bc/image.png"
    },
    {
      title: "Python for Everybody",
      issuer: "Coursera",
      date: "2024",
      url: "#",
      image: "https://images.credly.com/size/680x680/images/0e284e3f-5164-4b21-8660-0d84737941bc/image.png"
    },
    {
      title: "Data Science Fundamentals",
      issuer: "Coursera",
      date: "2024",
      url: "#",
      image: "https://images.credly.com/size/680x680/images/0e284e3f-5164-4b21-8660-0d84737941bc/image.png"
    },
    {
      title: "Web Development Bootcamp",
      issuer: "Coursera",
      date: "2024",
      url: "#",
      image: "https://images.credly.com/size/680x680/images/0e284e3f-5164-4b21-8660-0d84737941bc/image.png"
    },
    {
      title: "React Development",
      issuer: "Coursera",
      date: "2024",
      url: "#",
      image: "https://images.credly.com/size/680x680/images/0e284e3f-5164-4b21-8660-0d84737941bc/image.png"
    },
    {
      title: "Node.js Backend Development",
      issuer: "Coursera",
      date: "2024",
      url: "#",
      image: "https://images.credly.com/size/680x680/images/0e284e3f-5164-4b21-8660-0d84737941bc/image.png"
    }
  ];

  return (
    <div className="certificates">
      <h3>Certificates</h3>
      <div className="certificates-grid">
        {certificates.map((cert, index) => (
          <motion.div
            key={index}
            className="certificate-item"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ 
              y: -5,
              transition: { duration: 0.2 }
            }}
          >
            <div className="certificate-image">
              <img 
                src={cert.image} 
                alt={cert.title}
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="certificate-placeholder">
                <Award size={40} />
              </div>
            </div>
            <div className="certificate-content">
              <h4>{cert.title}</h4>
              <p className="certificate-issuer">{cert.issuer}</p>
              <p className="certificate-date">{cert.date}</p>
              <motion.a
                href={cert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="certificate-link"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <ExternalLink size={16} />
                View Certificate
              </motion.a>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Certificates; 