import { useCallback, useEffect, useState } from 'react';
import { getStats } from '../../services/statsService';

const FALLBACK_ERROR = "We couldn't reach connectkro.pk. Please check your connection and try again.";

/**
 * src/features/dashboard/useStats.js
 *
 * Wraps GET /api/admin/stats for AdminDashboardPage: idle load ->
 * { totalOrders, activeLinesCount, expiringSoonCount, recentOrders }.
 */
export function useStats() {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const response = await getStats();
      setStats(response.data);
    } catch (err) {
      setError(err?.response?.data?.message || FALLBACK_ERROR);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return { stats, isLoading, error, refetch: fetchStats };
}

export default useStats;
