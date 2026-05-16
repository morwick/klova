import { useState } from "react";

export default function Login({ onSignIn }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    const { error } = await onSignIn(email.trim(), password);
    setBusy(false);
    if (error) setErr(error.message || "Sign-in failed");
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={submit}>
        <div className="brand">klova</div>
        <div className="tag">Studio Admin</div>
        <div className="field">
          <label>Email</label>
          <input type="email" autoComplete="username" value={email}
                 onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="field">
          <label>Password</label>
          <input type="password" autoComplete="current-password" value={password}
                 onChange={(e) => setPassword(e.target.value)} required />
        </div>
        {err && <div className="err">{err}</div>}
        <button className="btn" style={{ width: "100%", marginTop: 8 }} disabled={busy}>
          {busy ? "Signing in…" : "Sign in"}
        </button>
        <p className="help" style={{ textAlign: "center", marginTop: 16 }}>
          Create the admin user in Supabase → Authentication → Users.
        </p>
      </form>
    </div>
  );
}
