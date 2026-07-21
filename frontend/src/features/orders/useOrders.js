import { useCallback, useEffect, useState } from 'react';
import * as orderService from '../../services/orderService';

const FALLBACK_ERROR = "We couldn't reach connectkro.pk. Please check your connection and try again.";

function extractMessage(err) {
  return err?.response?.data?.message || FALLBACK_ERROR;
}

/**
 * src/features/orders/useOrders.js
 *
 * A small family of hooks wrapping services/orderService.js, each scoped to
 * one page's needs (list vs. a single order vs. creation) rather than one
 * monolithic hook. Every hook returns/throws so the calling component can
 * still show its own toast/inline error where that's more appropriate
 * (mirrors useLookupOrder.js's approach for the public page).
 *
 * DeleteOrderDialog.jsx calls orderService.remove(id) directly rather than
 * through a hook here — it's a fully self-contained confirm-and-mutate unit
 * (same pattern LoginForm.jsx uses for authService.login), so there's no
 * shared list/detail state for a "remove" hook to usefully own.
 */

const DEFAULT_LIST_PARAMS = { query: '', status: '', destinationCode: '', page: 1, pageSize: 20 };

/**
 * Backs AdminOrdersPage: search/filter/paginate the admin order list.
 */
export function useOrderList(initialParams) {
  const [params, setParams] = useState({ ...DEFAULT_LIST_PARAMS, ...initialParams });
  const [items, setItems] = useState([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, pageSize: DEFAULT_LIST_PARAMS.pageSize });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    setIsLoading(true);
    setError('');

    orderService
      .list(params)
      .then((response) => {
        if (cancelled) return;
        setItems(response.data || []);
        setMeta(response.meta || { total: 0, page: params.page, pageSize: params.pageSize });
      })
      .catch((err) => {
        if (cancelled) return;
        setItems([]);
        setError(extractMessage(err));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [params]);

  // Any filter change jumps back to page 1; an explicit page change (from
  // setPage) is the only way to move off it.
  const setFilters = useCallback((patch) => {
    setParams((prev) => ({ ...prev, ...patch, page: 1 }));
  }, []);

  const setPage = useCallback((page) => {
    setParams((prev) => ({ ...prev, page }));
  }, []);

  const refetch = useCallback(() => {
    setParams((prev) => ({ ...prev }));
  }, []);

  return { items, meta, isLoading, error, filters: params, setFilters, setPage, refetch };
}

/**
 * Backs AdminOrderDetailPage and AdminOrderEditPage: fetch one order plus
 * the two mutations available from those pages (edit, force usage refresh).
 */
export function useOrder(id) {
  const [order, setOrder] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchOrder = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await orderService.get(id);
      setOrder(response.data);
    } catch (err) {
      setOrder(null);
      setError(extractMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Left to throw on failure — callers (OrderDetailPanel) decide how to
  // surface the error (toast) since success/failure UI differs per caller.
  const refreshUsage = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const response = await orderService.refreshUsage(id);
      setOrder(response.data);
      return response.data;
    } finally {
      setIsRefreshing(false);
    }
  }, [id]);

  const updateOrder = useCallback(async (patch) => {
    setIsUpdating(true);
    try {
      const response = await orderService.update(id, patch);
      setOrder(response.data);
      return response.data;
    } finally {
      setIsUpdating(false);
    }
  }, [id]);

  return { order, isLoading, error, refetch: fetchOrder, isRefreshing, refreshUsage, isUpdating, updateOrder };
}

/**
 * Backs AdminNewOrderPage. Deliberately has no "current order" state of its
 * own — the created order is only ever handed back to the caller (OrderForm
 * shows it inline so the admin can copy the new Order ID).
 */
export function useCreateOrder() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const createOrder = useCallback(async (payload) => {
    setIsSubmitting(true);
    try {
      const response = await orderService.create(payload);
      return response.data;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { createOrder, isSubmitting };
}
