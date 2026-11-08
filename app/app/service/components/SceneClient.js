"use client";
import React from "react";
import dynamic from "next/dynamic";

const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false, loading: () => <div className="orb-fallback" /> });

class Boundary extends React.Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() {}
  render() { return this.state.failed ? <div className="orb-fallback" /> : this.props.children; }
}

export default function SceneClient() {
  return (
    <Boundary>
      <Scene3D />
    </Boundary>
  );
}
