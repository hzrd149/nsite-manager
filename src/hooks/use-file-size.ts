import { LRU } from "applesauce-core/helpers";
import { useEffect, useState } from "react";

const cache = new LRU<number>(1000);

export default function useFileSize(hash: string, servers?: (string | URL)[]) {
  const [size, setSize] = useState<number | undefined>(cache.get(hash));

  useEffect(() => {
    if (!servers) return;

    if (!cache.has(hash)) {
      (async () => {
        for (const server of servers) {
          try {
            const res = await fetch(new URL(hash, server), { method: "HEAD" });

            if (res.ok && res.headers.has("content-length")) {
              const size = parseInt(res.headers.get("content-length")!);
              cache.set(hash, size);
              setSize(size);
              break;
            }
          } catch (error) {}
        }
      })();
    }
  }, [hash, servers?.join(",")]);

  return size;
}
