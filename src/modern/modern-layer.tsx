import './theme.css';
import HeroSection from './sections/about-me-section';
import ExperienceCards from './components/experience-cards/experience-cards';
import ScrollProgress from './components/scroll-progress/scroll-progress';
import NavBar from './components/nav-bar/nav-bar';
import TechStack from './sections/TechStack';
import Education from './sections/Education';
import ContactMe from './sections/ContactMe';

export default function ModernLayer() {
  return (
    <div style={{ background: 'var(--modern-color-ink)' }}>
      <ScrollProgress />
      <NavBar />
      <HeroSection />
      <ExperienceCards />
      <TechStack />
      <Education />
      <ContactMe />
    </div>
  );
}
