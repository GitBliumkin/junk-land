import './theme.css';
import HeroSection from './components/hero-section/hero-section';
import ExperienceCards from './components/experience-cards/experience-cards';
import TechStack from './sections/TechStack';
import Education from './sections/Education';
import ContactMe from './sections/ContactMe';

export default function ModernLayer() {
  return (
    <div style={{ background: 'var(--modern-color-ink)' }}>
      <HeroSection />
      <ExperienceCards />
      <TechStack />
      <Education />
      <ContactMe />
    </div>
  );
}
