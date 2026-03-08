import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY!;
const genAI = new GoogleGenerativeAI(apiKey);

export const geminiModel = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });
export const embeddingModel = genAI.getGenerativeModel({ model: "text-embedding-004" });

export async function generateEmbedding(text: string) {
  const result = await embeddingModel.embedContent(text);
  const embedding = result.embedding;
  return embedding.values;
}

export async function generateChatResponse(prompt: string, context: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-001" });

  const finalPrompt = `
    You are a helpful study assistant for a student.
    Use the following pieces of context to answer the question at the end.
    If the context doesn't contain the answer, just say you don't know based on the notes.
    
    Context:
    ${context}
    
    Question: ${prompt}
    
    Answer:
  `;

  const result = await model.generateContent(finalPrompt);
  const response = await result.response;
  return response.text();
}
