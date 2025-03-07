import { bufferTime, distinct, filter, map, merge, Subject } from "rxjs";
import { openDB } from "idb";

import { eventStore } from "./stores";
import { addSeenRelay, getSeenRelays } from "applesauce-core/helpers";

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
    // batch every 5s
    bufferTime(5_000),
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
      tx.store.put(Array.from(relays), id);
    }
    await tx.done;
  });

// load seen from cache
eventStore.database.inserted
  .pipe(
    // get event id
    map((e) => e.id),
    // only load ids once
    distinct(),
    // buffer into 5s chunks
    bufferTime(5_000),
    // ignore empty batches
    filter((b) => b.length > 0),
  )
  .subscribe(async (ids) => {
    const tx = db.transaction("relays", "readonly");
    for (const id of ids) {
      const event = eventStore.getEvent(id);

      if (event) {
        tx.store.get(id).then((relays) => {
          for (const relay of relays) addSeenRelay(event, relay);
        });
      }
    }

    console.log(`Loaded ${ids.length} from the database`);

    await tx.done;
  });
