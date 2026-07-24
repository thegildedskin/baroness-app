"use client";

// The Estate Ball (SPEC_3d_quarters_glb Goal 4, first pass) — a grand candlelit
// hall you can stroll through, populated with the court's GLB avatars as guests.
// Single-player for now; real-time presence is a later backend phase. Reuses the
// walk controls + Draco loader from the rest of the 3D suite.

import { Canvas, useFrame, useThree, useLoader } from "@react-three/fiber";
import { GLTFLoader, setupDracoLoader } from "@/lib/gltf";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { Component, Suspense, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import * as THREE from "three";

const GOLD_PALE = "#f1dc97";
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

type Guest = { id: string; displayName: string; package: string };

class LoadBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Hall
// ---------------------------------------------------------------------------
function Column({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 2.5, 0]} castShadow>
        <cylinderGeometry args={[0.32, 0.36, 5, 20]} />
        <meshStandardMaterial color="#2a2018" roughness={0.8} metalness={0.15} />
      </mesh>
      {/* gilt capital + base */}
      <mesh position={[0, 5.05, 0]}>
        <cylinderGeometry args={[0.44, 0.34, 0.3, 20]} />
        <meshStandardMaterial color="#8B6F35" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.42, 0.46, 0.3, 20]} />
        <meshStandardMaterial color="#8B6F35" metalness={0.6} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Chandelier({ z }: { z: number }) {
  return (
    <group position={[0, 4.7, z]}>
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshStandardMaterial color={GOLD_PALE} emissive={"#ffcf8a"} emissiveIntensity={1.4} metalness={0.5} roughness={0.3} />
      </mesh>
      <pointLight intensity={16} distance={16} decay={2} color="#ffcf8a" castShadow={false} />
    </group>
  );
}

function Hall() {
  return (
    <group>
      {/* marble floor with a gilt aisle inlay */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[12, 18]} />
        <meshStandardMaterial color="#1c1712" roughness={0.4} metalness={0.25} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, -4]}>
        <planeGeometry args={[2, 16]} />
        <meshStandardMaterial color="#3a2c18" roughness={0.5} metalness={0.3} emissive="#5a4420" emissiveIntensity={0.25} />
      </mesh>
      {/* back wall + side walls */}
      <mesh position={[0, 3, -12]} receiveShadow>
        <planeGeometry args={[12, 6]} />
        <meshStandardMaterial color="#191320" roughness={1} />
      </mesh>
      <mesh position={[-6, 3, -4]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[18, 6]} />
        <meshStandardMaterial color="#171019" roughness={1} />
      </mesh>
      <mesh position={[6, 3, -4]} rotation-y={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[18, 6]} />
        <meshStandardMaterial color="#171019" roughness={1} />
      </mesh>
      {/* dais at the head of the hall */}
      <mesh position={[0, 0.15, -11]} receiveShadow castShadow>
        <boxGeometry args={[6, 0.3, 1.6]} />
        <meshStandardMaterial color="#241a12" roughness={0.7} metalness={0.2} />
      </mesh>
      {/* columns down both sides */}
      {[-1, -4, -7, -10].map((z) => (
        <group key={z}>
          <Column x={-4.7} z={z} />
          <Column x={4.7} z={z} />
        </group>
      ))}
      {/* chandeliers */}
      <Chandelier z={-2} />
      <Chandelier z={-7} />
    </group>
  );
}

// ---------------------------------------------------------------------------
// Guests (court GLB avatars via the CORS proxy + Draco loader)
// ---------------------------------------------------------------------------
function Avatar({ url, yaw }: { url: string; yaw: number }) {
  const gltf = useLoader(GLTFLoader, url, setupDracoLoader);
  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) m.castShadow = true;
    });
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 1.8 / maxDim; // guest ~1.8m tall
    root.scale.setScalar(scale);
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    return root;
  }, [gltf]);
  return (
    <group rotation-y={yaw}>
      <primitive object={scene} />
    </group>
  );
}

function GuestSpot({ url, x, z, yaw }: { url: string; x: number; z: number; yaw: number }) {
  return (
    <group position={[x, 0, z]}>
      {/* pedestal disc + contact shadow (also the poster-frame while the GLB streams) */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0]}>
        <circleGeometry args={[0.5, 28]} />
        <meshStandardMaterial color="#20180f" roughness={0.6} metalness={0.3} />
      </mesh>
      <LoadBoundary fallback={null}>
        <Suspense fallback={null}>
          <Avatar url={url} yaw={yaw} />
        </Suspense>
      </LoadBoundary>
    </group>
  );
}

