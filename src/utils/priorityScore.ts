import dayjs from 'dayjs';
import { Issue } from '../types';

/**
 * Calculate priority score for an issue
 * Formula: score = severity * 10 + (daysSinceCreated * -1) + userDefinedRank
 *
 * Higher severity issues get higher scores
 * Older issues get lower scores (encouraging recent work)
 * User-defined rank provides manual priority adjustment
 */
export const calculatePriorityScore = (issue: Issue): number => {
  const now = dayjs();
  const createdAt = dayjs(issue.createdAt);
  const daysSinceCreated = now.diff(createdAt, 'day');

  const score =
    issue.severity * 10 +
    (daysSinceCreated * -1) +
    issue.userDefinedRank;

  return score;
};
