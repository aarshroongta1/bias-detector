import type { BiasIssue } from "./type";

const API_URL = "http://localhost:3000/analyze";

export async function analyzeBias(text: string): Promise<BiasIssue[]> {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.results?.biases || [];
}