import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function generateDocument(docType: string, formData: any) {
  const prompt = `
You are an expert Nigerian legal and business consultant. Write documents in a formal, high-level Nigerian English style suitable for the Corporate Affairs Commission (CAC) and Nigerian banks.

DOCUMENT TYPE TO GENERATE: ${docType}

CLIENT DETAILS:
- Name/Organization: ${formData.name}
- Business Type: ${formData.businessType}
- Purpose/Objective: ${formData.purpose}
- State/Location: ${formData.state}
- Budget/Capital: ${formData.budget}

INSTRUCTIONS:
1. Generate a complete, professional, and formal document based on the type requested.
2. If it is a Business Plan (e.g., for BoI/GEEP grants), include standard sections: Executive Summary, Market Analysis, Operational Plan, and Financial Projections (incorporating the budget).
3. If it is a Tenancy Agreement, include standard Nigerian tenancy clauses (e.g., Lagos/Abuja tenancy laws, covenants, rent, term).
4. If it is an NGO Constitution, structure it according to CAC Part F requirements (Name, Aims & Objectives, Trustees, Meetings, etc.).
5. Use professional formatting (Markdown headers, bullet points, bold text).
6. Do NOT include markdown code blocks (like \`\`\`markdown), just return the raw markdown text.
7. Ensure the tone is highly formal, authoritative, and legally sound for the Nigerian context.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    return response.text || "No document generated.";
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
}
