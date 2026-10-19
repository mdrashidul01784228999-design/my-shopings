'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import * as THREE from 'three';

const S = 150; // world half-size
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = (a) => a[Math.floor(Math.random() * a.length)];
const mat = (c, r = 0.75) => new THREE.MeshStandardMaterial({ color: c, roughness: r });
const add = (p, geo, m, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };
const cap = (r, l) => new THREE.CapsuleGeometry(r, l, 6, 12);

// ---------- সাউন্ড (Web Audio, কোনো ফাইল লাগে না) ----------
let AC = null, master = null, muted = false, noiseBuf = null;
const noise = () => { if (!noiseBuf) { noiseBuf = AC.createBuffer(1, AC.sampleRate, AC.sampleRate); const d = noiseBuf.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return noiseBuf; };
const initAudio = () => {
  if (AC) { AC.resume?.(); return; }
  const C = window.AudioContext || window.webkitAudioContext; if (!C) return;
  AC = new C(); master = AC.createGain(); master.gain.value = muted ? 0 : .6; master.connect(AC.destination);
  const w = AC.createBufferSource(); w.buffer = noise(); w.loop = true;
  const f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 350;
  const g = AC.createGain(); g.gain.value = .06; w.connect(f); f.connect(g); g.connect(master); w.start(); // বাতাসের শব্দ
};
const setMute = v => { muted = v; if (master) master.gain.value = v ? 0 : .6; };
const burst = (freq, dur, vol, type = 'lowpass') => {
  if (!AC || muted || vol < .01) return;
  const s = AC.createBufferSource(); s.buffer = noise();
  const fl = AC.createBiquadFilter(); fl.type = type; fl.frequency.value = freq;
  const g = AC.createGain(), t = AC.currentTime;
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  s.connect(fl); fl.connect(g); g.connect(master); s.start(t, Math.random() * .4); s.stop(t + dur);
};
const tone = (f0, f1, dur, vol, type = 'sine', delay = 0) => {
  if (!AC || muted || vol < .01) return;
  const o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + delay;
  o.type = type; o.frequency.setValueAtTime(f0, t); o.frequency.exponentialRampToValueAtTime(f1, t + dur);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(.001, t + dur);
  o.connect(g); g.connect(master); o.start(t); o.stop(t + dur);
};
const sfx = {
  shot: (v = 1) => { burst(3500, .18, .5 * v); tone(160, 40, .15, .6 * v, 'triangle'); },
  step: (v = 1, run = false) => burst(run ? 900 : 600, run ? .09 : .12, (run ? .4 : .25) * v),
  hit: () => tone(1500, 900, .06, .25, 'square'),
  hurt: () => { tone(120, 60, .22, .5, 'sawtooth'); burst(500, .12, .3); },
  pick: () => { tone(500, 700, .1, .25); tone(800, 1100, .12, .25, 'sine', .09); },
  warn: () => tone(700, 700, .12, .15, 'square'),
  lose: () => tone(400, 80, 1, .4, 'sawtooth'),
  win: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, f, .3, .3, 'triangle', i * .15)),
};

function makeHand(skin) {
  const h = new THREE.Group();
  add(h, new THREE.BoxGeometry(.09, .1, .03), skin, 0, -.05, 0);
  for (let i = 0; i < 4; i++) add(h, new THREE.BoxGeometry(.017, .07, .022), skin, -.032 + i * .021, -.125, 0);
  const t = add(h, new THREE.BoxGeometry(.02, .06, .022), skin, .055, -.06, .01); t.rotation.z = -.5;
  return h;
}

