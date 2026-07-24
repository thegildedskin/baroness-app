"use client";

// My Quarters — three.js upgrade of the 2.5D CSS room (SPEC_3d_quarters_glb Goal 3).
// Fixed isometric-ish camera; furniture stands on the floor as candlelit emoji
// billboards (poster-frames until GLBs land) that you click-to-place, drag on the
// floor plane, or click to pick up. Gem shop / inventory stay a DOM overlay.
// Saved layout migrates from the old {item,x,y%} shape to {item,x,z,rotation}.

import { Canvas, useFrame, useLoader, useThree, type ThreeEvent } from "@react-three/fiber";
import { TextureLoader } from "three";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Catalogue (verbatim from the design kit) + shared state contract
// ---------------------------------------------------------------------------
type Category = "furniture" | "accessories" | "trophies";
type Item = {
  id: string; em: string; nm: string; c: Category;
  own?: number; gems?: number; tier?: string; earn?: string; size: number;
};

const ITEMS: Item[] = [
  { id: "throne", em: "🪑", nm: "Velvet Throne", c: "furniture", own: 1, size: 44 },
  { id: "chaise", em: "🛋", nm: "Rose Chaise", c: "furniture", own: 1, size: 48 },
  { id: "candelabra", em: "🕯", nm: "Candelabra", c: "furniture", own: 2, size: 34 },
  { id: "mirror", em: "🪞", nm: "Gilded Mirror", c: "furniture", own: 1, size: 42 },
  { id: "harpsichord", em: "🎹", nm: "Harpsichord", c: "furniture", own: 0, gems: 120, size: 52 },
  { id: "bookcase", em: "📚", nm: "Grimoire Case", c: "furniture", own: 0, gems: 80, size: 44 },
  { id: "organ", em: "🎼", nm: "Gothic Organ", c: "furniture", own: 0, tier: "Royal", size: 56 },
  { id: "cat", em: "🐈‍⬛", nm: "House Cat", c: "accessories", own: 1, size: 30 },
  { id: "raven", em: "🐦‍⬛", nm: "Pet Raven", c: "accessories", own: 0, gems: 60, size: 26 },
  { id: "skull", em: "💀", nm: "Memento Mori", c: "accessories", own: 1, size: 26 },
  { id: "roses", em: "🌹", nm: "Black Roses", c: "accessories", own: 2, size: 26 },
  { id: "crystal", em: "🔮", nm: "Scrying Orb", c: "accessories", own: 0, gems: 45, size: 26 },
  { id: "moth", em: "🦋", nm: "Moth Cloche", c: "accessories", own: 0, tier: "Noble", size: 24 },
  { id: "t-ring", em: "🔔", nm: "First Ring", c: "trophies", own: 1, size: 28 },
  { id: "t-blood", em: "🗡", nm: "First Blood", c: "trophies", own: 1, size: 30 },
  { id: "t-rook", em: "🏆", nm: "Rook's Favorite", c: "trophies", own: 0, earn: "Find all 7 curiosities", size: 32 },
  { id: "t-crown", em: "👑", nm: "Bodysuit Sovereign", c: "trophies", own: 0, earn: "Multi-year project", size: 32 },
];
const byId = (id: string) => ITEMS.find((i) => i.id === id);

const LS = "baroness-my-quarters";
type Placed = { item: string; x: number; z: number; rotation: number };
type Store = { gems: number; placed: Placed[]; bought: string[] };

// room floor bounds (world units)
const BX = 3.7, BZ_BACK = -2.6, BZ_FRONT = 2.8;

