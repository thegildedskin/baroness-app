"use client";

import { Canvas, useFrame, useLoader, useThree } from "@react-three/fiber";
import { GLTFLoader, setupDracoLoader } from "@/lib/gltf";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import * as THREE from "three";

// ---- design tokens (canonical Baroness values; also in globals.css) ----
const GOLD = "#B8924A";
const GOLD_DARK = "#8B6F35";
const GOLD_PALE = "#f1dc97";
const ESTATE_BLACK = "#0c0a08";

export type MeshyModel = {
  id: string;
  name: string;
  displayName: string;
  package: string;
  status: string;
  glbUrl: string | null;
  usdzUrl: string | null;
  thumbnailUrl: string | null;
};

// Catches GLB load failures so one bad model doesn't blank the whole page.
class LoadBoundary extends Component<
  { children: ReactNode; onError?: () => void; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onError?.();
  }
  componentDidUpdate(prev: { children: ReactNode }) {
    if (prev.children !== this.props.children && this.state.failed) {
      this.setState({ failed: false });
    }
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}

/** Orbit controls with zoom + damping; autorotates only while idle (stately). */
function StageControls({ target = 1.05, idleMs = 2600 }: { target?: number; idleMs?: number }) {
  const { camera, gl } = useThree();
  const controls = useMemo(() => new OrbitControls(camera, gl.domElement), [camera, gl]);

  useEffect(() => {
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.enablePan = false;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.55; // slow, courtly
    controls.minDistance = 2.4;
    controls.maxDistance = 7;
    controls.minPolarAngle = Math.PI * 0.12;
    controls.maxPolarAngle = Math.PI * 0.62;
    controls.target.set(0, target, 0);
    controls.update();

    let timer: ReturnType<typeof setTimeout>;
    const pause = () => {
      controls.autoRotate = false;
      clearTimeout(timer);
    };
    const resume = () => {
      clearTimeout(timer);
      timer = setTimeout(() => (controls.autoRotate = true), idleMs);
    };
    controls.addEventListener("start", pause);
    controls.addEventListener("end", resume);
    return () => {
      controls.removeEventListener("start", pause);
      controls.removeEventListener("end", resume);
      clearTimeout(timer);
      controls.dispose();
    };
  }, [controls, target, idleMs]);

  useFrame(() => controls.update());
  return null;
}

/** Loads a GLB, normalizes size, and stands it on the y=0 floor to cast a shadow. */
function Model({ url, onReady }: { url: string; onReady: () => void }) {
  const gltf = useLoader(GLTFLoader, url, setupDracoLoader);

  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);
    root.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.isMesh) {
        m.castShadow = true;
        m.receiveShadow = false;
      }
    });
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2.2 / maxDim;
    root.scale.setScalar(scale);
    // center horizontally, plant feet on the floor plane (y = 0)
    root.position.set(-center.x * scale, -box.min.y * scale, -center.z * scale);
    return root;
  }, [gltf]);

  useEffect(() => {
    onReady();
  }, [scene, onReady]);

  return <primitive object={scene} />;
}

function Viewer({ url }: { url: string }) {
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setBusy(true);
    setFailed(false);
  }, [url]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "min(64vh, 560px)",
        borderRadius: "var(--radius-xl)",
        overflow: "hidden",
        background: `radial-gradient(120% 90% at 50% 16%, #201810 0%, ${ESTATE_BLACK} 72%)`,
        border: "1px solid var(--gold)",
        boxShadow: "var(--frame-inset), var(--glow-gold)",
        cursor: "grab",
        touchAction: "none",
      }}
    >
      {/* candle-glow pool (above the canvas, non-interactive) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(60% 42% at 50% 22%, rgba(255,200,110,.18), rgba(255,200,110,0) 70%)",
          pointerEvents: "none",
          zIndex: 4,
        }}
      />
      {/* heavy vignette (design-system --vignette) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: "var(--vignette)",
          pointerEvents: "none",
          zIndex: 4,
        }}
      />

      {(busy || failed) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: GOLD_PALE,
            fontFamily: "var(--caps)",
            fontSize: 12,
            letterSpacing: "var(--track-caps)",
            textTransform: "uppercase",
            zIndex: 6,
            pointerEvents: "none",
            textAlign: "center",
            padding: 20,
          }}
        >
          {failed ? "Her Grace could not be received — try Summon Anew" : "Summoning the likeness…"}
        </div>
      )}

      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.15, 4.6], fov: 32 }}
        gl={{ antialias: true }}
        style={{ position: "relative", zIndex: 2 }}
      >
        {/* candlelit rig — warm key, gold rim, warm ambient (never neutral grey) */}
        <ambientLight intensity={0.55} color="#ffe6c0" />
        <directionalLight
          castShadow
          position={[3.2, 5.5, 3]}
          intensity={2.4}
          color="#ffb06a"
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-near={0.5}
          shadow-camera-far={20}
          shadow-camera-left={-3}
          shadow-camera-right={3}
          shadow-camera-top={4}
          shadow-camera-bottom={-1.2}
          shadow-bias={-0.0005}
        />
        <directionalLight position={[-4.5, 3.5, -4]} intensity={1.25} color={GOLD_PALE} />
        <directionalLight position={[-3, 1.4, 4]} intensity={0.5} color={GOLD} />

        {/* shadow-catching floor */}
        <mesh rotation-x={-Math.PI / 2} position={[0, 0, 0]} receiveShadow>
          <circleGeometry args={[6, 48]} />
          <shadowMaterial transparent opacity={0.4} />
        </mesh>

        <LoadBoundary
          fallback={null}
          onError={() => {
            setBusy(false);
            setFailed(true);
          }}
        >
          <Suspense fallback={null}>
            <Model url={url} onReady={() => setBusy(false)} />
          </Suspense>
        </LoadBoundary>

        <StageControls target={1.05} />
      </Canvas>
    </div>
  );
}

