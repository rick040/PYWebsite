type Section = {
  readonly heading: string
  readonly paragraphs: readonly string[]
  readonly bullets?: readonly string[]
}

/** Shared body renderer for POI pages, news articles and the flat pages. */
export function ProseSections({ sections }: { sections: readonly Section[] }) {
  return (
    <div className="py-prose">
      {sections.map((section) => (
        <section key={section.heading}>
          <h2>{section.heading}</h2>
          {section.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className="mt-[var(--py-space-3)]">
              {paragraph}
            </p>
          ))}
          {section.bullets !== undefined && section.bullets.length > 0 && (
            <ul className="mt-[var(--py-space-3)] list-disc pl-[var(--py-space-5)]">
              {section.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          )}
        </section>
      ))}
    </div>
  )
}