// মানুষের মত ক্যারেক্টার: মাথা, চুল, চোখ, ভ্রু, কান, নাক, মুখ, ঘাড়, ধড়, হাত (আঙুলসহ), পা, বুট
function makeHuman(o) {
  const skin = mat(o.skin, .55), shirt = mat(o.shirt), pants = mat(o.pants), hairM = mat(o.hair, .9);
  const g = new THREE.Group();
  add(g, cap(.2, .35), shirt, 0, 1.2, 0).scale.set(1.15, 1, .65);
  add(g, new THREE.BoxGeometry(.36, .2, .22), pants, 0, .97, 0);
  add(g, new THREE.CylinderGeometry(.055, .06, .12, 12), skin, 0, 1.52, 0);
  add(g, new THREE.BoxGeometry(.34, .5, .14), mat(o.pack), 0, 1.25, -.2);
  const head = new THREE.Group(); head.position.y = 1.68; g.add(head);
  add(head, new THREE.SphereGeometry(1, 28, 20), skin).scale.set(.115, .14, .125);
  add(head, new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI * .55), hairM, 0, .012, -.005).scale.set(.126, .15, .136);
  add(head, new THREE.SphereGeometry(1, 16, 12), hairM, 0, -.01, -.06).scale.set(.115, .12, .07);
  for (const s of [-1, 1]) {
    add(head, new THREE.SphereGeometry(1, 12, 10), mat(0xffffff, .3), s * .045, .02, .108).scale.setScalar(.022);
    add(head, new THREE.SphereGeometry(1, 10, 8), mat(0x1a1a1a, .2), s * .045, .02, .128).scale.setScalar(.011);
    add(head, new THREE.BoxGeometry(.05, .01, .01), hairM, s * .045, .058, .118);
    add(head, new THREE.SphereGeometry(1, 10, 8), skin, s * .118, -.005, 0).scale.set(.012, .03, .022);
  }
  add(head, new THREE.ConeGeometry(.016, .045, 10), skin, 0, -.012, .14).rotation.x = Math.PI / 2;
  add(head, new THREE.BoxGeometry(.05, .009, .01), mat(0x8a3b3b), 0, -.06, .118);
  const arms = [], legs = [];
  for (const s of [-1, 1]) {
    const sh = new THREE.Group(); sh.position.set(s * .3, 1.42, 0); sh.rotation.order = 'YXZ'; g.add(sh);
    add(sh, cap(.055, .22), shirt, 0, -.165, 0);
    const el = new THREE.Group(); el.position.y = -.33; sh.add(el);
    add(el, cap(.048, .2), skin, 0, -.15, 0);
    const hand = makeHand(skin); hand.position.y = -.31; el.add(hand);
    sh.rotation.set(-1.35, -s * .35, 0); el.rotation.x = -.35; arms.push(sh);
    const hp = new THREE.Group(); hp.position.set(s * .11, .95, 0); g.add(hp);
    add(hp, cap(.09, .32), pants, 0, -.25, 0);
    const kn = new THREE.Group(); kn.position.y = -.5; hp.add(kn);
    add(kn, cap(.07, .3), pants, 0, -.22, 0);
    add(kn, new THREE.BoxGeometry(.12, .1, .27), mat(0x2a2a2a), 0, -.42, .05);
    legs.push(hp);
  }
  const gun = new THREE.Group(); gun.position.set(0, 1.3, .38); g.add(gun);
  const gm = mat(0x222222, .4), wood = mat(0x8a6a2a);
  add(gun, new THREE.BoxGeometry(.06, .09, .55), gm);
  add(gun, new THREE.BoxGeometry(.04, .04, .45), gm, 0, .01, .45);
  add(gun, new THREE.BoxGeometry(.05, .13, .05), wood, 0, -.1, .08);
  add(gun, new THREE.BoxGeometry(.06, .1, .22), wood, 0, -.02, -.35);
  const muzzle = new THREE.Object3D(); muzzle.position.set(0, .01, .7); gun.add(muzzle);
  const hb = new THREE.Mesh(new THREE.BoxGeometry(.6, 1.85, .5), new THREE.MeshBasicMaterial({ visible: false }));
  hb.position.y = .92; g.add(hb);
  return { g, arms, legs, muzzle, hb };
}

