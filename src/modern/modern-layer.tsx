import './theme.css';
import AboutMe from './sections/about-me/about-me';
import ExperienceCards from './components/experience-cards/experience-cards';
import ScrollProgress from './components/scroll-progress/scroll-progress';
import NavBar from './components/nav-bar/nav-bar';
import TechStack from './sections/tech-stack/tech-stack';
import Education from './sections/education/education';
import ContactMe from './sections/contact-me/contact-me';

export default function ModernLayer() {
  return (
    <div style={{ background: 'var(--modern-color-ink)' }}>
      <ScrollProgress />
      <NavBar />
      <AboutMe />
      <ExperienceCards />
      <TechStack />
      <Education />
      <ContactMe />
    </div>
  );
}
