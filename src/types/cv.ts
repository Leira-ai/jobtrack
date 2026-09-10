export type CvCheckCategory =
  | "match"
  | "content"
  | "structure"
  | "impact"
  | "readability";

export interface CvAnalysisInput {
  readonly cvText: string;
  readonly jobDescriptionText: string;
}

export interface CvCheckResult {
  readonly id: string;
  readonly category: CvCheckCategory;
  readonly label: string;
  readonly weight: number;
  readonly earned: number;
  readonly passed: boolean;
  readonly feedback: string;
}

export interface CvAnalysisResult {
  readonly score: number;
  readonly checks: readonly CvCheckResult[];
  readonly matchedKeywords: readonly string[];
  readonly missingKeywords: readonly string[];
  readonly strengths: readonly string[];
  readonly suggestions: readonly string[];
  readonly excludedSensitiveTraits: readonly string[];
  /** Kept as a compatibility alias for existing consumers. */
  readonly excludedSignals: readonly string[];
  readonly disclaimer: string;
}

export interface CvRule {
  readonly id: string;
  readonly category: CvCheckCategory;
  readonly label: string;
  readonly weight: number;
}
