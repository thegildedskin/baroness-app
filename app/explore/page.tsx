"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

type Keys = Record<string, boolean>;

function Player({ keys, rpmUrl }: { keys: MutableRefObject<Keys>; rpmUrl: string | null }) {
  const ref = useRef<THREE.Group>(null);
  const [model, setModel] = useState<THREE.Object3D | null>(null);

  useEffect(() => {
    if (!rpmUrl) return;
    let alive = true;
    const loader = new GLTFLoader();
    loader.load(rpmUrl, (gltf) => {
      if (!alive) return;
      const m = gltf.scene;
      m.traverse((o) => { o.castShadow = true; });
      setModel(m);
    }, undefined, () => { /* keep capsule on error */ });
    return () => { alive = false; };
  }, [rpmUrl]);

  useFrame((state, dt) => {
    const g = ref.current;
    if (!g) return;
    const k = keys.current;
    let mx = 0, mz = 0;
    if (k["w"] || k["arrowup"]) mz -= 1;
    if (k["s"] || k["arrowdown"]) mz += 1;
    if (k["a"] || k["arrowleft"]) mx -= 1;
    if (k["d"] || k["arrowright"]) mx += 1;
    if (mx || mz) {
      const len = Math.hypot(mx, mz) || 1;
      const sp = 6 * Math.min(dt, 0.05);
      g.position.x += (mx / len) * sp;
      g.position.z += (mz / len) * sp;
      g.rotation.y = Math.atan2(mx, mz);
    }
    const B = 8.6;
    g.position.x = Math.max(-B, Math.min(B, g.position.x));
    g.position.z = Math.max(-B, Math.min(B, g.position.z));
    const cam = state.camera;
    cam.position.lerp(new THREE.Vector3(g.position.x, 5.2, g.position.z + 9), 0.08);
    cam.lookAt(g.position.x, 1.4, g.position.z);
  });

  return (
    <group ref={ref} position={[0, 0, 5]}>
      {model ? (
        <primitive object={model} />
      ) : (
        <>
          <mesh position={[0, 1.1, 0]} castShadow><cylinderGeometry args={[0.4, 0.55, 1.5, 18]} /><meshStandardMaterial color="#9fbccf" /></mesh>
          <mesh position={[0, 2.05, 0]} castShadow><sphereGeometry args={[0.42, 22, 22]} /><meshStandardMaterial color="#f0c8a8" /></mesh>
          <mesh position={[0, 2.22, -0.04]}><sphereGeometry args={[0.45, 22, 22, 0, Math.PI * 2, 0, Math.PI / 1.7]} /><meshStandardMaterial color="#4a3324" /></mesh>
        </>
      )}
    </group>
  );
}

function Door({ position, rotation, color, href }: { position: [number, number, number]; rotation: [number, number, number]; color: string; href: string }) {
  const router = useRouter();
  const [hover, setHover] = useState(false);
  useEffect(() => { document.body.style.cursor = hover ? "pointer" : "auto"; return () => { document.body.style.cursor = "auto"; }; }, [hover]);
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 2.05, -0.08]}><boxGeometry args={[2.9, 4.5, 0.12]} /><meshStandardMaterial color="#b8924a" metalness={0.4} roughness={0.4} /></mesh>
      <mesh position={[0, 2, 0]} onClick={() => router.push(href)} onPointerOver={() => setHover(true)} onPointerOut={() => setHover(false)}>
        <boxGeometry args={[2.5, 4.1, 0.28]} />
        <meshStandardMaterial color={hover ? "#ffe6a8" : color} emissive={hover ? "#caa24e" : "#000000"} emissiveIntensity={hover ? 0.5 : 0} />
      </mesh>
    </group>
  );
}

