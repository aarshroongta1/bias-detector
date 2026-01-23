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
      good: "Students unfamiliar to the environment may struggle in advanced classes.",
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressRef = useRef<NodeJS.Timeout | null>(null);

  const DURATION = 5000;

  const startProgress = () => {
    setProgress(0);
    if (progressRef.current) clearInterval(progressRef.current);
    const step = 100 / (DURATION / 50);
    progressRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) return 100;
        return prev + step;
      });
    }, 50);
  };

  const goToIndex = (index: number) => {
    if (index === activeIndex) return;
    setDirection(index > activeIndex ? "next" : "prev");
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setIsTransitioning(false);
      startProgress();
    }, 400);
  };

  useEffect(() => {
    startProgress();
    intervalRef.current = setInterval(() => {
      setDirection("next");
      setIsTransitioning(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % categories.length);
        setIsTransitioning(false);
        startProgress();
      }, 400);
    }, DURATION);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, []);

  const active = categories[activeIndex];

  const renderHighlightedText = (
    text: string,
    highlight: string,
    isBad: boolean,
  ) => {
    const parts = text.split(highlight);
    if (parts.length === 1) return text;
    return (
      <>
        {parts[0]}
        <span className={`highlight-word ${isBad ? "bad" : "good"}`}>
          {isBad ? highlight : ""}
        </span>
        {parts[1]}
      </>
    );
  };

  return (
    <section className="categories" id="categories">
      <div className="section-header">
        <h2>Implicit Biases creep their way into everyday writing</h2>
      </div>

      <div className="showcase-container">
        {/* Vertical Category Navigation */}
        <div className="category-sidebar">
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`category-tab-v2 ${index === activeIndex ? "active" : ""}`}
              onClick={() => goToIndex(index)}
              style={{ "--tab-color": cat.color } as React.CSSProperties}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Showcase Card */}
        <div className="showcase-wrapper">
          <div
            className={`showcase-card-v2 ${isTransitioning ? `transitioning-${direction}` : ""}`}
          >
            {/* Decorative elements */}
            <div
              className="card-glow"
              style={{
                background: `radial-gradient(circle at 30% 30%, ${active.color}15, transparent 70%)`,
              }}
            />

            <div className="showcase-content">
              <div className="showcase-before-v2">
                <div className="showcase-label-v2">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                  Biased
                </div>
                <p className="showcase-text-v2">
                  {renderHighlightedText(
                    active.example.bad,
                    active.example.highlight,
                    true,
                  )}
                </p>
              </div>

              <div className="showcase-divider">
                <div className="divider-line" />
                <div
                  className="divider-icon"
                  style={{ borderColor: active.color, color: active.color }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14" />
                    <path d="M12 5l7 7-7 7" />
                  </svg>
                </div>
                <div className="divider-line" />
              </div>

              <div className="showcase-after-v2">
                <div className="showcase-label-v2 success">
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9 12l2 2 4-4" />
                  </svg>
                  Inclusive
                </div>
                <p className="showcase-text-v2 improved">
                  {active.example.good}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Progress Dots */}
        <div className="showcase-dots-v2">
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`dot-v2 ${index === activeIndex ? "active" : ""}`}
              onClick={() => goToIndex(index)}
              style={{ "--dot-color": cat.color } as React.CSSProperties}
            >
              {index === activeIndex && (
                <svg className="dot-progress" viewBox="0 0 36 36">
                  <circle
                    cx="18"
                    cy="18"
                    r="16"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeDasharray={`${progress}, 100`}
                  />
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
