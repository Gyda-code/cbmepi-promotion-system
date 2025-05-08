
import { RankType } from "@/types/military";

// Map to establish rank order for promotions
export const rankOrder: Record<RankType, number> = {
  'SOLDADO': 1,
  'CABO': 2,
  'SARGENTO': 3,
  '3º SARGENTO': 4,
  '2º SARGENTO': 5,
  '1º SARGENTO': 6,
  'SUBTENENTE': 7,
  'ASPIRANTE': 8,
  '2º TENENTE': 9,
  '1º TENENTE': 10,
  'CAPITÃO': 11,
  'MAJOR': 12,
  'TENENTE-CORONEL': 13,
  'CORONEL': 14
};

// Function to determine next rank for promotion
export const getNextRank = (currentRank: RankType): RankType | null => {
  const currentRankLevel = rankOrder[currentRank];
  
  for (const [rank, level] of Object.entries(rankOrder) as [RankType, number][]) {
    if (level === currentRankLevel + 1) {
      return rank;
    }
  }
  
  return null; // No next rank found (already at highest rank)
};

// Function to check if target rank is higher than current rank
export const isHigherRank = (currentRank: RankType, targetRank: RankType): boolean => {
  return rankOrder[targetRank] > rankOrder[currentRank];
};

// Get available ranks for promotion from current rank
export const getAvailableRanksForPromotion = (currentRank: RankType): RankType[] => {
  const currentRankLevel = rankOrder[currentRank];
  
  return Object.entries(rankOrder)
    .filter(([_, level]) => level > currentRankLevel)
    .map(([rank]) => rank as RankType);
};
