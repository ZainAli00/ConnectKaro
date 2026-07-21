import Card from '../ui/Card';
import EmptyState from '../ui/EmptyState';
import './DestinationBarChart.css';

/**
 * src/components/dataviz/DestinationBarChart.jsx
 *
 * Horizontal bar chart: order count per destination. Per the dataviz skill,
 * this is a magnitude comparison across categories ("compare magnitude, low
 * -> high") — the safe default is a SEQUENTIAL single hue, not a categorical
 * palette per bar (destinations aren't a fixed set of identities the reader
 * needs to tell apart across charts, just a ranked list). One legend-free
 * hue (--mint), thin rounded bars, direct value label at the tip, longest
 * bar first — horizontal specifically because destination names vary a lot
 * in length ("UAE" vs "Saudi Arabia").
 *
 * @param {{ data: Array<{destinationCode:string, destinationLabel:string, flag:string, count:number}> }} props
 */
export default function DestinationBarChart({ data }) {
  const rows = Array.isArray(data) ? data : [];
  const max = rows.reduce((m, row) => Math.max(m, row.count), 0);

  return (
    <Card className="ck-dest-chart">
      <h3 className="ck-dest-chart__title">Orders by destination</h3>

      {rows.length === 0 && (
        <EmptyState icon="🌍" message="Once you create orders, the destination breakdown appears here." />
      )}

      {rows.length > 0 && (
        <ul className="ck-dest-chart__list">
          {rows.map((row) => {
            const widthPct = max > 0 ? Math.max((row.count / max) * 100, 4) : 0;
            return (
              <li key={row.destinationCode} className="ck-dest-chart__row">
                <span className="ck-dest-chart__label">
                  <span aria-hidden="true">{row.flag}</span> {row.destinationLabel}
                </span>
                <span className="ck-dest-chart__track">
                  <span className="ck-dest-chart__fill" style={{ width: `${widthPct}%` }} />
                </span>
                <span className="ck-dest-chart__value mono">{row.count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
