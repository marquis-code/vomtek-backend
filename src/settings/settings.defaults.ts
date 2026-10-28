export const DIVISION_SLUGS = ['electrical', 'instrumentation', 'automotive', 'mechanical', 'fabrication', 'real-estate'] as const

export const SERVICE_SLUGS = [
  'control-panels',
  'pcb-design',
  'wire-harness',
  'motor-rewinding',
  'motor-testing',
  'panel-repair',
  'field-service',
] as const

export const PROJECT_TYPES = ['control-panel', 'retrofit', 'pcb', 'harness', 'motor', 'field', 'multiple', 'other'] as const

export interface LeadTimeRule {
  projectType: string
  maxQuantity: number
  leadTime: string
}

export interface CarouselItem {
  image: string
  alt: string
  title: string
  caption: string
  label: string
  credit?: string
}

export const SITE_DEFAULTS = {
  company: {
    name: 'Vomtek',
    legalName: 'Vomtek',
    tagline: 'Engineered control systems.',
    description: 'Control systems, electrical manufacturing, and field service — Houston, Texas.',
    phone: '713-347-1466',
    phoneHref: '+17133471466',
    email: 'support@vomtek.com',
    address: {
      street: '2401 Fountain View Dr, Ste 312',
      city: 'Houston',
      state: 'TX',
      postalCode: '77057',
      country: 'USA',
      full: '2401 Fountain View Dr, Ste 312, Houston, TX 77057',
      maps: 'https://maps.google.com/?q=2401+Fountain+View+Dr+Ste+312+Houston+TX+77057',
    },
    hours: 'Monday–Friday, 8:00–17:00 CT',
    coordinates: '29.7410° N / 95.4830° W',
    serviceArea: 'Houston, the Gulf Coast, and field support beyond.',
  },
  socials: {
    linkedin: '',
    facebook: '',
    instagram: '',
    youtube: '',
    x: '',
  },
  announcement: {
    enabled: false,
    text: 'Now scheduling Q1 2027 panel work — request a scope before the calendar closes.',
    linkLabel: 'Request a scope',
    linkUrl: '/quote',
  },
  hero: {
    eyebrow: 'UL 508A panel shop',
    location: 'Houston, Texas',
    titleLine1: 'Control panels',
    titleLine2: 'engineered to',
    emphasis: 'hold the line.',
    subtitle: 'Vomtek designs, builds, tests, and commissions custom control panels, PCB assemblies, and wire harnesses for the plants, fleets, and facilities that cannot afford to stop.',
    primaryLabel: 'Start a project',
    primaryHref: '/quote',
    secondaryLabel: 'Explore capabilities',
    secondaryHref: '/services',
    badges: ['UL 508A certified', 'NFPA 70 design', '24/7 field response'],
  },
  stats: [
    { value: '06', label: 'Divisions', note: 'One accountable team' },
    { value: '01', label: 'Shop floor', note: 'Engineering to startup' },
    { value: '100%', label: 'FAT coverage', note: 'Every panel, before freight' },
    { value: '24/7', label: 'Field response', note: 'When the line is down' },
  ],
  carousel: {
    enabled: true,
    eyebrow: 'Inside the work',
    title: 'A shop floor you can read.',
    subtitle: 'Photography from the disciplines we run every week — build, verify, fabricate, commission, and the plants where it ends up.',
    items: [
      {
        image: 'panel-line',
        alt: 'Rows of industrial control enclosures on a production line',
        title: 'Enclosure build',
        caption: 'Cutouts, backplates, and component layout released to the bench.',
        label: 'Assembly',
        credit: 'Pexels',
      },
      {
        image: 'electrician-meter',
        alt: 'Electrician testing voltage inside a control enclosure with a multimeter',
        title: 'Point-to-point verification',
        caption: 'Every termination is checked before the FAT, not after freight.',
        label: 'Testing',
        credit: 'Onics Energy / Pexels',
      },
      {
        image: 'laser-cutting',
        alt: 'Laser cutting a sheet metal panel',
        title: 'Sheet metal & backplates',
        caption: 'Cabinets, cutouts, and custom mounting built to the drawing.',
        label: 'Fabrication',
        credit: 'Cemrecan Yurtman / Pexels',
      },
      {
        image: 'control-room',
        alt: 'Control room operator monitoring SCADA screens',
        title: 'Startup & controls',
        caption: 'Loop checks, tuning, and a screen that tells the truth.',
        label: 'Commissioning',
        credit: 'Sergey Sergeev / Pexels',
      },
      {
        image: 'water-treatment',
        alt: 'Aerial view of a water treatment facility',
        title: 'Critical infrastructure',
        caption: 'Water, wastewater, and process plants that cannot stop.',
        label: 'In service',
        credit: 'Giant Asparagus / Pexels',
      },
    ] as CarouselItem[],
  },
  sections: {
    carousel: true,
    divisions: true,
    capabilities: true,
    panelIndex: true,
    process: true,
    principles: true,
    foundation: true,
    insights: true,
    catalog: true,
    industries: true,
    plans: true,
  },
  features: {
    foundation: true,
    careers: true,
    automotive: true,
    facilities: true,
    catalog: true,
    tracker: true,
    newsletter: true,
    mobileCta: true,
    quotes: true,
    plans: true,
  },
  quote: {
    projectTypes: [...PROJECT_TYPES],
    leadTimeRules: [
      { projectType: 'control-panel', maxQuantity: 1, leadTime: '4–6 weeks' },
      { projectType: 'control-panel', maxQuantity: 2, leadTime: '6–9 weeks' },
      { projectType: 'control-panel', maxQuantity: 999, leadTime: '8–12 weeks' },
      { projectType: 'retrofit', maxQuantity: 999, leadTime: '3–6 weeks after survey' },
      { projectType: 'pcb', maxQuantity: 999, leadTime: '2–4 weeks' },
      { projectType: 'harness', maxQuantity: 999, leadTime: '1–3 weeks' },
      { projectType: 'motor', maxQuantity: 999, leadTime: '1–3 weeks' },
      { projectType: 'field', maxQuantity: 999, leadTime: 'Scheduled within 1–2 weeks' },
      { projectType: 'multiple', maxQuantity: 999, leadTime: '6–10 weeks' },
      { projectType: 'other', maxQuantity: 999, leadTime: 'To be confirmed' },
    ] as LeadTimeRule[],
    defaultLeadTime: 'To be confirmed',
    reviewSlaHours: 24,
    autoReplySubject: 'We received your request — {{ref}}',
    autoReplyBody: 'Thanks {{name}}. Your reference is {{ref}}. An engineer will review the scope and reply within one business day.',
    requiredFields: ['projectType', 'name', 'email', 'consent'],
  },
  plans: [
    {
      slug: 'essential',
      name: 'Essential',
      price: '$1,800',
      period: 'per site / year',
      description: 'A yearly health check for panels that are running fine and need to stay that way.',
      features: ['Annual thermal scan', 'Torque & termination check', 'Visual inspection report', 'Written recommendations', 'Priority scheduling'],
      featured: false,
      ctaLabel: 'Request assessment',
    },
    {
      slug: 'priority',
      name: 'Priority',
      price: '$7,500',
      period: 'per site / year',
      description: 'Scheduled maintenance plus a four-hour response commitment for the equipment you depend on.',
      features: ['Everything in Essential', 'Quarterly inspections', '4-hour priority response', '10% parts discount', 'Annual spares audit', 'Documentation refresh'],
      featured: true,
      ctaLabel: 'Talk about Priority',
    },
    {
      slug: 'critical',
      name: 'Critical',
      price: 'From $18,000',
      period: 'per site / year',
      description: 'For plants where downtime is measured in product, not hours. Spares held, 24/7 escalation, shutdown support.',
      features: ['Everything in Priority', '24/7 escalation line', 'Critical spares held on site', 'Shutdown planning support', 'Remote monitoring ready', 'Quarterly engineering review'],
      featured: false,
      ctaLabel: 'Scope a critical plan',
    },
  ],
  seo: {
    titleSuffix: 'Vomtek',
    defaultTitle: 'Custom control panels, PCB design & field service',
    defaultDescription: 'Vomtek is a Houston engineering and manufacturing company building UL 508A control panels, PCB assemblies, wire harnesses, and electrical systems — designed, tested, and commissioned by one accountable team.',
    ogImage: '/og.png',
    twitterHandle: '',
  },
  notifications: {
    recipients: ['support@vomtek.com'],
    notifyOnQuote: true,
    notifyOnContact: true,
    notifyOnApplication: true,
    sendCustomerAck: true,
    fromName: 'Vomtek',
    fromEmail: 'no-reply@vomtek.com',
  },
  integrations: {
    ga4Id: '',
    metaPixelId: '',
    linkedinPartnerId: '',
    webhookUrl: '',
    calendarUrl: '',
  },
  divisions: {
    electrical: { enabled: true, headline: '', lead: '' },
    instrumentation: { enabled: true, headline: '', lead: '' },
    automotive: { enabled: true, headline: '', lead: '' },
    mechanical: { enabled: true, headline: '', lead: '' },
    fabrication: { enabled: true, headline: '', lead: '' },
    'real-estate': { enabled: true, headline: '', lead: '' },
  },
  services: {
    'control-panels': { enabled: true, lead: '' },
    'pcb-design': { enabled: true, lead: '' },
    'wire-harness': { enabled: true, lead: '' },
    'motor-rewinding': { enabled: true, lead: '' },
    'motor-testing': { enabled: true, lead: '' },
    'panel-repair': { enabled: true, lead: '' },
    'field-service': { enabled: true, lead: '' },
  },
} as const

export type SiteDefaults = typeof SITE_DEFAULTS
