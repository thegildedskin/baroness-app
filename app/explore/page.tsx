"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createClient } from "@/lib/supabase/client";

type Keys = Record<string, boolean>;

const ROOMS = [
  { key: "foyer", label: "Grand Foyer", wall: "#a9c4d4", photo: "/rooms/foyer.jpg", page: "/" },
  { key: "artists", label: "Portrait Salon", wall: "#a6c1d2", photo: "/rooms/gallery-hall.jpg", page: "/#artists" },
  { key: "gallery", label: "The Gallery", wall: "#9fbccf", photo: "/rooms/gallery.jpg", page: "/#gallery" },
  { key: "boutique", label: "Boudoir", wall: "#ccb2c3", photo: "/rooms/boudoir.jpg", page: "/#boutique" },
  { key: "salon", label: "Drawing Room", wall: "#aac6d1", photo: "/rooms/salon.jpg", page: "/#salon" },
  { key: "booking", label: "Writing Parlor", wall: "#b2cad9", photo: "/rooms/parlor.jpg", page: "/#booking" },
];

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
function Rug({ color }: { color: string }) { return <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}><planeGeometry args={[9, 6]} /><meshStandardMaterial color={color} /></mesh>; }
function Sofa({ position, rot = 0, color }: { position: [number, number, number]; rot?: number; color: string }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[3, 0.6, 1.2]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[0, 1.1, -0.5]} castShadow><boxGeometry args={[3, 1, 0.3]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[-1.45, 0.9, 0]} castShadow><boxGeometry args={[0.3, 0.9, 1.2]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[1.45, 0.9, 0]} castShadow><boxGeometry args={[0.3, 0.9, 1.2]} /><meshStandardMaterial color={color} /></mesh>
  </group>);
}
function Table({ position, r = 0.9 }: { position: [number, number, number]; r?: number }) {
  return (<group position={position}>
    <mesh position={[0, 1, 0]} castShadow><cylinderGeometry args={[r, r, 0.12, 24]} /><meshStandardMaterial color="#caa24e" metalness={0.4} roughness={0.3} /></mesh>
    <mesh position={[0, 0.5, 0]}><cylinderGeometry args={[0.12, 0.12, 1, 12]} /><meshStandardMaterial color="#8b6f35" /></mesh>
  </group>);
}
function Bookshelf({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 2, 0]} castShadow><boxGeometry args={[3, 4, 0.6]} /><meshStandardMaterial color="#4a3324" /></mesh>
    {[1, 2, 3].map((i) => <mesh key={"b" + i} position={[0, i + 0.8, 0.2]}><boxGeometry args={[2.4, 0.5, 0.2]} /><meshStandardMaterial color={["#7a2d3a", "#3a5673", "#6f8a7e"][i - 1]} /></mesh>)}
  </group>);
}
function Fireplace({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 1.4, 0]}><boxGeometry args={[3, 2.8, 0.6]} /><meshStandardMaterial color="#cfc7bd" /></mesh>
    <mesh position={[0, 1.1, 0.31]}><boxGeometry args={[1.6, 1.6, 0.2]} /><meshStandardMaterial color="#1a1410" /></mesh>
    <mesh position={[0, 0.9, 0.42]}><planeGeometry args={[1.3, 1.1]} /><meshStandardMaterial color="#ff9a3c" emissive="#ff7a18" emissiveIntensity={1.3} /></mesh>
  </group>);
}
function FramedArt({ position, rot = 0, color }: { position: [number, number, number]; rot?: number; color: string }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh><boxGeometry args={[1.8, 2.4, 0.1]} /><meshStandardMaterial color="#caa24e" /></mesh>
    <mesh position={[0, 0, 0.06]}><planeGeometry args={[1.5, 2.1]} /><meshStandardMaterial color={color} /></mesh>
  </group>);
}
function Vanity({ position, rot = 0 }: { position: [number, number, number]; rot?: number }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.8, 0]} castShadow><boxGeometry args={[2, 1.6, 0.6]} /><meshStandardMaterial color="#caa24e" metalness={0.3} /></mesh>
    <mesh position={[0, 2.6, 0]}><boxGeometry args={[1.4, 1.8, 0.1]} /><meshStandardMaterial color="#dfeaf0" metalness={0.6} roughness={0.1} /></mesh>
  </group>);
}
function Chaise({ position, rot = 0, color }: { position: [number, number, number]; rot?: number; color: string }) {
  return (<group position={position} rotation={[0, rot, 0]}>
    <mesh position={[0, 0.5, 0]} castShadow><boxGeometry args={[3.2, 0.5, 1.1]} /><meshStandardMaterial color={color} /></mesh>
    <mesh position={[-1.4, 1, 0]} castShadow><boxGeometry args={[0.4, 1.4, 1.1]} /><meshStandardMaterial color={color} /></mesh>
  </group>);
}

