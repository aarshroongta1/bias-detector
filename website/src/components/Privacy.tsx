export default function Privacy() {
  return (
    <div className="privacy-page">
      <div className="privacy-container">
        <h1>Privacy Policy</h1>
        <p className="last-updated">Last updated: January 2025</p>

        <section>
          <h2>Overview</h2>
          <p>
            Bias Detector ("we", "our", or "us") is committed to protecting your privacy.
            This Privacy Policy explains how we collect, use, and safeguard information when
            you use our Chrome extension, Google Docs add-on, Outlook add-in, or website.
          </p>
        </section>

        <section>
          <h2>Information We Collect</h2>
          <p>
            <strong>Text Content:</strong> When you use Bias Detector to analyze text, we
            temporarily process the text you submit to identify potential biases. This text
            is sent to our secure server for analysis.
          </p>
          <p>
            <strong>What We Do NOT Collect:</strong>
          </p>
          <ul>
            <li>Personal identification information (name, email, address)</li>
            <li>Authentication credentials or passwords</li>
            <li>Browsing history or web activity</li>
            <li>Location data</li>
            <li>Financial information</li>
            <li>Health information</li>
          </ul>
        </section>

        <section>
          <h2>How We Use Your Information</h2>
          <p>
            Text submitted for analysis is used solely to:
          </p>
          <ul>
            <li>Detect potential biases in your writing</li>
            <li>Generate suggestions for more inclusive alternatives</li>
          </ul>
          <p>
            We do not store, log, or retain the text you submit after the analysis is complete.
            Each analysis request is processed in real-time and discarded immediately after
            returning results.
          </p>
        </section>

        <section>
          <h2>Data Sharing</h2>
          <p>
            We do not sell, trade, or transfer your data to third parties. Text submitted
            for analysis is processed using OpenAI's API, which is subject to
            <a href="https://openai.com/policies/privacy-policy" target="_blank" rel="noopener noreferrer"> OpenAI's Privacy Policy</a>.
          </p>
        </section>

        <section>
          <h2>Data Security</h2>
          <p>
            All data transmitted between your device and our servers is encrypted using
            HTTPS. We implement industry-standard security measures to protect against
            unauthorized access.
          </p>
        </section>

        <section>
          <h2>Your Choices</h2>
          <p>
            You have full control over when Bias Detector analyzes your text. The extension
            only reads and processes text when you explicitly trigger an analysis. No
            background scanning or automatic data collection occurs.
          </p>
        </section>

        <section>
          <h2>Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. Any changes will be posted
            on this page with an updated revision date.
          </p>
        </section>

        <section>
          <h2>Contact Us</h2>
          <p>
            If you have questions about this Privacy Policy, please visit our
            <a href="https://github.com/aarshroongta1/bias-detector" target="_blank" rel="noopener noreferrer"> GitHub repository</a>
            to open an issue.
          </p>
        </section>

        <a href="/" className="back-link">← Back to Home</a>
      </div>
    </div>
  )
}
