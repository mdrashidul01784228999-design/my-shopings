export function Cube() {
  return (
    <div className="scene" aria-hidden="true">
      <div className="cube">
        {["front", "back", "right", "left", "top", "bottom"].map((f) => (
          <div key={f} className={`face ${f}`}>
            {f === "front" ? "SHOP" : f === "back" ? "UPLOAD" : "★"}
          </div>
        ))}
      </div>
      <div className="ring r1" />
      <div className="ring r2" />
      <div className="orb o1" />
      <div className="orb o2" />
    </div>
  );
}

export function Pyramid() {
  return (
    <div className="pyr-wrap" aria-hidden="true">
      <div className="pyr">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="pf" style={{ "--r": `${i * 90}deg` }} />
        ))}
      </div>
    </div>
  );
}