export default function MeshyGallery() {
  const [models, setModels] = useState<MeshyModel[]>([]);
  const [selected, setSelected] = useState<MeshyModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load(refresh = false) {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/meshy/models${refresh ? "?refresh=1" : ""}`);
      const json = await res.json();
      if (!res.ok || json.error) throw new Error(json.error || `HTTP ${res.status}`);
      const list: MeshyModel[] = json.models || [];
      setModels(list);
      setSelected((prev) => list.find((m) => m.id === prev?.id) || list[0] || null);
    } catch (e: any) {
      setError(e?.message || "Failed to load models");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const capLabel: React.CSSProperties = {
    fontFamily: "var(--caps)",
    textTransform: "uppercase",
  };

  return (
    <div
      style={{
        maxWidth: "var(--panel-max)",
        margin: "0 auto",
        padding: "var(--space-10) var(--space-8)",
        color: "var(--black)",
      }}
    >
      {/* header — butler voice */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 16 }}>
        <div>
          <div
            style={{
              ...capLabel,
              fontSize: "var(--text-label-sm)",
              letterSpacing: "var(--track-caps-wide)",
              color: "var(--gold-dark)",
            }}
          >
            By Appointment of Her Grace · Garland, Texas
          </div>
          <h1
            style={{
              margin: "6px 0 0",
              fontFamily: "var(--display)",
              fontWeight: "var(--weight-display)" as unknown as number,
              fontSize: "var(--text-hero)",
              lineHeight: "var(--leading-tight)",
              color: "var(--black)",
            }}
          >
            The Court in Three Dimensions
          </h1>
          <p
            style={{
              margin: "6px 0 0",
              fontFamily: "var(--body)",
              fontSize: "var(--text-lead)",
              color: "var(--grey)",
            }}
          >
            {selected ? (
              <>
                Now received: <em style={{ color: "var(--gold-dark)" }}>{selected.displayName}</em>
                <span style={{ color: "var(--gold)" }}> · {selected.package.replace(/_/g, " ")}</span>
              </>
            ) : (
              "The likenesses of the house, presented in full relief."
            )}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          style={{
            ...capLabel,
            fontSize: "var(--text-label)",
            letterSpacing: "var(--track-caps)",
            color: "var(--gold-dark)",
            background: "transparent",
            border: "1px solid var(--gold)",
            borderRadius: "var(--radius-xs)",
            padding: "var(--pad-btn-sm)",
            cursor: "pointer",
            whiteSpace: "nowrap",
          }}
        >
          ❦ Summon Anew
        </button>
      </div>

      {/* stage */}
      <div style={{ marginTop: "var(--space-8)" }}>
        {error ? (
          <div
            style={{
              padding: "var(--pad-card)",
              borderRadius: "var(--radius-lg)",
              background: "var(--parchment-face)",
              border: "1px solid var(--gold)",
              color: "var(--error)",
              fontFamily: "var(--body)",
              fontSize: "var(--text-body)",
            }}
          >
            The house could not open its doors: {error}
          </div>
        ) : selected?.glbUrl ? (
          <Viewer url={`/api/meshy/model/${selected.id}`} />
        ) : (
          <div
            style={{
              padding: "var(--pad-card)",
              borderRadius: "var(--radius-lg)",
              background: "var(--parchment-face)",
              border: "1px solid var(--gold)",
              color: "var(--grey)",
              fontFamily: "var(--body)",
              fontSize: "var(--text-body)",
            }}
          >
            {loading ? "Rousing the court…" : "No likenesses have yet been sculpted for the court."}
          </div>
        )}
      </div>

      {/* the court — thumbnail register */}
      <div
        style={{
          marginTop: "var(--space-8)",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(104px, 1fr))",
          gap: "var(--space-4)",
        }}
      >
        {models.map((m) => {
          const active = m.id === selected?.id;
          return (
            <button
              key={m.id}
              onClick={() => setSelected(m)}
              title={m.displayName}
              style={{
                border: active ? "1.5px solid var(--gold)" : "1px solid var(--gold-dark)",
                background: "var(--parchment-face)",
                borderRadius: "var(--radius-lg)",
                padding: "var(--space-2)",
                cursor: "pointer",
                textAlign: "center",
                boxShadow: active ? "var(--glow-candle)" : "none",
                transform: active ? "scale(1.03)" : "none",
                transition: "transform var(--dur-hover) var(--ease-tile), box-shadow var(--dur-hover) var(--ease-estate)",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: "var(--radius-md)",
                  overflow: "hidden",
                  background: `linear-gradient(180deg, #221a12, ${ESTATE_BLACK})`,
                }}
              >
                {m.thumbnailUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={m.thumbnailUrl}
                    alt={m.displayName}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                ) : null}
              </div>
              <div
                style={{
                  ...capLabel,
                  marginTop: "var(--space-2)",
                  fontSize: "var(--text-label-xs)",
                  letterSpacing: "var(--track-caps)",
                  color: active ? "var(--gold-dark)" : "var(--grey)",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {m.displayName}
              </div>
            </button>
          );
        })}
      </div>

      <p
        style={{
          marginTop: "var(--space-6)",
          textAlign: "center",
          fontFamily: "var(--body)",
          fontStyle: "italic",
          fontSize: "var(--text-fine)",
          color: "var(--grey)",
        }}
      >
        ❧ Drag to turn the figure · scroll to draw near · she resumes her turn when left to herself.
      </p>
    </div>
  );
}
