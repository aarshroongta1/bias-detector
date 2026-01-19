export interface BiasIssue {
  phrase: string;
  category: string;
  explanation: string;
  replacement: string;
  severity: "low" | "medium" | "high";
}