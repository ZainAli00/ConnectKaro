/**
 * src/utils/constants.js
 *
 * Small static data shared across the backend. No Destination table exists —
 * this list is served as-is via GET /api/public/destinations and used to
 * validate destinationCode on order creation.
 */

const DESTINATIONS = [
  { code: 'PK', label: 'Pakistan', flag: '🇵🇰' },
  { code: 'TR', label: 'Türkiye', flag: '🇹🇷' },
  { code: 'MY', label: 'Malaysia', flag: '🇲🇾' },
  { code: 'SA', label: 'Saudi Arabia', flag: '🇸🇦' },
  { code: 'AE', label: 'UAE', flag: '🇦🇪' },
  { code: 'GB', label: 'United Kingdom', flag: '🇬🇧' },
  { code: 'TH', label: 'Thailand', flag: '🇹🇭' },
  { code: 'SG', label: 'Singapore', flag: '🇸🇬' },
  { code: 'ID', label: 'Indonesia', flag: '🇮🇩' },
  { code: 'PH', label: 'Philippines', flag: '🇵🇭' },
  { code: 'VN', label: 'Vietnam', flag: '🇻🇳' },
  { code: 'JP', label: 'Japan', flag: '🇯🇵' },
  { code: 'KR', label: 'South Korea', flag: '🇰🇷' },
  { code: 'TW', label: 'Taiwan', flag: '🇹🇼' },
  { code: 'HK', label: 'Hong Kong', flag: '🇭🇰' },
  { code: 'MO', label: 'Macau', flag: '🇲🇴' },
  { code: 'CN', label: 'China', flag: '🇨🇳' },
  { code: 'AU', label: 'Australia', flag: '🇦🇺' },
  { code: 'NZ', label: 'New Zealand', flag: '🇳🇿' },
  { code: 'OTHER', label: 'Other / Not Listed', flag: '🌍' },
];

// Public-facing order code prefix, e.g. "CK-7F3K9QM".
const ORDER_ID_PREFIX = 'CK-';

// Crockford base32 alphabet — excludes I/L/O/U to avoid ambiguity when a
// customer reads/types the order ID.
const ORDER_ID_ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

const ORDER_ID_RANDOM_LENGTH = 7;

module.exports = {
  DESTINATIONS,
  ORDER_ID_PREFIX,
  ORDER_ID_ALPHABET,
  ORDER_ID_RANDOM_LENGTH,
};
