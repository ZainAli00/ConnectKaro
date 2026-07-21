import './Field.css';

export default function Input({ label, error, id, className = '', ...rest }) {
  const inputId = id || rest.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className="ck-field">
      {label && (
        <label className="ck-field__label" htmlFor={inputId}>
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={[
          'ck-field__control',
          error ? 'ck-field__control--error' : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        aria-invalid={error ? 'true' : undefined}
        aria-describedby={errorId}
        {...rest}
      />
      {error && (
        <p className="ck-field__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