function Room() {
  const walls: [number, number, number, number][] = [[0, 3, -10, 0], [0, 3, 10, Math.PI], [-10, 3, 0, Math.PI / 2], [10, 3, 0, -Math.PI / 2]];
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[20, 20]} /><meshStandardMaterial color="#e7eaec" /></mesh>
      <gridHelper args={[20, 10, "#7a7a7a", "#b9b9b9"]} position={[0, 0.02, 0]} />
      {walls.map((w, i) => (<mesh key={i} position={[w[0], w[1], w[2]]} rotation={[0, w[3], 0]} receiveShadow><boxGeometry args={[20, 6, 0.4]} /><meshStandardMaterial color="#a9c4d4" /></mesh>))}
      <mesh position={[0, 6, 0]}><sphereGeometry args={[0.6, 16, 16]} /><meshStandardMaterial color="#caa24e" emissive="#ffcf7a" emissiveIntensity={0.8} /></mesh>
    </group>
  );
}

export default function Explore() {
  const keys = useRef<Keys>({});
  const [rpmUrl, setRpmUrl] = useState<string | null>(null);

  useEffect(() => {
    const d = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = true; };
    const u = (e: KeyboardEvent) => { keys.current[e.key.toLowerCase()] = false; };
    window.addEventListener("keydown", d); window.addEventListener("keyup", u);
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data } = await supabase.from("profiles").select("rpm_url").eq("id", user.id).single();
          if (data?.rpm_url) setRpmUrl(data.rpm_url as string);
        }
      } catch { /* anon — use capsule */ }
    })();
    return () => { window.removeEventListener("keydown", d); window.removeEventListener("keyup", u); };
  }, []);

  return (
    <div style={{ position: "fixed", inset: 0, background: "#0c0a08" }}>
      <Canvas shadows camera={{ position: [0, 5.2, 14], fov: 55 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[0, 6, 0]} intensity={60} distance={40} color="#ffe6b0" castShadow />
        <directionalLight position={[6, 12, 6]} intensity={1.1} />
        <Room />
        <Player keys={keys} rpmUrl={rpmUrl} />
        <Door position={[0, 0, -9.7]} rotation={[0, 0, 0]} color="#7c5a86" href="/#artists" />
        <Door position={[9.7, 0, 0]} rotation={[0, -Math.PI / 2, 0]} color="#5a6f8c" href="/#gallery" />
        <Door position={[0, 0, 9.7]} rotation={[0, Math.PI, 0]} color="#9c6b72" href="/#boutique" />
        <Door position={[-9.7, 0, 0]} rotation={[0, Math.PI / 2, 0]} color="#6f8a7e" href="/#salon" />
      </Canvas>
      <div style={{ position: "fixed", top: 18, left: 18, right: 18, display: "flex", justifyContent: "space-between", alignItems: "flex-start", pointerEvents: "none", fontFamily: "var(--body)" }}>
        <div style={{ background: "rgba(20,12,8,.72)", border: "1px solid #b8924a", borderRadius: 8, padding: "12px 16px", color: "#f5e9d3", maxWidth: 330, pointerEvents: "auto" }}>
          <div style={{ fontFamily: "var(--blackletter)", color: "#e8cf86", fontSize: 22, lineHeight: 1 }}>The Estate Grounds</div>
          <div style={{ fontSize: 14, opacity: 0.9, margin: "6px 0 8px" }}>Beta · walk with <strong>W A S D</strong> / arrows. Click a gilded door to enter that room.{rpmUrl ? " You're walking as your 3D avatar." : " Create a 3D avatar in your Quarters to walk as yourself."}</div>
          <div style={{ fontSize: 13, lineHeight: 1.5 }}>
            <span style={{ color: "#b79ac6" }}>■</span> North → Portrait Salon &nbsp; <span style={{ color: "#8aa0c0" }}>■</span> East → Gallery<br />
            <span style={{ color: "#c69aa0" }}>■</span> South → Boudoir &nbsp; <span style={{ color: "#9ab8a8" }}>■</span> West → Drawing Room
          </div>
        </div>
        <a href="/" style={{ pointerEvents: "auto", fontFamily: "var(--caps)", letterSpacing: ".14em", textTransform: "uppercase", fontSize: 10, color: "#1a1a1a", background: "linear-gradient(180deg,#d4b574,#b8924a)", border: "1px solid #8b6f35", padding: "8px 14px", borderRadius: 2, textDecoration: "none" }}>← Back to the estate</a>
      </div>
    </div>
  );
}