function Furniture({ kind }: { kind: string }) {
  if (kind === "salon") return <><Rug color="#3a5673" /><Sofa position={[0, 0, -2]} color="#2f6b58" /><Table position={[0, 0, 1]} /><Bookshelf position={[-8.6, 0, 0]} rot={Math.PI / 2} /><Fireplace position={[8.6, 0, 0]} rot={-Math.PI / 2} /></>;
  if (kind === "booking") return <><Rug color="#1f3a52" /><Table position={[0, 0, -1]} r={1.4} /><Bookshelf position={[-8.6, 0, 2.5]} rot={Math.PI / 2} /><Bookshelf position={[-8.6, 0, -2.5]} rot={Math.PI / 2} /><Fireplace position={[8.6, 0, 0]} rot={-Math.PI / 2} /></>;
  if (kind === "boutique") return <><Rug color="#9c6b72" /><Vanity position={[0, 0, -8.6]} /><Chaise position={[3, 0, 2]} rot={-0.4} color="#c8959a" /><Table position={[-3, 0, 2]} r={0.6} /></>;
  if (kind === "artists") return <><Rug color="#3a5673" /><FramedArt position={[-9.6, 2.6, -3]} rot={Math.PI / 2} color="#5a6f8c" /><FramedArt position={[-9.6, 2.6, 3]} rot={Math.PI / 2} color="#7c5a86" /><FramedArt position={[9.6, 2.6, 0]} rot={-Math.PI / 2} color="#6f8a7e" /><Chaise position={[0, 0, 2]} color="#3a5673" /></>;
  if (kind === "gallery") return <><Rug color="#2b3a4a" />{[-6, -2, 2, 6].map((z, i) => <FramedArt key={i} position={[-9.6, 2.6, z]} rot={Math.PI / 2} color={["#7c5a86", "#5a6f8c", "#9c6b72", "#6f8a7e"][i]} />)}{[-4, 0, 4].map((z, i) => <FramedArt key={"r" + i} position={[9.6, 2.6, z]} rot={-Math.PI / 2} color={["#caa24e", "#3a5673", "#7a2d3a"][i]} />)}</>;
  return <><Rug color="#7a2d3a" /><Table position={[0, 0, 0]} r={1.3} />{[[-7, -7], [7, -7], [-7, 7], [7, 7]].map((p, i) => <mesh key={i} position={[p[0], 3, p[1]]}><cylinderGeometry args={[0.5, 0.6, 6, 16]} /><meshStandardMaterial color="#e6dcc6" /></mesh>)}</>;
}

function PhotoWall({ src, wall }: { src: string; wall: string }) {
  const [tex, setTex] = useState<THREE.Texture | null>(null);
  useEffect(() => { let alive = true; new THREE.TextureLoader().load(src, (t) => { if (alive) setTex(t); }, undefined, () => {}); return () => { alive = false; }; }, [src]);
  return (<mesh position={[0, 3, -10]}><planeGeometry args={[20, 6]} /><meshStandardMaterial map={tex || undefined} color={tex ? "#ffffff" : wall} /></mesh>);
}

