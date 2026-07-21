import Card from '../../components/ui/Card';
import { PackageIcon, SignalIcon, ClockIcon } from '../../components/ui/Icons';
import './StatsCards.css';

const TILES = [
  { key: 'totalOrders', label: 'Total orders', Icon: PackageIcon, tone: 'mint' },
  { key: 'activeLinesCount', label: 'Active lines', Icon: SignalIcon, tone: 'gold' },
  { key: 'expiringSoonCount', label: 'Expiring soon (7 days)', Icon: ClockIcon, tone: 'rose' },
];

function formatCount(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US').format(value);
}

/**
 * src/features/dashboard/StatsCards.jsx
 *
 * Three headline stat tiles for AdminDashboardPage. Per the project's
 * dataviz skill, each figure is a standalone proportional-figure number
 * (never `tabular-nums` — that's reserved for columns of digits that must
 * align, like a table column) set in the body sans rather than the display
 * face used for headings, and stays in plain ink color — status/accent
 * color is reserved for chart marks, never borrowed for stat-tile text.
 *
 * @param {{ stats: { totalOrders:number, activeLinesCount:number, expiringSoonCount:number } | null }} props
 */
export default function StatsCards({ stats }) {
  return (
    <div className="ck-stats-cards">
      {TILES.map(({ key, label, Icon, tone }) => (
        <Card key={key} className="ck-stat-card">
          <span className={`ck-stat-card__icon ck-stat-card__icon--${tone}`}>
            <Icon width={22} height={22} />
          </span>
          <div>
            <p className="ck-stat-card__value">{formatCount(stats?.[key])}</p>
            <p className="ck-stat-card__label">{label}</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
