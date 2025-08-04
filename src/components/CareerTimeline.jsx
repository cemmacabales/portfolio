import React, { useState, useEffect } from 'react';
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

// Mobile detection hook
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return isMobile;
};

export const CareerTimeline = () => {
  const [expandedItems, setExpandedItems] = useState(new Set([0, 1, 2])); // Start with all expanded
  const isMobile = useIsMobile();

  const toggleItem = (index) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  // Render only the appropriate timeline based on screen size
  if (isMobile) {
    return (
      <div className="mobile-timeline" style={{
        display: 'block',
        width: '100%',
        padding: '1rem 0'
      }}>
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
        
        <div className="timeline-cards" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          width: '100%'
        }}>
          {careerData.map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="timeline-card"
              style={{
                display: 'block',
                width: '100%',
                marginBottom: '1rem',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '12px',
                overflow: 'hidden',
                minHeight: '120px'
              }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <div 
                className="timeline-card-header"
                onClick={() => toggleItem(index)}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '1rem',
                  gap: '1rem',
                  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <div className="timeline-card-icon" style={{ 
                  backgroundColor: item.color + '20', 
                  borderColor: item.color,
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div className="timeline-card-info" style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem'
                }}>
                  <div className="timeline-card-period" style={{
                    fontSize: '0.8rem',
                    color: item.color,
                    fontWeight: '600'
                  }}>{item.period}</div>
                  <div className="timeline-card-title" style={{
                    fontSize: '1rem',
                    fontWeight: '600',
                    color: '#ffffff'
                  }}>{item.title}</div>
                  <div className="timeline-card-level" style={{
                    fontSize: '0.85rem',
                    color: '#a0a0a0'
                  }}>{item.level}</div>
                </div>
                <div className="timeline-card-toggle" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#a0a0a0',
                  transition: 'color 0.3s ease'
                }}>
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
                style={{
                  overflow: 'hidden',
                  padding: '0 1rem',
                  maxHeight: '500px'
                }}
              >
                <div className="timeline-card-image" style={{ margin: '1rem 0' }}>
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
                <div className="timeline-card-description" style={{
                  fontSize: '0.95rem',
                  color: '#a0a0a0',
                  lineHeight: '1.6',
                  marginBottom: '1rem',
                  paddingBottom: '1rem'
                }}>
                  {item.description}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // Desktop timeline
  return (
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
  );
}; 