export default function Hero() {
  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-subtitle">
          AI-powered tool that helps you write more inclusive content by identifying
          biased language in real-time. Available for Chrome, Outlook, and Gmail.
        </p>
        <div className="hero-cta">
          <button className="btn btn-primary" onClick={scrollToDemo}>
            Try Demo
          </button>
          <a href="#download" className="btn btn-secondary">
            Download Extension
          </a>
        </div>
        <div className="hero-stats">
          <div className="stat">
            <span className="stat-number">6+</span>
            <span className="stat-label">Bias Categories</span>
          </div>
          <div className="stat">
            <span className="stat-number">3</span>
            <span className="stat-label">Platforms</span>
          </div>
          <div className="stat">
            <span className="stat-number">AI</span>
            <span className="stat-label">Powered</span>
          </div>
        </div>
      </div>
      <div className="hero-visual">
        <div className="demo-preview">
          <div className="preview-header">
            <div className="preview-dots">
              <span></span><span></span><span></span>
            </div>
            <span className="preview-title">Email Compose</span>
          </div>
          <div className="preview-content">
            <p>Dear Team,</p>
            <p>
              We need a <span className="bias-highlight medium">strong man</span> to
              lead this project. The <span className="bias-highlight low">chairman</span> has
              approved the budget.
            </p>
            <p>Best regards</p>
          </div>
        </div>
      </div>
    </section>
  )
}
