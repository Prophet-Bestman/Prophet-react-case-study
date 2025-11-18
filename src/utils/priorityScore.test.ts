import { calculatePriorityScore } from './priorityScore';
import { Issue } from '../types';
import dayjs from 'dayjs';

describe('calculatePriorityScore', () => {
  const createMockIssue = (overrides: Partial<Issue>): Issue => ({
    id: '1',
    title: 'Test Issue',
    status: 'Backlog',
    priority: 'medium',
    severity: 2,
    createdAt: dayjs().format('YYYY-MM-DD'),
    assignee: 'alice',
    tags: [],
    userDefinedRank: 0,
    ...overrides,
  });

  describe('formula calculation', () => {
    it('should calculate score with formula: severity * 10 + (daysSinceCreated * -1) + userDefinedRank', () => {
      const threeDaysAgo = dayjs().subtract(3, 'day').format('YYYY-MM-DD');
      const issue = createMockIssue({
        severity: 2,
        createdAt: threeDaysAgo,
        userDefinedRank: 5,
      });

      const score = calculatePriorityScore(issue);

      // Expected: 2*10 + (3*-1) + 5 = 20 - 3 + 5 = 22
      expect(score).toBe(22);
    });

    it('should calculate score for issue created today', () => {
      const today = dayjs().format('YYYY-MM-DD');
      const issue = createMockIssue({
        severity: 3,
        createdAt: today,
        userDefinedRank: 0,
      });

      const score = calculatePriorityScore(issue);

      // Expected: 3*10 + (0*-1) + 0 = 30
      expect(score).toBe(30);
    });

    it('should handle negative user ranks', () => {
      const issue = createMockIssue({
        severity: 2,
        createdAt: dayjs().format('YYYY-MM-DD'),
        userDefinedRank: -10,
      });

      const score = calculatePriorityScore(issue);

      // Expected: 2*10 + 0 + (-10) = 10
      expect(score).toBe(10);
    });

    it('should handle positive user ranks', () => {
      const issue = createMockIssue({
        severity: 1,
        createdAt: dayjs().format('YYYY-MM-DD'),
        userDefinedRank: 15,
      });

      const score = calculatePriorityScore(issue);

      // Expected: 1*10 + 0 + 15 = 25
      expect(score).toBe(25);
    });
  });

  describe('severity impact', () => {
    it('should give high severity (3) a score of 30 points', () => {
      const issue = createMockIssue({
        severity: 3,
        createdAt: dayjs().format('YYYY-MM-DD'),
        userDefinedRank: 0,
      });

      const score = calculatePriorityScore(issue);

      expect(score).toBe(30);
    });

    it('should give medium severity (2) a score of 20 points', () => {
      const issue = createMockIssue({
        severity: 2,
        createdAt: dayjs().format('YYYY-MM-DD'),
        userDefinedRank: 0,
      });

      const score = calculatePriorityScore(issue);

      expect(score).toBe(20);
    });

    it('should give low severity (1) a score of 10 points', () => {
      const issue = createMockIssue({
        severity: 1,
        createdAt: dayjs().format('YYYY-MM-DD'),
        userDefinedRank: 0,
      });

      const score = calculatePriorityScore(issue);

      expect(score).toBe(10);
    });

    it('should prioritize high severity over low severity', () => {
      const lowSeverity = createMockIssue({ severity: 1, userDefinedRank: 0 });
      const highSeverity = createMockIssue({ severity: 3, userDefinedRank: 0 });

      const scoreLow = calculatePriorityScore(lowSeverity);
      const scoreHigh = calculatePriorityScore(highSeverity);

      expect(scoreHigh).toBeGreaterThan(scoreLow);
      expect(scoreHigh - scoreLow).toBe(20); // (3-1) * 10
    });
  });

  describe('age impact', () => {
    it('should decrease score for older issues', () => {
      const today = dayjs().format('YYYY-MM-DD');
      const tenDaysAgo = dayjs().subtract(10, 'day').format('YYYY-MM-DD');

      const newIssue = createMockIssue({
        severity: 2,
        createdAt: today,
        userDefinedRank: 0,
      });

      const oldIssue = createMockIssue({
        severity: 2,
        createdAt: tenDaysAgo,
        userDefinedRank: 0,
      });

      const scoreNew = calculatePriorityScore(newIssue);
      const scoreOld = calculatePriorityScore(oldIssue);

      expect(scoreNew).toBeGreaterThan(scoreOld);
      expect(scoreNew - scoreOld).toBe(10); // 10 days difference
    });

    it('should handle very old issues', () => {
      const hundredDaysAgo = dayjs().subtract(100, 'day').format('YYYY-MM-DD');
      const issue = createMockIssue({
        severity: 3,
        createdAt: hundredDaysAgo,
        userDefinedRank: 0,
      });

      const score = calculatePriorityScore(issue);

      // Expected: 3*10 + (100*-1) + 0 = 30 - 100 = -70
      expect(score).toBe(-70);
    });
  });

  describe('user-defined rank impact', () => {
    it('should prioritize issues with higher user-defined rank', () => {
      const lowRank = createMockIssue({
        severity: 2,
        userDefinedRank: 1,
      });

      const highRank = createMockIssue({
        severity: 2,
        userDefinedRank: 10,
      });

      const scoreLow = calculatePriorityScore(lowRank);
      const scoreHigh = calculatePriorityScore(highRank);

      expect(scoreHigh).toBeGreaterThan(scoreLow);
      expect(scoreHigh - scoreLow).toBe(9); // 10 - 1
    });

    it('should allow rank to override severity', () => {
      const lowSeverityHighRank = createMockIssue({
        severity: 1,
        createdAt: dayjs().format('YYYY-MM-DD'),
        userDefinedRank: 25,
      });

      const highSeverityLowRank = createMockIssue({
        severity: 3,
        createdAt: dayjs().format('YYYY-MM-DD'),
        userDefinedRank: 0,
      });

      const scoreLow = calculatePriorityScore(lowSeverityHighRank);
      const scoreHigh = calculatePriorityScore(highSeverityLowRank);

      // Low: 1*10 + 0 + 25 = 35
      // High: 3*10 + 0 + 0 = 30
      expect(scoreLow).toBeGreaterThan(scoreHigh);
      expect(scoreLow).toBe(35);
      expect(scoreHigh).toBe(30);
    });
  });

  describe('combined factors', () => {
    it('should correctly calculate score with all factors', () => {
      const fiveDaysAgo = dayjs().subtract(5, 'day').format('YYYY-MM-DD');
      const issue = createMockIssue({
        severity: 3,
        createdAt: fiveDaysAgo,
        userDefinedRank: 8,
      });

      const score = calculatePriorityScore(issue);

      // Expected: 3*10 + (5*-1) + 8 = 30 - 5 + 8 = 33
      expect(score).toBe(33);
    });

    it('should handle edge case with negative total score', () => {
      const veryOldIssue = dayjs().subtract(50, 'day').format('YYYY-MM-DD');
      const issue = createMockIssue({
        severity: 1,
        createdAt: veryOldIssue,
        userDefinedRank: -5,
      });

      const score = calculatePriorityScore(issue);

      // Expected: 1*10 + (50*-1) + (-5) = 10 - 50 - 5 = -45
      expect(score).toBe(-45);
    });
  });

  describe('return type', () => {
    it('should always return a number', () => {
      const issue = createMockIssue({});
      const score = calculatePriorityScore(issue);

      expect(typeof score).toBe('number');
    });

    it('should return an integer', () => {
      const issue = createMockIssue({
        severity: 2,
        createdAt: dayjs().subtract(3, 'day').format('YYYY-MM-DD'),
        userDefinedRank: 5,
      });

      const score = calculatePriorityScore(issue);

      expect(Number.isInteger(score)).toBe(true);
    });
  });
});
