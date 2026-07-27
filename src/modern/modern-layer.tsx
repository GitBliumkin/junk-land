import './theme.css';
import HeroSection from './components/hero-section/hero-section';

export default function ModernLayer() {
  return (
    <div style={{ background: 'var(--modern-color-ink)' }}>
      <HeroSection />
    </div>
  );
}
