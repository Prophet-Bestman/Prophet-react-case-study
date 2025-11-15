import dayjs from 'dayjs';
import { Issue } from '../types';
import { calculatePriorityScore } from './priorityScore';

/**
 * Sort issues by priority score (descending)
 * If scores match, newer issues appear first (stable sort)
 *
 * @param issues - Array of issues to sort
 * @returns Sorted array (does not mutate original)
 */
export const sortIssuesByPriority = (issues: Issue[]): Issue[] => {
  return [...issues].sort((a, b) => {
    const scoreA = calculatePriorityScore(a);
    const scoreB = calculatePriorityScore(b);

    // Higher score comes first
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }

    // If scores are equal, newer issues come first
    const dateA = dayjs(a.createdAt);
    const dateB = dayjs(b.createdAt);

    return dateB.diff(dateA);
  });
};