// migrate old {item,x(0-100),y(56-100)} → world {item,x,z,rotation}
function loadStore(): Store {
  const base: Store = { gems: 250, placed: [], bought: [] };
  if (typeof window === "undefined") return base;
  try {
    const raw = JSON.parse(localStorage.getItem(LS) || "{}");
    const placed: Placed[] = (raw.placed || []).map((p: any) => {
      if (typeof p.z === "number") return { item: p.item, x: p.x, z: p.z, rotation: p.rotation || 0 };
      // old percent shape
      const x = ((Number(p.x) || 50) / 100 - 0.5) * (BX * 2);
      const z = ((Number(p.y) || 78) - 56) / 44 * (BZ_FRONT - BZ_BACK) + BZ_BACK;
      return { item: p.item, x, z, rotation: 0 };
    });
    return { gems: raw.gems ?? 250, placed, bought: raw.bought || [] };
  } catch {
    return base;
  }
}
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// ---------------------------------------------------------------------------
// emoji → CanvasTexture (cached), used as billboard art
// ---------------------------------------------------------------------------
const texCache = new Map<string, THREE.CanvasTexture>();
function emojiTexture(em: string): THREE.CanvasTexture | null {
  if (typeof document === "undefined") return null;
  const hit = texCache.get(em);
  if (hit) return hit;
  const s = 256;
  const c = document.createElement("canvas");
  c.width = c.height = s;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  ctx.clearRect(0, 0, s, s);
  ctx.font = `${Math.floor(s * 0.78)}px serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(em, s / 2, s / 2 * 1.06);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  texCache.set(em, t);
  return t;
}

// ---------------------------------------------------------------------------
// Scene pieces
// ---------------------------------------------------------------------------
function WallSlot({ x, url, w = 1.35, h = 1.75 }: { x: number; url: string; w?: number; h?: number }) {
  const tex = useLoader(TextureLoader, url);
  return (
    <group position={[x, 2.15, -2.94]}>
      {/* gilt frame */}
      <mesh position={[0, 0, -0.02]}>
        <planeGeometry args={[w + 0.14, h + 0.14]} />
        <meshStandardMaterial color="#8B6F35" metalness={0.6} roughness={0.35} />
      </mesh>
      <mesh>
        <planeGeometry args={[w, h]} />
        <meshStandardMaterial map={tex} roughness={0.9} />
      </mesh>
    </group>
  );
}

function Room() {
  return (
    <group>
      {/* floor */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[8, 6]} />
        <meshStandardMaterial color="#241811" roughness={0.95} metalness={0.05} />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 2.1, -3]}>
        <planeGeometry args={[8, 4.2]} />
        <meshStandardMaterial color="#1a1420" roughness={1} />
      </mesh>
      {/* wainscot rail */}
      <mesh position={[0, 0.62, -2.96]}>
        <boxGeometry args={[8, 0.5, 0.08]} />
        <meshStandardMaterial color="#3a2c18" roughness={0.7} metalness={0.2} emissive="#3a2a12" emissiveIntensity={0.2} />
      </mesh>
      <Suspense fallback={null}>
        <WallSlot x={-2.3} url="/likeness-portrait.png" w={1.15} h={1.55} />
        <WallSlot x={2.3} url="/rooms/gallery.jpg" w={1.15} h={1.55} />
      </Suspense>
    </group>
  );
}

function PlacedItem({
  p,
  onPointerDown,
  interactive,
}: {
  p: Placed;
  onPointerDown: (e: ThreeEvent<PointerEvent>) => void;
  interactive: boolean;
}) {
  const it = byId(p.item);
  const tex = it ? emojiTexture(it.em) : null;
  const planeRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();
  useFrame(() => {
    const m = planeRef.current;
    if (!m) return;
    // billboard the art toward the camera (Y only) so it reads from any angle
    m.rotation.y = Math.atan2(camera.position.x - p.x, camera.position.z - p.z) - p.rotation;
  });
  if (!it || !tex) return null;
  const h = it.size / 20; // world height
  const w = h * 0.9;
  return (
    <group position={[p.x, 0, p.z]} rotation-y={p.rotation}>
      {/* billboard art, anchored so its foot sits on the floor */}
      <mesh ref={planeRef} position={[0, h / 2, 0]} onPointerDown={interactive ? onPointerDown : undefined}>
        <planeGeometry args={[w, h]} />
        <meshBasicMaterial map={tex} transparent alphaTest={0.35} toneMapped={false} />
      </mesh>
      {/* soft contact shadow */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.01, 0]}>
        <circleGeometry args={[w * 0.42, 24]} />
        <meshBasicMaterial color="#000" transparent opacity={0.4} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Raycasts the floor plane during a drag; robust to the pointer passing over meshes. */
function DragController({
  active,
  onMove,
}: {
  active: boolean;
  onMove: (x: number, z: number) => void;
}) {
  const { camera, gl, raycaster } = useThree();
  const plane = useMemo(() => new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), []);
  useEffect(() => {
    if (!active) return;
    const el = gl.domElement;
    const hit = new THREE.Vector3();
    function onPM(ev: PointerEvent) {
      const r = el.getBoundingClientRect();
      const nx = ((ev.clientX - r.left) / r.width) * 2 - 1;
      const ny = -((ev.clientY - r.top) / r.height) * 2 + 1;
      raycaster.setFromCamera(new THREE.Vector2(nx, ny), camera);
      if (raycaster.ray.intersectPlane(plane, hit)) {
        onMove(clamp(hit.x, -BX, BX), clamp(hit.z, BZ_BACK, BZ_FRONT));
      }
    }
    el.addEventListener("pointermove", onPM);
    return () => el.removeEventListener("pointermove", onPM);
  }, [active, camera, gl, raycaster, plane, onMove]);
  return null;
}

/** Resets the fixed isometric-ish camera whenever we return to edit mode. */
function CameraRig({ mode }: { mode: "edit" | "walk" }) {
  const { camera } = useThree();
  useEffect(() => {
    if (mode === "edit") {
      camera.position.set(0, 3.4, 7);
      camera.lookAt(0, 1, 0);
    }
  }, [mode, camera]);
  return null;
}

/** First-person walk: pointer-lock mouse-look + WASD, bounded to the room. */
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
    // enter at standing height near the front of the room, facing the wall
    camera.position.set(0, 1.6, 2.8);
    camera.lookAt(0, 1.6, -1);

    const moveCodes = new Set(["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"]);
    const onDown = (e: KeyboardEvent) => {
      if (moveCodes.has(e.code)) {
        keys.current[e.code] = true;
        e.preventDefault();
      }
    };
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
    const step = 2.6 * Math.min(dt, 0.05);
    const k = keys.current;
    if (k["KeyW"] || k["ArrowUp"]) controls.moveForward(step);
    if (k["KeyS"] || k["ArrowDown"]) controls.moveForward(-step);
    if (k["KeyA"] || k["ArrowLeft"]) controls.moveRight(-step);
    if (k["KeyD"] || k["ArrowRight"]) controls.moveRight(step);
    // keep the guest inside the walls, at eye height
    camera.position.x = clamp(camera.position.x, -3.6, 3.6);
    camera.position.z = clamp(camera.position.z, -2.4, 3.3);
    camera.position.y = 1.6;
  });

  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
export default function QuartersRoom() {
  const [S, setS] = useState<Store>(() => ({ gems: 250, placed: [], bought: [] }));
  const [cat, setCat] = useState<Category>("furniture");
  const [sel, setSel] = useState<string | null>(null);
  const [hint, setHint] = useState("Click the floor to place · click an item to pick it up");
  const dragRef = useRef<{ idx: number; moved: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [mode, setMode] = useState<"edit" | "walk">("edit");
  const [walkLocked, setWalkLocked] = useState(false);

  // hydrate from localStorage on mount (client only)
  useEffect(() => setS(loadStore()), []);
  // persist
  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem(LS, JSON.stringify(S));
  }, [S]);

  const flash = useCallback((m: string) => {
    setHint(m);
  }, []);

  const stock = useCallback(
    (i: Item) => {
      const owned = (i.own || 0) + (S.bought.includes(i.id) ? 1 : 0);
      return owned - S.placed.filter((p) => p.item === i.id).length;
    },
    [S]
  );

  // place selected item at a floor point
  const placeAt = useCallback(
    (x: number, z: number) => {
      if (!sel) return;
      const it = byId(sel);
      if (!it || stock(it) <= 0) return;
      setS((s) => ({ ...s, placed: [...s.placed, { item: sel, x: clamp(x, -BX, BX), z: clamp(z, BZ_BACK, BZ_FRONT), rotation: 0 }] }));
      // if that was the last in stock, clear the brush
      if (stock(it) - 1 <= 0) setSel(null);
      flash("Placed. Drag it to arrange, or click to pick it up.");
    },
    [sel, stock, flash]
  );

  const onFloorClick = useCallback(
    (e: ThreeEvent<MouseEvent>) => {
      if (mode !== "edit") return; // no editing while walking
      if (dragRef.current) return; // a drag just ended
      if (!sel) return;
      placeAt(e.point.x, e.point.z);
    },
    [mode, sel, placeAt]
  );

  const startDrag = useCallback(
    (idx: number) => (e: ThreeEvent<PointerEvent>) => {
      e.stopPropagation();
      dragRef.current = { idx, moved: false };
      setDragging(true);
    },
    []
  );

  const dragMove = useCallback((x: number, z: number) => {
    const d = dragRef.current;
    if (!d) return;
    d.moved = true;
    setS((s) => {
      const placed = s.placed.slice();
      if (!placed[d.idx]) return s;
      placed[d.idx] = { ...placed[d.idx], x, z };
      return { ...s, placed };
    });
  }, []);

  // end drag (pick-up if it was a click, not a move)
  useEffect(() => {
    if (!dragging) return;
    function up() {
      const d = dragRef.current;
      setDragging(false);
      if (d && !d.moved && !sel) {
        // treat as pick-up: return to inventory, arm as brush
        setS((s) => {
          const placed = s.placed.slice();
          const removed = placed.splice(d.idx, 1)[0];
          if (removed) setSel(removed.item);
          return { ...s, placed };
        });
        flash("Picked up — click the floor to re-place, or Esc to shelve it.");
      }
      // clear after the click handler has had a chance to bail
      setTimeout(() => (dragRef.current = null), 0);
    }
    window.addEventListener("pointerup", up);
    return () => window.removeEventListener("pointerup", up);
  }, [dragging, sel, flash]);

  // buy or select an inventory slot
  const onSlot = useCallback(
    (i: Item) => {
      const st = stock(i);
      if (st <= 0 && !(i.own || S.bought.includes(i.id))) {
        if (i.gems) {
          if (S.gems >= i.gems) {
            setS((s) => ({ ...s, gems: s.gems - i.gems!, bought: [...s.bought, i.id] }));
            setSel(i.id);
            flash(`${i.nm} acquired — place it.`);
          } else flash("Not enough gems.");
        } else if (i.tier) flash(`Ascend to ${i.tier} tier to own the ${i.nm}.`);
        else if (i.earn) flash(`Earn it: ${i.earn}.`);
        return;
      }
      setSel((cur) => (cur === i.id ? null : i.id));
    },
    [stock, S, flash]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSel(null);
        flash("Click the floor to place · click an item to pick it up");
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flash]);

  const list = ITEMS.filter((i) => i.c === cat);

  return (
    <div style={{ maxWidth: 1220, margin: "0 auto", padding: "24px 22px 60px", color: "var(--quarter-text)" }}>
      {/* header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: 16, flexWrap: "wrap", marginBottom: 16 }}>
        <div>
          <div style={{ fontFamily: "var(--caps)", fontSize: "var(--text-label-xs)", letterSpacing: "var(--track-caps-wider)", textTransform: "uppercase", color: "var(--gold)", marginBottom: 6 }}>
            The Kingdom · Your Chamber
          </div>
          <h1 style={{ fontFamily: "var(--display)", fontSize: 38, color: "var(--cream)", fontWeight: 600 as unknown as number, lineHeight: "var(--leading-tight)" }}>
            My Quarters
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          <span style={pill}>
            <span style={{ color: "var(--rose)" }}>◆</span> <b>{S.gems}</b> gems
          </span>
          <button style={btn} onClick={() => setMode((m) => (m === "walk" ? "edit" : "walk"))}>
            {mode === "walk" ? "Leave the Floor" : "Walk the Chamber"}
          </button>
          <button style={{ ...btn, ...btnGhost }} onClick={() => { setS((s) => ({ ...s, placed: [] })); flash("The chamber is cleared."); }}>
            Reset room
          </button>
        </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 16, alignItems: "start" }}>
        {/* ROOM */}
        <div style={{ border: "1px solid rgba(184,146,74,.35)", borderRadius: "var(--radius-tile)", overflow: "hidden", boxShadow: "var(--shadow-tile)", position: "relative", background: "var(--estate-black)" }}>
          <div style={{ position: "relative", height: 560, cursor: mode === "walk" ? "pointer" : sel ? "copy" : "default", touchAction: "none" }}>
            {/* hint bar (edit mode) */}
            {mode === "edit" && (
              <div style={{ position: "absolute", top: 12, left: "50%", transform: "translateX(-50%)", zIndex: 5, fontFamily: "var(--caps)", fontSize: 9, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold-pale)", background: "rgba(12,10,8,.78)", border: "1px solid rgba(184,146,74,.4)", borderRadius: "var(--radius-pill)", padding: "6px 14px", pointerEvents: "none", whiteSpace: "nowrap" }}>
                {hint}
              </div>
            )}
            {/* candle glow + vignette */}
            <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", background: "radial-gradient(52% 40% at 50% 20%, rgba(255,200,110,.14), rgba(255,200,110,0) 70%)" }} />
            <div style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none", boxShadow: "var(--vignette)" }} />
            {sel && mode === "edit" && <div style={{ position: "absolute", inset: 6, zIndex: 4, pointerEvents: "none", outline: "2px dashed rgba(212,181,116,.6)", borderRadius: 8 }} />}
            {/* walk-mode instruction (until the pointer is locked) */}
            {mode === "walk" && !walkLocked && (
              <div style={{ position: "absolute", inset: 0, zIndex: 6, display: "grid", placeItems: "center", pointerEvents: "none", fontFamily: "var(--caps)", fontSize: 11, letterSpacing: ".14em", textTransform: "uppercase", color: "var(--gold-pale)", textAlign: "center", padding: 20, textShadow: "0 2px 12px rgba(0,0,0,.8)" }}>
                Click to look around · W A S D to walk · Esc to leave
              </div>
            )}

            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 3.4, 7], fov: 35 }} style={{ position: "relative", zIndex: 2 }}>
              <ambientLight intensity={0.5} color="#ffe6c0" />
              <directionalLight castShadow position={[3, 6, 4]} intensity={1.9} color="#ffb06a" shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
              <directionalLight position={[-4, 3.5, -3]} intensity={0.9} color="#f1dc97" />
              <pointLight position={[0, 3.2, 1]} intensity={12} distance={12} color="#ffcf8a" />

              <Room />

              {/* floor click-catcher for placement (edit mode only) */}
              {mode === "edit" && (
                <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} onClick={onFloorClick}>
                  <planeGeometry args={[8, 6]} />
                  <meshBasicMaterial transparent opacity={0} depthWrite={false} />
                </mesh>
              )}

              {S.placed.map((p, idx) => (
                <PlacedItem key={`${p.item}-${idx}`} p={p} interactive={mode === "edit"} onPointerDown={startDrag(idx)} />
              ))}

              <DragController active={dragging && mode === "edit"} onMove={dragMove} />
              <CameraRig mode={mode} />
              <WalkControls active={mode === "walk"} onExit={() => setMode("edit")} onLockChange={setWalkLocked} />
            </Canvas>
          </div>
        </div>

        {/* INVENTORY */}
        <aside style={{ border: "1px solid rgba(184,146,74,.28)", borderRadius: "var(--radius-xl)", background: "linear-gradient(180deg,rgba(255,255,255,.035),rgba(255,255,255,.012))", padding: "14px 16px" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, flexWrap: "wrap" }}>
            {(["furniture", "accessories", "trophies"] as Category[]).map((c) => (
              <button key={c} onClick={() => { setCat(c); setSel(null); }} style={{ ...tab, ...(cat === c ? tabOn : null) }}>
                {c}
              </button>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {list.map((i) => {
              const st = stock(i);
              const owned = !!(i.own || S.bought.includes(i.id));
              const locked = st <= 0 && !owned;
              return (
                <button key={i.id} onClick={() => onSlot(i)} style={{ ...slot, ...(sel === i.id ? slotSel : null), opacity: locked ? 0.55 : 1 }}>
                  <span style={{ fontSize: 24, display: "block", filter: locked ? "grayscale(1) brightness(.7)" : "none" }}>{i.em}</span>
                  {st > 0 && <span style={{ position: "absolute", top: 4, right: 6, fontSize: 9, color: "var(--gold-pale)", fontFamily: "var(--caps)" }}>×{st}</span>}
                  <span style={{ fontFamily: "var(--caps)", fontSize: 8, letterSpacing: ".08em", textTransform: "uppercase", color: "var(--quarter-muted)", display: "block", marginTop: 4 }}>{i.nm}</span>
                  {locked && i.gems ? <span style={{ fontFamily: "var(--caps)", fontSize: 8, color: "var(--gold-pale)", display: "block", marginTop: 2 }}>◆ {i.gems}</span> : null}
                  {locked && i.tier ? <span style={lockTag}>{i.tier} tier</span> : null}
                  {locked && i.earn ? <span style={lockTag}>{i.earn}</span> : null}
                </button>
              );
            })}
          </div>
          <p style={{ fontSize: 11, fontStyle: "italic", color: "var(--quarter-muted)", marginTop: 10, lineHeight: 1.5 }}>
            Trophies are earned, never bought — win them through missions, hunts and sittings. Locked wares unlock with gems or tier.
          </p>
        </aside>
      </div>
    </div>
  );
}

// ---- inline token styles ----
const pill: React.CSSProperties = { border: "1px solid rgba(184,146,74,.45)", borderRadius: "var(--radius-pill)", padding: "8px 16px", fontFamily: "var(--caps)", fontSize: "var(--text-label-sm)", letterSpacing: ".08em", textTransform: "uppercase", color: "var(--gold-pale)" };
const btn: React.CSSProperties = { fontFamily: "var(--caps)", letterSpacing: "var(--track-caps)", textTransform: "uppercase", fontSize: "var(--text-label-sm)", color: "var(--black)", background: "var(--gilt)", border: "var(--border-gold-dark)", padding: "9px 14px", borderRadius: "var(--radius-xs)", cursor: "pointer" };
const btnGhost: React.CSSProperties = { background: "transparent", color: "var(--gold)" };
const tab: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 9, letterSpacing: ".1em", textTransform: "uppercase", padding: "7px 12px", borderRadius: "var(--radius-pill)", cursor: "pointer", border: "1px solid rgba(184,146,74,.4)", background: "transparent", color: "#cbbfa4" };
const tabOn: React.CSSProperties = { background: "var(--gilt)", color: "var(--black)", borderColor: "var(--gold-dark)" };
const slot: React.CSSProperties = { border: "1px solid rgba(184,146,74,.25)", borderRadius: 10, padding: "10px 6px 8px", background: "rgba(255,255,255,.02)", textAlign: "center", cursor: "pointer", position: "relative", color: "var(--quarter-text)" };
const slotSel: React.CSSProperties = { borderColor: "var(--gold-pale)", boxShadow: "var(--glow-gold)" };
const lockTag: React.CSSProperties = { fontFamily: "var(--caps)", fontSize: 7.5, letterSpacing: ".08em", color: "var(--rose)", display: "block", marginTop: 2, textTransform: "uppercase" };
