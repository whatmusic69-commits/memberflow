export const landingPaths = ["solutions/coffee-shops", "solutions/beauty-salons", "features/digital-loyalty-cards", "features/qr-code-loyalty"] as const;
export type LandingPath = typeof landingPaths[number];
export interface LandingCopy {
  label: string; title: string; seoTitle: string; description: string; intro: string;
  problemTitle: string; problem: string;
  scenarioTitle: string; steps: string[];
  benefitTitle: string; benefits: {title:string;text:string}[];
  faq: {question:string;answer:string}[];
  final: string; finalText: string;
}
export type LandingCollection = Record<LandingPath, LandingCopy>;

export function isLandingPath(path: string): path is LandingPath { return landingPaths.some(value => value === path); }
