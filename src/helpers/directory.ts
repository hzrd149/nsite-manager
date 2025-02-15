import { getReplaceableIdentifier, getTagValue } from "applesauce-core/helpers";
import { NostrEvent } from "nostr-tools";

export type DirFolder = {
  type: "folder";
  name: string;
  children: number;
  modified: number;
};
export type DirFile = {
  type: "file";
  name: string;
  sha256: string;
  event: NostrEvent;
  modified: number;
};

function isInFolder(path: string[], dir: string[]) {
  for (let i = 0; i < dir.length; i++) {
    if (path[i] !== dir[i]) return false;
  }
  return true;
}

export function getDirectoryFromEvents(events: NostrEvent[], path: string) {
  const folders = new Map<string, DirFolder>();
  const files = new Map<string, DirFile>();

  const dir = path === "/" ? [] : path.replace(/(^\/|\/$)/g, "").split("/");
  for (const event of events) {
    const filePath = getReplaceableIdentifier(event).split("/").slice(1);

    if (filePath.length > dir.length && isInFolder(filePath, dir)) {
      const name = filePath[dir.length];
      const modified = event.created_at;

      if (filePath.length === dir.length + 1) {
        // file
        const sha256 = getTagValue(event, "x")!;
        if (sha256)
          files.set(name, { type: "file", name, modified, sha256, event });
      } else {
        // folder
        if (folders.has(name)) {
          // update modified
          const folder = folders.get(name)!;
          folder.modified = Math.max(modified, folder.modified);
          folder.children++;
        } else {
          folders.set(name, { type: "folder", name, modified, children: 1 });
        }
      }
    }
  }

  return [...folders.values(), ...files.values()];
}
