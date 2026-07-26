import WelcomeSprite from '../retro/components/welcome-sprite/welcome-sprite';
import NavSection from '../retro/components/nav-section/nav-section';
import FlameBar from '../retro/components/flame-bar/flame-bar';
import NavGif from '../retro/components/nav-gif/nav-gif';
import uottawaLogo from '../assets/retro/images/uottawa-logo.png';
import uottawaLogoOutline from '../assets/retro/images/uottawa-logo-outline.png';
import myPhoto from '../assets/retro/images/my-photo.png';
import myPhotoOutline from '../assets/retro/images/my-photo-outline.png';
import javaLogo from '../assets/retro/images/java-logo.png';
import tsLogo from '../assets/retro/images/ts-logo.png';
import sqlLogo from '../assets/retro/images/sql-logo.png';

import officialSiteBadge from '../assets/retro/gifs/nav-side/official-site-badge.webp';
import thanksForVisiting from '../assets/retro/gifs/nav-side/thanks-for-visiting.webp';
import webmasterCrossing from '../assets/retro/gifs/nav-side/webmaster-crossing.webp';

export interface JunkItem {
  id: string;
  Component: React.ComponentType;
  /** Which side panel to render into. Omit to render in the center column. */
  placement?: 'left' | 'right';
}

function gifItem(id: string, src: string, width: number, placement: 'left' | 'right'): JunkItem {
  return {
    id,
    placement,
    Component: () => <NavGif src={src} width={width} />,
  };
}

export const JUNK_ITEMS: JunkItem[] = [
  { id: 'welcome-sprite', Component: WelcomeSprite },
  { id: 'nav-section', Component: NavSection },
  { id: 'flame-bar', Component: FlameBar },

  // left side panel: vertically centered next to the nav section
  gifItem('official-site-badge', officialSiteBadge, 208, 'left'),

  // right side panel: top, then bottom, centered around the nav section
  gifItem('webmaster-crossing', webmasterCrossing, 182, 'right'),
  gifItem('thanks-for-visiting', thanksForVisiting, 208, 'right'),
];

export interface ExperiencePage {
  role: string;
  company: string;
  location: string;
  dates: string;
  /** Client project context, when the role spans multiple engagements (e.g. a consulting firm). */
  subtext?: string;
  /** Project/product website, shown as a link button beside the header. */
  link?: string;
  bullets: string[];
}

export interface SectionItem {
  id: string;
  title: string;
  /** Each entry renders as its own line in the section panel. Ignored when `pages` is set. */
  lines?: string[];
  /** Optional badge/logo rendered beside the lines. */
  image?: {
    src: string;
    alt: string;
    outlineSrc?: string;
    framed?: boolean;
    /** Buttons rendered below a framed image, same width as the frame. */
    links?: { label: string; href: string }[];
  };
  /** Plain small logos rendered to the right of the lines (no frame/outline). */
  images?: { src: string; alt: string }[];
  /** If set, the section paginates through these instead of rendering `lines`. */
  pages?: ExperiencePage[];
}

