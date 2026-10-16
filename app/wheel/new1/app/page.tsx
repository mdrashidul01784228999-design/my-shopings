"use client";

import { useRef, useState, type FormEvent } from "react";
import Wheel, { type WheelHandle } from "../components/Wheel";
import rawData from "../data/names.json";

// names.json-এ title বা names না থাকলেও যেন টাইপ এরর না হয়
const data = rawData as { title?: string; names?: string[] };
const initialNames: string[] = Array.isArray(data.names) ? data.names : [];
const pageTitle: string = data.title ?? "ভাগ্যচক্র";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [names, setNames] = useState<string[]>(initialNames);
  const [input, setInput] = useState("");
  const [winner, setWinner] = useState<string | null>(null);
  const [removeWinner, setRemoveWinner] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [pulled, setPulled] = useState(false);
  const wheelRef = useRef<WheelHandle>(null);

  const canSpin = !spinning && names.length >= 2;

  function pull() {
    if (!canSpin) return;
    setPulled(true);
    setTimeout(() => setPulled(false), 700);
    wheelRef.current?.spin();
  }

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
        <p className="sub">নাম যোগ করুন, লিভার টানুন, বিজয়ী বেছে নিন</p>
      </header>

      <section className="stage">
        <div className="machine-wrap">
          <div className={`machine${spinning ? " running" : ""}`}>
            <div className="crown">
              <div className="sirens" aria-hidden="true">
                <span className="siren siren-s" />
                <span className="siren siren-l" />
                <span className="siren siren-s" />
              </div>
            </div>

            <div className="cabinet">
              <div className="window">
                <Wheel
                  ref={wheelRef}
                  names={names}
                  onWinner={setWinner}
                  onSpinningChange={setSpinning}
                />
              </div>

              <div className="controls">
                <button
                  type="button"
                  className="red-btn"
                  disabled={spinning || names.length < 2}
                  onClick={() => setNames((p) => shuffle(p))}
                >
                  মেশান
                </button>
                <button type="button" className="red-btn red-btn-main" disabled={!canSpin} onClick={pull}>
                  ঘোরান
                </button>
                <button
                  type="button"
                  className="red-btn"
                  disabled={spinning}
                  onClick={() => setNames(initialNames)}
                >
                  রিসেট
                </button>
              </div>

              <button
                type="button"
                className={`lever${pulled ? " pulled" : ""}`}
                onClick={pull}
                disabled={!canSpin}
                aria-label="লিভার টানুন"
              >
                <span className="arm">
                  <span className="ball" />
                </span>
              </button>
            </div>

            <div className="base">
              <span>SPIN</span>
            </div>
            <div className="floor" />
          </div>
        </div>

        <aside className="panel">
          <form onSubmit={addName} className="add">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="নাম লিখুন (কমা দিয়ে একাধিক)"
              aria-label="নতুন নাম"
            />
            <button type="submit" disabled={spinning}>
              যোগ করুন
            </button>
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
              <button className="link" disabled={spinning} onClick={() => setNames([])}>
                সব মুছুন
              </button>
            )}
          </div>

          <ul className="names">
            {names.map((n, i) => (
              <li key={`${n}-${i}`}>
                <span>{n}</span>
                <button disabled={spinning} onClick={() => removeName(i)} aria-label={`${n} মুছুন`}>
                  ×
                </button>
              </li>
            ))}
            {names.length < 2 && <li className="hint">চাকা ঘোরাতে কমপক্ষে ২টি নাম দিন</li>}
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
