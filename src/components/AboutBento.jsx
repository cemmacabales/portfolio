import MagicBento from './MagicBento';

const cardData = [
  {
    color: 'var(--bg-secondary)',
    title: 'Machine Learning',
    description: 'Building intelligent systems',
    label: 'AI / ML'
  },
  {
    color: 'var(--bg-secondary)',
    title: 'Mapúa University',
    description: '3rd-year CS, AI specialization',
    label: 'Student'
  },
  {
    color: 'var(--bg-secondary)',
    title: 'Full-Stack',
    description: 'End-to-end digital solutions',
    label: 'Dev'
  },
  {
    color: 'var(--bg-secondary)',
    title: 'Gaming & Making',
    description: 'Games, open-source & making things',
    label: 'Hobbies'
  },
  {
    color: 'var(--bg-secondary)',
    title: 'Problem Solving',
    description: 'Tackling challenging problems',
    label: 'Drive'
  }
];

const AboutBento = () => (
  <MagicBento
    cardData={cardData}
    glowColor="100, 255, 218"
    textAutoHide={true}
    enableStars={true}
    enableSpotlight={true}
    enableBorderGlow={true}
    enableTilt={false}
    enableMagnetism={true}
    clickEffect={true}
    spotlightRadius={300}
    particleCount={12}
  />
);

export default AboutBento;
