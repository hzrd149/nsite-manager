import { isFromCache, markFromCache } from "applesauce-core/helpers";
import { CacheRelay, openDB } from "nostr-idb";
import { Filter, NostrEvent } from "nostr-tools";
import { Observable } from "rxjs";
import rxNostr from "./rx-nostr";
import { eventStore } from "./stores";

const db = await openDB();
const cache = new CacheRelay(db);
cache.connect();

export function cacheRequest(filters: Filter[]): Observable<NostrEvent> {
  return new Observable((observer) => {
    const sub = cache.subscribe(filters, {
      onevent: (event) => {
        markFromCache(event);
        observer.next(event);
      },
      oneose: () => {
        sub.close();
        observer.complete();
      },
      onclose: () => {
        sub.close();
        observer.complete();
      },
    });
  });
}

// save all events to cache
rxNostr.createAllEventObservable().subscribe((packet) => {
  if (!isFromCache(packet.event)) cache.publish(packet.event);
});

// save all outgoing messages to local cache and event store
rxNostr.createOutgoingMessageObservable().subscribe((packet) => {
  if (packet.message[0] === "EVENT") {
    cache.publish(packet.message[1]);
    eventStore.add(packet.message[1]);
  }
});

export default cache;
