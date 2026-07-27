import './theme.css';
import HeroSection from './components/hero-section/hero-section';
import ExperienceCards from './components/experience-cards/experience-cards';

export default function ModernLayer() {
  return (
    <div style={{ background: 'var(--modern-color-ink)' }}>
      <HeroSection />
      <ExperienceCards />
    </div>
  );
}
