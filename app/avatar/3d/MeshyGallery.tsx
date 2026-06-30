"use client";

import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import * as THREE from "three";

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

// ----- estate palette -----
const CREAM = "#ece0c4";
const GOLD = "#caa24e";
const SLATE = "#1b2330";

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

type Spin = { y: number; drag: boolean; px: number };

/** Loads a GLB, centers + normalizes its size, and turntable-spins it. */
function Model({
  url,
  spin,
  onReady,
}: {
  url: string;
  spin: React.MutableRefObject<Spin>;
  onReady: () => void;
}) {
  const gltf = useLoader(GLTFLoader, url);
  const ref = useRef<THREE.Group>(null);

  const scene = useMemo(() => {
    const root = gltf.scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const scale = 2 / maxDim;
    root.scale.setScalar(scale);
    // recenter after scaling so the model spins around its own middle
    root.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
    return root;
  }, [gltf]);

  useEffect(() => {
    onReady();
  }, [scene, onReady]);

  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    if (!spin.current.drag) spin.current.y += Math.min(dt, 0.05) * 0.45; // slow auto-spin
    g.rotation.y = spin.current.y;
  });

  return (
    <group ref={ref}>
      <primitive object={scene} />
    </group>
  );
}

function Viewer({ url }: { url: string }) {
  const spin = useRef<Spin>({ y: 0, drag: false, px: 0 });
  const [busy, setBusy] = useState(true);
  const [failed, setFailed] = useState(false);

  // reset state whenever the model changes
  useEffect(() => {
    setBusy(true);
    setFailed(false);
  }, [url]);

  const onDown = (e: ReactPointerEvent) => {
    spin.current.drag = true;
    spin.current.px = e.clientX;
  };
  const onMove = (e: ReactPointerEvent) => {
    if (!spin.current.drag) return;
    const dx = e.clientX - spin.current.px;
    spin.current.px = e.clientX;
    spin.current.y += dx * 0.01;
  };
  const onUp = () => {
    spin.current.drag = false;
  };

  return (
    <div
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
      style={{
        position: "relative",
        width: "100%",
        height: "min(60vh, 520px)",
        borderRadius: 16,
        overflow: "hidden",
        background: `radial-gradient(circle at 50% 35%, #2a3547 0%, ${SLATE} 70%)`,
        cursor: "grab",
        touchAction: "none",
      }}
    >
      {(busy || failed) && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            color: CREAM,
            font: "500 14px/1.4 ui-sans-serif, system-ui",
            letterSpacing: 0.4,
            zIndex: 2,
            pointerEvents: "none",
            textAlign: "center",
            padding: 16,
          }}
        >
          {failed ? "Couldn’t load this model. Try Refresh." : "Loading model…"}
        </div>
      )}
      <Canvas camera={{ position: [0, 0.2, 4], fov: 35 }} dpr={[1, 2]}>
        <ambientLight intensity={0.8} />
        <directionalLight position={[3, 5, 4]} intensity={1.5} />
        <directionalLight position={[-4, 2, -3]} intensity={0.6} color={GOLD} />
        <LoadBoundary
          fallback={null}
          onError={() => {
            setBusy(false);
            setFailed(true);
          }}
        >
          <Suspense fallback={null}>
            <Model url={url} spin={spin} onReady={() => setBusy(false)} />
          </Suspense>
        </LoadBoundary>
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

  return (
    <div style={{ maxWidth: 920, margin: "0 auto", padding: "24px 16px", color: "#27201a" }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 style={{ margin: 0, font: "600 24px/1.2 ui-serif, Georgia, serif", color: "#3a2a1c" }}>
            3D Avatar Gallery
          </h1>
          <p style={{ margin: "4px 0 0", color: "#6b5a48", fontSize: 14 }}>
            {selected ? selected.displayName : "Your Meshy models"}
            {selected ? <span style={{ color: "#a08a6e" }}> · {selected.package.replace(/_/g, " ")}</span> : null}
          </p>
        </div>
        <button
          onClick={() => load(true)}
          style={{
            border: `1px solid ${GOLD}`,
            background: "transparent",
            color: "#7a5e2a",
            borderRadius: 999,
            padding: "6px 14px",
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          ↻ Refresh
        </button>
      </div>

      <div style={{ marginTop: 16 }}>
        {error ? (
          <div style={{ padding: 24, borderRadius: 12, background: "#fbeaea", color: "#8a2b2b", fontSize: 14 }}>
            Couldn’t load models: {error}
          </div>
        ) : selected?.glbUrl ? (
          <Viewer url={`/api/meshy/model/${selected.id}`} />
        ) : (
          <div style={{ padding: 24, borderRadius: 12, background: "#f3ecdd", color: "#6b5a48", fontSize: 14 }}>
            {loading ? "Loading your models…" : "No 3D models found on your Meshy account."}
          </div>
        )}
      </div>

      {/* thumbnail picker */}
      <div
        style={{
          marginTop: 16,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))",
          gap: 10,
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
                border: active ? `2px solid ${GOLD}` : "2px solid transparent",
                background: "#f3ecdd",
                borderRadius: 12,
                padding: 6,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1 / 1",
                  borderRadius: 8,
                  overflow: "hidden",
                  background: "#e3d8c2",
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
                  marginTop: 4,
                  fontSize: 11,
                  color: "#5a4a38",
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
    </div>
  );
}
