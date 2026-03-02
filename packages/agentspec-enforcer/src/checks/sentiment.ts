/**
 * Sentiment analysis and enforcement
 */

import { createSentimentViolation } from '../violation';
import type { Violation } from '../types';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface SentimentAnalysis {
  sentiment: SentimentType;
  score: number; // -1 to 1
  confidence: number; // 0 to 1
}

export interface SentimentConstraints {
  minScore?: number;
  maxScore?: number;
  allowedSentiments?: SentimentType[];
  minConfidence?: number;
}

/**
 * Simple sentiment detection using keyword analysis
 */
export function analyzeSentiment(text: string): SentimentAnalysis {
  const lowerText = text.toLowerCase();

  // Positive keywords
  const positiveKeywords = [
    'good',
    'great',
    'excellent',
    'amazing',
    'wonderful',
    'fantastic',
    'love',
    'happy',
    'joy',
    'awesome',
    'brilliant',
  ];

  // Negative keywords
  const negativeKeywords = [
    'bad',
    'terrible',
    'horrible',
    'awful',
    'hate',
    'sad',
    'angry',
    'poor',
    'worst',
    'failure',
    'disaster',
  ];

  let positiveScore = 0;
  let negativeScore = 0;

  for (const word of positiveKeywords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    positiveScore += (lowerText.match(regex) || []).length;
  }

  for (const word of negativeKeywords) {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    negativeScore += (lowerText.match(regex) || []).length;
  }

  const total = positiveScore + negativeScore;
  let sentiment: SentimentType = 'neutral';
  let score = 0;

  if (total > 0) {
    score = (positiveScore - negativeScore) / total;
    if (score > 0.1) sentiment = 'positive';
    else if (score < -0.1) sentiment = 'negative';
  }

  const confidence = total > 0 ? Math.min(1, total / 10) : 0.5;

  return { sentiment, score, confidence };
}

/**
 * Check if text meets sentiment constraints
 */
export function checkSentimentConstraints(
  text: string,
  constraints: SentimentConstraints
): Violation[] {
  const violations: Violation[] = [];
  const analysis = analyzeSentiment(text);

  // Check score constraints
  if (
    constraints.minScore !== undefined &&
    analysis.score < constraints.minScore
  ) {
    violations.push(
      createSentimentViolation(
        analysis.sentiment,
        constraints.minScore
      )
    );
  }

  if (
    constraints.maxScore !== undefined &&
    analysis.score > constraints.maxScore
  ) {
    violations.push(
      createSentimentViolation(
        analysis.sentiment,
        constraints.maxScore
      )
    );
  }

  // Check allowed sentiments
  if (
    constraints.allowedSentiments &&
    !constraints.allowedSentiments.includes(analysis.sentiment)
  ) {
    violations.push(
      createSentimentViolation(
        analysis.sentiment,
        constraints.allowedSentiments.length
      )
    );
  }

  // Check confidence
  if (
    constraints.minConfidence !== undefined &&
    analysis.confidence < constraints.minConfidence
  ) {
    violations.push(
      createSentimentViolation(
        'neutral',
        constraints.minConfidence
      )
    );
  }

  return violations;
}

/**
 * Soften negative sentiment in text
 */
export function softenNegativeSentiment(text: string): string {
  let result = text;

  const softeners: [RegExp, string][] = [
    [/\bhate\b/gi, 'dislike'],
    [/\bterrible\b/gi, 'suboptimal'],
    [/\bhorrible\b/gi, 'unfortunate'],
    [/\bawful\b/gi, 'undesirable'],
    [/\bworst\b/gi, 'least preferred'],
  ];

  for (const [pattern, replacement] of softeners) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

/**
 * Strengthen positive sentiment in text
 */
export function strengthenPositiveSentiment(text: string): string {
  let result = text;

  const intensifiers: [RegExp, string][] = [
    [/\bgood\b/gi, 'excellent'],
    [/\bgreat\b/gi, 'outstanding'],
    [/\bnice\b/gi, 'wonderful'],
    [/\blike\b/gi, 'love'],
  ];

  for (const [pattern, replacement] of intensifiers) {
    result = result.replace(pattern, replacement);
  }

  return result;
}
