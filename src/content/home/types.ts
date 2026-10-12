export interface HomeRefinement {
  channelHeading: string;
  why: {
    label: string;
    title: string;
    intro: string;
    pairs: { problem: string; solution: string }[];
    example: string;
    scenarioTitle: string;
    steps: { title: string; text: string }[];
    walletNote: string;
    walletConnection: string;
    walletRelationship: string;
  };
  stories: { label: string; title: string; text: string; takeaway: string }[];
  benefits: { title: string; text: string }[];
  benefitsTitle: string;
  customerPage: {
    entry: string;
    public: string;
    personal: string;
    description: string;
    businessDescription: string;
    hours: string;
    location: string;
    connect: string;
    connectText: string;
    social: string;
    offer: string;
    programme: string;
    membership: string;
    wallet: string;
    noApp: string;
  };
  staff: {
    title: string;
    qr: string;
    scan: string;
    action: string;
    progress: string;
    access: string;
    owner: string;
  };
  wallet: {
    title: string;
    text: string;
    updates: string;
    notifications: string;
    page: string;
  };
  activity: { segmentation: string; automation: string; eligibility: string };
  faqTitle: string;
  faq: { question: string; answer: string }[];
  pricing: {
    title: string;
    intro: string;
    scope: string;
    details: string;
    customers: string;
    locations: string;
    features: string;
    monthly: string;
    yearly: string;
    from: string;
    custom: string;
    upgrade: string;
    back: string;
    tryFree: string;
    billing: string;
    customScope: string;
    ctaTitle: string;
    ctaText: string;
    unavailable: string;
  };
}
