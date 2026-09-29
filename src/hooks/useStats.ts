import { useMemo } from 'react';
import { getStatsData, getTodayStats } from '../services/statsService';
import { StatsData } from '../types';

export default function useStats() {
  const statsData = useMemo<StatsData>(() => getStatsData(), []);
  const todayStats = useMemo(() => getTodayStats(), []);

  return {
    ...statsData,
    todayStats,
  };
}
