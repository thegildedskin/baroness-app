"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createClient } from "@/lib/supabase/client";

type Keys = Record<string, boolean>;
type Cam = { yaw: number; pitch: number };

const ROOMS = [
  { key: "foyer", label: "Grand Foyer", wall: "#a9c4d4", photo: "/rooms/foyer.jpg", page: "/", floor: "marble", rug: "#3a5673" },
  { key: "artists", label: "Portrait Salon", wall: "#a6c1d2", photo: "/rooms/gallery-hall.jpg", page: "/#artists", floor: "marble", rug: "#34506e" },
  { key: "gallery", label: "The Gallery", wall: "#9fbccf", photo: "/rooms/gallery.jpg", page: "/#gallery", floor: "marble", rug: "#2b3a4a" },
  { key: "boutique", label: "Boudoir", wall: "#ccb2c3", photo: "/rooms/boudoir.jpg", page: "/#boutique", floor: "wood", rug: "#9c6b72" },
  { key: "salon", label: "Drawing Room", wall: "#aac6d1", photo: "/rooms/salon.jpg", page: "/#salon", floor: "wood", rug: "#2f6b58" },
  { key: "booking", label: "Writing Parlor", wall: "#b2cad9", photo: "/rooms/parlor.jpg", page: "/#booking", floor: "wood", rug: "#1f3a52" },
];

// ---- procedural textures (no external assets) ----
function marbleTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 512; const x = c.getContext("2d")!;
  x.fillStyle = "#efe9df"; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 26; i++) {
    x.strokeStyle = `rgba(120,124,134,${0.10 + Math.random() * 0.18})`; x.lineWidth = 0.5 + Math.random() * 2.2;
    x.beginPath(); let px = Math.random() * 512, py = Math.random() * 512; x.moveTo(px, py);
    for (let j = 0; j < 7; j++) { px += (Math.random() - 0.5) * 160; py += (Math.random() - 0.5) * 160; x.lineTo(px, py); } x.stroke();
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(3, 3); return t;
}
function woodTexture() {
  const c = document.createElement("canvas"); c.width = c.height = 512; const x = c.getContext("2d")!;
  x.fillStyle = "#5a3d28"; x.fillRect(0, 0, 512, 512);
  for (let i = 0; i < 512; i += 6) {
    x.fillStyle = `rgba(${60 + Math.random() * 40},${40 + Math.random() * 26},${24 + Math.random() * 16},0.5)`;
    x.fillRect(0, i + Math.sin(i) * 2, 512, 3 + Math.random() * 2);
  }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(4, 4); return t;
}

