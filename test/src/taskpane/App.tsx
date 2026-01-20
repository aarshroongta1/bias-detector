import * as React from "react";
import { analyzeBias } from "./api";
import type { BiasIssue } from "./type";
import IssueCard from "./components/IssueCard";
import "./App.css";

const App: React.FC = () => {
  const [issues, setIssues] = React.useState<BiasIssue[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("Ready to analyze");
  const [originalBody, setOriginalBody] = React.useState("");

  const getEmailBody = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.item.body.getAsync(
        Office.CoercionType.Html,
        (result) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve(result.value);
          } else {
            reject(result.error);
          }
        }
      );
    });
  };

  const setEmailBodyContent = (body: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.item.body.setAsync(
        body,
        { coercionType: Office.CoercionType.Html },
        (result) => {
          if (result.status === Office.AsyncResultStatus.Succeeded) {
            resolve();
          } else {
            reject(result.error);
          }
        }
      );
    });
  };

  const stripHtmlTags = (html: string): string => {
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };

  const getSeverityColor = (severity: string): string => {
    switch (severity) {
      case "high":
        return "#fecaca"; // light red
      case "medium":
        return "#fef3c7"; // light yellow
      case "low":
        return "#d1fae5"; // light green
      default:
        return "#fef3c7";
    }
  };

  const highlightIssuesInEmail = async (
    emailHtml: string,
    issuesToHighlight: BiasIssue[]
  ): Promise<string> => {
    let highlightedHtml = emailHtml;

    // Sort issues by phrase length (longest first) to avoid nested replacements
    const sortedIssues = [...issuesToHighlight].sort(
      (a, b) => b.phrase.length - a.phrase.length
    );

    sortedIssues.forEach((issue) => {
      const color = getSeverityColor(issue.severity);
      const escapedPhrase = escapeRegExp(issue.phrase);
      
      // Create regex that matches the phrase but not already highlighted text
      const regex = new RegExp(
        `(?<!<[^>]*)(\\b${escapedPhrase}\\b)(?![^<]*>)`,
        "gi"
      );

      highlightedHtml = highlightedHtml.replace(
        regex,
        `<span style="background-color: ${color}; padding: 2px 0; border-radius: 2px;" data-bias-phrase="${issue.phrase}">$1</span>`
      );
    });

    return highlightedHtml;
  };

  const removeHighlightFromEmail = async (phrase: string): Promise<void> => {
    try {
      const currentHtml = await getEmailBody();
      
      // Remove the highlight span for this specific phrase
      const escapedPhrase = escapeRegExp(phrase);
      const regex = new RegExp(
        `<span style="background-color: [^"]+;" data-bias-phrase="${escapedPhrase}">([^<]+)</span>`,
        "gi"
      );
      
      const cleanedHtml = currentHtml.replace(regex, "$1");
      await setEmailBodyContent(cleanedHtml);
    } catch (error) {
      console.error("Failed to remove highlight:", error);
    }
  };

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setStatus("Analyzing email...");

      const bodyHtml = await getEmailBody();
      const bodyText = stripHtmlTags(bodyHtml);

      if (!bodyText || !bodyText.trim()) {
        setStatus("No email content to analyze");
        setLoading(false);
        return;
      }

      // Store original body
      setOriginalBody(bodyHtml);

      const detectedIssues = await analyzeBias(bodyText);
      setIssues(detectedIssues);

      if (detectedIssues.length === 0) {
        setStatus("✓ No bias detected! Your email looks great.");
      } else {
        // Highlight issues in the actual email
        const highlightedHtml = await highlightIssuesInEmail(
          bodyHtml,
          detectedIssues
        );
        await setEmailBodyContent(highlightedHtml);

        setStatus(
          `Found ${detectedIssues.length} potential issue${
            detectedIssues.length > 1 ? "s" : ""
          }`
        );
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setStatus(
        "❌ Analysis failed. Make sure the backend server is running on port 3000."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = async (issue: BiasIssue) => {
    try {
      setStatus("Applying suggestion...");

      const currentHtml = await getEmailBody();
      
      // First remove the highlight span
      const escapedPhrase = escapeRegExp(issue.phrase);
      let cleanedHtml = currentHtml.replace(
        new RegExp(
          `<span style="background-color: [^"]+;" data-bias-phrase="${escapedPhrase}">([^<]+)</span>`,
          "gi"
        ),
        "$1"
      );

      // Then replace the phrase with the suggestion
      cleanedHtml = cleanedHtml.replace(
        new RegExp(`\\b${escapedPhrase}\\b`, "gi"),
        issue.replacement
      );

      await setEmailBodyContent(cleanedHtml);

      // Remove the applied issue
      const updatedIssues = issues.filter((i) => i.phrase !== issue.phrase);
      setIssues(updatedIssues);

      if (updatedIssues.length === 0) {
        setStatus("✓ All issues resolved!");
      } else {
        setStatus(
          `✓ Applied! ${updatedIssues.length} issue${
            updatedIssues.length !== 1 ? "s" : ""
          } remaining.`
        );
      }
    } catch (error) {
      console.error("Failed to apply suggestion:", error);
      setStatus("❌ Failed to apply suggestion");
    }
  };

  const handleIgnore = async (issue: BiasIssue) => {
    try {
      // Remove highlight from email
      await removeHighlightFromEmail(issue.phrase);

      // Remove from issues list
      const updatedIssues = issues.filter((i) => i.phrase !== issue.phrase);
      setIssues(updatedIssues);

      if (updatedIssues.length === 0) {
        setStatus("All issues resolved or ignored.");
      } else {
        setStatus(
          `${updatedIssues.length} issue${
            updatedIssues.length !== 1 ? "s" : ""
          } remaining.`
        );
      }
    } catch (error) {
      console.error("Failed to ignore issue:", error);
      setStatus("❌ Failed to ignore issue");
    }
  };

  const handleApplyAll = async () => {
    try {
      setStatus("Applying all suggestions...");

      let currentHtml = await getEmailBody();

      // Remove all highlights and replace all phrases
      issues.forEach((issue) => {
        const escapedPhrase = escapeRegExp(issue.phrase);
        
        // Remove highlight
        currentHtml = currentHtml.replace(
          new RegExp(
            `<span style="background-color: [^"]+;" data-bias-phrase="${escapedPhrase}">([^<]+)</span>`,
            "gi"
          ),
          "$1"
        );

        // Replace phrase
        currentHtml = currentHtml.replace(
          new RegExp(`\\b${escapedPhrase}\\b`, "gi"),
          issue.replacement
        );
      });

      await setEmailBodyContent(currentHtml);

      setIssues([]);
      setStatus("✓ All suggestions applied!");
    } catch (error) {
      console.error("Failed to apply all suggestions:", error);
      setStatus("❌ Failed to apply suggestions");
    }
  };

  const escapeRegExp = (string: string): string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="logo">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h1 className="title">Bias Detector</h1>
        <p className="subtitle">Detect and fix implicit bias in your emails</p>
      </header>

      {/* Main Content */}
      <main className="main-content">
        {/* Analyze Button */}
        <div className="action-section">
          <button
            className="primary-btn"
            onClick={handleAnalyze}
            disabled={loading}
          >
            {loading ? "Analyzing..." : "Analyze Email"}
          </button>
          {loading && <div className="spinner"></div>}
        </div>

        {/* Status */}
        <div className="status-bar">
          <p>{status}</p>
        </div>

        {/* Results */}
        {issues.length === 0 && !loading && originalBody && (
          <div className="success-message">
            <div className="success-icon">✓</div>
            <p>No bias detected! Your email looks great.</p>
          </div>
        )}

        {issues.length > 0 && (
          <>
            <div className="results-container">
              {issues.map((issue, index) => (
                <IssueCard
                  key={`${issue.phrase}-${index}`}
                  issue={issue}
                  onReplace={() => handleReplace(issue)}
                  onIgnore={() => handleIgnore(issue)}
                />
              ))}
            </div>

            <div className="apply-all-section">
              <button className="secondary-btn" onClick={handleApplyAll}>
                Apply All Suggestions
              </button>
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="footer">
        <p>
          Backend server: <strong>localhost:3000</strong>
        </p>
      </footer>
    </div>
  );
};

export default App;