export interface AboutContent {
  nav: string;
  seo: { title: string; description: string };
  hero: { label: string; title: string; text: string; signature: string };
  problem: {
    label: string;
    title: string;
    lead: string;
    everyday: string;
    text: string;
    closing: string;
  };
  purpose: {
    label: string;
    title: string;
    paragraphs: string[];
    quote: string;
  };
  team: {
    label: string;
    title: string;
    developers: string;
    idea: string;
    paragraphs: string[];
    closing: string;
  };
  people: {
    label: string;
    title: string;
    lines: string[];
    text: string;
    closing: string;
  };
  belief: { label: string; title: string };
  final: { title: string; paragraphs: string[]; cta: string };
}