export default function Game() {
  const root = useRef(null), base = useRef(null), knob = useRef(null);
  const [hud, setHud] = useState({ hp: 100, alive: 20, kills: 0, over: null });
  const [snd, setSnd] = useState(true);

  useEffect(() => {
    const el = root.current;
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
    renderer.setSize(innerWidth, innerHeight);
    renderer.shadowMap.enabled = true;
    el.prepend(renderer.domElement);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x8cc6ee);
    scene.fog = new THREE.Fog(0xa5d0ee, 70, 280);
    const cam = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, .1, 600);
    scene.add(new THREE.HemisphereLight(0xcfe8ff, 0x8a7a55, 1));
    const sun = new THREE.DirectionalLight(0xfff2d0, 1.6);
    sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, far: 300 });
    scene.add(sun, sun.target);

    const sea = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), mat(0x2f7fbf, .3));
    sea.rotation.x = -Math.PI / 2; sea.position.y = -.4; scene.add(sea);
    const ground = new THREE.Mesh(new THREE.PlaneGeometry(S * 2, S * 2), mat(0xcdb27c, 1));
    ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);

    // বিল্ডিং
    const walls = [], occ = [];
    for (let i = 0; i < 30; i++) {
      const w = rnd(10, 22), d = rnd(10, 22), h = rnd(4, 7), x = rnd(-S + 15, S - 15), z = rnd(-S + 15, S - 15);
      if (Math.hypot(x, z) < 18) continue;
      const b = add(scene, new THREE.BoxGeometry(w, h, d), mat(pick([0x9aa7b3, 0xb8b2a0, 0x8fa39a])), x, h / 2, z);
      const r = add(scene, new THREE.BoxGeometry(w + .6, .5, d + .6), mat(pick([0x5b7ea6, 0x9a4b3c, 0x4f7a5a])), x, h + .25, z);
      b.receiveShadow = true; occ.push(b, r);
      walls.push({ x0: x - w / 2, x1: x + w / 2, z0: z - d / 2, z1: z + d / 2 });
    }
    for (let i = 0; i < 60; i++) { const r = add(scene, new THREE.DodecahedronGeometry(rnd(.5, 1.6)), mat(0x7d7466), rnd(-S, S), .3, rnd(-S, S)); r.receiveShadow = true; }
    const push = (p, r) => { for (const b of walls) {
      const cx = Math.max(b.x0, Math.min(p.x, b.x1)), cz = Math.max(b.z0, Math.min(p.z, b.z1));
      const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz);
      if (d < r) { if (d > .0001) { p.x += dx / d * (r - d); p.z += dz / d * (r - d); } else p.x = b.x0 - r; }
    } p.x = Math.max(-S, Math.min(S, p.x)); p.z = Math.max(-S, Math.min(S, p.z)); };
    const inWall = (x, z) => walls.some(b => x > b.x0 - 1 && x < b.x1 + 1 && z > b.z0 - 1 && z < b.z1 + 1);

    // এন্টিটি
    const ents = [];
    const mkEnt = (bot) => {
      const h = makeHuman({ skin: pick([0xf1c27d, 0xe0ac69, 0xc68642, 0x8d5524]), shirt: bot ? pick([0xa83232, 0x7a3a8a, 0x3a6a8a]) : 0xe8741a, pants: bot ? 0x3a3a46 : 0x2b2f3a, hair: pick([0x1a1410, 0x3b2314, 0x6b4423, 0x111111]), pack: bot ? 0x3a4a3a : 0x6b3a14 });
      const e = { ...h, bot, hp: 100, kills: 0, cd: 0, t: 0, yaw: rnd(0, 6.28), ph: 0, dead: false };
      let x, z; do { x = rnd(-S + 8, S - 8); z = rnd(-S + 8, S - 8); } while (inWall(x, z) || (bot && Math.hypot(x, z) < 25));
      if (!bot) { x = 0; z = 0; }
      e.g.position.set(x, 0, z); e.hb.userData.ent = e; scene.add(e.g); ents.push(e); return e;
    };
    const P = mkEnt(false); for (let i = 0; i < 19; i++) mkEnt(true);

    // লুট ও জোন
    const loot = Array.from({ length: 50 }, () => { const m = add(scene, new THREE.BoxGeometry(.6, .6, .6), new THREE.MeshStandardMaterial({ color: 0x3ddc84, emissive: 0x1a7a44 }), rnd(-S, S), .6, rnd(-S, S)); return m; });
    const zone = { r: 140 };
    const zm = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 80, 64, 1, true), new THREE.MeshBasicMaterial({ color: 0xff2a2a, transparent: true, opacity: .25, side: THREE.DoubleSide }));
    zm.position.y = 30; scene.add(zm);

    // ইনপুট
    const keys = {}; let yaw = 0, pitch = .25, fireHeld = false, mx = 0, my = 0, runBtn = false, stepT = 0, warnT = 0;
    const kd = e => { keys[e.code] = true; }, ku = e => { keys[e.code] = false; };
    const mmv = e => { if (document.pointerLockElement) { yaw -= e.movementX * .0025; pitch = Math.max(-.35, Math.min(1.1, pitch + e.movementY * .0025)); } };
    const mdn = e => { if (e.target.tagName === 'CANVAS') { if (!document.pointerLockElement) renderer.domElement.requestPointerLock?.(); fireHeld = true; } };
    const mup = () => { fireHeld = false; };
    addEventListener('keydown', kd); addEventListener('keyup', ku); addEventListener('mousemove', mmv);
    addEventListener('mousedown', mdn); addEventListener('mouseup', mup);
    const AEV = ['pointerdown', 'keydown', 'touchend', 'click']; AEV.forEach(n => addEventListener(n, initAudio));
    let sL = null, sR = null;
    const ts = e => { for (const t of e.changedTouches) {
      if (t.target.closest?.('.firebtn,.runbtn,.mute')) continue;
      if (t.clientX < innerWidth / 2 && !sL) { sL = { id: t.identifier, ox: t.clientX, oy: t.clientY }; Object.assign(base.current.style, { display: 'block', left: t.clientX + 'px', top: t.clientY + 'px' }); }
      else if (t.clientX >= innerWidth / 2 && !sR) sR = { id: t.identifier, x: t.clientX, y: t.clientY };
    } };
    const tm = e => { e.preventDefault(); for (const t of e.changedTouches) {
      if (sL && t.identifier === sL.id) { let dx = t.clientX - sL.ox, dy = t.clientY - sL.oy; const m = Math.hypot(dx, dy); if (m > 50) { dx = dx / m * 50; dy = dy / m * 50; } mx = dx / 50; my = dy / 50; knob.current.style.transform = `translate(${dx}px,${dy}px)`; }
      if (sR && t.identifier === sR.id) { yaw -= (t.clientX - sR.x) * .006; pitch = Math.max(-.35, Math.min(1.1, pitch + (t.clientY - sR.y) * .006)); sR.x = t.clientX; sR.y = t.clientY; }
    } };
    const te = e => { for (const t of e.changedTouches) {
      if (sL && t.identifier === sL.id) { sL = null; mx = my = 0; base.current.style.display = 'none'; knob.current.style.transform = ''; }
      if (sR && t.identifier === sR.id) sR = null;
    } };
    el.addEventListener('touchstart', ts, { passive: true }); el.addEventListener('touchmove', tm, { passive: false });
    el.addEventListener('touchend', te); el.addEventListener('touchcancel', te);
    const fb = el.querySelector('.firebtn');
    const fon = e => { e.preventDefault(); e.stopPropagation(); fireHeld = true; }, foff = () => { fireHeld = false; };
    fb.addEventListener('touchstart', fon, { passive: false }); fb.addEventListener('touchend', foff);
    const rb = el.querySelector('.runbtn');
    const ron = e => { e.preventDefault(); e.stopPropagation(); runBtn = true; }, roff = () => { runBtn = false; };
    rb.addEventListener('touchstart', ron, { passive: false }); rb.addEventListener('touchend', roff); rb.addEventListener('touchcancel', roff);

    // শুটিং
    const ray = new THREE.Raycaster(), tracers = [];
    const hurt = (v, d, k) => { if (v.dead) return; v.hp -= d; if (v === P) sfx.hurt(); else if (k === P) sfx.hit(); if (v.hp <= 0) { v.hp = 0; v.dead = true; k.kills++; } };
    const fire = (e, o, d) => {
      sfx.shot(e === P ? 1 : Math.max(0, 1 - e.g.position.distanceTo(P.g.position) / 70) ** 2);
      ray.set(o, d); ray.far = 160;
      const tg = [...occ]; for (const x of ents) if (!x.dead && x !== e) tg.push(x.hb);
      const hit = ray.intersectObjects(tg, false)[0];
      const end = hit ? hit.point.clone() : o.clone().addScaledVector(d, 160);
      if (hit && hit.object.userData.ent) hurt(hit.object.userData.ent, e.bot ? 9 : 16, e);
      const m = new THREE.Vector3(); e.muzzle.getWorldPosition(m);
      const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints([m, end]), new THREE.LineBasicMaterial({ color: 0xffe27a }));
      scene.add(l); tracers.push({ l, t: .07 });
    };
    const los = (a, b) => {
      const o = new THREE.Vector3(a.g.position.x, 1.5, a.g.position.z), t = new THREE.Vector3(b.g.position.x, 1.2, b.g.position.z);
      const d = t.clone().sub(o), L = d.length(); ray.set(o, d.normalize()); ray.far = L; return ray.intersectObjects(occ, false).length === 0;
    };

    // লুপ
    const clock = new THREE.Clock(); let raf, acc = 0, ended = false;
    const loop = () => {
      const dt = Math.min(.05, clock.getDelta()); acc += dt;
      const pp = P.g.position;
      if (!ended) {
        // প্লেয়ার
        let ix = (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0) + mx, iz = (keys.KeyW ? 1 : 0) - (keys.KeyS ? 1 : 0) - my;
        const m = Math.hypot(ix, iz); if (m > 1) { ix /= m; iz /= m; }
        const run = !!(keys.ShiftLeft || keys.ShiftRight || runBtn || Math.hypot(mx, my) > .95); const sp = run ? 8 : 4.5;
        pp.x += (Math.sin(yaw) * iz - Math.cos(yaw) * ix) * sp * dt;
        pp.z += (Math.cos(yaw) * iz + Math.sin(yaw) * ix) * sp * dt;
        push(pp, .4); P.yaw = yaw; P.moving = Math.hypot(ix, iz) * (run ? 1.5 : 1);
        if (P.moving > .1) { stepT -= dt; if (stepT <= 0) { stepT = run ? .27 : .45; sfx.step(1, run); } } else stepT = 0;
        cam.fov += ((run && P.moving > .1 ? 74 : 65) - cam.fov) * Math.min(1, dt * 6); cam.updateProjectionMatrix();
        P.cd -= dt;
        if (fireHeld && P.cd <= 0 && !P.dead) { P.cd = .12; const d = new THREE.Vector3(); cam.getWorldDirection(d); fire(P, cam.position.clone(), d); }
        // বট
        for (const b of ents) {
          if (!b.bot || b.dead) continue;
          b.cd -= dt; b.t -= dt; const bp = b.g.position;
          let tg = null, bd = 45;
          for (const o of ents) { if (o === b || o.dead) continue; const d = bp.distanceTo(o.g.position); if (d < bd && los(b, o)) { bd = d; tg = o; } }
          let spd = 0;
          if (tg) {
            b.yaw = Math.atan2(tg.g.position.x - bp.x, tg.g.position.z - bp.z);
            if (bd > 12) spd = 3;
            if (b.cd <= 0) { b.cd = rnd(.6, 1.2);
              const o = new THREE.Vector3(bp.x, 1.5, bp.z), d = new THREE.Vector3(tg.g.position.x, 1.2, tg.g.position.z).sub(o).normalize();
              d.x += rnd(-.05, .05); d.y += rnd(-.03, .03); d.z += rnd(-.05, .05); fire(b, o, d.normalize()); }
          } else {
            if (b.t <= 0) { b.yaw = rnd(0, 6.28); b.t = rnd(2, 5); }
            if (Math.hypot(bp.x, bp.z) > zone.r - 10) b.yaw = Math.atan2(-bp.x, -bp.z);
            spd = 2.5;
          }
          bp.x += Math.sin(b.yaw) * spd * dt; bp.z += Math.cos(b.yaw) * spd * dt; push(bp, .4); b.moving = spd / 3;
          b.st = (b.st || 0) - dt; if (spd > 0 && b.st <= 0) { b.st = .5; sfx.step(Math.max(0, 1 - bp.distanceTo(pp) / 30) ** 2 * .8); }
        }
        // জোন, লুট
        zone.r = Math.max(20, zone.r - .4 * dt); zm.scale.set(zone.r, 1, zone.r);
        for (const e of ents) { if (e.dead) continue;
          if (Math.hypot(e.g.position.x, e.g.position.z) > zone.r) { if (e === P) { warnT -= dt; if (warnT <= 0) { warnT = .8; sfx.warn(); } } e.hp -= 4 * dt; if (e.hp <= 0) { e.hp = 0; e.dead = true; } }
          for (let i = loot.length - 1; i >= 0; i--) if (loot[i].position.distanceTo(e.g.position) < 1.6 && e.hp < 100) { e.hp = Math.min(100, e.hp + 25); if (e === P) sfx.pick(); scene.remove(loot[i]); loot.splice(i, 1); } }
      }
      // অ্যানিমেশন
      for (const e of ents) {
        if (e.dead) { e.g.rotation.x += (-Math.PI / 2 - e.g.rotation.x) * Math.min(1, dt * 6); e.g.position.y = .25; continue; }
        e.g.rotation.y = e.yaw; e.ph += dt * 9 * (e.moving || 0);
        const s = Math.sin(e.ph) * .7 * Math.min(1, e.moving || 0);
        e.legs[0].rotation.x = s; e.legs[1].rotation.x = -s; e.g.position.y = Math.abs(Math.sin(e.ph)) * .04 * (e.moving || 0);
      }
      for (let i = tracers.length - 1; i >= 0; i--) { const t = tracers[i]; t.t -= dt; if (t.t <= 0) { scene.remove(t.l); t.l.geometry.dispose(); tracers.splice(i, 1); } }
      for (const l of loot) l.rotation.y += dt * 2;
      // ক্যামেরা (থার্ড পারসন, কাঁধের উপর দিয়ে)
      const cp = Math.cos(pitch), fx = Math.sin(yaw), fz = Math.cos(yaw), rx = -Math.cos(yaw), rz = Math.sin(yaw);
      const tx = pp.x + rx * .6, ty = 1.6, tz = pp.z + rz * .6;
      cam.position.set(tx - fx * cp * 3.4, ty + Math.sin(pitch) * 3.4, tz - fz * cp * 3.4);
      cam.lookAt(tx + fx * 12, ty, tz + fz * 12);
      sun.position.set(pp.x + 60, 90, pp.z + 30); sun.target.position.copy(pp);
      renderer.render(scene, cam);
      // স্ট্যাটাস
      const alive = ents.filter(e => !e.dead).length;
      if (!ended && (P.dead || alive === 1)) { ended = true; P.dead ? sfx.lose() : sfx.win(); setHud({ hp: Math.ceil(P.hp), alive, kills: P.kills, over: P.dead ? 'lose' : 'win' }); document.exitPointerLock?.(); }
      else if (!ended && acc > .2) { acc = 0; setHud({ hp: Math.ceil(P.hp), alive, kills: P.kills, over: null }); }
      raf = requestAnimationFrame(loop);
    };
    loop();
    const rs = () => { renderer.setSize(innerWidth, innerHeight); cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); };
    addEventListener('resize', rs);
    return () => {
      cancelAnimationFrame(raf); removeEventListener('resize', rs); removeEventListener('keydown', kd); removeEventListener('keyup', ku);
      removeEventListener('mousemove', mmv); removeEventListener('mousedown', mdn); removeEventListener('mouseup', mup);
      AEV.forEach(n => removeEventListener(n, initAudio)); document.exitPointerLock?.(); renderer.dispose(); renderer.domElement.remove();
    };
  }, []);

  return (
    <div className="game" ref={root}>
      <div className="hud"><span>👥 বেঁচে আছে: {hud.alive}</span><span>🎯 কিল: {hud.kills}</span></div>
      <div className="cross" />
      <div className="hpbar"><div style={{ width: hud.hp + '%' }} /></div>
      <div className="stickbase" ref={base}><div className="stickknob" ref={knob} /></div>
      <div className="firebtn">🔫</div>
      <div className="runbtn">🏃</div>
      <button className="mute" onClick={() => { const v = !snd; setSnd(v); setMute(!v); }}>{snd ? '🔊' : '🔇'}</button>
      {hud.over && (
        <div className="over">
          {hud.over === 'win' ? '🏆 WINNER WINNER!' : '💀 আপনি হেরে গেছেন'}
          <div style={{ fontSize: '1.2rem' }}>কিল: {hud.kills}</div>
          <button className="btn" onClick={() => location.reload()}>আবার খেলুন</button>
          <Link href="/" className="btn" style={{ background: '#444', boxShadow: '0 6px 0 #222' }}>হোম</Link>
        </div>
      )}
    </div>
  );
}
