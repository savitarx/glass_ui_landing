import { useEffect, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer, MeshTransmissionMaterial } from "@react-three/drei";
import * as THREE from "three";

/* frame-rate-independent exponential damping */
function damp(cur: number, target: number, lambda: number, dt: number) {
  return THREE.MathUtils.lerp(cur, target, 1 - Math.exp(-lambda * dt));
}
/* piecewise keyframe across scroll progress p (0..1): a@0 · b@0.5 · c@1 */
function kf(p: number, a: number, b: number, c: number) {
  return p < 0.5
    ? THREE.MathUtils.lerp(a, b, p / 0.5)
    : THREE.MathUtils.lerp(b, c, (p - 0.5) / 0.5);
}

function Blob({ mobile }: { mobile: boolean }) {
  const group = useRef<THREE.Group>(null!);
  const mesh = useRef<THREE.Mesh>(null!);
  const scroll = useRef(0);
  const { pointer } = useThree();

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scroll.current = max > 0 ? window.scrollY / max : 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useFrame((_, dt) => {
    const p = scroll.current;
    // the floating sculpture's journey: top-left → centre (zoom in) → right
    const tx = kf(p, -3.0, 0.4, 3.1);
    const ty = kf(p, 1.7, 0.1, -1.0);
    const tz = kf(p, -1.6, 0.7, -0.5); // gentle zoom toward the camera mid-page
    const g = group.current;
    // damp toward target so it drifts like something floating underwater
    g.position.x = damp(g.position.x, tx, 1.5, dt);
    g.position.y = damp(g.position.y, ty, 1.5, dt);
    g.position.z = damp(g.position.z, tz, 1.5, dt);

    const m = mesh.current;
    // slow continuous rotation
    m.rotation.y += dt * 0.12;
    m.rotation.z += dt * 0.03;
    // very subtle cursor tilt (max ~3.5°)
    m.rotation.x = damp(m.rotation.x, pointer.y * 0.06, 2, dt);
    g.rotation.y = damp(g.rotation.y, pointer.x * 0.06, 2, dt);
  });

  return (
    <group ref={group}>
      <mesh ref={mesh} scale={mobile ? 1.5 : 2.15}>
        {/* smooth high-poly sphere → reads as a liquid glass droplet */}
        <icosahedronGeometry args={[1, 14]} />
        <MeshTransmissionMaterial
          samples={mobile ? 3 : 8}
          resolution={mobile ? 128 : 256}
          transmission={1}
          roughness={0.16}
          thickness={1.4}
          ior={1.34}
          chromaticAberration={0.05}
          distortion={0.35}
          distortionScale={0.4}
          temporalDistortion={0.08}
          clearcoat={1}
          clearcoatRoughness={0.1}
          attenuationDistance={2.6}
          attenuationColor="#eaf0ff"
          color="#eef2ff"
        />
      </mesh>
    </group>
  );
}

/**
 * Full-viewport WebGL layer holding a single translucent liquid-glass blob.
 * Fixed and pointer-events:none, sits BEHIND all UI (see .glass3d). A custom
 * Lightformer environment gives soft, muted reflections — no bright colours.
 */
export default function GlassBlob3D() {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const set = () => setMobile(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  return (
    <div className="glass3d" aria-hidden>
      <Canvas
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        dpr={mobile ? 1 : [1, 1.6]}
        camera={{ position: [0, 0, 6], fov: 34 }}
      >
        <ambientLight intensity={0.5} />
        {/* soft studio lighting → premium frosted-glass reflections */}
        <Environment resolution={mobile ? 128 : 256}>
          <group rotation={[0, 0, 1]}>
            <Lightformer form="rect" intensity={2} position={[-3, 2, 3]} scale={[4, 6, 1]} color="#d3e2ff" />
            <Lightformer form="rect" intensity={1.4} position={[3, -2, 2]} scale={[5, 4, 1]} color="#ded6ff" />
            <Lightformer form="circle" intensity={2.2} position={[0, 3, -2]} scale={4} color="#ffffff" />
            <Lightformer form="rect" intensity={1.1} position={[0, -3, 1]} scale={[6, 3, 1]} color="#eef1ff" />
          </group>
        </Environment>
        <Blob mobile={mobile} />
      </Canvas>
    </div>
  );
}
