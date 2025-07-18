
import { useEffect, useState } from "react";
import { sendMessageToGemini } from "@/services/GeminiService";

/**
 * Fetches a small description and one "famous for" thing about a city/place from Gemini.
 * Returns { description, famousFor, loading }
 */
export function usePlaceDescription(placeName: string) {
  const [description, setDescription] = useState("");
  const [famousFor, setFamousFor] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!placeName) return;
    setLoading(true);
    const prompt = `
Give me a 1-2 sentence, travel-friendly English summary describing what is special about "${placeName}" for a tourist (include cultural facts, vibe, style, or nature).
Then in a separate line, reply: "Famous for: ..." (one very famous thing, landmark, cultural place, food, or traditional style/garment).
Keep the information clear for travelers and DON'T mention that you are an AI.
`;
    sendMessageToGemini([{ role: "user", content: prompt }])
      .then((geminiText) => {
        // Try to extract description and "Famous for:" part
        let desc = geminiText;
        let famous = null;
        if (geminiText.includes("Famous for:")) {
          const [firstPart, secondPart] = geminiText.split(/Famous for:/i);
          desc = firstPart.trim();
          famous = secondPart.replace(/^[\s-:]*/, "").replace(/^\n+/g, "").trim();
        }
        setDescription(desc);
        setFamousFor(famous);
      })
      .catch(() => {
        setDescription("");
        setFamousFor(null);
      })
      .finally(() => setLoading(false));
  }, [placeName]);

  return { description, famousFor, loading };
}
