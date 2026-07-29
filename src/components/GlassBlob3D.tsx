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
        {/* detail 14 was ~1M triangles for a shape that is always soft and
            half-hidden behind frosted glass; 6 is visually identical here */}
        <icosahedronGeometry args={[1, 6]} />
        <MeshTransmissionMaterial
          /* `samples` is the dominant cost — each one is another pass over the
             transmission buffer. 2 is plenty at this blur/scale. */
          samples={2}
          resolution={128}
          transmission={1}
          roughness={0.16}
          thickness={1.4}
          ior={1.34}
          chromaticAberration={0.04}
          /* distortion/temporalDistortion run noise per-pixel every frame —
             dropped entirely, the refraction still reads as glass */
          distortion={0}
          distortionScale={0}
          temporalDistortion={0}
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
/**
 * Drives the render loop at a capped ~30fps instead of letting R3F render
 * continuously at 60. Transmission is a multi-pass material, so halving the
 * frame rate roughly halves its GPU cost — and at this size and blur the
 * difference is invisible. Rendering also stops entirely when the tab is
 * hidden, so a backgrounded tab costs nothing.
 */
function ThrottledLoop({ fps = 30 }: { fps?: number }) {
  const { invalidate } = useThree();
  useEffect(() => {
    let timer = 0;
    let stopped = false;
    const step = () => {
      if (stopped) return;
      if (!document.hidden) invalidate();
      timer = window.setTimeout(step, 1000 / fps);
    };
    step();
    const onVis = () => {
      if (!document.hidden) invalidate();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [invalidate, fps]);
  return null;
}

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
        /* on-demand: nothing renders unless we explicitly invalidate() */
        frameloop="demand"
        gl={{
          antialias: false, // the blob is soft-edged; MSAA is wasted cost here
          alpha: true,
          powerPreference: "low-power",
          stencil: false,
          depth: true,
        }}
        /* transmission cost scales with pixel count — never go above 1x */
        dpr={1}
        camera={{ position: [0, 0, 6], fov: 34 }}
      >
        <ambientLight intensity={0.5} />
        {/* baked once (frames={1}) rather than re-rendered every frame */}
        <Environment resolution={64} frames={1}>
          <group rotation={[0, 0, 1]}>
            <Lightformer form="rect" intensity={2} position={[-3, 2, 3]} scale={[4, 6, 1]} color="#d3e2ff" />
            <Lightformer form="rect" intensity={1.4} position={[3, -2, 2]} scale={[5, 4, 1]} color="#ded6ff" />
            <Lightformer form="circle" intensity={2.2} position={[0, 3, -2]} scale={4} color="#ffffff" />
            <Lightformer form="rect" intensity={1.1} position={[0, -3, 1]} scale={[6, 3, 1]} color="#eef1ff" />
          </group>
        </Environment>
        <Blob mobile={mobile} />
        <ThrottledLoop fps={30} />
      </Canvas>
    </div>
  );
}
