import './theme.css';
import HeroSection from './components/hero-section/hero-section';
import ExperienceCards from './components/experience-cards/experience-cards';
import TechStack from './sections/TechStack';

export default function ModernLayer() {
  return (
    <div style={{ background: 'var(--modern-color-ink)' }}>
      <HeroSection />
      <ExperienceCards />
      <TechStack />
    </div>
  );
}
