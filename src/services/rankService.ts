
import { RankType } from "@/types/military";

/**
 * Helper for rank ordering
 * Used for comparing ranks in the promotion logic
 */
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

/**
 * Get the next rank in the progression
 * @param currentRank The current rank
 * @param divisionType The type of division (QOEM, QOE, QPBM)
 * @returns The next rank in the progression or null if at top rank
 */
export function getNextRank(currentRank: RankType, divisionType: string): RankType | null {
  if (divisionType === 'QOEM') {
    switch (currentRank) {
      case '2º TENENTE': return '1º TENENTE';
      case '1º TENENTE': return 'CAPITÃO';
      case 'CAPITÃO': return 'MAJOR';
      case 'MAJOR': return 'TENENTE-CORONEL';
      case 'TENENTE-CORONEL': return 'CORONEL';
      case 'CORONEL': return null; // Top rank
      default: return null;
    }
  } else if (divisionType === 'QOE') {
    switch (currentRank) {
      case '2º TENENTE': return '1º TENENTE';
      case '1º TENENTE': return 'CAPITÃO';
      case 'CAPITÃO': return null; // Top rank for QOE
      default: return null;
    }
  } else if (divisionType === 'QPBM') {
    switch (currentRank) {
      case 'SOLDADO': return 'CABO';
      case 'CABO': return '3º SARGENTO';
      case 'SARGENTO': return '3º SARGENTO';
      case '3º SARGENTO': return '2º SARGENTO';
      case '2º SARGENTO': return '1º SARGENTO';
      case '1º SARGENTO': return 'SUBTENENTE';
      case 'SUBTENENTE': return null; // Top rank for QPBM
      default: return null;
    }
  }
  
  return null;
}

/**
 * Check if a rank is eligible for promotion by merit
 * According to promotion laws, not all ranks can be promoted by merit
 */
export function isEligibleForMeritPromotion(rank: RankType, divisionType: string): boolean {
  // Based on Law 5.461 Art. 9
  if (divisionType === 'QOEM') {
    // Officers can be promoted by merit from Captain and higher
    return ['CAPITÃO', 'MAJOR', 'TENENTE-CORONEL'].includes(rank);
  } else if (divisionType === 'QOE') {
    // Specialist officers - only 1º TENENTE can be promoted by merit
    return rank === '1º TENENTE';
  } else if (divisionType === 'QPBM') {
    // In QPBM, only Sergeants can be promoted by merit
    return ['3º SARGENTO', '2º SARGENTO', '1º SARGENTO'].includes(rank);
  }
  
  return false;
}
