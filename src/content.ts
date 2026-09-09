// Everything written on the page. House rules: no em dashes, plain words, short lines.

export const hero = {
  first: 'Sagar',
  last: 'Kotian',
  meta: 'Founder’s Office · GTM · Customer Success · Superjoin · Bengaluru',
  tagEm: 'First non-eng hire.',
  tag: 'I bring in the demand, keep the customers, and grade the AI’s homework.',
  badge: 'OPEN TO FOUNDER’S OFFICE · GTM · CUSTOMER SUCCESS · ',
  photoAlt: 'Sagar Kotian in a dark blazer, smiling, in front of a wall of green ivy.',
};

export const facts = [
  '10 to 20 demos a month, solo',
  'first 3 paying customers',
  '6,800 figures checked',
  'outbound from zero',
  '4,000+ execs cold emailed',
  '$15K MRR, one engineer, me',
  '60% less manual CRM work',
  'three startups, one degree',
  'Bengaluru',
  'attendance: allegedly',
];

export interface Stop { index: string; org: string; role: string; dates: string; about?: string; bullets: string[]; closer: string }
export const stops: Stop[] = [
  {
    index: '01', org: 'Superjoin', role: 'Founder’s Office, GTM & Customer Success', dates: 'Jan 2026 to now',
    about: 'AI Excel agent for finance teams, backed by Better Capital. Intern to full-time in Aug 2026.',
    bullets: [
      'Built outbound from zero. 10 to 20 qualified demos a month, and AI Copilot’s first 3 paying customers from CA firms and merchant banks.',
      'Co-own customer success for a $15K MRR product with one engineer. I’m on every customer issue and I decide what gets fixed first.',
      'Own the Intercom Fin support agent: wrote the knowledge base it answers from, watch its live replies, close the gaps.',
    ],
    closer: 'Sell it, support it, and fact-check the robot when it does math.',
  },
  {
    index: '02', org: 'Zenskar', role: 'Founder’s Office Intern, RevOps & Strategy', dates: 'Sep 2025 to Jan 2026',
    about: 'B2B revenue automation, backed by Bessemer.',
    bullets: [
      'Built a bot that scraped LinkedIn, Reddit and Twitter for freshly hired CFOs, then pinged Slack before they had finished onboarding.',
      'Mapped the founder’s and investors’ networks against live deals, so we stopped cold calling people we were two handshakes away from.',
      'Cut manual CRM work by 60%, mostly because I did not want to do it.',
    ],
    closer: 'Final year of engineering through all of this. The bots had better attendance than I did.',
  },
  {
    index: '03', org: 'CodeRound AI', role: 'Chief of Staff', dates: 'Aug 2024 to Jul 2025',
    bullets: [
      'Cold emailed, called and messaged 4,000+ VC partners, YC founders and CTOs. 12+ demos and the company’s first paying customer came out of it.',
      'Ran client ops for 30+ VC-funded startups including Sarvam AI and Nurix AI.',
      'Sat in on candidate interviews for roles paying up to 80 LPA.',
    ],
    closer: 'Did all three while still in college, where I was noticeably worse at attendance than at cold email.',
  },
];

export type Project = { id: string; index: string; title: string; blurb: string; stack: string[]; label: string; url: string; cta: string } &
  ({ kind: 'video'; preview: string; poster: 'posterInvoice' | 'posterDashboard' } | { kind: 'site'; image: 'bengaluruRun'; repo: string });
export const projects: Project[] = [
  {
    id: 'invoice-po', index: '01', kind: 'video', preview: '/video/invoice-po-preview.mp4', poster: 'posterInvoice',
    url: 'https://screen.studio/share/62w9eq8a', cta: 'Watch the demo', label: 'demo',
    title: 'Invoice to PO reconciliation',
    blurb: 'Drop a mixed pile of invoice and PO PDFs into n8n. Claude reads each one. Plain code does the matching: seller GSTIN, many-to-many, line items, GST checks. It remembers past runs.',
    stack: ['n8n', 'Claude', 'JavaScript'],
  },
  {
    id: 'dashboard', index: '02', kind: 'video', preview: '/video/dashboard-preview.mp4', poster: 'posterDashboard',
    url: 'https://screen.studio/share/c7oyPJeH', cta: 'Watch the demo', label: 'demo',
    title: 'Superjoin internal dashboard',
    blurb: 'Stripe billing, PostHog usage, Intercom support and Slack in one screen, so one person can see revenue, usage and support load without opening four tabs.',
    stack: ['React', 'Stripe', 'PostHog', 'Intercom'],
  },
  {
    id: 'bengaluru-run', index: '03', kind: 'site', image: 'bengaluruRun', repo: 'https://github.com/sagarkotian07/Bengaluru.run',
    url: 'https://bengaluru-run.vercel.app', cta: 'Open the site', label: 'live',
    title: 'Bengaluru.run',
    blurb: 'A community map of Bengaluru running routes. Upvote routes, find clubs and events, a corporate km leaderboard. Real OpenStreetMap route geometry, not hand-drawn lines.',
    stack: ['React', 'Leaflet', 'Supabase', 'Strava'],
  },
];

export interface Counter { value: string; label: string }
export const counters: Counter[] = [
  { value: '4,000+', label: 'execs reached' },
  { value: '10 to 20', label: 'demos a month' },
  { value: '3', label: 'first paying customers' },
  { value: '6,800', label: 'figures verified' },
  { value: '60%', label: 'less manual CRM work' },
  { value: '3', label: 'startups before graduating' },
];

export const about = {
  lines: [
    'I like the part of a startup where nothing has an owner yet.',
    'Sales calls in the morning, support tickets after lunch, arguing with two AI models by evening.',
    'I’m not an engineer. I build things anyway, because waiting for one is slower.',
    'Bengaluru. I run. I built a map for that too.',
  ],
  facts: [
    ['Degree', 'B.Tech, Computer Science, NMAMIT, 2022 to 2026'],
    ['Stack', 'Clay, Apollo, HubSpot, Instantly, Intercom, n8n, Claude Code'],
    ['Data', 'Stripe, PostHog, Metabase, Supabase, SQL'],
    ['Attendance', 'did not survive'],
  ],
  wallAlt: 'Sagar at his desk, glasses on, with a whiteboard of sticky notes behind him.',
  casualAlt: 'Sagar in a black polo, smiling at a cafe table.',
};

export const links = {
  email: 'kotiansagar07@gmail.com',
  linkedin: 'https://linkedin.com/in/sagar-kotian-',
  github: 'https://github.com/sagarkotian07',
  resume: '/resume.pdf',
};

export const game = {
  title: 'Pipeline Run',
  intro: 'Jump over bounced emails, no-shows and duplicate leads. Collect demos. Land a customer if you can. Every 20 seconds is a month.',
  controls: 'space, up, or tap to jump',
  result: (demos: number, customers: number, months: number) =>
    `You booked ${demos} demo${demos === 1 ? '' : 's'}${customers ? ` and closed ${customers} customer${customers === 1 ? '' : 's'}` : ''} in ${months} month${months === 1 ? '' : 's'}.`,
  compare: 'Sagar does 10 to 20 a month, solo.',
};
