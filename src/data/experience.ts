import mcProLogo from '../assets/modern/images/mc-pro-logo-trimmed.png';
import viewbidLogo from '../assets/modern/images/viewbid-logo-trimmed.png';
import fiservLogo from '../assets/modern/images/fiserv-logo-trimmed.png';

export interface ExperienceEntry {
  id: string;
  logoSrc: string;
  company: string;
  project?: string;
  role: string;
  location: string;
  dateRange: string;
  techStack?: string;
  overview: string;
  bullets: string[];
  productUrl?: string;
}

export const EXPERIENCE: ExperienceEntry[] = [
  {
    id: 'personify',
    logoSrc: mcProLogo,
    productUrl: 'https://memberclicks.com/products/professional/',
    company: 'Personify – MC Professional Platform',
    role: 'Software Developer II',
    location: 'Toronto, ON',
    dateRange: 'Apr 2025 – Apr 2026',
    overview: 'A SaaS platform nonprofits use to run their websites and manage invoicing and donations.',
    bullets: [
      'Architected a distributed invoice history logging system, designing backend services and data models to track invoice lifecycle events across <strong>microservices</strong>',
      'Implemented a <strong>Kafka-based event-driven pipeline</strong> to guarantee reliable invoice state propagation and eliminate cross-service inconsistencies',
      'Designed and executed database schema migrations and production data backfills as part of a blue-green deployment, coordinating Kafka consumer updates for <strong>zero-downtime releases</strong>',
      'Resolved complex production incidents across microservices, Kafka consumers, and database layers, reducing mean time to resolution',
      'Built Zapier automation triggers that reduced billing-related incidents to <strong>zero</strong>',
      'Modernized Angular invoice UI to align with updated design standards, improving usability',
    ],
  },
  {
    id: 'levio-viewbid',
    logoSrc: viewbidLogo,
    productUrl: 'https://viewbid.com/home',
    company: 'Levio (formerly Indellient)',
    project: 'Viewbid — Online Auction Platform',
    role: 'Full Stack Developer',
    location: 'Toronto, ON',
    dateRange: 'Mar 2024 – Mar 2025',
    overview: 'A live online auction platform where users bid against each other in real time, similar to eBay.',
    bullets: [
      'Built scalable REST APIs with NestJS and PostgreSQL powering high-frequency bidding for <strong>21,000+ global users</strong>',
      'Developed full-stack auction features including auction management, user profiles, and bidding views using Angular',
      'Optimized concurrent database queries to maintain consistency under simultaneous bidding load',
      'Leveraged Redis Pub/Sub for asynchronous event propagation across services, enabling <strong>real-time bid updates</strong> at scale',
      'Deployed and maintained containerized microservices on AWS using Docker and CI/CD pipelines',
    ],
  },
  {
    id: 'levio-fiserv',
    logoSrc: fiservLogo,
    productUrl: 'https://www.fiserv.com/en/solutions/instant-payments/now-gateway.html',
    company: 'Levio (formerly Indellient)',
    project: 'Fiserv — NOW Gateway, Real-Time Payments Platform',
    role: 'Full Stack Developer',
    location: 'Toronto, ON',
    dateRange: 'Jun 2021 – Mar 2024',
    overview:
      'A real-time payments gateway banks use to move money between each other instantly instead of waiting days for transfers to settle.',
    bullets: [
      "Developed backend transaction processing pipeline for Fiserv's NOW Gateway, reducing payment settlement time from <strong>1–3 days to seconds</strong><br />via ISO format normalization, validation, and routing through The Clearing House RTP network",
      'Built services processing <strong>100,000+ transactions monthly</strong> across 5,000+ financial institutions using Java (Spring Boot), integrated Kafka and IBM MQ for asynchronous communication',
      'Designed real-time monitoring dashboard tracking transaction throughput, success rates, and system failures across financial institutions',
      'Implemented SQL-driven test automation harness enabling support teams to simulate and validate real transaction scenarios',
    ],
  },
];
