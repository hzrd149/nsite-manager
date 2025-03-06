import { bufferTime, filter, map, merge, Subject } from "rxjs";
import { openDB } from "idb";

import { eventStore } from "./stores";
import { getSeenRelays } from "applesauce-core/helpers";

const db = await openDB("event-metadata", 1, {
  upgrade(database) {
    database.createObjectStore("relays");
  },
});

// subscribe to event inserts and updates (add seen relay)
merge(eventStore.database.updated, eventStore.database.inserted).subscribe(
  (event) => {
    const seen = getSeenRelays(event);
    if (seen) write.next({ id: event.id, relays: Array.from(seen) });
  },
);

const write = new Subject<{ id: string; relays: string[] }>();

// write queue to database
write
  .pipe(
    // batch every 10s
    bufferTime(10_000),
    // ignore empty batches
    filter((b) => b.length > 0),
    // consolidate duplicates
    map((buffer) => {
      const map = new Map<string, Set<string>>();
      for (const item of buffer) {
        if (map.has(item.id)) {
          for (const relay of item.relays) map.get(item.id)!.add(relay);
        } else map.set(item.id, new Set(item.relays));
      }
      return map;
    }),
  )
  .subscribe(async (map) => {
    console.log("Writing event metadata", map.size);
    const tx = db.transaction("relays", "readwrite");
    for (const [id, relays] of map) {
      tx.store.put(relays, id);
    }
    await tx.done;
  });
