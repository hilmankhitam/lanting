import { AuditCategory, AuditQuestion, QuestionAnswer, PredikatKearsipan } from '../types';

export interface EvaluatedAnswersResult {
  evaluatedAnswers: Record<string, QuestionAnswer>;
  totalScore: number;
  maxScore: number;
  percentageScore: number;
  predikat: PredikatKearsipan;
  progressPercentage: number;
  answeredCount: number;
  activeCount: number;
  disabledCount: number;
  categoryScores: Record<string, {
    category: AuditCategory;
    score: number;
    maxScore: number;
    percentage: number;
    weightedScore: number;
  }>;
}

export function evaluateAuditLogic(
  questions: AuditQuestion[],
  categories: AuditCategory[],
  currentAnswers: Record<string, QuestionAnswer>,
  targetUnit: 'UP' | 'UK'
): EvaluatedAnswersResult {
  // Filter questions for the active unit
  const activeQuestions = questions.filter(
    (q) => q.targetUnit === targetUnit || q.targetUnit === 'BOTH'
  );

  const updatedAnswers: Record<string, QuestionAnswer> = {};

  // Initialize answer state for all active questions
  for (const q of activeQuestions) {
    const existing = currentAnswers[q.id];
    updatedAnswers[q.id] = {
      questionId: q.id,
      selectedOptionId: existing?.selectedOptionId || null,
      score: existing?.score || 0,
      level: existing?.level || 0,
      isDisabled: false,
      disabledReason: undefined,
      catatanAuditor: existing?.catatanAuditor || '',
      catatanObjekPengawasan: existing?.catatanObjekPengawasan || '',
      evidenceList: existing?.evidenceList || [],
    };
  }

  // 1. Evaluate logic rules from triggers to determine disabled status
  for (const q of activeQuestions) {
    const answer = updatedAnswers[q.id];
    if (answer && answer.selectedOptionId && !answer.isDisabled) {
      // Check logic rules of this question
      if (q.logicRules && q.logicRules.length > 0) {
        for (const rule of q.logicRules) {
          if (rule.triggerOptionIds.includes(answer.selectedOptionId)) {
            // Apply disable action to target questions
            for (const targetId of rule.targetQuestionIds) {
              if (updatedAnswers[targetId]) {
                updatedAnswers[targetId].isDisabled = true;
                updatedAnswers[targetId].disabledReason = rule.reasonMessage;
                // When disabled, the score is reset to 0 or N/A
                updatedAnswers[targetId].score = 0;
                updatedAnswers[targetId].level = 0;
              }
            }
          }
        }
      }
    }
  }

  // 2. Compute scores & active questions
  let totalScore = 0;
  let maxScore = 0;
  let answeredCount = 0;
  let activeCount = 0;
  let disabledCount = 0;

  // Group by category for weighted scoring
  const categoryScores: Record<string, {
    category: AuditCategory;
    score: number;
    maxScore: number;
    percentage: number;
    weightedScore: number;
  }> = {};

  const unitCategories = categories.filter(
    (c) => c.targetUnit === targetUnit || c.targetUnit === 'BOTH'
  );

  for (const cat of unitCategories) {
    categoryScores[cat.id] = {
      category: cat,
      score: 0,
      maxScore: 0,
      percentage: 0,
      weightedScore: 0,
    };
  }

  for (const q of activeQuestions) {
    const ans = updatedAnswers[q.id];
    const catScore = categoryScores[q.kategoriId];

    if (ans.isDisabled) {
      disabledCount++;
      // Disabled questions do not count towards the denominator if excluded,
      // or count as 0. In ANRI standard, questions with valid N/A adjust max score or count 0.
      continue;
    }

    activeCount++;
    maxScore += q.bobotMaksimal;
    if (catScore) {
      catScore.maxScore += q.bobotMaksimal;
    }

    if (ans.selectedOptionId) {
      answeredCount++;
      const selectedOpt = q.options.find((o) => o.id === ans.selectedOptionId);
      if (selectedOpt) {
        ans.score = selectedOpt.skor;
        ans.level = selectedOpt.level;
        totalScore += selectedOpt.skor;
        if (catScore) {
          catScore.score += selectedOpt.skor;
        }
      }
    }
  }

  // Calculate percentage and weighted scores per category
  let totalWeightedScore = 0;
  let totalCategoryWeights = 0;

  for (const catId in categoryScores) {
    const item = categoryScores[catId];
    if (item.maxScore > 0) {
      item.percentage = (item.score / item.maxScore) * 100;
    } else {
      item.percentage = 0;
    }
    // Weighted contribution
    const weight = item.category.bobotPersentase;
    item.weightedScore = (item.percentage * weight) / 100;
    totalWeightedScore += item.weightedScore;
    totalCategoryWeights += weight;
  }

  // Normalize final percentage
  const percentageScore = totalCategoryWeights > 0
    ? (totalWeightedScore / totalCategoryWeights) * 100
    : maxScore > 0
    ? (totalScore / maxScore) * 100
    : 0;

  // Determine Predikat ANRI
  let predikat: PredikatKearsipan = 'D';
  if (percentageScore >= 90) {
    predikat = 'AA';
  } else if (percentageScore >= 80) {
    predikat = 'A';
  } else if (percentageScore >= 70) {
    predikat = 'BB';
  } else if (percentageScore >= 60) {
    predikat = 'B';
  } else if (percentageScore >= 50) {
    predikat = 'CC';
  } else if (percentageScore >= 30) {
    predikat = 'C';
  } else {
    predikat = 'D';
  }

  const progressPercentage = activeCount > 0
    ? Math.round((answeredCount / activeCount) * 100)
    : 0;

  return {
    evaluatedAnswers: updatedAnswers,
    totalScore: Math.round(totalScore * 10) / 10,
    maxScore,
    percentageScore: Math.round(percentageScore * 10) / 10,
    predikat,
    progressPercentage,
    answeredCount,
    activeCount,
    disabledCount,
    categoryScores,
  };
}
