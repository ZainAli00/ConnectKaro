import { Link } from 'react-router-dom';
import './Button.css';

/**
 * Pill-shaped button matching connectkro.html's .btn-mint/.btn-gold/.btn-ghost
 * visual language. Renders a react-router-dom <Link> when a `to` prop is
 * passed, otherwise renders the element named by `as` (default 'button').
 *
 * `external`: set this when `to` points outside this SPA's own routes (e.g.
 * back to the marketing site's "/", which is a separate static page, not a
 * client-side route) — renders a plain <a> (full page load) instead of a
 * React Router <Link> (which would just hit the in-app 404 for a path this
 * app doesn't own).
 */
export default function Button({
  variant = 'mint',
  size = 'md',
  as = 'button',
  to,
  external = false,
  className = '',
  children,
  ...rest
}) {
  const classes = ['ck-btn', `ck-btn--${variant}`, `ck-btn--${size}`, className]
    .filter(Boolean)
    .join(' ');

  if (to && external) {
    return (
      <a href={to} className={classes} {...rest}>
        {children}
      </a>
    );
  }

  if (to) {
    return (
      <Link to={to} className={classes} {...rest}>
        {children}
      </Link>
    );
  }

  const Component = as;
  const isButtonEl = Component === 'button';
  const { type, ...restProps } = rest;

  return (
    <Component
      type={isButtonEl ? type || 'button' : type}
      className={classes}
      {...restProps}
    >
      {children}
    </Component>
  );
}
