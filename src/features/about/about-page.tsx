import type { AboutContent } from "@/content/about/types";
import { StartLink } from "@/components/marketing/start-link";

function ChapterLabel({
  number,
  children,
}: {
  number: string;
  children: string;
}) {
  return (
    <p className="eyebrow about-chapter-label">
      <span>{number}</span>
      {children}
    </p>
  );
}

export function AboutStory({ c }: { c: AboutContent }) {
  return (
    <main id="main" className="about-page">
      <section className="about-hero container" aria-labelledby="about-title">
        <p className="eyebrow">
          <span className="status-dot" />
          {c.hero.label}
        </p>
        <h1 id="about-title">{c.hero.title}</h1>
        <div className="about-hero-bottom">
          <p>{c.hero.text}</p>
          <div className="about-signature">
            <span className="about-two-signals" aria-hidden="true">
              <i />
              <span />
              <i />
            </span>
            <span>{c.hero.signature}</span>
          </div>
        </div>
      </section>

      <section
        className="about-problem container about-chapter"
        aria-labelledby="about-problem-title"
      >
        <div>
          <ChapterLabel number="01">{c.problem.label}</ChapterLabel>
          <h2 id="about-problem-title">{c.problem.title}</h2>
        </div>
        <div className="about-prose">
          <p className="about-lead">{c.problem.lead}</p>
          <p className="about-everyday">{c.problem.everyday}</p>
          <p>{c.problem.text}</p>
          <p className="about-closing">{c.problem.closing}</p>
        </div>
      </section>

      <section
        className="about-purpose container"
        aria-labelledby="about-purpose-title"
      >
        <div className="about-chapter">
          <div>
            <ChapterLabel number="02">{c.purpose.label}</ChapterLabel>
            <h2 id="about-purpose-title">{c.purpose.title}</h2>
          </div>
          <div className="about-prose">
            {c.purpose.paragraphs.map((text) => (
              <p key={text}>{text}</p>
            ))}
          </div>
        </div>
        <blockquote className="about-pullquote">
          <span className="about-quote-line" aria-hidden="true" />
          <p>{c.purpose.quote}</p>
          <span className="about-quote-end" aria-hidden="true" />
        </blockquote>
      </section>

      <section
        className="about-team container about-chapter"
        aria-labelledby="about-team-title"
      >
        <div>
          <ChapterLabel number="03">{c.team.label}</ChapterLabel>
          <h2 id="about-team-title">{c.team.title}</h2>
          <div className="about-team-mark">
            <span className="about-team-count">2</span>
            <div>
              <p>{c.team.developers}</p>
              <span>{c.team.idea}</span>
            </div>
          </div>
        </div>
        <div className="about-prose">
          {c.team.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <p className="about-closing">{c.team.closing}</p>
        </div>
      </section>

      <section className="about-people" aria-labelledby="about-people-title">
        <div className="container">
          <div className="about-people-heading">
            <ChapterLabel number="04">{c.people.label}</ChapterLabel>
            <h2 id="about-people-title">{c.people.title}</h2>
          </div>
          <ul className="about-local-lines">
            {c.people.lines.map((line, i) => (
              <li key={line}>
                <span aria-hidden="true">0{i + 1}</span>
                <p>{line}</p>
                <span className="about-local-dot" aria-hidden="true" />
              </li>
            ))}
          </ul>
          <div className="about-people-bottom">
            <p>{c.people.text}</p>
            <p>{c.people.closing}</p>
          </div>
        </div>
      </section>

      <section className="about-belief" aria-labelledby="about-belief-title">
        <div className="container">
          <p className="eyebrow">
            <span className="status-dot" />
            {c.belief.label}
          </p>
          <h2 id="about-belief-title">{c.belief.title}</h2>
        </div>
      </section>

      <section
        className="about-final container"
        aria-labelledby="about-final-title"
      >
        <div>
          <span className="about-final-line" aria-hidden="true" />
          <h2 id="about-final-title">{c.final.title}</h2>
        </div>
        <div className="about-prose">
          {c.final.paragraphs.map((text) => (
            <p key={text}>{text}</p>
          ))}
          <StartLink label={c.final.cta} />
        </div>
      </section>
    </main>
  );
}