function RoomShell({ wall, photo }: { wall: string; photo: string }) {
  return (<group>
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#d8cdb5" /></mesh>
    <PhotoWall src={photo} wall={wall} />
    <mesh position={[0, 3, 10]} rotation={[0, Math.PI, 0]}><boxGeometry args={[20, 6, 0.4]} /><meshStandardMaterial color={wall} /></mesh>
    <mesh position={[-10, 3, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[20, 6, 0.4]} /><meshStandardMaterial color={wall} /></mesh>
    <mesh position={[10, 3, 0]} rotation={[0, -Math.PI / 2, 0]}><boxGeometry args={[20, 6, 0.4]} /><meshStandardMaterial color={wall} /></mesh>
    <Chandelier3D />
  </group>);
}

function Player({ keys, rpmUrl }: { keys: MutableRefObject<Keys>; rpmUrl: string | null }) {
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
    const k = keys.current; let mx = 0, mz = 0;
    if (k["w"] || k["arrowup"]) mz -= 1;
    if (k["s"] || k["arrowdown"]) mz += 1;
    if (k["a"] || k["arrowleft"]) mx -= 1;
    if (k["d"] || k["arrowright"]) mx += 1;
    if (mx || mz) { const len = Math.hypot(mx, mz) || 1; const sp = 6 * Math.min(dt, 0.05); g.position.x += (mx / len) * sp; g.position.z += (mz / len) * sp; g.rotation.y = Math.atan2(mx, mz); }
    const B = 8.6; g.position.x = Math.max(-B, Math.min(B, g.position.x)); g.position.z = Math.max(-B, Math.min(B, g.position.z));
    const cam = state.camera; cam.position.lerp(new THREE.Vector3(g.position.x, 5.4, g.position.z + 9.5), 0.08); cam.lookAt(g.position.x, 1.4, g.position.z);
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
  const [rpmUrl, setRpmUrl] = useState<string | null>(null);
  const [roomKey, setRoomKey] = useState("foyer");
  const room = ROOMS.find((r) => r.key === roomKey) || ROOMS[0];

  useEffect(() => {
    const d = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const u = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", d); window.addEventListener("keyup", u);
    (async () => { try { const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (user) { const { data } = await supabase.from("profiles").select("rpm_url").eq("id", user.id).single(); if (data?.rpm_url) setRpmUrl(data.rpm_url as string); } } catch { /* anon */ } })();
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0c0a08" }}>
      <Canvas shadows camera={{ position: [0, 5.4, 14], fov: 55 }}>
        <ambientLight intensity={0.55} />
        <pointLight position={[0, 6, 0]} intensity={60} distance={42} color="#ffe6b0" castShadow />
        <directionalLight position={[6, 12, 6]} intensity={1} />
        <group key={roomKey}>
          <RoomShell wall={room.wall} photo={room.photo} />
          <Furniture kind={room.key} />
        </group>
        <Player keys={keys} rpmUrl={rpmUrl} />
      </Canvas>

      <div style={{ position: "fixed", top: 16, left: 16, right: 16, display: "flex", justifyContent: "space-between", gap: 12, pointerEvents: "none", fontFamily: "var(--body)" }}>
        <div style={{ background: "rgba(20,12,8,.74)", border: "1px solid #b8924a", borderRadius: 8, padding: "12px 16px", color: "#f5e9d3", maxWidth: 360, pointerEvents: "auto" }}>
          <div style={{ fontFamily: "var(--blackletter)", color: "#e8cf86", fontSize: 22, lineHeight: 1 }}>{room.label}</div>
          <div style={{ fontSize: 13, opacity: 0.9, margin: "6px 0 10px" }}>Walk with <strong>W A S D</strong> / arrows.{rpmUrl ? " You're your 3D avatar." : " Make a 3D avatar in your Quarters."} Choose a room below; open its full page on the right.</div>
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
