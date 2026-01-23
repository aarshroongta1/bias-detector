import { useState } from 'react'

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

const SAMPLE_TEXT = `Dear Team,

We're looking for a young, energetic chairman to lead our new initiative. The ideal candidate should be a strong man who can manage manpower effectively.

We need someone who is a digital native and can hit the ground running. The position requires someone who can stand for long periods during presentations.

Best regards`

export default function Demo() {
  const [text, setText] = useState(SAMPLE_TEXT)
  const [results, setResults] = useState<BiasIssue[] | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeText = async () => {
    if (!text.trim()) return

    setIsLoading(true)
    setError(null)
    setResults(null)

    try {
      const response = await fetch('http://localhost:3001/analyze', {
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
      setError('Unable to connect to the analysis server. Make sure the server is running on port 3001.')
    } finally {
      setIsLoading(false)
    }
  }

  const getHighlightedText = () => {
    if (!results || results.length === 0) return text

    const sortedPositions: { start: number; end: number; severity: string; issue: BiasIssue }[] = []

    results.forEach(issue => {
      issue.positions.forEach(pos => {
        sortedPositions.push({ ...pos, severity: issue.severity, issue })
      })
    })

    sortedPositions.sort((a, b) => a.start - b.start)

    const elements: (string | JSX.Element)[] = []
    let lastEnd = 0

    sortedPositions.forEach((pos, index) => {
      if (pos.start > lastEnd) {
        elements.push(text.slice(lastEnd, pos.start))
      }
      if (pos.start >= lastEnd) {
        elements.push(
          <span
            key={index}
            className={`bias-highlight ${pos.severity}`}
            title={`${pos.issue.category}: ${pos.issue.explanation}`}
          >
            {text.slice(pos.start, pos.end)}
          </span>
        )
        lastEnd = pos.end
      }
    })

    if (lastEnd < text.length) {
      elements.push(text.slice(lastEnd))
    }

    return elements
  }

  return (
    <section className="demo" id="demo">
      <div className="section-header">
        <h2>Try It Yourself</h2>
        <p className="section-subtitle">
          Paste your text below and see Bias Detector in action
        </p>
      </div>

      <div className="demo-container">
        <div className="demo-input-area">
          <div className="demo-toolbar">
            <span className="demo-label">Input</span>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Enter or paste your text here to analyze for bias..."
            rows={12}
          />
          <div className="demo-actions">
            <button
              className="btn btn-text"
              onClick={() => setText(SAMPLE_TEXT)}
            >
              Load sample
            </button>
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

        <div className="demo-results-area">
          <div className="demo-toolbar">
            <span className="demo-label">Results</span>
            {results && (
              <span className="results-count">
                {results.length} issue{results.length !== 1 ? 's' : ''} found
              </span>
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

          {!results && !error && !isLoading && (
            <div className="demo-placeholder">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p>Click "Analyze for Bias" to see results</p>
            </div>
          )}

          {results && results.length === 0 && (
            <div className="demo-success">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p>No bias detected! Your text looks inclusive.</p>
            </div>
          )}

          {results && results.length > 0 && (
            <>
              <div className="highlighted-text">
                {getHighlightedText()}
              </div>

              <div className="issues-list">
                {results.map((issue, index) => (
                  <div key={index} className={`issue-card ${issue.severity}`}>
                    <div className="issue-header">
                      <span className={`severity-badge ${issue.severity}`}>
                        {issue.severity}
                      </span>
                      <span className="issue-category">{issue.category}</span>
                    </div>
                    <div className="issue-phrase">"{issue.phrase}"</div>
                    <p className="issue-explanation">{issue.explanation}</p>
                    <div className="issue-replacement">
                      <span className="replacement-label">→</span>
                      <span className="replacement-text">{issue.replacement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  )
}
