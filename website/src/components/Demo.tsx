import { useState, useRef } from 'react'

interface BiasIssue {
  phrase: string
  category: string
  explanation: string
  replacement: string
  severity: 'low' | 'medium' | 'high'
  positions: { start: number; end: number }[]
}

interface AnalysisResult {
  results: {
    biases: BiasIssue[]
  }
}

interface HoverCardData {
  issue: BiasIssue
  positionIndex: number
  rect: DOMRect
}

const SAMPLE_TEXT = `Dear Team,

We're looking for a young, energetic chairman to lead our new initiative. The ideal candidate should be a strong man who can manage manpower effectively.

We need someone who is a digital native and can hit the ground running. The position requires someone who can stand for long periods during presentations.

Best regards`

export default function Demo() {
  const [text, setText] = useState(SAMPLE_TEXT)
  const [results, setResults] = useState<BiasIssue[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hoveredCard, setHoveredCard] = useState<HoverCardData | null>(null)
  const [isEditing, setIsEditing] = useState(true)
  const editorRef = useRef<HTMLDivElement>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const analyzeText = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    setError(null)
    setResults(null)
    setIsEditing(false)

    try {
      const response = await fetch('https://bias-detector-2ih2.onrender.com/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text })
      })

      if (!response.ok) {
        throw new Error('Failed to analyze text')
      }

      const data: AnalysisResult = await response.json()
      setResults(data.results.biases)
    } catch (err) {
      setError('Unable to connect to the analysis server. Please try again later.')
      setIsEditing(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEditorInput = () => {
    if (editorRef.current && isEditing) {
      setText(editorRef.current.innerText || '')
    }
  }

  const handleHighlightMouseEnter = (
    e: React.MouseEvent<HTMLSpanElement>,
    issue: BiasIssue,
    positionIndex: number
  ) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
    const rect = e.currentTarget.getBoundingClientRect()
    setHoveredCard({ issue, positionIndex, rect })
  }

  const handleHighlightMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredCard(null)
    }, 150)
  }

  const handleCardMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
    }
  }

  const handleCardMouseLeave = () => {
    setHoveredCard(null)
  }

  const handleApplyFix = (issue: BiasIssue, positionIndex: number) => {
    const pos = issue.positions[positionIndex]
    const newText = text.slice(0, pos.start) + issue.replacement + text.slice(pos.end)
    setText(newText)
    setHoveredCard(null)

    // Update results to remove the fixed issue position
    if (results) {
      const updatedResults = results.map(r => {
        if (r === issue) {
          const newPositions = r.positions.filter((_, i) => i !== positionIndex)
          // Adjust positions after the fix
          const lengthDiff = issue.replacement.length - (pos.end - pos.start)
          const adjustedPositions = newPositions.map(p => {
            if (p.start > pos.start) {
              return { start: p.start + lengthDiff, end: p.end + lengthDiff }
            }
            return p
          })
          return { ...r, positions: adjustedPositions }
        }
        // Adjust positions in other issues too
        const lengthDiff = issue.replacement.length - (pos.end - pos.start)
        const adjustedPositions = r.positions.map(p => {
          if (p.start > pos.start) {
            return { start: p.start + lengthDiff, end: p.end + lengthDiff }
          }
          return p
        })
        return { ...r, positions: adjustedPositions }
      }).filter(r => r.positions.length > 0)

      setResults(updatedResults)
    }
  }

  const handleReset = () => {
    setResults(null)
    setIsEditing(true)
    setHoveredCard(null)
  }

  const renderHighlightedContent = () => {
    if (!results || results.length === 0) {
      return text
    }

    // Collect all positions with their issue references
    const allPositions: { start: number; end: number; issue: BiasIssue; posIndex: number }[] = []
    results.forEach(issue => {
      issue.positions.forEach((pos, posIndex) => {
        allPositions.push({ ...pos, issue, posIndex })
      })
    })

    // Sort by start position, then by length (longer first for overlaps)
    allPositions.sort((a, b) => a.start - b.start || (b.end - b.start) - (a.end - a.start))

    // Filter out overlapping positions
    const filtered: typeof allPositions = []
    for (const pos of allPositions) {
      const overlaps = filtered.some(f => pos.start < f.end && pos.end > f.start)
      if (!overlaps) filtered.push(pos)
    }

    // Build the highlighted content
    const elements: React.ReactNode[] = []
    let lastEnd = 0

    filtered.forEach((pos, index) => {
      // Add text before this highlight
      if (pos.start > lastEnd) {
        elements.push(text.slice(lastEnd, pos.start))
      }

      // Add the highlighted span
      elements.push(
        <span
          key={index}
          className={`bias-highlight ${pos.issue.severity}`}
          onMouseEnter={(e) => handleHighlightMouseEnter(e, pos.issue, pos.posIndex)}
          onMouseLeave={handleHighlightMouseLeave}
        >
          {text.slice(pos.start, pos.end)}
        </span>
      )

      lastEnd = pos.end
    })

    // Add remaining text
    if (lastEnd < text.length) {
      elements.push(text.slice(lastEnd))
    }

    return elements
  }

  // Calculate card position
  const getCardPosition = () => {
    if (!hoveredCard) return {}

    const { rect } = hoveredCard
    let top = rect.bottom + 8
    let left = rect.left

    // Adjust if too close to right edge
    if (left + 320 > window.innerWidth) {
      left = window.innerWidth - 340
    }

    // Adjust if too close to bottom
    if (top + 200 > window.innerHeight) {
      top = rect.top - 210
    }

    return { top: `${top}px`, left: `${left}px` }
  }

  const issueCount = results?.reduce((acc, r) => acc + r.positions.length, 0) || 0

  return (
    <section className="demo" id="demo">
      <div className="section-header">
        <h2>Try It Yourself</h2>
        <p className="section-subtitle">
          Paste your text below and see Bias Detector in action
        </p>
      </div>

      <div className="demo-container-v2">
        <div className="demo-toolbar">
          <span className="demo-label">
            {isEditing ? 'Editor' : 'Analysis Results'}
          </span>
          {results && issueCount > 0 && (
            <span className="results-count">
              {issueCount} issue{issueCount !== 1 ? 's' : ''} found
            </span>
          )}
          {results && results.length === 0 && (
            <span className="results-count success">No bias detected</span>
          )}
        </div>

        {error && (
          <div className="demo-error">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="demo-editor-wrapper">
          {isEditing ? (
            <div
              ref={editorRef}
              className="demo-editor"
              contentEditable
              suppressContentEditableWarning
              onInput={handleEditorInput}
              dangerouslySetInnerHTML={{ __html: text.replace(/\n/g, '<br>') }}
            />
          ) : (
            <div className="demo-editor readonly">
              {renderHighlightedContent()}
            </div>
          )}
        </div>

        <div className="demo-actions">
          <div className="demo-actions-left">
            <button
              className="btn btn-text"
              onClick={() => {
                setText(SAMPLE_TEXT)
                if (editorRef.current && isEditing) {
                  editorRef.current.innerHTML = SAMPLE_TEXT.replace(/\n/g, '<br>')
                }
              }}
            >
              Load sample
            </button>
            {results && (
              <button className="btn btn-text" onClick={handleReset}>
                Edit text
              </button>
            )}
          </div>
          <button
            className="btn btn-primary"
            onClick={analyzeText}
            disabled={isLoading || !text.trim()}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </div>

      {/* Hover Card */}
      {hoveredCard && (
        <div
          className="demo-hover-card"
          style={getCardPosition()}
          onMouseEnter={handleCardMouseEnter}
          onMouseLeave={handleCardMouseLeave}
        >
          <div className="hover-card-header">
            <span className={`severity-badge ${hoveredCard.issue.severity}`}>
              {hoveredCard.issue.severity}
            </span>
            <span className="hover-card-category">{hoveredCard.issue.category}</span>
          </div>
          <p className="hover-card-explanation">{hoveredCard.issue.explanation}</p>
          <div className="hover-card-suggestion">
            <span className="suggestion-label">Suggestion:</span>
            <span className="suggestion-text">"{hoveredCard.issue.replacement}"</span>
          </div>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => handleApplyFix(hoveredCard.issue, hoveredCard.positionIndex)}
          >
            Apply Fix
          </button>
        </div>
      )}
    </section>
  )
}
