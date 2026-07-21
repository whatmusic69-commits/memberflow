import { SiteFooter, SiteNavbar } from "@/components/ui/marketing";

export function PublicTextPage({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: { title: string; text: string }[] }) {
  return (
    <main className="min-h-screen bg-[var(--background)]">
      <SiteNavbar />
      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--primary)]">{eyebrow}</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-[var(--foreground)]">{title}</h1>
        <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">{intro}</p>
        <div className="mt-8 space-y-4">
          {sections.map((section) => (
            <article key={section.title} className="rounded-[24px] border border-[var(--border)] bg-white p-6 shadow-[var(--shadow-sm)]">
              <h2 className="text-lg font-semibold">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-slate-600">{section.text}</p>
            </article>
          ))}
        </div>
      </section>
      <SiteFooter />
    </main>
  );
}
