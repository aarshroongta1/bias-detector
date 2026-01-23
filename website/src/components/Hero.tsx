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
        <div className="hero-platforms">
          <span className="platforms-label">Available on</span>
          <div className="platforms-icons">
            <a href="#download" className="platform-icon-small" title="Chrome Extension">
              <svg viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" fill="#fff"/>
                <path d="M12 2a10 10 0 0 1 8.66 5H12a5 5 0 0 0-4.33 2.5L5.25 5.17A10 10 0 0 1 12 2z" fill="#EA4335"/>
                <path d="M20.66 7a10 10 0 0 1-3.41 11.83L14.83 14.5A5 5 0 0 0 17 12h5.66z" fill="#FBBC05"/>
                <path d="M17.25 18.83A10 10 0 0 1 5.25 5.17l2.42 4.33A5 5 0 0 0 12 17l5.25 1.83z" fill="#34A853"/>
                <path d="M7.67 9.5A5 5 0 0 0 12 17v5a10 10 0 0 1-6.75-12.83l2.42 4.33z" fill="#4285F4"/>
                <circle cx="12" cy="12" r="4" fill="#fff"/>
                <circle cx="12" cy="12" r="3" fill="#4285F4"/>
              </svg>
              <span>Chrome</span>
            </a>
            <a href="#download" className="platform-icon-small" title="Outlook Add-in">
              <svg viewBox="0 0 24 24">
                <rect x="1" y="4" width="22" height="16" rx="2" fill="#0078D4"/>
                <path d="M13 6h8v12h-8z" fill="#0078D4"/>
                <path d="M14 8h6v8h-6z" fill="#fff" opacity="0.3"/>
                <ellipse cx="6" cy="12" rx="3.5" ry="4" fill="#0078D4"/>
                <ellipse cx="6" cy="12" rx="2" ry="2.5" fill="#fff"/>
              </svg>
              <span>Outlook</span>
            </a>
            <a href="#download" className="platform-icon-small" title="Google Docs">
              <svg viewBox="0 0 24 24">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#4285F4"/>
                <path d="M14 2v6h6" fill="#A1C2FA"/>
                <path d="M8 13h8M8 16h5" stroke="#fff" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
              </svg>
              <span>Google Docs</span>
            </a>
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
