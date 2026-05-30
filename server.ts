/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Smart Gen-Z Vibe Recommendations via Gemini 3.5-Flash
  app.post("/api/gemini/vibe-advice", async (req, res) => {
    try {
      const { prompt, city, spots } = req.body;
      const apiKey = process.env.GEMINI_API_KEY;

      // Handle missing API Key gracefully - lazy initialization prevents any startup crashes!
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        return res.json({
          text: `### ⚠️ **No API Key Found (FR FR)**\n\nTo unlock the full power of our **Vibe Translator**, please add your \`GEMINI_API_KEY\` inside the **Settings > Secrets** panel in the top-right corner. \n\nNo stress though! Our fully interactive **Neo-Brutalist Spot Directory**, **Creator Guides**, and **Interactive Map Pin drop** are 100% active and offline-cached to slay. ☕️💅`,
          isFallback: true
        });
      }

      const ai = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });

      // Filter and compile the local context to ground our recommendations beautifully
      const formattedSpots = Array.isArray(spots) ? spots : [];
      const localizedSpots = city 
        ? formattedSpots.filter((s: any) => s.city.toLowerCase() === city.toLowerCase())
        : formattedSpots;

      const spotsContextString = localizedSpots
        .map((s: any) => `- **${s.name}** (${s.category}) in ${s.neighborhood}, ${s.city}. Vibes: ${s.vibes.join(", ")}. Price Tier: ${s.priceRange}. Why go: "${s.whyGo}". Recommendation: "${s.description}". Best Time: "${s.bestTime}". What to order: "${s.whatToOrder}". Rating: ${s.stats?.rating}/10`)
        .join("\n\n");

      const systemInstruction = 
        "You are the ultimate, hyper-helpful 'Gen Z Spot Matcher' advisor. Your voice is aesthetic, warm, witty, and fluent in modern Gen-Z slang (no cap, fr fr, slay, vibe check, main character energy, ate and left no crumbs, understood the assignment, gatekeeping is over, era, real ones).\n\n" +
        "Output a beautifully structured response with playful, funny headers. Do not use boring bullet points everywhere - make it styled like a personal DM from a trendy bestie.\n" +
        "Include a 'Vibe Check Rating' and details on what to order, why it passes the check, and the best aesthetic hour to arrive. Use custom emojis extensively.";

      const promptMessage = 
        `The user is asking: "${prompt}".\n` +
        `Current selected city context: "${city || "Any"}"\n\n` +
        `Here is our current curated list of trendy places in this city context:\n\n${spotsContextString || "No matching spots loaded in database yet."}\n\n` +
        `Suggest the absolute best match(es) from our curated list. If we have a good match, review it with glowing excitement. If none of our curated spots perfectly fit their specific request, suggest a "Manifested Vibe Spot" (a custom, creative imaginary spot modeled after real high-vibe layouts) indicating that you are manifesting this exact vibe for them, and then suggest their nearest best category fit. Always structure nicely in Markdown. No code blocks in output.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: promptMessage,
        config: {
          systemInstruction: systemInstruction,
          temperature: 0.85,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini API Routing Fail:", error);
      res.status(500).json({ error: error.message || "Internal server crash... majorly mid fr." });
    }
  });

  // Handle Static files vs Development Vite Serving
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[VibeCheck Server] Lit on http://0.0.0.0:${PORT} - no cap!`);
  });
}

startServer();
