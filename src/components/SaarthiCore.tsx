import { useMemo, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';
import { CORE_STATE_META, type CoreState } from '@/types/core';

interface CoreProps {
  state?: CoreState;
  size?: number;
  interactive?: boolean;
  showStars?: boolean;
}

function CoreSphere({ state, interactive }: { state: CoreState; interactive: boolean }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const innerRef = useRef<THREE.Mesh>(null);
  const meta = CORE_STATE_META[state];

  const color = new THREE.Color(meta.color);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.3;
      meshRef.current.rotation.x = Math.sin(t * 0.4) * 0.15;
      const scalePulse = 1 + Math.sin(t * 1.5) * 0.03;
      meshRef.current.scale.setScalar(scalePulse);
    }
    if (innerRef.current) {
      innerRef.current.rotation.y -= delta * 0.6;
      innerRef.current.rotation.z += delta * 0.2;
    }
  });

  const speed = state === 'idle' ? 1 : 2.5;

  return (
    <group>
      <Float speed={speed} rotationIntensity={interactive ? 0.5 : 0.3} floatIntensity={0.6}>
        {/* Outer wireframe sphere */}
        <mesh ref={meshRef}>
          <icosahedronGeometry args={[1.4, 2]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.6}
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>

        {/* Inner solid core */}
        <mesh ref={innerRef} scale={0.85}>
          <icosahedronGeometry args={[1.4, 1]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.9}
            roughness={0.2}
            metalness={0.8}
            transparent
            opacity={0.35}
          />
        </mesh>

        {/* Glow halo */}
        <mesh scale={1.7}>
          <sphereGeometry args={[1.4, 32, 32]} />
          <meshBasicMaterial color={color} transparent opacity={0.06} side={THREE.BackSide} />
        </mesh>
      </Float>
    </group>
  );
}

function OrbitRing({
  radius,
  tilt,
  color,
  speed,
  particles,
}: {
  radius: number;
  tilt: [number, number, number];
  color: string;
  speed: number;
  particles: number;
}) {
  const groupRef = useRef<THREE.Group>(null);

  const particlePositions = useMemo(() => {
    const arr: THREE.Vector3[] = [];
    for (let i = 0; i < particles; i++) {
      const angle = (i / particles) * Math.PI * 2;
      arr.push(
        new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius),
      );
    }
    return arr;
  }, [radius, particles]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.z += delta * speed;
  });

  return (
    <group rotation={tilt}>
      <group ref={groupRef}>
        {/* Ring line */}
        <mesh>
          <torusGeometry args={[radius, 0.008, 8, 100]} />
          <meshBasicMaterial color={color} transparent opacity={0.4} />
        </mesh>
        {/* Orbiting particles */}
        {particlePositions.map((p, i) => (
          <mesh key={i} position={p}>
            <sphereGeometry args={[0.03, 8, 8]} />
            <meshBasicMaterial color={color} />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function NeuralConnections({ state }: { state: CoreState }) {
  const meta = CORE_STATE_META[state];
  const color = new THREE.Color(meta.color);
  const ref = useRef<THREE.LineSegments>(null);

  const { positions, linePositions } = useMemo(() => {
    const pts: THREE.Vector3[] = [];
    const lines: number[] = [];
    const count = 14;
    for (let i = 0; i < count; i++) {
      const phi = Math.acos(1 - (2 * (i + 0.5)) / count);
      const theta = Math.PI * (1 + Math.sqrt(5)) * i;
      const r = 1.55;
      pts.push(
        new THREE.Vector3(
          r * Math.cos(theta) * Math.sin(phi),
          r * Math.sin(theta) * Math.sin(phi),
          r * Math.cos(phi),
        ),
      );
    }
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        if (pts[i].distanceTo(pts[j]) < 2.1) {
          lines.push(pts[i].x, pts[i].y, pts[i].z, pts[j].x, pts[j].y, pts[j].z);
        }
      }
    }
    return { positions: pts, linePositions: Float32Array.from(lines) };
  }, []);

  useFrame((_, delta) => {
    if (ref.current) ref.current.rotation.y += delta * 0.15;
  });

  const geo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
    return g;
  }, [linePositions]);

  return (
    <group ref={ref as unknown as React.RefObject<THREE.Group>}>
      <lineSegments geometry={geo}>
        <lineBasicMaterial color={color} transparent opacity={0.25} />
      </lineSegments>
      {positions.map((p, i) => (
        <mesh key={i} position={p}>
          <sphereGeometry args={[0.04, 8, 8]} />
          <meshBasicMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

function Scene({ state, interactive, showStars }: { state: CoreState; interactive: boolean; showStars: boolean }) {
  const meta = CORE_STATE_META[state];

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[5, 5, 5]} intensity={1} color={meta.color} />
      <pointLight position={[-5, -3, -5]} intensity={0.6} color={meta.color} />
      <CoreSphere state={state} interactive={interactive} />
      <NeuralConnections state={state} />
      <OrbitRing radius={2.2} tilt={[Math.PI / 3, 0, 0]} color={meta.color} speed={0.4} particles={8} />
      <OrbitRing radius={2.6} tilt={[Math.PI / 2.5, Math.PI / 4, 0]} color={meta.color} speed={-0.3} particles={6} />
      <OrbitRing radius={3.0} tilt={[Math.PI / 2, 0, Math.PI / 6]} color={meta.color} speed={0.2} particles={5} />
      {showStars && (
        <Stars radius={50} depth={30} count={1200} factor={3} saturation={0} fade speed={0.5} />
      )}
    </>
  );
}

export default function SaarthiCore({
  state = 'idle',
  size = 320,
  interactive = true,
  showStars = true,
}: CoreProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className="relative"
      role="img"
      aria-label={`SAARTHI Core in ${state} state`}
    >
      <Canvas
        camera={{ position: [0, 0, 7], fov: 45 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true }}
      >
        <Suspense fallback={null}>
          <Scene state={state} interactive={interactive} showStars={showStars} />
        </Suspense>
      </Canvas>
    </div>
  );
}
