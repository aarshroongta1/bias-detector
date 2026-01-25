import { useState, useEffect, useRef } from "react";

const categories = [
  {
    name: "Gender",
    color: "#ec4899",
    example: {
      bad: "We need a strong chairman to lead the team.",
      good: "We need a strong chairperson to lead the team.",
      highlight: "chairman",
    },
  },
  {
    name: "Age",
    color: "#f59e0b",
    example: {
      bad: "Looking for young and energetic candidates.",
      good: "Looking for energetic candidates.",
      highlight: "young and",
    },
  },
  {
    name: "Ethnic",
    color: "#8b5cf6",
    example: {
      bad: "You speak really good English for someone from Japan.",
      good: "You speak really good English.",
      highlight: "for someone from Japan",
    },
  },
  {
    name: "Ability",
    color: "#06b6d4",
    example: {
      bad: "The team was blind to the obvious solution.",
      good: "The team was unaware of the obvious solution.",
      highlight: "blind to",
    },
  },
  {
    name: "Socioeconomic",
    color: "#10b981",
    example: {
      bad: "Students from public schools may struggle in advanced classes.",
      good: "Students unfamiliar with the environment may struggle in advanced classes.",
      highlight: "from public schools",
    },
  },
  {
    name: "Racial",
    color: "#3b82f6",
    example: {
      bad: "Could you show me the way to the master bedroom?",
      good: "Could you show me the way to the primary bedroom?",
      highlight: "master",
    },
  },
];

export default function BiasCategories() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;

      const container = containerRef.current;
      const rect = container.getBoundingClientRect();
      const containerHeight = container.offsetHeight;
      const viewportHeight = window.innerHeight;

      const scrollableHeight = containerHeight - viewportHeight;
      const scrolled = -rect.top;
      const progress = Math.max(0, Math.min(1, scrolled / scrollableHeight));

      setScrollProgress(progress);

      const categoryIndex = Math.min(
        Math.floor(progress * categories.length),
        categories.length - 1
      );
      setActiveIndex(categoryIndex);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const active = categories[activeIndex];

  return (
    <section className="categories-parallax" id="categories" ref={containerRef}>
      <div className="categories-sticky">
        <div className="categories-inner">
          {/* Left: Category info */}
          <div className="category-left">
            <span className="category-label">Bias Category</span>
            <h2
              className={`category-name ${active.name.length > 8 ? 'long-name' : ''}`}
              style={{ color: active.color }}
            >
              {active.name}
            </h2>

            {/* Progress dots */}
            <div className="category-dots">
              {categories.map((cat, index) => (
                <div
                  key={index}
                  className={`category-dot ${index === activeIndex ? "active" : ""}`}
                  style={{
                    backgroundColor: index === activeIndex ? cat.color : undefined,
                  }}
                />
              ))}
            </div>

            <p className="category-hint">
              Implicit biases that creep into everyday writing.
            </p>
          </div>

          {/* Right: Example card */}
          <div className="category-right">
            <div className="example-card" style={{ borderTopColor: active.color }}>
              {/* Before */}
              <div className="example-section">
                <div className="example-header bad">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  <span>Biased</span>
                </div>
                <p className="example-text">
                  {active.example.bad.split(active.example.highlight).map((part, i, arr) => (
                    <span key={i}>
                      {part}
                      {i < arr.length - 1 && (
                        <mark className="highlight-bad">{active.example.highlight}</mark>
                      )}
                    </span>
                  ))}
                </p>
              </div>

              {/* Arrow */}
              <div className="example-arrow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12l7 7 7-7" />
                </svg>
              </div>

              {/* After */}
              <div className="example-section">
                <div className="example-header good">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  <span>Inclusive</span>
                </div>
                <p className="example-text good">{active.example.good}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll progress bar */}
        <div className="scroll-progress-bar">
          <div
            className="scroll-progress-fill"
            style={{
              width: `${scrollProgress * 100}%`,
              backgroundColor: active.color,
            }}
          />
        </div>
      </div>
    </section>
  );
}
