// Server-side Meshy API helper.
// IMPORTANT: only import this from server code (API routes / server components).
// It reads MESHY_API_KEY and must never be bundled into the client.
//
// Meshy's per-asset library IDs are NOT retrievable via the public REST API, so we
// enumerate the account's tasks through the documented list endpoints instead. Each
// task's model_urls are short-lived signed URLs (they expire), so we cache for a few
// minutes and the client should re-fetch rather than persist a URL.

const BASE = process.env.MESHY_BASE_URL || "https://api.meshy.ai";

const LIST_ENDPOINTS = [
  { tag: "image-to-3d", url: `${BASE}/openapi/v1/image-to-3d` },
  { tag: "text-to-3d", url: `${BASE}/openapi/v2/text-to-3d` },
  { tag: "multi-image-to-3d", url: `${BASE}/openapi/v1/multi-image-to-3d` },
];

const PKG_LABELS: Record<string, string> = {
  "punk rococo": "punk_rococo",
  "classic rococo": "classic_rococo",
  fantasy: "fantasy",
  modern: "modern",
};

export type MeshyModel = {
  id: string;
  name: string;
  /** clean name with any " - Fantasy" style suffix stripped */
  displayName: string;
  package: string;
  status: string;
  glbUrl: string | null;
  fbxUrl: string | null;
  objUrl: string | null;
  usdzUrl: string | null;
  thumbnailUrl: string | null;
  source: string;
};

type RawTask = Record<string, any> & { _source: string };

function parseName(name: string, fallbackPkg: string) {
  const displayName = name.replace(/\s*[-–—]\s*[^-–—]+$/, "").trim() || name;
  const suffix = (name.match(/[-–—]\s*([^-–—]+)$/)?.[1] || "").trim().toLowerCase();
  return { displayName, package: PKG_LABELS[suffix] || fallbackPkg };
}

async function fetchTasks(key: string): Promise<RawTask[]> {
  const all: RawTask[] = [];
  for (const ep of LIST_ENDPOINTS) {
    for (let page = 1; page <= 40; page++) {
      const url = `${ep.url}?page_num=${page}&page_size=50&sort_by=-created_at`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
        cache: "no-store",
      });
      if (!res.ok) break;
      const json: any = await res.json().catch(() => null);
      const items: any[] = Array.isArray(json)
        ? json
        : json?.result || json?.data || json?.tasks || [];
      if (!items.length) break;
      for (const t of items) all.push({ ...t, _source: ep.tag });
      if (items.length < 50) break;
    }
  }
  return all;
}

function toModel(t: RawTask): MeshyModel {
  const id = t.id || t.task_id || "";
  const name = (t.name || t.prompt || id) as string;
  const mu = t.model_urls || t.result?.model_urls || {};
  const { displayName, package: pkg } = parseName(name, t._source);
  return {
    id,
    name,
    displayName,
    package: pkg,
    status: t.status || t.state || "",
    glbUrl: mu.glb || null,
    fbxUrl: mu.fbx || null,
    objUrl: mu.obj || null,
    usdzUrl: mu.usdz || null,
    thumbnailUrl: t.thumbnail_url || t.result?.thumbnail_url || null,
    source: t._source,
  };
}

let cache: { at: number; models: MeshyModel[] } | null = null;
const TTL_MS = 5 * 60 * 1000; // signed URLs are short-lived; refresh often

/** List all finished 3D models on the Meshy account (cached for 5 min). */
export async function listMeshyModels(opts?: { force?: boolean }): Promise<MeshyModel[]> {
  const key = process.env.MESHY_API_KEY;
  if (!key) throw new Error("MESHY_API_KEY is not set");
  if (!opts?.force && cache && Date.now() - cache.at < TTL_MS) return cache.models;

  const tasks = await fetchTasks(key);
  const models = tasks.map(toModel).filter((m) => m.glbUrl);
  cache = { at: Date.now(), models };
  return models;
}

/** Fresh signed URLs for a single model id (use right before rendering). */
export async function getMeshyModel(id: string): Promise<MeshyModel | null> {
  const models = await listMeshyModels({ force: true });
  return models.find((m) => m.id === id) || null;
}
