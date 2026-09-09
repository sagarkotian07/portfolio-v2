// Everything written on the page. Short. About him, not his numbers.

export const hero = {
  first: 'Sagar',
  last: 'Kotian',
  meta: 'Founder’s office · Superjoin · Bengaluru',
  line: 'I like the part of a startup where nothing has an owner yet.',
  badge: 'SAGAR KOTIAN · BENGALURU · ',
  photoAlt: 'Sagar Kotian in a dark blazer, smiling, in front of a wall of green ivy.',
};

export interface Stop { index: string; org: string; role: string; dates: string; line: string }
export const stops: Stop[] = [
  { index: '01', org: 'Superjoin', role: 'Founder’s office', dates: 'Jan 2026 to now', line: 'Sales and customer success for an AI Excel agent for finance teams.' },
  { index: '02', org: 'Zenskar', role: 'Founder’s office intern', dates: 'Sep 2025 to Jan 2026', line: 'RevOps for a revenue automation startup.' },
  { index: '03', org: 'CodeRound AI', role: 'Chief of staff', dates: 'Aug 2024 to Jul 2025', line: 'Outbound and client ops, while still in college.' },
];

export type Project = { id: string; title: string; line: string; label: string; url: string; cta: string } &
  ({ kind: 'video'; preview: string; poster: 'posterInvoice' | 'posterDashboard' } | { kind: 'site'; image: 'bengaluruRun' });
export const projects: Project[] = [
  { id: 'invoice-po', kind: 'video', preview: '/video/invoice-po-preview.mp4', poster: 'posterInvoice', url: 'https://screen.studio/share/62w9eq8a', cta: 'Watch', label: 'demo',
    title: 'Invoice to PO reconciliation', line: 'Drop in invoices and purchase orders. It matches them.' },
  { id: 'dashboard', kind: 'video', preview: '/video/dashboard-preview.mp4', poster: 'posterDashboard', url: 'https://screen.studio/share/c7oyPJeH', cta: 'Watch', label: 'demo',
    title: 'Superjoin internal dashboard', line: 'Billing, usage and support in one screen.' },
  { id: 'bengaluru-run', kind: 'site', image: 'bengaluruRun', url: 'https://bengaluru-run.vercel.app', cta: 'Open', label: 'live',
    title: 'Bengaluru.run', line: 'A map of running routes in Bengaluru.' },
];

export const about = {
  lines: [
    'Not an engineer. I build things anyway.',
    'I run. So I built a map for that.',
    'B.Tech in computer science, 2022 to 2026.',
  ],
  wallAlt: 'Sagar at his desk, glasses on, with a whiteboard of sticky notes behind him.',
  casualAlt: 'Sagar in a black polo, smiling at a cafe table.',
};

export const links = {
  whatsapp: 'https://wa.me/919321747802?text=Hi%20Sagar',
  email: 'kotiansagar07@gmail.com',
  linkedin: 'https://linkedin.com/in/sagar-kotian-',
  resume: '/resume.pdf',
};

export const game = {
  intro: 'Jump over the bad leads. Collect the demos. Every 20 seconds is a month.',
  controls: 'space, up, or tap to jump',
  result: (demos: number, customers: number, months: number) =>
    `You booked ${demos} demo${demos === 1 ? '' : 's'}${customers ? ` and closed ${customers} customer${customers === 1 ? '' : 's'}` : ''} in ${months} month${months === 1 ? '' : 's'}.`,
  after: 'That is roughly the job.',
};