function Chandelier3D() {
  return (
    <group position={[0, 5.2, 0]}>
      <mesh><sphereGeometry args={[0.35, 16, 16]} /><meshStandardMaterial color="#caa24e" emissive="#ffcf7a" emissiveIntensity={0.7} /></mesh>
      {[0, 1, 2, 3, 4, 5].map((i) => {
        const a = (i / 6) * Math.PI * 2;
        return <mesh key={i} position={[Math.cos(a) * 0.9, -0.3, Math.sin(a) * 0.9]}><sphereGeometry args={[0.12, 10, 10]} /><meshStandardMaterial color="#fff3c4" emissive="#ffdd88" emissiveIntensity={1.4} /></mesh>;
      })}
    </group>
  );
}
function Rug({ color }: { color: string }) { return <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[9, 6]} /><meshStandardMaterial color={color} roughness={0.95} /></mesh>; }
function Sofa({ position, rot = 0, color }: { position: [number, number, number]; rot?: number; color: string }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[3, 0.6, 1.2]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
    <mesh position={[0, 1.1, -0.5]} castShadow><boxGeometry args={[3, 1, 0.3]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
    <mesh position={[-1.45, 0.9, 0]} castShadow><boxGeometry args={[0.3, 0.9, 1.2]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
    <mesh position={[1.45, 0.9, 0]} castShadow><boxGeometry args={[0.3, 0.9, 1.2]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
    {/* gilt feet */}
    {[[-1.4, -0.5], [1.4, -0.5], [-1.4, 0.5], [1.4, 0.5]].map((p, i) => <mesh key={i} position={[p[0], 0.1, p[1]]}><cylinderGeometry args={[0.08, 0.08, 0.2, 8]} /><meshStandardMaterial color="#caa24e" metalness={0.6} roughness={0.3} /></mesh>)}
  </group>);
}
function Table({ position, r = 0.9 }: { position: [number, number, number]; r?: number }) {
  return (<group position={position}>
    <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[r, r, 0.12, 24]} /><meshStandardMaterial color="#caa24e" metalness={0.5} roughness={0.25} /></mesh>
    <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.12, 0.12, 1, 12]} /><meshStandardMaterial color="#8b6f35" metalness={0.4} /></mesh>
  </group>);
}
function Bookshelf({ position, rot = 0, tex }: { position: [number, number, number]; rot?: number; tex: THREE.Texture | null }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[3, 4, 0.6]} /><meshStandardMaterial map={tex || undefined} color={tex ? "#ffffff" : "#4a3324"} /></mesh>
    {[1, 2, 3].map((i) => <mesh key={"b" + i} position={[0, i + 0.8, 0.2]}><boxGeometry args={[2.4, 0.5, 0.2]} /><meshStandardMaterial color={["#7a2d3a", "#3a5673", "#6f8a7e"][i - 1]} /></mesh>)}
  </group>);
}
function Fireplace({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 1.4, 0]}><boxGeometry args={[3, 2.8, 0.6]} /><meshStandardMaterial color="#cfc7bd" roughness={0.7} /></mesh>
    <mesh position={[0, 1.1, 0.31]}><boxGeometry args={[1.6, 1.6, 0.2]} /><meshStandardMaterial color="#1a1410" /></mesh>
    <mesh position={[0, 0.9, 0.42]}><planeGeometry args={[1.3, 1.1]} /><meshStandardMaterial color="#ff9a3c" emissive="#ff7a18" emissiveIntensity={1.4} /></mesh>
    <pointLight position={[0, 1, 1]} intensity={6} distance={8} color="#ff8a3c" />
  </group>);
}
function FramedArt({ position, rot = 0, color }: { position: [number, number, number]; rot?: number; color: string }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh><boxGeometry args={[1.8, 2.4, 0.1]} /><meshStandardMaterial color="#caa24e" metalness={0.5} roughness={0.3} /></mesh>
    <mesh position={[0, 0, 0.06]}><planeGeometry args={[1.5, 2.1]} /><meshStandardMaterial color={color} /></mesh>
  </group>);
}
function Vanity({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[2, 1.6, 0.6]} /><meshStandardMaterial color="#caa24e" metalness={0.4} roughness={0.3} /></mesh>
    <mesh position={[0, 2.6, 0]}><boxGeometry args={[1.4, 1.8, 0.1]} /><meshStandardMaterial color="#dfeaf0" metalness={0.7} roughness={0.08} /></mesh>
  </group>);
}
function Chaise({ position, rot = 0, color }: { position: [number, number, number]; rot?: number; color: string }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[3.2, 0.5, 1.1]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
    <mesh position={[-1.4, 1, 0]} castShadow><boxGeometry args={[0.4, 1.4, 1.1]} /><meshStandardMaterial color={color} roughness={0.85} /></mesh>
  </group>);
}
// ---- windows & doors ----
function WindowPane({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh><boxGeometry args={[2.7, 3.6, 0.18]} /><meshStandardMaterial color="#caa24e" metalness={0.5} roughness={0.3} /></mesh>
    <mesh position={[0, 0, 0.05]}><planeGeometry args={[2.2, 3.1]} /><meshStandardMaterial color="#bcd6e8" emissive="#a8cce6" emissiveIntensity={0.6} transparent opacity={0.72} /></mesh>
    <mesh position={[0, 0, 0.08]}><boxGeometry args={[0.07, 3.1, 0.06]} /><meshStandardMaterial color="#caa24e" /></mesh>
    <mesh position={[0, 0, 0.08]}><boxGeometry args={[2.2, 0.07, 0.06]} /><meshStandardMaterial color="#caa24e" /></mesh>
    <mesh position={[0, 1.95, 0.02]}><boxGeometry args={[2.9, 0.4, 0.16]} /><meshStandardMaterial color="#caa24e" metalness={0.5} roughness={0.3} /></mesh>
  </group>);
}
function DoorWay({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 2.2, 0]}><boxGeometry args={[3.4, 4.6, 0.22]} /><meshStandardMaterial color="#caa24e" metalness={0.5} roughness={0.3} /></mesh>
    <mesh position={[-0.82, 2, 0.13]} castShadow><boxGeometry args={[1.32, 3.9, 0.08]} /><meshStandardMaterial color="#3a2a1c" roughness={0.6} /></mesh>
    <mesh position={[0.82, 2, 0.13]} castShadow><boxGeometry args={[1.32, 3.9, 0.08]} /><meshStandardMaterial color="#3a2a1c" roughness={0.6} /></mesh>
    <mesh position={[-0.12, 2, 0.2]}><sphereGeometry args={[0.09, 10, 10]} /><meshStandardMaterial color="#e8cf86" metalness={0.7} roughness={0.2} /></mesh>
    <mesh position={[0.12, 2, 0.2]}><sphereGeometry args={[0.09, 10, 10]} /><meshStandardMaterial color="#e8cf86" metalness={0.7} roughness={0.2} /></mesh>
  </group>);
}

