export type EmotionKey = "happy" | "relaxed" | "sad" | "angry";

export interface EmotionScores {
  happy: number;
  relaxed: number;
  sad: number;
  angry: number;
}

export type PredictEmotion = "HAPPY" | "RELAXED" | "SAD" | "ANGRY";

export interface ExpressionAnalysis {
  expressionId: string;
  predictEmotion: string; // Changed to string to be safe, or keep PredictEmotion if mapped
  emotionScores: EmotionScores;
  summary: string;
  imageUrl?: string;
  videoUrl?: string;
  createdAt?: string;
  dogId?: number;
  walkId?: number;
}
