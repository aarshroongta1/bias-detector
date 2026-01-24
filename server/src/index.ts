import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import { z } from "zod";

dotenv.config();

const client = new OpenAI({
  apiKey: process.env["OPENAI_API_KEY"],
});

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const PROMPT = `You are an expert at detecting implicit bias in written text. Analyze for:
- Gendered language (e.g., "chairman", assuming gender)
- Racial/ethnic assumptions or coded language
- Age-related bias or stereotypes
- Ability-related assumptions
- Socioeconomic assumptions
- Cultural assumptions
- Other forms of implicit bias

For each biased phrase, return:
- phrase: the exact biased phrase
- category: type of bias
- explanation: brief explanation of why it's problematic - concise and relevant
- replacement: a more inclusive alternative that can replace the biased phrase exactly without changing context
- severity: how bad the bias is classified as "low", "medium", or "high"

NOTE:
- Report each biased word or short phrase separately, even if they appear near each other.
- Give only one replacement suggestion per biased phrase that addresses the bias.
- Carefully choose phrases: keep them short (1-4 words ideally) and maybe split if long. Make sure only the biased part is included.
- Don't go overkill. Stick to actual biases.
- Be helpful, not preachy. Focus on genuine issues. 

PLEASE MAKE THE EXACT REPLACEMENTS YOURSELF AND MAKE SURE THE SENTENCE AS A WHOLE IS STILL GRAMMATICALLY CORRECT AND MAKES SENSE.
`;

const Bias = z.object({
  phrase: z.string(),
  category: z.string(),
  explanation: z.string(),
  replacement: z.string(),
  severity: z.enum(["low", "medium", "high"]),
});

const Response = z.object({
  biases: z.array(Bias),
});

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.post("/analyze", async (req, res) => {
  const text: string = req.body.text;
  const response = await client.responses.parse({
    model: "gpt-5-mini",
    input: [
      {
        role: "system",
        content: PROMPT,
      },
      { role: "user", content: "Analyze this text for bias: " + text },
    ],
    text: {
      format: zodTextFormat(Response, "response"),
    },
  });

  // Add position information for each bias
  const biasesWithPositions = (response.output_parsed?.biases || []).map(
    (bias) => {
      const positions: { start: number; end: number }[] = [];
      const escaped = bias.phrase.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const phraseRegex = new RegExp(`\\b${escaped}\\b`, "gi");
      let match;
      while ((match = phraseRegex.exec(text)) !== null) {
        positions.push({
          start: match.index,
          end: match.index + match[0].length,
        });
      }
      return { ...bias, positions };
    },
  );

  res.json({ results: { biases: biasesWithPositions } });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
