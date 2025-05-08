
import { RankType } from "@/types/military";

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

// Helper function to get next rank in promotion sequence
export const getNextRank = (currentRank: RankType): RankType => {
  const currentRankOrder = rankOrder[currentRank];
  
  for (const [rank, order] of Object.entries(rankOrder) as [RankType, number][]) {
    if (order > currentRankOrder) {
      return rank as RankType;
    }
  }
  
  return currentRank; // If already at highest rank
};

// Helper function to check if a promotion is valid (rank order check)
export const isValidPromotion = (previousRank: RankType, newRank: RankType): boolean => {
  return rankOrder[newRank] > rankOrder[previousRank];
};
