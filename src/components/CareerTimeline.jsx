import React from 'react';
import { motion } from 'framer-motion';
import MapuaImage from '../assets/Mapua.png';
import StPaulImage from '../assets/stpaul.png';
import IpsaImage from '../assets/ipsa.jpg';

const careerData = [
  {
    period: "2023 - Present",
    title: "Mapúa University",
    level: "College - Computer Science",
    description: "Currently pursuing a degree in Computer Science with specialization in Artificial Intelligence, actively learning and growing in the field of technology.",
    image: MapuaImage,
    color: "from-green-500 to-emerald-500"
  },
  {
    period: "2021 - 2023",
    title: "St. Paul University",
    level: "Senior High School",
    description: "Pursued specialized education in senior high school, focusing on academic excellence and preparing for higher education.",
    image: StPaulImage,
    color: "from-purple-500 to-pink-500"
  },
  {
    period: "2009 - 2021",
    title: "International Philippine School in Al Khobar",
    level: "Gradeschool to Highschool",
    description: "Completed my primary and secondary education, building a strong foundation in academics and developing essential life skills.",
    image: IpsaImage,
    color: "from-blue-500 to-cyan-500"
  }
];

export const CareerTimeline = () => {
  return (
    <div className="minimal-timeline">
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