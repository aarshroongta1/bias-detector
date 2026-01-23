import { useState, useEffect, useRef } from 'react'

type Phase = 'idle' | 'cursor-moving' | 'cursor-at-word' | 'card-appear' | 'cursor-to-button' | 'clicking' | 'transforming' | 'complete'

export default function AnimatedTitle() {
  const [phase, setPhase] = useState<Phase>('idle')
  const [word, setWord] = useState('Bias')
  const [cursorStyle, setCursorStyle] = useState<React.CSSProperties>({
    left: -100,
    top: '50%',
    opacity: 0
  })

  const wordRef = useRef<HTMLSpanElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const moveCursorTo = (target: 'start' | 'word' | 'button') => {
    if (target === 'start') {
      setCursorStyle({
        left: -100,
        top: '50%',
        opacity: 0
      })
    } else if (target === 'word' && wordRef.current) {
      const rect = wordRef.current.getBoundingClientRect()
      setCursorStyle({
        left: rect.right - 20,
        top: rect.bottom - 15,
        opacity: 1
      })
    } else if (target === 'button' && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      setCursorStyle({
        left: rect.left + rect.width / 2 - 5,
        top: rect.top + rect.height / 2,
        opacity: 1
      })
    }
  }

  useEffect(() => {
    // Start cursor off-screen
    moveCursorTo('start')

    const timers: NodeJS.Timeout[] = []

    // Phase 1: Cursor enters and moves to word
    timers.push(setTimeout(() => {
      setPhase('cursor-moving')
      moveCursorTo('word')
    }, 800))

    // Phase 2: Cursor arrives at word
    timers.push(setTimeout(() => {
      setPhase('cursor-at-word')
    }, 2400))

    // Phase 3: Card appears
    timers.push(setTimeout(() => {
      setPhase('card-appear')
    }, 3200))

    // Phase 4: Cursor moves to button
    timers.push(setTimeout(() => {
      setPhase('cursor-to-button')
      setTimeout(() => moveCursorTo('button'), 50)
    }, 4800))

    // Phase 5: Click
    timers.push(setTimeout(() => {
      setPhase('clicking')
    }, 6400))

    // Phase 6: Transform
    timers.push(setTimeout(() => {
      setPhase('transforming')
      setCursorStyle(prev => ({ ...prev, opacity: 0 }))
    }, 6800))

    // Phase 7: Complete
    timers.push(setTimeout(() => {
      setWord('Bias Detector')
      setPhase('complete')
    }, 7200))

    return () => timers.forEach(clearTimeout)
  }, [])

  const showCard = ['card-appear', 'cursor-to-button', 'clicking'].includes(phase)
  const isComplete = phase === 'complete'
  const isTransforming = phase === 'transforming'

  return (
    <section className="intro-section">
      <div className="intro-content">
        {/* The Word */}
        <div className="word-container">
          <span
            ref={wordRef}
            className={`the-word ${isComplete ? 'complete' : 'biased'} ${isTransforming ? 'transforming' : ''}`}
          >
            {word}
          </span>

          {/* Hover Card - matches extension design */}
          {showCard && (
            <div className={`hover-card ${phase === 'clicking' ? 'clicking' : ''}`}>
              <div className="hover-card-header">
                <span className="severity-badge medium">medium</span>
                <span className="category-text">Gendered Language</span>
              </div>
              <div className="hover-card-body">
                <p className="explanation-text">
                  The word "Bias" represents prejudiced thinking. Replace with inclusive,
                  awareness-driven language.
                </p>
                <div className="suggestion-box">
                  <span className="suggestion-label">Suggested replacement:</span>
                  <span className="suggestion-value">Bias Detector</span>
                </div>
              </div>
              <div className="hover-card-actions">
                <button className="action-btn ignore-btn">Ignore</button>
                <button
                  ref={buttonRef}
                  className={`action-btn accept-btn ${phase === 'clicking' ? 'pressed' : ''}`}
                >
                  Accept
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Cursor */}
        <div
          className={`the-cursor ${phase === 'clicking' ? 'clicking' : ''}`}
          style={cursorStyle}
        >
          <svg viewBox="0 0 24 24" fill="currentColor">
            <path d="M4 4l16 8-7 2-2 7z"/>
          </svg>
        </div>
      </div>
    </section>
  )
}
