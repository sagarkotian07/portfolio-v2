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
  { index: '01', org: 'Superjoin', role: 'Founder’s office', dates: 'Jan 2026 to now', line: 'Sales and customer success for an AI Excel agent. If something is on fire, it is usually mine.' },
  { index: '02', org: 'Zenskar', role: 'Founder’s office intern', dates: 'Sep 2025 to Jan 2026', line: 'RevOps. Mostly building bots so I would not have to do the boring bits myself.' },
  { index: '03', org: 'CodeRound AI', role: 'Chief of staff', dates: 'Aug 2024 to Jul 2025', line: 'Outbound and client ops, while still in college. Attendance did not survive.' },
];

export type Project = { id: string; title: string; line: string; label: string; url: string; cta: string } &
  ({ kind: 'video'; preview: string; poster: 'posterInvoice' | 'posterDashboard' } | { kind: 'site'; image: 'bengaluruRun' });
export const projects: Project[] = [
  { id: 'invoice-po', kind: 'video', preview: '/video/invoice-po-preview.mp4', poster: 'posterInvoice', url: 'https://screen.studio/share/62w9eq8a', cta: 'Watch', label: 'demo',
    title: 'Invoice to PO reconciliation', line: 'Drop in invoices and purchase orders. It matches them so nobody has to.' },
  { id: 'dashboard', kind: 'video', preview: '/video/dashboard-preview.mp4', poster: 'posterDashboard', url: 'https://screen.studio/share/c7oyPJeH', cta: 'Watch', label: 'demo',
    title: 'Superjoin internal dashboard', line: 'Billing, usage and support in one screen, so I stop opening four tabs.' },
  { id: 'bengaluru-run', kind: 'site', image: 'bengaluruRun', url: 'https://bengaluru-run.vercel.app', cta: 'Open', label: 'live',
    title: 'Bengaluru.run', line: 'A map of running routes in Bengaluru. I run, so this was inevitable.' },
];

export const about = {
  lines: [
    'Not an engineer. I build things anyway.',
    'Filter coffee over everything.',
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
  intro: 'Dodge the potholes, the autos and the odd cow. Collect filter coffee. That is the whole game.',
  controls: 'space, up, or tap to jump',
  distance: (m: number) => (m >= 1000 ? `${(m / 1000).toFixed(1)} km` : `${m} m`),
  result: (coffee: number, metres: number) =>
    `You ran ${metres >= 1000 ? `${(metres / 1000).toFixed(1)} km` : `${metres} m`} and had ${coffee} coffee${coffee === 1 ? '' : 's'}.`,
  verdict: (coffee: number) =>
    coffee === 0 ? 'No coffee at all. Are you okay?'
    : coffee < 6 ? 'A light morning.'
    : coffee < 16 ? 'Respectable.'
    : coffee < 30 ? 'That is a lot of coffee.'
    : 'Please sit down.',
};