// ---------------------------------------------------------------------------
// Camera modes
// ---------------------------------------------------------------------------
function ViewControls({ active }: { active: boolean }) {
  const { camera, gl } = useThree();
  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl]);
  useEffect(() => {
    controls.enabled = active;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.autoRotate = active;
    controls.autoRotateSpeed = 0.35;
    controls.minDistance = 4;
    controls.maxDistance = 13;
    controls.minPolarAngle = Math.PI * 0.15;
    controls.maxPolarAngle = Math.PI * 0.52;
    controls.target.set(0, 1.3, -4.5);
    controls.update();
    return () => controls.dispose();
  }, [controls, active]);
  useFrame(() => {
    if (active) controls.update();
  });
  return null;
}

function CameraRig({ mode }: { mode: "view" | "walk" }) {
  const { camera } = useThree();
  useEffect(() => {
    if (mode === "view") {
      camera.position.set(0, 3.6, 6.5);
      camera.lookAt(0, 1.3, -4.5);
    }
  }, [mode, camera]);
  return null;
}

function WalkControls({
  active,
  onExit,
  onLockChange,
}: {
  active: boolean;
  onExit: () => void;
  onLockChange: (locked: boolean) => void;
}) {
  const { camera, gl } = useThree();
  const controls = useMemo(() => new PointerLockControls(camera, gl.domElement), [camera, gl]);
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    if (!active) return;
    camera.position.set(0, 1.6, 2.5);
    camera.lookAt(0, 1.6, -4);
    const moveCodes = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
    const onDown = (e: KeyboardEvent) => { if (moveCodes.has(e.code)) { keys.current[e.code] = true; e.preventDefault(); } };
    const onUp = (e: KeyboardEvent) => { keys.current[e.code] = false; };
    const onClick = () => { if (!controls.isLocked) controls.lock(); };
    const onLock = () => onLockChange(true);
    const onUnlock = () => { onLockChange(false); onExit(); };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    gl.domElement.addEventListener("click", onClick);
    controls.addEventListener("lock", onLock);
    controls.addEventListener("unlock", onUnlock);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
      gl.domElement.removeEventListener("click", onClick);
      controls.removeEventListener("lock", onLock);
      controls.removeEventListener("unlock", onUnlock);
      keys.current = {};
      if (controls.isLocked) controls.unlock();
    };
  }, [active, controls, camera, gl, onExit, onLockChange]);
  useFrame((_, dt) => {
    if (!active || !controls.isLocked) return;
    const step = 3 * Math.min(dt, 0.05);
    const k = keys.current;
    if (k["KeyW"] || k["ArrowUp"]) controls.moveForward(step);
    if (k["KeyS"] || k["ArrowDown"]) controls.moveForward(-step);
    if (k["KeyA"] || k["ArrowLeft"]) controls.moveRight(-step);
    if (k["KeyD"] || k["ArrowRight"]) controls.moveRight(step);
    camera.position.x = clamp(camera.position.x, -5.2, 5.2);
    camera.position.z = clamp(camera.position.z, -10.5, 3);
    camera.position.y = 1.6;
  });
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function EstateBall() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"view" | "walk">("view");
  const [walkLocked, setWalkLocked] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/meshy/models");
        const json = await res.json();
        if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
        setGuests((json.models || []).slice(0, 10));
      } catch (e: any) {
        setError(e?.message || "Failed to summon the guests");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // arrange guests down both sides of the aisle, facing inward
  const spots = useMemo(() => {
    const zs = [-1.5, -3.5, -5.5, -7.5, -9.2];
    return guests.map((g, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const row = Math.floor(i / 2);
      return { g, x: side * 3.6, z: zs[row % zs.length], yaw: side < 0 ? Math.PI / 2 : -Math.PI / 2 };
    });
  }, [guests]);

  return (
    <div style={{ maxWidth: "var(--panel-max)", margin: "0 auto", padding: "var(--space-9) var(--space-8) var(--space-12)" }}>
      {/* header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16, flexWrap: "wrap", marginBottom: "var(--space-6)" }}>
        <div>
          <div style={{ fontFamily: "var(--caps)", fontSize: "var(--text-label-sm)", letterSpacing: "var(--track-caps-wide)", textTransform: "uppercase", color: "var(--gold)" }}>
            The Kingdom · A Soirée in Your Honour
          </div>
          <h1 style={{ margin: "6px 0 0", fontFamily: "var(--display)", fontWeight: 700 as unknown as number, fontSize: "var(--text-hero)", lineHeight: "var(--leading-tight)", color: "var(--cream)" }}>
            The Estate Ball
          </h1>
          <p style={{ margin: "6px 0 0", fontFamily: "var(--body)", fontSize: "var(--text-body)", color: "var(--quarter-muted)" }}>
            {error
              ? "The hall stands ready, though the guests tarry."
              : loading
              ? "The doors are opening; the court assembles…"
              : `The court is assembled — ${guests.length} in attendance. Take a turn about the room.`}
          </p>
        </div>
        <button
          style={{ fontFamily: "var(--caps)", letterSpacing: "var(--track-caps)", textTransform: "uppercase", fontSize: "var(--text-label)", color: "var(--black)", background: "var(--gilt)", border: "var(--border-gold-dark)", padding: "var(--pad-btn-sm)", borderRadius: "var(--radius-xs)", cursor: "pointer", whiteSpace: "nowrap" }}
          onClick={() => setMode((m) => (m === "walk" ? "view" : "walk"))}
        >
          {mode === "walk" ? "Take Your Seat" : "Enter the Ball"}
        </button>
      </div>

      {/* stage */}
      <div
        style={{
          position: "relative",
          height: "min(70vh, 620px)",
          borderRadius: "var(--radius-xl)",
          overflow: "hidden",
          background: "radial-gradient(120% 90% at 50% 12%, #241a12 0%, var(--estate-black) 74%)",
          border: "1px solid var(--gold)",
          boxShadow: "var(--frame-inset), var(--glow-gold)",
          cursor: mode === "walk" ? "pointer" : "grab",
          touchAction: "none",
        }}
      >
        <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", background: "radial-gradient(60% 44% at 50% 16%, rgba(255,200,110,.16), rgba(255,200,110,0) 72%)" }} />
        <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", boxShadow: "var(--vignette)" }} />
        {mode === "walk" && !walkLocked && (
          <div style={{ position: "absolute", inset: 0, zIndex: 6, display: "grid", placeItems: "center", pointerEvents: "none", fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: GOLD_PALE, textAlign: "center", padding: 20, textShadow: "0 2px 12px rgba(0,0,0,.85)" }}>
            Click to look around · W A S D to walk the hall · Esc to be seated
          </div>
        )}
        {(loading || error) && (
          <div style={{ position: "absolute", inset: 0, zIndex: 5, display: "grid", placeItems: "center", pointerEvents: "none", fontFamily: "var(--caps)", fontSize: 12, letterSpacing: "var(--track-caps)", textTransform: "uppercase", color: GOLD_PALE, textAlign: "center", padding: 20 }}>
            {error ? "The guests could not be summoned — the hall awaits." : "Lighting the candelabra…"}
          </div>
        )}

        <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3.6, 6.5], fov: 40 }} style={{ position: "relative", zIndex: 2 }}>
          <fog attach="fog" args={["#0c0a08", 10, 26]} />
          <ambientLight intensity={0.4} color="#ffe6c0" />
          <directionalLight castShadow position={[4, 8, 5]} intensity={1.3} color="#ffb06a" shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
          <directionalLight position={[-5, 4, -6]} intensity={0.7} color={GOLD_PALE} />

          <Hall />
          {spots.map(({ g, x, z, yaw }) => (
            <GuestSpot key={g.id} url={`/api/meshy/model/${g.id}`} x={x} z={z} yaw={yaw} />
          ))}

          <CameraRig mode={mode} />
          <ViewControls active={mode === "view"} />
          <WalkControls active={mode === "walk"} onExit={() => setMode("view")} onLockChange={setWalkLocked} />
        </Canvas>
      </div>

      <p style={{ marginTop: "var(--space-6)", textAlign: "center", fontFamily: "var(--body)", fontStyle: "italic", fontSize: "var(--text-fine)", color: "var(--quarter-muted)" }}>
        ❧ The court you see are the house’s own figures. In time, guests will arrive wearing designs of their own — and you among them.
      </p>
    </div>
  );
}
