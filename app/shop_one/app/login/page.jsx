"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "../../lib/store";

export default function Login() {
  const router = useRouter();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setErr("");
    try {
      await api("/api/auth", { method: "POST", body: JSON.stringify({ password: pw }) });
      router.push("/add-product"); router.refresh();
    } catch (er) { setErr(er.message); }
    setBusy(false);
  };

  return (
    <div className="sc-wrap" style={{ maxWidth: 440 }}>
      <h1 className="sc-title">Admin Login</h1>
      <p className="sc-sub">Only the shop owner can add products and see orders.</p>
      <form className="sc-box" onSubmit={submit}>
        <div className="sc-field">
          <label>Password</label>
          <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        </div>
        {err && <p className="sc-err">{err}</p>}
        <button className="sc-btn" disabled={busy || !pw}>{busy ? "Checking…" : "Login"}</button>
      </form>
    </div>
  );
}
