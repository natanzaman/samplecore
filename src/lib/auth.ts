// Simple auth utilities for MVP
// In production, replace with NextAuth or similar

export const MOCK_USER_ID = "coordinator-1";
export const MOCK_USER_NAME = "Sample Coordinator";

/**
 * Get current user (mocked for MVP)
 * In production, this would check session/cookies
 */
export function getCurrentUser() {
  return {
    id: MOCK_USER_ID,
    name: MOCK_USER_NAME,
    role: "sample_coordinator" as const,
  };
}


