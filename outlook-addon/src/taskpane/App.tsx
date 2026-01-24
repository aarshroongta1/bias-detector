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

  // Get plain text for analysis (API needs clean text)
  const getEmailBodyText = (): Promise<string> => {
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

  // Get HTML for replacement (preserves formatting)
  const getEmailBodyHtml = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.item.body.getAsync(Office.CoercionType.Html, (result) => {
        if (result.status === Office.AsyncResultStatus.Succeeded) {
          resolve(result.value);
        } else {
          reject(result.error);
        }
      });
    });
  };

  // Set HTML body (preserves formatting)
  const setEmailBodyHtml = (html: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      Office.context.mailbox.item.body.setAsync(
        html,
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

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setStatus("Analyzing email...");

      const body = await getEmailBodyText();

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

      const currentHtml = await getEmailBodyHtml();
      const newHtml = currentHtml.replace(
        new RegExp(`\\b${escapeRegExp(issue.phrase)}\\b`, "gi"),
        issue.replacement
      );

      await setEmailBodyHtml(newHtml);
      setEmailBody(newHtml);

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

      let newHtml = await getEmailBodyHtml();

      issues.forEach((issue) => {
        newHtml = newHtml.replace(
          new RegExp(`\\b${escapeRegExp(issue.phrase)}\\b`, "gi"),
          issue.replacement
        );
      });

      await setEmailBodyHtml(newHtml);
      setEmailBody(newHtml);

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
        <h1 className="title">Detect and fix implicit bias in your emails</h1>
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

      {/* Status Bar at Bottom */}
      <footer className="status-bar">
        <p>{status}</p>
      </footer>
    </div>
  );
};

export default App;
