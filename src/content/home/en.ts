import type { HomeRefinement } from "./types";
export const en: HomeRefinement = {
  channelHeading: "SOCIAL PUBLISHING · PLANNED",
  why: {
    label: "WHY MEMBERFLOW",
    title: "A first visit is good.\nA second one is better.",
    intro:
      "A paper stamp card shows a customer their progress. MemberFlow also gives you a record of visits, so you can see who returns, who has been away and which group to prepare an offer for.",
    pairs: [
      {
        problem:
          "You invest in bringing people in. The connection often ends at the door.",
        solution:
          "Loyalty, rewards and memberships give customers a clear reason for their next visit.",
      },
      {
        problem:
          "People get busy. Your business slips their mind, and emails get lost in a crowded inbox.",
        solution:
          "A customer page and a card in Apple Wallet or Google Wallet keep your business close, with supported pass updates.",
      },
      {
        problem:
          "Without visit history, it is hard to know who needs a reason to return.",
        solution:
          "Customer activity and automations help you identify an eligible return opportunity and prepare a relevant offer.",
      },
    ],
    example: "Example journey · Your Coffee",
    scenarioTitle: "A reason for Anna to return",
    steps: [
      {
        title: "Notice the pause",
        text: "Anna · Last visit: 30 days ago. MemberFlow identifies an eligible return opportunity.",
      },
      {
        title: "Prepare a return offer",
        text: "The business creates an offer: “Your next coffee comes with double stamps.”",
      },
      {
        title: "Keep the card connected",
        text: "A Wallet pass update, with a notification where supported, can lead Anna back to her personal customer page.",
      },
      {
        title: "Make the next visit count",
        text: "Anna can open her loyalty experience, return and redeem the eligible offer with a staff scan.",
      },
    ],
    walletConnection: "The relationship continues after the door closes.",
    walletRelationship:
      "A card in their wallet keeps your business within reach — with loyalty progress, rewards and supported updates, without a separate MemberFlow app.",
    walletNote:
      "Wallet updates and notifications depend on the platform, pass type, user settings and Apple / Google rules. A notification is not guaranteed.",
  },
  stories: [
    {
      label: "SOCIAL PUBLISHING · PLANNED",
      title: "One post.\nSupported channels.",
      text: "Planned: create a post with text and an image, select connected social channels, review the adapted formats and approve publishing through official APIs. Each platform has its own formats, permissions and approval requirements.",
      takeaway: "Social publishing is planned; this preview does not publish posts.",
    },
    {
      label: "ACQUIRE & CONNECT",
      title: "Your business.\nYour page. Your customers.",
      text: "A link from social media or your business QR opens your Customer Page. Your branding, business details, active offers and programmes come together in one template. After connecting, customers see their own progress, rewards, memberships and eligible offers.",
      takeaway: "From discovery to a personal connection.",
    },
    {
      label: "RETAIN & ENGAGE",
      title: "A reason to return.\nA simple way to serve.",
      text: "Customers show their QR. Staff scan it to record a visit or add a permitted stamp, and loyalty progress updates. Rewards, memberships and offers give the next visit a purpose. A Wallet card keeps that connection close without a separate MemberFlow app.",
      takeaway: "Your team serves customers. You control access.",
    },
    {
      label: "UNDERSTAND & RETURN",
      title: "Know the regulars.\nNotice the pause.",
      text: "See visits, loyalty and membership activity together. Use customer segments and automations to identify eligible return opportunities and prepare a relevant offer, instead of treating every customer the same.",
      takeaway: "One view of the relationship. A clearer next step.",
    },
  ],
  benefitsTitle: "More than a paper stamp card.",
  benefits: [{"title": "A card for every customer.", "text": "Customers join through your business QR and get their own digital QR card. No app to install."}, {"title": "Progress they can see.", "text": "Show stamps, points and the next reward on the personal customer page."}, {"title": "A record you can use.", "text": "See recorded visits and identify customers who have not visited recently. Prepare offers for the right group."}, {"title": "One place to manage it.", "text": "Set up programmes, review customer history and manage memberships in your dashboard."}],
  customerPage: {
    entry: "Social link or business QR",
    public: "Public business page",
    personal: "Anna’s personal experience",
    description: "One page, before and after connection.",
    businessDescription:
      "Your neighbourhood coffee spot. Good coffee and familiar faces.",
    hours: "Mon–Fri · 08:00–18:00",
    location: "Riga · Address & directions",
    connect: "Connect to Your Coffee",
    connectText: "Customers connect to see their own rewards and progress.",
    social: "Social links",
    offer: "Active offer",
    programme: "Loyalty programme",
    membership: "Memberships",
    wallet: "Apple Wallet / Google Wallet",
    noApp: "No separate MemberFlow app required.",
  },
  staff: {
    title: "Staff Scanner",
    qr: "Customer shows their QR",
    scan: "Staff scan the code",
    action: "Record a visit · Add a stamp",
    progress: "Customer loyalty progress updates",
    access: "Separate, limited staff access.",
    owner: "The owner manages the team and permissions.",
  },
  wallet: {
    title: "Their loyalty card, always within reach.",
    text: "Apple Wallet or Google Wallet can hold a customer’s personal loyalty card, so it is easy to find at the counter. Card issuance requires the Wallet integration; the personal QR also stays available on the Customer Page.",
    updates: "Pass updates keep card information current.",
    notifications:
      "Notifications may accompany eligible updates where supported.",
    page: "The personal Customer Page holds progress, rewards, memberships and eligible offers.",
  },
  activity: {
    segmentation: "Segment by customer activity",
    automation: "Prepare a return automation",
    eligibility:
      "Eligibility and programme rules determine who can receive and redeem an offer.",
  },
  faqTitle: "A few things worth knowing.",
  faq: [
    {
      question: "Does a customer need to install an app?",
      answer:
        "No separate MemberFlow app is required. A link or business QR opens the Customer Page in a browser. Customers can also keep a digital card in Apple Wallet or Google Wallet where supported.",
    },
    {
      question: "What changes when a customer connects?",
      answer:
        "Before connection, the page shows public business information, active offers and programmes. After connection, the customer can see personal loyalty progress, rewards, memberships and eligible offers.",
    },
    {
      question: "Can my team use MemberFlow?",
      answer:
        "Staff use a separate scanner with limited permissions to serve customers. The owner manages team access, so not every employee needs access to the whole workspace.",
    },
    {
      question: "Are Wallet updates the same as push notifications?",
      answer:
        "No. A pass update changes card information. A notification may be shown where the platform supports it, depending on pass type, user settings and Apple / Google rules. Not every offer becomes a notification.",
    },
    {
      question: "Does this replace a website builder?",
      answer:
        "Your Customer Page uses a MemberFlow template and business data. It brings customer programmes and offers together; it is not a separate website builder.",
    },
  ],
  pricing: {
    title: "Choose a plan for your repeat customers.",
    intro:
      "Compare Starter, Growth and Business by active customer capacity, locations and listed tools. Choose the scope your loyalty programme needs.",
    scope: "Plan overview",
    details: "Compare your needs",
    customers: "Active customers",
    locations: "Business locations",
    features: "Included features",
    monthly: "/ month",
    yearly: "/ year",
    from: "from",
    custom: "Custom pricing",
    upgrade:
      "Compare active customer capacity, locations and included features before choosing or upgrading. Plan availability and subscription terms are shown when selecting a plan.",
    billing: "Billing period",
    customScope: "Around your business needs",
    ctaTitle: "Start with a reason to return.",
    ctaText: "Create your account and set up a loyalty programme for your business.",
    tryFree: "Create your loyalty programme",
    back: "Explore the product",
    unavailable:
      "Choose by customer capacity, locations and the features your team needs.",
  },
};
