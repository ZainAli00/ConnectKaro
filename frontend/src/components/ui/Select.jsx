import './Field.css';

export default function Select({ label, error, id, className = '', children, ...rest }) {
  const selectId = id || rest.name;
  const errorId = error && selectId ? `${selectId}-error` : undefined;

  return (
    <div className="ck-field">
      {label && (
        <label className="ck-field__label" htmlFor={selectId}>
          {label}
        </label>
      )}
      <select
        id={selectId}
        className={[
          'ck-field__control',
          'ck-field__control--select',
          error ? 'ck-field__control--error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        {...rest}
      >
        {children}
      </select>
      {error && (
        <p className="ck-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
