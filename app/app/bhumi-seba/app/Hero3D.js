"use client";
import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function Hero3D() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    el.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(55, 1, 0.1, 100); cam.position.z = 9;
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const l1 = new THREE.PointLight(0xff5fa2, 60, 40); l1.position.set(6, 5, 6); scene.add(l1);
    const l2 = new THREE.PointLight(0x35d6ff, 60, 40); l2.position.set(-6, -4, 5); scene.add(l2);

    const cols = [0xffc857, 0xff5fa2, 0x35d6ff, 0x7cf29c, 0xb18cff];
    const shapes = [new THREE.IcosahedronGeometry(1, 0), new THREE.OctahedronGeometry(1.1), new THREE.TorusKnotGeometry(0.7, 0.24, 90, 12), new THREE.BoxGeometry(1.4, 1.4, 1.4), new THREE.TorusGeometry(0.9, 0.3, 14, 40)];
    const objs = shapes.map((g, i) => {
      const m = new THREE.Mesh(g, new THREE.MeshStandardMaterial({ color: cols[i], metalness: 0.5, roughness: 0.25, flatShading: true }));
      const a = (i / shapes.length) * Math.PI * 2;
      m.position.set(Math.cos(a) * 4.2, Math.sin(a) * 2.6, -1 + (i % 2) * 2);
      m.userData = { s: 0.004 + i * 0.002 };
      scene.add(m); return m;
    });
    const grid = new THREE.GridHelper(40, 40, 0xffc857, 0x2f8f6b); grid.position.y = -4; grid.material.transparent = true; grid.material.opacity = 0.35; scene.add(grid);
    const N = 500, pos = new Float32Array(N * 3);
    for (let i = 0; i < N * 3; i++) pos[i] = (Math.random() - 0.5) * 30;
    const pg = new THREE.BufferGeometry(); pg.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    const pts = new THREE.Points(pg, new THREE.PointsMaterial({ size: 0.06, color: 0xffffff, transparent: true, opacity: 0.8 })); scene.add(pts);

    let mx = 0, my = 0, raf, t = 0;
    const size = () => { const w = el.clientWidth, h = el.clientHeight; renderer.setSize(w, h); cam.aspect = w / h; cam.updateProjectionMatrix(); };
    const mv = (e) => { mx = (e.clientX / innerWidth - 0.5) * 2; my = (e.clientY / innerHeight - 0.5) * 2; };
    size(); addEventListener("resize", size); addEventListener("mousemove", mv);
    const loop = () => {
      t += 0.01;
      objs.forEach((o, i) => { o.rotation.x += o.userData.s; o.rotation.y += o.userData.s * 1.4; o.position.y += Math.sin(t + i) * 0.004; });
      pts.rotation.y = t * 0.05; grid.position.z = (t * 2) % 1;
      cam.position.x += (mx * 1.2 - cam.position.x) * 0.04; cam.position.y += (-my * 0.8 - cam.position.y) * 0.04; cam.lookAt(0, 0, 0);
      renderer.render(scene, cam);
      if (!reduce) raf = requestAnimationFrame(loop);
    };
    loop();
    return () => { cancelAnimationFrame(raf); removeEventListener("resize", size); removeEventListener("mousemove", mv); renderer.dispose(); el.removeChild(renderer.domElement); };
  }, []);
  return <div ref={ref} className="hero3d" aria-hidden="true" />;
}