export const SECTION_ITEMS: SectionItem[] = [
  {
    id: 'about',
    title: 'About Me',
    lines: [
      "Nikita, nice to meet you. I'm a full-stack software engineer based in Toronto. I got into this industry 5 years ago, and what drives me isn't just delivering good work — it's making a real impact and helping the people I work with actually achieve their vision.",
      "Professionally, I've been fortunate to work on some pretty large-scale platforms and design backend systems. I've always stayed agile when it comes to stack, but I'm mostly known for my Spring Boot + Angular projects wired up with Kafka pipelines. My biggest passion is exploring macro architecture, learning from the best in the space to eventually grow into a System Architect role.",
      "Outside of work, I'm into art — street photography especially. If a gallery opening or a show pops up last minute, I'm probably already searching for my ticket.",
    ],
    image: {
      src: myPhoto,
      alt: 'Me',
      outlineSrc: myPhotoOutline,
      framed: true,
      links: [
        { label: 'LinkedIn', href: 'https://www.linkedin.com/in/nikita-bliumkin/' },
        { label: 'GitHub', href: 'https://github.com/GitBliumkin' },
      ],
    },
  },
  {
    id: 'experience',
    title: 'Experience',
    pages: [
      {
        role: 'Software Developer II',
        company: 'Personify – MC Professional Platform',
        location: 'Toronto, ON',
        dates: 'Apr 2025 – Apr 2026',
        subtext:
          'SaaS platform serving **2,500+ non-profit organizations** across North America',
        link: 'https://memberclicks.com/products/professional/',
        bullets: [
          '• **Architected a distributed invoice history logging system**, designing backend services and data models to track invoice lifecycle events across **microservices**',
          '• Implemented **Kafka**-based event-driven pipeline to guarantee reliable invoice state propagation and **eliminate cross-service inconsistencies**',
          '• Designed and executed database schema migrations and production data backfills as part of a **blue-green deployment**, coordinating **Kafka** consumer updates and data model changes for **zero-downtime releases**',
          '• Resolved complex production incidents across **microservices**, **Kafka** consumers, and database layers, **reducing mean time to resolution**',
          '• Built **Zapier** automation triggers that **reduced billing-related incidents to zero**',
          '• Modernized **Angular** invoice UI to align with updated design standards, improving usability',
        ],
      },
      {
        role: 'Full Stack Developer',
        company: 'Levio (formerly Indellient)',
        location: 'Toronto, ON',
        dates: 'Jun 2021 – Mar 2025',
        subtext: 'Client project: Viewbid — Online Auction Platform · Mar 2024 – Mar 2025',
        link: 'https://viewbid.com/home',
        bullets: [
          '• Built scalable REST APIs with **NestJS** and **PostgreSQL** powering high-frequency bidding for **21,000+ global users**',
          '• Developed full-stack auction features including auction management, user profiles, and bidding views using **Angular** on the frontend',
          '• **Optimized concurrent database queries** to maintain consistency under simultaneous bidding load',
          '• Leveraged **Redis Pub/Sub** for asynchronous event propagation across services, enabling **real-time bid updates at scale**',
          '• Deployed and maintained containerized microservices on **AWS** using **Docker** and **CI/CD** pipelines',
        ],
      },
      {
        role: 'Full Stack Developer',
        company: 'Levio (formerly Indellient)',
        location: 'Toronto, ON',
        dates: 'Jun 2021 – Mar 2025',
        subtext:
          'Client project: Fiserv — NOW Gateway, Real-Time Payments Platform · Jun 2021 – Mar 2024',
        link: 'https://www.fiserv.com/en/solutions/instant-payments/now-gateway.html',
        bullets: [
          "• Developed backend transaction processing pipeline for Fiserv's NOW Gateway, **reducing payment settlement time from 1–3 days to seconds** by implementing ISO format normalization, validation, and routing through **The Clearing House RTP network**",
          '• Built services processing **100,000+ transactions monthly across 5,000+ financial institutions** using **Java (Spring Boot)**, integrated **Kafka** and **IBM MQ** for asynchronous communication across financial microservices',
          '• Designed **real-time monitoring dashboard** tracking transaction throughput, success rates, and system failures across financial institutions',
          '• Implemented **SQL**-driven **test automation harness** enabling support teams to simulate and validate real transaction scenarios with configurable parameters',
        ],
      },
    ],
  },
  {
    id: 'technologies',
    title: 'Technologies',
    lines: [
      'Languages: Java, TypeScript, JavaScript, Scala',
      'Backend: Spring Boot, NestJS, Microservices, REST APIs',
      'Frontend: Angular, React, HTML5, CSS3',
      'Databases: PostgreSQL, MySQL, DynamoDB, MongoDB',
      'Messaging: Kafka, IBM MQ, Redis',
      'Cloud & DevOps: AWS, Docker, CI/CD, Jenkins',
      'Tools: OpenSearch, Elasticsearch, Git, Jira',
      'AI Tooling: GitHub Copilot, Claude',
    ],
    images: [
      { src: javaLogo, alt: 'Java' },
      { src: tsLogo, alt: 'TypeScript' },
      { src: sqlLogo, alt: 'SQL' },
    ],
  },
  {
    id: 'education',
    title: 'Education',
    lines: ['Computer Engineering', 'University of Ottawa', '2016 – 2020'],
    image: { src: uottawaLogo, alt: 'University of Ottawa', outlineSrc: uottawaLogoOutline },
  },
];