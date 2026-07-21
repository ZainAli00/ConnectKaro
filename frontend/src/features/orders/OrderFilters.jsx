import { useEffect, useState } from 'react';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import { useDebouncedValue } from '../../hooks/useDebouncedValue';
import { ORDER_STATUS_OPTIONS } from './orderStatus';
import { useDestinations } from './useDestinations';
import './OrderFilters.css';

/**
 * src/features/orders/OrderFilters.jsx
 *
 * Search + status + destination filter row for AdminOrdersPage. Fully
 * controlled from the outside would mean re-rendering the parent's list
 * fetch on every keystroke, so the free-text search box debounces locally
 * (~350ms) before it reaches the onChange({query,status,destinationCode})
 * callback; the two selects call back immediately since they don't need
 * debouncing.
 *
 * @param {{ onChange: (filters: {query:string,status:string,destinationCode:string}) => void }} props
 */
export default function OrderFilters({ onChange }) {
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [destinationCode, setDestinationCode] = useState('');
  const debouncedQuery = useDebouncedValue(query, 350);
  const { destinations } = useDestinations();

  useEffect(() => {
    onChange?.({ query: debouncedQuery.trim(), status, destinationCode });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery, status, destinationCode]);

  return (
    <div className="ck-order-filters">
      <Input
        label="Search"
        name="orderSearch"
        placeholder="Order ID, customer name, or contact"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
      />

      <Select
        label="Status"
        name="orderStatusFilter"
        value={status}
        onChange={(event) => setStatus(event.target.value)}
      >
        <option value="">All</option>
        {ORDER_STATUS_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>

      <Select
        label="Destination"
        name="destinationFilter"
        value={destinationCode}
        onChange={(event) => setDestinationCode(event.target.value)}
      >
        <option value="">All destinations</option>
        {destinations.map((destination) => (
          <option key={destination.code} value={destination.code}>
            {destination.flag} {destination.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