function Furniture({ kind, wood }: { kind: string; wood: THREE.Texture | null }) {
  if (kind === "salon") return <><Sofa position={[0, 0, -2]} color="#2f6b58" /><Table position={[0, 0, 1]} /><Bookshelf position={[-8.6, 0, 0]} rot={Math.PI / 2} tex={wood} /><Fireplace position={[8.6, 0, 0]} rot={-Math.PI / 2} /></>;
  if (kind === "booking") return <><Table position={[0, 0, -1]} r={1.4} /><Bookshelf position={[-8.6, 0, 2.5]} rot={Math.PI / 2} tex={wood} /><Bookshelf position={[-8.6, 0, -2.5]} rot={Math.PI / 2} tex={wood} /><Fireplace position={[8.6, 0, 0]} rot={-Math.PI / 2} /></>;
  if (kind === "boutique") return <><Vanity position={[0, 0, -8.4]} /><Chaise position={[3, 0, 2]} rot={-0.4} color="#c8959a" /><Table position={[-3, 0, 2]} r={0.6} /></>;
  if (kind === "artists") return <><FramedArt position={[-9.6, 2.6, -3]} rot={Math.PI / 2} color="#5a6f8c" /><FramedArt position={[-9.6, 2.6, 3]} rot={Math.PI / 2} color="#7c5a86" /><FramedArt position={[9.6, 2.6, 0]} rot={-Math.PI / 2} color="#6f8a7e" /><Chaise position={[0, 0, 2]} color="#34506e" /></>;
  if (kind === "gallery") return <>{[-6, -2, 2, 6].map((z, i) => <FramedArt key={i} position={[-9.6, 2.6, z]} rot={Math.PI / 2} color={["#7c5a86", "#5a6f8c", "#9c6b72", "#6f8a7e"][i]} />)}{[-4, 0, 4].map((z, i) => <FramedArt key={"r" + i} position={[9.6, 2.6, z]} rot={-Math.PI / 2} color={["#caa24e", "#3a5673", "#7a2d3a"][i]} />)}</>;
  return <><Table position={[0, 0, 0]} r={1.3} />{[[-7, -7], [7, -7], [-7, 7], [7, 7]].map((p, i) => <mesh key={i} position={[p[0], 3, p[1]]}><cylinderGeometry args={[0.5, 0.6, 6, 16]} /><meshStandardMaterial color="#e6dcc6" roughness={0.6} /></mesh>)}</>;
}

function PhotoWall({ src, wall }: { src: string; wall: string }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => { let alive = true; new THREE.TextureLoader().load(src, (t) => { if (alive) setTex(t); }, undefined, () => {}); return () => { alive = false; }; }, [src]);
  return (<>
    <mesh position={[0, 3, -10]}><planeGeometry args={[20, 6]} /><meshStandardMaterial map={tex || undefined} color={tex ? "#ffffff" : wall} /></mesh>
    {/* same scene faintly on side walls for immersion */}
    <mesh position={[-9.9, 3, 0]} rotation={[0, Math.PI / 2, 0]}><planeGeometry args={[20, 6]} /><meshStandardMaterial map={tex || undefined} color={tex ? "#dfe7ee" : wall} opacity={0.5} transparent /></mesh>
    <mesh position={[9.9, 3, 0]} rotation={[0, -Math.PI / 2, 0]}><planeGeometry args={[20, 6]} /><meshStandardMaterial map={tex || undefined} color={tex ? "#dfe7ee" : wall} opacity={0.5} transparent /></mesh>
  </>);
}

