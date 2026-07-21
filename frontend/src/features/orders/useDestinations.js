import { useEffect, useState } from 'react';
import { getDestinations } from '../../services/lookupService';

/**
 * src/features/orders/useDestinations.js
 *
 * Fetches the shared destination list (GET /api/public/destinations) once on
 * mount. Shared by OrderFilters (a filter dropdown) and OrderForm (a
 * required field) so neither hardcodes a second destinations list — per the
 * project rule, the ~21 destinations live only in the backend's
 * utils/constants.js.
 *
 * @returns {{ destinations: Array<{code:string,label:string,flag:string}>, isLoading: boolean }}
 */
export function useDestinations() {
  const [destinations, setDestinations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    getDestinations()
      .then((response) => {
        if (!cancelled) setDestinations(response.data || []);
      })
      .catch(() => {
        if (!cancelled) setDestinations([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { destinations, isLoading };
}

export default useDestinations;
