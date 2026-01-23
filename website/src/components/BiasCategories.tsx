import { useState, useEffect } from 'react'

const categories = [
  {
    name: 'Gendered Language',
    example: { bad: 'We need a strong chairman to lead the team.', good: 'We need a strong chairperson to lead the team.', highlight: 'chairman' }
  },
  {
    name: 'Age Bias',
    example: { bad: 'Looking for young and energetic candidates.', good: 'Looking for energetic candidates.', highlight: 'young and' }
  },
  {
    name: 'Cultural Assumptions',
    example: { bad: 'Please bring a dish for our Christmas party.', good: 'Please bring a dish for our holiday celebration.', highlight: 'Christmas party' }
  },
  {
    name: 'Ability Bias',
    example: { bad: 'The team was blind to the obvious solution.', good: 'The team was unaware of the obvious solution.', highlight: 'blind to' }
  },
  {
    name: 'Socioeconomic Bias',
    example: { bad: 'Programs for underprivileged communities.', good: 'Programs for under-resourced communities.', highlight: 'underprivileged' }
  },
  {
    name: 'Racial & Ethnic',
    example: { bad: 'She speaks so articulately for someone from there.', good: 'She speaks articulately.', highlight: 'for someone from there' }
  }
]

export default function BiasCategories() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % categories.length)
        setIsTransitioning(false)
      }, 300)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  const active = categories[activeIndex]

  const renderHighlightedText = (text: string, highlight: string, isBad: boolean) => {
    const parts = text.split(highlight)
    if (parts.length === 1) return text
    return (
      <>
        {parts[0]}
        <span className={`highlight-word ${isBad ? 'bad' : 'good'}`}>{isBad ? highlight : ''}</span>
        {parts[1]}
      </>
    )
  }

  return (
    <section className="categories" id="categories">
      <div className="section-header">
        <h2>See Bias Detection in Action</h2>
        <p className="section-subtitle">
          Real examples of how subtle bias appears in everyday writing
        </p>
      </div>

      <div className="showcase-container">
        {/* Category Pills */}
        <div className="category-pills">
          {categories.map((cat, index) => (
            <button
              key={index}
              className={`pill ${index === activeIndex ? 'active' : ''}`}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setActiveIndex(index)
                  setIsTransitioning(false)
                }, 300)
              }}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Showcase Card */}
        <div className={`showcase-card ${isTransitioning ? 'transitioning' : ''}`}>
          <div className="showcase-before">
            <span className="showcase-label">Before</span>
            <p className="showcase-text">
              {renderHighlightedText(active.example.bad, active.example.highlight, true)}
            </p>
          </div>

          <div className="showcase-arrow">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </div>

          <div className="showcase-after">
            <span className="showcase-label">After</span>
            <p className="showcase-text">
              {active.example.good}
            </p>
          </div>
        </div>

        {/* Progress Dots */}
        <div className="showcase-dots">
          {categories.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === activeIndex ? 'active' : ''}`}
              onClick={() => {
                setIsTransitioning(true)
                setTimeout(() => {
                  setActiveIndex(index)
                  setIsTransitioning(false)
                }, 300)
              }}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
