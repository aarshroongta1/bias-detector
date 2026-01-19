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
const port = 3000;

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
- There can be multiple types of biases in one phrase. Still, give only one replacement suggestion that addresses all.
- Carefully choose phrases: keep them short (3-4 words max) and split if long. Make sure only the biased part is included.
- Don't go overkill. Stick to actual biases.
- Be helpful, not preachy. Focus on genuine issues. 
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
  const text = req.body.text;
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
  res.json({ results: response.output_parsed });
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
