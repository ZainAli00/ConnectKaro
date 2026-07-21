import './Card.css';

export default function Card({ as = 'div', className = '', children, ...rest }) {
  const Component = as;
  return (
    <Component className={['ck-card', className].filter(Boolean).join(' ')} {...rest}>
      {children}
    </Component>
  );
}
