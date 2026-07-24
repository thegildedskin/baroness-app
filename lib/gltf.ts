// Shared GLTF loader configured with a self-hosted Draco decoder (public/draco/).
// Compressed GLBs from the build-models pipeline (KHR_draco_mesh_compression)
// load through this; plain GLBs are unaffected (Draco only engages when present).

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";

let draco: DRACOLoader | null = null;
function getDraco(): DRACOLoader {
  if (!draco) {
    draco = new DRACOLoader();
    draco.setDecoderPath("/draco/"); // self-hosted decoder (see public/draco)
  }
  return draco;
}

/** Pass as the 3rd arg to useLoader(GLTFLoader, url, setupDracoLoader). */
export function setupDracoLoader(loader: GLTFLoader) {
  loader.setDRACOLoader(getDraco());
}

export { GLTFLoader };
