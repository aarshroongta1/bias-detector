export default function About() {
  return (
    <section className="about" id="about">
      <div className="section-header">
        <h2>What is Bias Detector?</h2>
        <p className="section-subtitle">
          A smart assistant that helps you communicate more inclusively
        </p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <div className="about-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h3>AI-Powered Analysis</h3>
          <p>
            Uses advanced language models to detect subtle biases that traditional
            tools miss. Identifies gendered language, cultural assumptions, and more.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h3>Real-Time Detection</h3>
          <p>
            Works instantly as you type. Get suggestions before you hit send,
            ensuring your message is inclusive from the start.
          </p>
        </div>

        <div className="about-card">
          <div className="about-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h3>Privacy First</h3>
          <p>
            Your text is analyzed securely and never stored. We respect your
            privacy while helping you communicate better.
          </p>
        </div>
      </div>

      <div className="platforms">
        <h3>Available On</h3>
        <div className="platform-list">
          <a href="#download" className="platform">
            <div className="platform-icon-wrapper">
              {/* Chrome Logo */}
              <svg viewBox="0 0 24 24" className="platform-svg chrome">
                <circle cx="12" cy="12" r="10" fill="#fff"/>
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" fill="none"/>
                <path d="M12 2a10 10 0 0 1 8.66 5H12a5 5 0 0 0-4.33 2.5L5.25 5.17A10 10 0 0 1 12 2z" fill="#EA4335"/>
                <path d="M20.66 7a10 10 0 0 1-3.41 11.83L14.83 14.5A5 5 0 0 0 17 12h5.66z" fill="#FBBC05"/>
                <path d="M17.25 18.83A10 10 0 0 1 5.25 5.17l2.42 4.33A5 5 0 0 0 12 17l5.25 1.83z" fill="#34A853"/>
                <path d="M7.67 9.5A5 5 0 0 0 12 17v5a10 10 0 0 1-6.75-12.83l2.42 4.33z" fill="#4285F4"/>
                <circle cx="12" cy="12" r="4" fill="#fff"/>
                <circle cx="12" cy="12" r="3.2" fill="#4285F4"/>
              </svg>
            </div>
            <span>Chrome</span>
          </a>

          <a href="#download" className="platform">
            <div className="platform-icon-wrapper">
              {/* Outlook Logo */}
              <svg viewBox="0 0 24 24" className="platform-svg outlook">
                <path d="M24 7.387v10.478c0 .23-.08.424-.238.576-.158.154-.352.229-.584.229h-8.547v-6.959l1.6 1.229c.102.086.229.127.379.127.158 0 .295-.049.404-.143l.135-.121 4.156-3.164v-.004a.479.479 0 0 0 .186-.37.474.474 0 0 0-.186-.37l-.135-.12-4.156-3.166c-.109-.094-.246-.143-.404-.143-.15 0-.277.043-.379.127l-1.6 1.23V4.387h8.547c.232 0 .426.076.584.23.158.152.238.345.238.576z" fill="#0078D4"/>
                <path d="M8 8.5v7a.5.5 0 0 1-.5.5h-7a.5.5 0 0 1-.5-.5v-7a.5.5 0 0 1 .5-.5h7a.5.5 0 0 1 .5.5z" fill="#0078D4"/>
                <ellipse cx="4" cy="12" rx="2.5" ry="3" fill="#fff"/>
                <path d="M14.5 4h-6v12h6a.5.5 0 0 0 .5-.5v-11a.5.5 0 0 0-.5-.5z" fill="#0078D4" opacity="0.6"/>
              </svg>
            </div>
            <span>Outlook</span>
          </a>

          <a href="#download" className="platform">
            <div className="platform-icon-wrapper">
              {/* Google Docs Logo */}
              <svg viewBox="0 0 24 24" className="platform-svg docs">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6z" fill="#4285F4"/>
                <path d="M14 2v6h6" fill="#A1C2FA"/>
                <path d="M14 2l6 6h-6z" fill="#A1C2FA"/>
                <path d="M8 13h8M8 16h6" stroke="#fff" strokeWidth="1.2" fill="none"/>
              </svg>
            </div>
            <span>Google Docs</span>
          </a>
        </div>
      </div>
    </section>
  )
}
