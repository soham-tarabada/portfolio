import { useState } from "react";
import { useAuth } from "../lib/useAuth.jsx";
import { usePhosphor } from "../lib/usePhosphor.js";

export default function Login() {
  const { signIn } = useAuth();
  const { mode, toggle } = usePhosphor();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError(null);

    try {
      await signIn(email.trim(), password);
    } catch (failure) {
      setError(failure.message);
      setPassword("");
      setBusy(false);
    }
  }

  return (
    <div className="gate">
      <button type="button" className="gate__phosphor" onClick={toggle}>
        {mode}
      </button>

      <form className="gate__card" onSubmit={submit}>
        <p className="gate__mark">portfolio-v5</p>
        <h1 className="gate__title">admin</h1>
        <p className="gate__lede">Sign in to edit the content behind the site.</p>

        <div className="field">
          <label className="field__label" htmlFor="gate-email">
            Email
          </label>
          <input
            id="gate-email"
            className="input"
            type="email"
            autoComplete="username"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        <div className="field">
          <label className="field__label" htmlFor="gate-password">
            Password
          </label>
          <input
            id="gate-password"
            className="input"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {error ? (
          <p className="gate__error" role="alert">
            {error}
          </p>
        ) : null}

        <button type="submit" className="button button--primary gate__submit" disabled={busy}>
          {busy ? "signing in…" : "sign in"}
        </button>
      </form>
    </div>
  );
}
