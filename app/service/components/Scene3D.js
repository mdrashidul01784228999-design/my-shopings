"use client";
import { Canvas } from "@react-three/fiber";
import { Float, MeshDistortMaterial, OrbitControls, Environment } from "@react-three/drei";

function Core() {
  return (
    <Float speed={2} rotationIntensity={1.2} floatIntensity={1.5}>
      <mesh>
        <icosahedronGeometry args={[1.5, 8]} />
        <MeshDistortMaterial color="#2dd4bf" distort={0.38} speed={2} roughness={0.15} metalness={0.8} />
      </mesh>
      <mesh rotation={[1.2, 0.3, 0]}>
        <torusGeometry args={[2.3, 0.05, 16, 120]} />
        <meshStandardMaterial color="#f5b53d" metalness={1} roughness={0.2} emissive="#f5b53d" emissiveIntensity={0.4} />
      </mesh>
      <mesh rotation={[0.4, 1.1, 0.6]}>
        <torusGeometry args={[2.7, 0.03, 16, 120]} />
        <meshStandardMaterial color="#e8f0f2" metalness={1} roughness={0.3} />
      </mesh>
    </Float>
  );
}

export default function Scene3D() {
  return (
    <Canvas camera={{ position: [0, 0, 6.5], fov: 45 }} dpr={[1, 1.6]} aria-hidden="true">
      <ambientLight intensity={0.5} />
      <directionalLight position={[4, 5, 3]} intensity={2} />
      <pointLight position={[-4, -2, 2]} color="#f5b53d" intensity={30} />
      <Core />
      <Environment preset="city" />
      <OrbitControls enableZoom={false} enablePan={false} autoRotate autoRotateSpeed={1.2} />
    </Canvas>
  );
}
