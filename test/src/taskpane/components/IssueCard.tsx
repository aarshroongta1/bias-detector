import * as React from "react";
import type { BiasIssue } from "../type";

interface IssueCardProps {
  issue: BiasIssue;
  onReplace: () => void;
  onIgnore: () => void;
}

const IssueCard: React.FC<IssueCardProps> = ({ issue, onReplace, onIgnore }) => {
  return (
    <div className={`issue-card severity-${issue.severity}`}>
      <div className="issue-header">
        <span className={`severity-badge severity-${issue.severity}`}>
          {issue.severity}
        </span>
        <span className="category-badge">{issue.category}</span>
      </div>

      <div className="issue-content">
        <div className="phrase-highlight">
          <strong>Found:</strong> "{issue.phrase}"
        </div>
        <p className="explanation">{issue.explanation}</p>
        <div className="suggestion-box">
          <strong>Suggestion:</strong>
          <div className="suggestion-text">"{issue.replacement}"</div>
        </div>
      </div>

      <div className="issue-actions">
        <button className="action-btn primary" onClick={onReplace}>
          Apply Suggestion
        </button>
        <button className="action-btn secondary" onClick={onIgnore}>
          Ignore
        </button>
      </div>
    </div>
  );
};

export default IssueCard;