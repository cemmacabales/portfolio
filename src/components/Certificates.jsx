import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Award } from 'lucide-react';
import './Certificates.css';

// Import certificate images
import ComputerSimulationsImage from '../assets/Computer Simulations.png';
import CyberPhysicalSystemsImage from '../assets/Cyber-Physical Systems: Modeling and Simulation.png';
import DataWarehouseImage from '../assets/Data Warehouse Concepts, Design, and Data Integration.png';
import EngineeringPracticesImage from '../assets/Engineering Practices for Building Quality Software.png';
import MathematicsImage from '../assets/Mathematics for Computer Science.png';
import VisualElementsImage from '../assets/Visual Elements of User Interface Design.png';

const Certificates = () => {
  const certificates = [
    {
      title: "Computer Simulations",
      issuer: "University of California, Davis",
      date: "July 28, 2025",
      url: "https://coursera.org/share/a95589f4ec752a9847970d52171374e6",
      image: ComputerSimulationsImage
    },
    {
      title: "Cyber-Physical Systems: Modeling and Simulation",
      issuer: "University of California, Santa Cruz",
      date: "July 24, 2025",
      url: "https://coursera.org/share/44bb5e2ecfbc300c65243276e490b43d",
      image: CyberPhysicalSystemsImage
    },
    {
      title: "Data Warehouse Concepts, Design, and Data Integration",
      issuer: "University of Colorado System",
      date: "July 18, 2025",
      url: "https://coursera.org/share/f19cb1587ae281697b6409b32d091ab8",
      image: DataWarehouseImage
    },
    {
      title: "Engineering Practices for Building Quality Software",
      issuer: "University of Minnesota",
      date: "July 18, 2025",
      url: "https://coursera.org/share/3ec74c9e80af33781f9c9ca8af54d8bb",
      image: EngineeringPracticesImage
    },
    {
      title: "Mathematics for Computer Science",
      issuer: "University of London",
      date: "September 25, 2023",
      url: "https://coursera.org/share/a2cda3e2b82c71567fed50a1d7035fdb",
      image: MathematicsImage
    },
    {
      title: "Visual Elements of User Interface Design",
      issuer: "California Institute of the Arts",
      date: "July 18, 2025",
      url: "https://coursera.org/share/320f344082a94923a71bceae3cb36e8d",
      image: VisualElementsImage
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