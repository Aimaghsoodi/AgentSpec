/**
 * Topic-based enforcement and filtering
 */

import { createTopicViolation } from '../violation';
import type { Violation } from '../types';

export interface TopicConstraints {
  allowedTopics?: string[];
  deniedTopics?: string[];
  customKeywords?: { [topic: string]: string[] };
}

/**
 * Extract topics from text
 */
export function extractTopics(text: string): string[] {
  const lowerText = text.toLowerCase();
  const topics: string[] = [];

  // Common topic keywords
  const topicKeywords: { [topic: string]: string[] } = {
    politics: [
      'election',
      'vote',
      'political',
      'democrat',
      'republican',
      'government',
      'campaign',
    ],
    health: [
      'disease',
      'treatment',
      'medication',
      'hospital',
      'health',
      'medical',
      'doctor',
    ],
    finance: [
      'investment',
      'stock',
      'money',
      'bank',
      'financial',
      'crypto',
      'trading',
    ],
    adult: [
      'sex',
      'adult',
      'xxx',
      'nude',
      'explicit',
      'pornographic',
      'sexually',
    ],
    violence: [
      'kill',
      'murder',
      'attack',
      'violence',
      'war',
      'bomb',
      'weapon',
    ],
  };

  for (const [topic, keywords] of Object.entries(topicKeywords)) {
    for (const keyword of keywords) {
      const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
      if (regex.test(lowerText)) {
        topics.push(topic);
        break;
      }
    }
  }

  return [...new Set(topics)];
}

/**
 * Check if text violates topic constraints
 */
export function checkTopicConstraints(
  text: string,
  constraints: TopicConstraints
): Violation[] {
  const violations: Violation[] = [];
  const detectedTopics = extractTopics(text);

  // Check allowed topics
  if (constraints.allowedTopics && constraints.allowedTopics.length > 0) {
    const illegalTopics = detectedTopics.filter(
      (t) => !constraints.allowedTopics!.includes(t)
    );

    if (illegalTopics.length > 0) {
      violations.push(
        createTopicViolation(
          illegalTopics[0],
          constraints.allowedTopics
        )
      );
    }
  }

  // Check denied topics
  if (constraints.deniedTopics && constraints.deniedTopics.length > 0) {
    const violatingTopics = detectedTopics.filter((t) =>
      constraints.deniedTopics!.includes(t)
    );

    if (violatingTopics.length > 0) {
      violations.push(
        createTopicViolation(
          violatingTopics[0],
          constraints.deniedTopics
        )
      );
    }
  }

  // Check custom topic keywords
  if (constraints.customKeywords) {
    for (const [topic, keywords] of Object.entries(
      constraints.customKeywords
    )) {
      for (const keyword of keywords) {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (regex.test(text.toLowerCase())) {
          violations.push(
            createTopicViolation(topic, Object.keys(constraints.customKeywords))
          );
          break;
        }
      }
    }
  }

  return violations;
}

/**
 * Filter text to remove denied topics
 */
export function filterTopics(
  text: string,
  deniedTopics: string[]
): string {
  let filtered = text;

  // Simple filtering: remove sentences containing denied topics
  const topicKeywords: { [topic: string]: string[] } = {
    politics: [
      'election',
      'vote',
      'political',
      'democrat',
      'republican',
      'government',
      'campaign',
    ],
    health: [
      'disease',
      'treatment',
      'medication',
      'hospital',
      'health',
      'medical',
      'doctor',
    ],
    finance: [
      'investment',
      'stock',
      'money',
      'bank',
      'financial',
      'crypto',
      'trading',
    ],
    adult: [
      'sex',
      'adult',
      'xxx',
      'nude',
      'explicit',
      'pornographic',
      'sexually',
    ],
    violence: [
      'kill',
      'murder',
      'attack',
      'violence',
      'war',
      'bomb',
      'weapon',
    ],
  };

  for (const deniedTopic of deniedTopics) {
    const keywords = topicKeywords[deniedTopic] || [];

    const sentences = filtered.split(/[.!?]+/);
    const filtered_sentences = sentences.filter((sentence) => {
      const lowerSentence = sentence.toLowerCase();
      return !keywords.some((keyword) => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        return regex.test(lowerSentence);
      });
    });

    filtered = filtered_sentences.join('. ');
  }

  return filtered;
}

/**
 * Get topic keywords
 */
export function getTopicKeywords(topic: string): string[] {
  const topicKeywords: { [topic: string]: string[] } = {
    politics: [
      'election',
      'vote',
      'political',
      'democrat',
      'republican',
      'government',
      'campaign',
    ],
    health: [
      'disease',
      'treatment',
      'medication',
      'hospital',
      'health',
      'medical',
      'doctor',
    ],
    finance: [
      'investment',
      'stock',
      'money',
      'bank',
      'financial',
      'crypto',
      'trading',
    ],
    adult: [
      'sex',
      'adult',
      'xxx',
      'nude',
      'explicit',
      'pornographic',
      'sexually',
    ],
    violence: [
      'kill',
      'murder',
      'attack',
      'violence',
      'war',
      'bomb',
      'weapon',
    ],
  };

  return topicKeywords[topic] || [];
}
