export interface HomeContent {
  nav: string[];
  login: string;
  dashboard: string;
  start: string;
  how: string;
  menu: string;
  close: string;
  language: string;
  skip: string;
  label: string;
  hero: string[];
  intro: string;
  heroNote: string;
  demo: string;
  newOffer: string;
  stamps: string;
  channelFormats: string[];
  sections: string[][];
  editor: string[];
  distribution: string[];
  journey: string[];
  connect: string[];
  retention: string[];
  communication: string[];
  activity: string[];
  return: string[];
  loopTitle: string;
  loopDescription: string;
  loop: string[];
  replayLoop: string;
  solutionsTitle: string;
  solutionsDescription: string;
  solutions: string[];
  final: string[];
  footerLine: string;
  company: string;
  legal: string;
  about: string;
  privacy: string;
  terms: string;
  previewNote: string;
  dialogs: Record<
    "start" | "login" | "pricing" | "resources" | "about" | "privacy" | "terms",
    string[]
  >;
  imageAlt: string;
  seo: string;
}
