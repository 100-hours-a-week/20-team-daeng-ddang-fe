export type EmotionKey = "happy" | "relaxed" | "sad" | "angry";

export interface EmotionScores {
  happy: number;
  relaxed: number;
  sad: number;
  angry: number;
}

export type PredictEmotion = "HAPPY" | "RELAXED" | "SAD" | "ANGRY";

export interface ExpressionAnalysis {
  expressionId: number;
  predictEmotion: PredictEmotion;
  emotionScores: EmotionScores;
  summary: string;
  imageUrl: string;
  createdAt: string;
  dogId: number;
  walkId: number;
}
