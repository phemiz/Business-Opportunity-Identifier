import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function analyzeMarket(businessModel: string, location: string, budgetLevel: string) {
  const prompt = `
You are a Full-Stack AI Application Engine specializing in Geospatial Business Intelligence. Your goal is to evaluate business opportunities using real-time Google Maps data.

BUSINESS TYPE: ${businessModel}
TARGET LOCATION: ${location}
BUDGET LEVEL: ${budgetLevel}

CORE FUNCTIONALITY TO EXECUTE:
1. Live Grounding: Use Google Maps to find the current "Local Pack" of competitors in the target city.
2. Scoring Engine: Calculate a "Viability Score" from 1 to 10.
   - High Score: Low competitor density + High review ratings for the area + Budget alignment.
   - Low Score: Saturated market + poor transit/access.
3. Anchor Identification: Highlight "High Traffic Anchors" (e.g., transit hubs, malls) that justify the location's potential.
4. Budget Alignment:
   - If Budget = Low: Suggest areas with lower rent but high foot traffic.
   - If Budget = High: Suggest premium "Main Street" locations and focus on high-end USPs.

OUTPUT FORMAT:
You MUST return a structured report in Markdown exactly following these sections:

### Viability Score: [Insert Score]/10
*(Provide a brief 1-2 sentence explanation of why this score was given)*

### Competitor Audit
| Name | Rating | Price Tier | Distance/Location |
|---|---|---|---|
*(Fill table with real data from Google Maps)*

### High Traffic Anchors
*(List the identified anchors that drive relevant traffic)*

### Sentiment Analysis
*(Provide a summary count for each category: Positive, Negative, Neutral)*
- **Positive:** [Count]
- **Negative:** [Count]
- **Neutral:** [Count]
*(What customers are saying is missing in this area based on reviews)*

### Budget Alignment Strategy (${budgetLevel} Budget)
*(Specific location and strategy advice based on the selected budget)*

### Monetization Advice
*(Brief note on how to integrate Stripe/AdSense or other specific monetization/revenue streams for this specific niche)*
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        temperature: 0.2,
      },
    });

    const text = response.text || "No analysis generated.";
    
    // Extract Maps URLs from grounding chunks
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const mapLinks: { title: string; uri: string }[] = [];
    
    for (const chunk of groundingChunks) {
      if (chunk.maps?.uri && chunk.maps?.title) {
        mapLinks.push({
          title: chunk.maps.title,
          uri: chunk.maps.uri
        });
      }
    }

    // Deduplicate links
    const uniqueMapLinks = Array.from(new Map(mapLinks.map(item => [item.uri, item])).values());

    return { text, mapLinks: uniqueMapLinks };
  } catch (error) {
    console.error("Error analyzing market:", error);
    throw error;
  }
}
