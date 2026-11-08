"use client";

import { useState, type FormEvent } from "react";
import Wheel from "../components/Wheel";
import rawData from "../data/names.json";

// names.json-এ title বা names না থাকলেও যেন টাইপ এরর না হয়
const data = rawData as { title?: string; names?: string[] };
const initialNames: string[] = Array.isArray(data.names) ? data.names : [];
const pageTitle: string = data.title ?? "ভাগ্যচক্র";

export default function Home() {
  const [names, setNames] = useState<string[]>(initialNames);
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [removeWinner, setRemoveWinner] = useState(false);

  function addName(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const parts = input
      .split(/[\n,]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!parts.length) return;
    setNames((prev) => [...prev, ...parts].slice(0, 40));
    setInput("");
  }

  function removeName(i: number) {
    setNames((prev) => prev.filter((_, idx) => idx !== i));
  }

  function handleWinner(index: number) {
    setWinner(names[index] ?? null);
  }

  function closeModal() {
    if (removeWinner && winner) {
      setNames((prev) => {
        const i = prev.indexOf(winner);
        return i === -1 ? prev : prev.filter((_, idx) => idx !== i);
      });
    }
    setWinner(null);
  }

  return (
    <main className="page">
      <header className="head">
        <h1 className="title">{pageTitle}</h1>
        <p className="sub">নাম যোগ করুন, চাকা ঘোরান, বিজয়ী বেছে নিন</p>
      </header>

      <section className="stage">
        <Wheel names={names} onWinner={handleWinner} />

        <aside className="panel">
          <form onSubmit={addName} className="add">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="নাম লিখুন (কমা দিয়ে একাধিক)"
              aria-label="নতুন নাম"
            />
            <button type="submit">যোগ করুন</button>
          </form>

          <label className="check">
            <input
              type="checkbox"
              checked={removeWinner}
              onChange={(e) => setRemoveWinner(e.target.checked)}
            />
            বিজয়ীকে তালিকা থেকে সরান
          </label>

          <div className="list-head">
            <span>অংশগ্রহণকারী ({names.length})</span>
            {names.length > 0 && (
              <button className="link" onClick={() => setNames([])}>
                সব মুছুন
              </button>
            )}
          </div>

          <ul className="names">
            {names.map((n, i) => (
              <li key={`${n}-${i}`}>
                <span>{n}</span>
                <button onClick={() => removeName(i)} aria-label={`${n} মুছুন`}>
                  ×
                </button>
              </li>
            ))}
            {names.length < 2 && (
              <li className="hint">চাকা ঘোরাতে কমপক্ষে ২টি নাম দিন</li>
            )}
          </ul>
        </aside>
      </section>

      {winner && (
        <div className="overlay" onClick={closeModal} role="dialog" aria-modal="true">
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <p className="modal-label">অভিনন্দন! বিজয়ী</p>
            <h2 className="modal-name">{winner}</h2>
            <button className="modal-btn" onClick={closeModal}>
              ঠিক আছে
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
