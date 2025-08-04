import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, ChevronUp, GraduationCap, School, BookOpen } from 'lucide-react';
import MapuaImage from '../assets/Mapua.png';
import StPaulImage from '../assets/stpaul.png';
import IpsaImage from '../assets/ipsa.jpg';
import DecryptedText from './DecryptedText';

const careerData = [
  {
    period: "2023 - Present",
    title: "Mapúa University",
    level: "College - Computer Science",
    description: "Currently pursuing a degree in Computer Science with specialization in Artificial Intelligence, actively learning and growing in the field of technology.",
    image: MapuaImage,
    icon: <GraduationCap size={24} />,
    color: "#64ffda"
  },
  {
    period: "2021 - 2023",
    title: "St. Paul University",
    level: "Senior High School",
    description: "Pursued specialized education in senior high school, focusing on academic excellence and preparing for higher education.",
    image: StPaulImage,
    icon: <School size={24} />,
    color: "#8b5cf6"
  },
  {
    period: "2009 - 2021",
    title: "International Philippine School in Al Khobar",
    level: "Gradeschool to Highschool",
    description: "Completed my primary and secondary education, building a strong foundation in academics and developing essential life skills.",
    image: IpsaImage,
    icon: <BookOpen size={24} />,
    color: "#4ecdc4"
  }
];

export const CareerTimeline = () => {
  const [expandedItems, setExpandedItems] = useState(new Set());

  const toggleItem = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <>
      {/* Desktop Timeline - Original Minimal Design */}
      <div className="minimal-timeline desktop-timeline">
        <div className="timeline-list">
          {careerData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="timeline-entry"
              whileHover={{ scale: 1.02 }}
            >
              <div className="timeline-dot"></div>
              <div className="timeline-content-minimal">
                <div className="timeline-year">{item.period.split(' - ')[0]}</div>
                <div className="timeline-expanded">
                  <div className="timeline-image-placeholder">
                    <img 
                      src={item.image} 
                      alt={item.title}
                      className="timeline-image"
                      style={{
                        width: '80px',
                        height: '80px',
                        objectFit: 'contain',
                        borderRadius: '12px',
                        maxWidth: '100%',
                        maxHeight: '100%'
                      }}
                    />
                  </div>
                  <div className="timeline-details">
                    <div className="timeline-period-minimal">{item.period}</div>
                    <div className="timeline-title-minimal">{item.title}</div>
                    <div className="timeline-level-minimal">{item.level}</div>
                    <div className="timeline-description">{item.description}</div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Mobile Timeline - New Card Design */}
      <div className="mobile-timeline mobile-timeline-only">
        <div className="timeline-header">
          <DecryptedText
            text="My Educational Journey"
            speed={50}
            maxIterations={999999}
            sequential={false}
            className="timeline-header-title"
            parentClassName="timeline-header-title-wrapper"
          />
          <p>From primary education to university studies</p>
        </div>
        
        <div className="timeline-cards">
          {careerData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="timeline-card"
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="timeline-card-header"
                onClick={() => toggleItem(index)}
                style={{ cursor: 'pointer' }}
              >
                <div className="timeline-card-icon" style={{ backgroundColor: item.color + '20', borderColor: item.color }}>
                  {item.icon}
                </div>
                <div className="timeline-card-info">
                  <div className="timeline-card-period">{item.period}</div>
                  <div className="timeline-card-title">{item.title}</div>
                  <div className="timeline-card-level">{item.level}</div>
                </div>
                <div className="timeline-card-toggle">
                  {expandedItems.has(index) ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                </div>
              </div>
              
              <motion.div
                initial={false}
                animate={{ 
                  height: expandedItems.has(index) ? 'auto' : 0,
                  opacity: expandedItems.has(index) ? 1 : 0
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="timeline-card-content"
              >
                <div className="timeline-card-image">
                  <img 
                    src={item.image} 
                    alt={item.title}
                    style={{
                      width: '100%',
                      height: '120px',
                      objectFit: 'cover',
                      borderRadius: '8px'
                    }}
                  />
                </div>
                <div className="timeline-card-description">
                  {item.description}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </>
  );
}; 