function RoomShell({ wall, photo, floor }: { wall: string; photo: string; floor: string }) {
  const tex = useMemo(() => (floor === "wood" ? woodTexture() : marbleTexture()), [floor]);
  return (<group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial map={tex} color="#ffffff" roughness={floor === "wood" ? 0.7 : 0.35} metalness={floor === "wood" ? 0.05 : 0.2} /></mesh>
    <PhotoWall src={photo} wall={wall} />
    <mesh position={[0, 3, 10]} rotation={[0, Math.PI, 0]}><boxGeometry args={[20, 6, 0.4]} /><meshStandardMaterial color={wall} /></mesh>
    <mesh position={[-10, 3, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[20, 6, 0.4]} /><meshStandardMaterial color={wall} /></mesh>
    <mesh position={[10, 3, 0]} rotation={[0, -Math.PI / 2, 0]}><boxGeometry args={[20, 6, 0.4]} /><meshStandardMaterial color={wall} /></mesh>
    {/* gilt cornice */}
    <mesh position={[0, 5.9, 0]}><boxGeometry args={[20, 0.3, 20]} /><meshStandardMaterial color="#caa24e" metalness={0.4} roughness={0.4} /></mesh>
    {/* windows on the side walls */}
    <WindowPane position={[-9.8, 3.1, -5]} rot={Math.PI / 2} />
    <WindowPane position={[-9.8, 3.1, 5]} rot={Math.PI / 2} />
    <WindowPane position={[9.8, 3.1, -5]} rot={-Math.PI / 2} />
    <WindowPane position={[9.8, 3.1, 5]} rot={-Math.PI / 2} />
    {/* grand door on the front wall */}
    <DoorWay position={[0, 0, 9.78]} rot={Math.PI} />
    <Chandelier3D />
  </group>);
}

function Player({ keys, cam, rpmUrl }: { keys: MutableRefObject<Keys>; cam: MutableRefObject<Cam>; rpmUrl: string | null }) {
  const ref = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);
  useEffect(() => {
    if (!rpmUrl) return;
    let alive = true;
    new GLTFLoader().load(rpmUrl, (g) => { if (alive) { g.scene.traverse((o) => { o.castShadow = true; }); setModel(g.scene); } }, undefined, () => {});
    return () => { alive = false; };
  }, [rpmUrl]);
  useFrame((state, dt) => {
    const g = ref.current; if (!g) return;
    const k = keys.current; const c = cam.current; const step = Math.min(dt, 0.05);
    // arrow keys orbit the camera
    if (k["arrowleft"]) c.yaw += 1.6 * step;
    if (k["arrowright"]) c.yaw -= 1.6 * step;
    if (k["arrowup"]) c.pitch = Math.min(1.25, c.pitch + 1.2 * step);
    if (k["arrowdown"]) c.pitch = Math.max(0.08, c.pitch - 1.2 * step);
    // WASD walk, relative to camera yaw
    let f = 0, r = 0;
    if (k["w"]) f += 1; if (k["s"]) f -= 1; if (k["d"]) r += 1; if (k["a"]) r -= 1;
    if (f || r) {
      const fwdX = -Math.sin(c.yaw), fwdZ = -Math.cos(c.yaw), rgtX = Math.cos(c.yaw), rgtZ = -Math.sin(c.yaw);
      let mx = fwdX * f + rgtX * r, mz = fwdZ * f + rgtZ * r; const len = Math.hypot(mx, mz) || 1;
      const sp = 6 * step; g.position.x += (mx / len) * sp; g.position.z += (mz / len) * sp; g.rotation.y = Math.atan2(mx, mz);
    }
    const B = 8.6; g.position.x = Math.max(-B, Math.min(B, g.position.x)); g.position.z = Math.max(-B, Math.min(B, g.position.z));
    // camera follows on a yaw/pitch orbit
    const dist = 9.5; const cp = state.camera;
    const cx = g.position.x + Math.sin(c.yaw) * Math.cos(c.pitch) * dist;
    const cz = g.position.z + Math.cos(c.yaw) * Math.cos(c.pitch) * dist;
    const cy = 1.5 + Math.sin(c.pitch) * dist;
    cp.position.lerp(new THREE.Vector3(cx, cy, cz), 0.12); cp.lookAt(g.position.x, 1.5, g.position.z);
  });
  return (<group ref={ref} position={[0, 0, 5]}>
    {model ? <primitive object={model} /> : (<>
      <mesh position={[0, 1.1, 0]} castShadow><cylinderGeometry args={[0.4, 0.55, 1.5, 18]} /><meshStandardMaterial color="#9fbccf" /></mesh>
      <mesh position={[0, 2.05, 0]} castShadow><sphereGeometry args={[0.42, 22, 22]} /><meshStandardMaterial color="#f0c8a8" /></mesh>
      <mesh position={[0, 2.22, -0.04]}><sphereGeometry args={[0.45, 22, 22, 0, Math.PI * 2, 0, Math.PI / 1.7]} /><meshStandardMaterial color="#4a3324" /></mesh>
    </>)}
  </group>);
}

