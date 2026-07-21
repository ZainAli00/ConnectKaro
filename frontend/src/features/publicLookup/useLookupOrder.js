import { useCallback, useState } from 'react';
import { lookup as lookupRequest } from '../../services/lookupService';

const FALLBACK_ERROR = "We couldn't reach connectkro.pk. Please check your connection and try again.";

/**
 * src/features/publicLookup/useLookupOrder.js
 *
 * Drives the public lookup form: idle -> loading -> success | error.
 *
 * On a server-returned error, the `message` field is already a safe,
 * generic connectkro-branded string (see backend errorHandler) and is used
 * verbatim; the local fallback only covers requests that never reached the
 * server at all (network failure, etc.).
 */
export function useLookupOrder() {
  const [state, setState] = useState({
    status: 'idle',
    data: null,
    errorMessage: '',
  });

  const lookup = useCallback(async (orderId) => {
    setState({ status: 'loading', data: null, errorMessage: '' });
    try {
      const response = await lookupRequest(orderId);
      setState({ status: 'success', data: response.data, errorMessage: '' });
    } catch (err) {
      const message = err?.response?.data?.message || FALLBACK_ERROR;
      setState({ status: 'error', data: null, errorMessage: message });
    }
  }, []);

  return { ...state, lookup };
}

export default useLookupOrder;
