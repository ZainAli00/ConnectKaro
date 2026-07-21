import { useState } from 'react';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import { useAuth } from './useAuth';
import './LoginForm.css';

const GENERIC_ERROR = 'Invalid email or password.';

/**
 * Email/password login form. Calls useAuth().login on submit; on success
 * invokes the optional onSuccess callback (the page decides what to do,
 * typically navigate('/dashboard')) rather than navigating itself.
 */
export default function LoginForm({ onSuccess }) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      const admin = await login(email, password);
      onSuccess?.(admin);
    } catch (err) {
      const message = err?.response?.data?.message || GENERIC_ERROR;
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="ck-login-form" onSubmit={handleSubmit} noValidate>
      {error && (
        <p className="ck-login-form__error" role="alert">
          {error}
        </p>
      )}

      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="username"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        required
      />

      <Input
        label="Password"
        type="password"
        name="password"
        autoComplete="current-password"
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        required
      />

      <Button
        type="submit"
        variant="mint"
        className="ck-login-form__submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
}