export default function Explore() {
  const keys = useRef<Keys>({});
  const cam = useRef<Cam>({ yaw: 0, pitch: 0.34 });
  const [rpmUrl, setRpmUrl] = useState<string | null>(null);
  const [roomKey, setRoomKey] = useState("foyer");
  const woodRef = useRef<THREE.Texture | null>(null);
  if (typeof document !== "undefined" && !woodRef.current) woodRef.current = woodTexture();
  const room = ROOMS.find((r) => r.key === roomKey) || ROOMS[0];

  useEffect(() => {
    const d = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; if (e.key.startsWith("Arrow")) e.preventDefault(); };
    const u = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", d); window.addEventListener("keyup", u);
    (async () => { try { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (user) { const { data } = await supabase.from("profiles").select("rpm_url").eq("id", user.id).single(); if (data?.rpm_url) setRpmUrl(data.rpm_url as string); } } catch { /* anon */ } })();
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0c0a08" }}>
      <Canvas shadows camera={{ position: [0, 5.4, 14], fov: 55 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[0, 6, 0]} intensity={60} distance={42} color="#ffe6b0" castShadow />
        <directionalLight position={[6, 12, 6]} intensity={0.9} />
        <group key={roomKey}>
          <RoomShell wall={room.wall} photo={room.photo} floor={room.floor} />
          <Rug color={room.rug} />
          <Furniture kind={room.key} wood={woodRef.current} />
        </group>
        <Player keys={keys} cam={cam} rpmUrl={rpmUrl} />
      </Canvas>

      <div style={{ position: "fixed", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", gap: 12, pointerEvents: "none", fontFamily: "var(--body)" }}>
        <div style={{ background: "rgba(20,12,8,.74)", border: "1px solid #b8924a", borderRadius: 8, padding: "12px 16px", color: "#f5e9d3", maxWidth: 380, pointerEvents: "auto" }}>
          <div style={{ fontFamily: "var(--blackletter)", color: "#e8cf86", fontSize: 22, lineHeight: 1 }}>{room.label}</div>
          <div style={{ fontSize: 13, opacity: 0.9, margin: "6px 0 10px" }}><strong>W A S D</strong> to walk · <strong>arrow keys</strong> to pan &amp; tilt the view.{rpmUrl ? " You're walking as your created avatar." : " Make a 3D avatar in your Quarters to appear as yourself."}</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {ROOMS.map((r) => (
              <button key={r.key} onClick={() => setRoomKey(r.key)} style={{ fontFamily: "var(--caps)", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", padding: "6px 9px", borderRadius: 3, cursor: "pointer", border: "1px solid #8b6f35", background: r.key === roomKey ? "#caa24e" : "transparent", color: r.key === roomKey ? "#1a1a1a" : "#e8cf86" }}>{r.label}</button>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8, pointerEvents: "auto", alignItems: "flex-end" }}>
          <a href={room.page} style={{ fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 10, color: "#1a1a1a", background: "linear-gradient(180deg,#d4b574,#b8924a)", border: "1px solid #8b6f35", padding: "8px 14px", borderRadius: 2, textDecoration: "none" }}>Open {room.label} page →</a>
          <a href="/" style={{ fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 10, color: "#e8cf86", background: "rgba(20,12,8,.74)", border: "1px solid #8b6f35", padding: "8px 14px", borderRadius: 2, textDecoration: "none" }}>← Estate</a>
        </div>
      </div>
    </div>
  );
}
