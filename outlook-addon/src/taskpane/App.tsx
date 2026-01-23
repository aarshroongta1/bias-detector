import * as React from "react";
import { analyzeBias } from "./api";
import type { BiasIssue } from "./type";
import IssueCard from "./components/IssueCard";
import "./App.css";

const App: React.FC = () => {
  const [issues, setIssues] = React.useState<BiasIssue[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState("Ready to analyze");
  const [emailBody, setEmailBody] = React.useState("");

  const getEmailBody = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value);
        } else {
          reject(result.error);
        }
      });
    });
  };

  const setEmailBodyContent = (body: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.item.body.setAsync(
        body,
        { coercionType: Office.CoercionType.Text },
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

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setStatus("Analyzing email...");

      const body = await getEmailBody();

      if (!body || !body.trim()) {
        setStatus("No email content to analyze");
        setLoading(false);
        return;
      }

      setEmailBody(body);

      const detectedIssues = await analyzeBias(body);
      setIssues(detectedIssues);

      if (detectedIssues.length === 0) {
        setStatus("✓ No bias detected! Your email looks great.");
      } else {
        setStatus(
          `Found ${detectedIssues.length} potential issue${detectedIssues.length > 1 ? "s" : ""}`
        );
      }
    } catch (error) {
      console.error("Analysis failed:", error);
      setStatus("❌ Analysis failed. Make sure the backend server is running on port 3000.");
    } finally {
      setLoading(false);
    }
  };

  const handleReplace = async (issue: BiasIssue) => {
    try {
      setStatus("Applying suggestion...");

      const currentBody = await getEmailBody();
      const newBody = currentBody.replace(
        new RegExp(`\\b${escapeRegExp(issue.phrase)}\\b`, "gi"),
        issue.replacement
      );

      await setEmailBodyContent(newBody);
      setEmailBody(newBody);

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

  const handleIgnore = (issue: BiasIssue) => {
    const updatedIssues = issues.filter((i) => i.phrase !== issue.phrase);
    setIssues(updatedIssues);

    if (updatedIssues.length === 0) {
      setStatus("All issues resolved or ignored.");
    } else {
      setStatus(`${updatedIssues.length} issue${updatedIssues.length !== 1 ? "s" : ""} remaining.`);
    }
  };

  const handleApplyAll = async () => {
    try {
      setStatus("Applying all suggestions...");

      let newBody = await getEmailBody();

      issues.forEach((issue) => {
        newBody = newBody.replace(
          new RegExp(`\\b${escapeRegExp(issue.phrase)}\\b`, "gi"),
          issue.replacement
        );
      });

      await setEmailBodyContent(newBody);
      setEmailBody(newBody);

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
            width="32"
            height="32"
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
          <button className="primary-btn" onClick={handleAnalyze} disabled={loading}>
            {loading ? "Analyzing..." : "Analyze Email"}
          </button>
          {loading && <div className="spinner"></div>}
        </div>

        {/* Status */}
        <div className="status-bar">
          <p>{status}</p>
        </div>

        {/* Results */}
        {issues.length === 0 && !loading && emailBody && (
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
          Make sure your backend server is running on <strong>localhost:3000</strong>
        </p>
      </footer>
    </div>
  );
};

export default App;
