"use client";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Environment, Lightformer, Sparkles } from "@react-three/drei";

function Core() {
  return (
    <Float speed={2} rotationIntensity={1} floatIntensity={1.4}>
      <mesh>
        <icosahedronGeometry args={[1.45, 8]} />
        <MeshDistortMaterial color="#2dd4bf" distort={0.36} speed={2} roughness={0.12} metalness={0.85} />
      </mesh>
      <mesh rotation={[1.2, 0.3, 0]}>
        <torusGeometry args={[2.3, 0.05, 16, 140]} />
        <meshStandardMaterial color="#f5b53d" metalness={1} roughness={0.2} emissive="#f5b53d" emissiveIntensity={0.5} />
      </mesh>
      <mesh rotation={[0.4, 1.1, 0.6]}>
        <torusGeometry args={[2.75, 0.03, 16, 140]} />
        <meshStandardMaterial color="#e8f0f2" metalness={1} roughness={0.3} />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }} dpr={[1, 1.6]} gl={{ alpha: true, antialias: true }} style={{ touchAction: "pan-y" }} aria-hidden="true">
      <ambientLight intensity={0.4} />
      <directionalLight position={[4, 5, 3]} intensity={2} />
      <pointLight position={[-4, -2, 2]} color="#f5b53d" intensity={30} />
      <Core />
      <Sparkles count={40} scale={7} size={2.2} speed={0.4} color="#7cf0de" />
      {/* লোকাল এনভায়রনমেন্ট — বাইরের কোনো ফাইল লোড হয় না, তাই Vercel/অফলাইনে ক্র্যাশ করে না */}
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={4} position={[0, 5, -6]} scale={[10, 4, 1]} />
        <Lightformer form="rect" intensity={2} color="#f5b53d" position={[-5, 1, 2]} scale={[3, 5, 1]} />
        <Lightformer form="ring" intensity={3} color="#2dd4bf" position={[4, 0, 3]} scale={3} />
      </Environment>
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}
