import './Spinner.css';

export default function Spinner({ size = 22, label = 'Loading' }) {
  return (
    <span
      className="ck-spinner"
      style={{ width: size, height: size }}
      role="status"
      aria-label={label}
    >
      <span className="ck-spinner__ring" />
    </span>
  );
}
