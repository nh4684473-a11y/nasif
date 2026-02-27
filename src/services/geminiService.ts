import { GoogleGenAI, Type } from "@google/genai";
import { ProjectState } from "../types";

export async function getSmartSuggestions(state: ProjectState) {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `As a professional music producer, analyze this project state and suggest a musical improvement or a new melody idea.
    
    Current State:
    - Tempo: ${state.tempo} BPM
    - Key: ${state.key} ${state.scale}
    - Note Count: ${state.notes.length}
    
    Provide a concise, inspiring suggestion for the next part of the composition.`,
    config: {
      temperature: 0.7,
      maxOutputTokens: 200,
    },
  });

  return response.text;
}

export async function generateMelody(state: ProjectState, type: 'Arpeggiate' | 'Lead' | 'Motif') {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
  const humanizeInfo = state.humanization 
    ? `Apply humanization: timing jitter ${state.humanization.timingJitter}%, velocity randomness ${state.humanization.velocityRandom}%, and duration variance ${state.humanization.durationVariance}%.`
    : "";

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Generate a MIDI sequence for a ${type} melody in the key of ${state.key} ${state.scale} at ${state.tempo} BPM.
    ${humanizeInfo}
    Return the result as a JSON array of notes with properties: pitch (MIDI number), start (ticks), duration (ticks), velocity (0-127).
    Assume 480 ticks per quarter note. Generate 1 bar.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            pitch: { type: Type.NUMBER },
            start: { type: Type.NUMBER },
            duration: { type: Type.NUMBER },
            velocity: { type: Type.NUMBER },
          },
          required: ["pitch", "start", "duration", "velocity"]
        }
      }
    },
  });

  try {
    return JSON.parse(response.text || "[]");
  } catch (e) {
    console.error("Failed to parse melody", e);
    return [];
  }
}
