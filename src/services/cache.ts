import { isFromCache } from "applesauce-core/helpers";
import { CacheRequest } from "applesauce-loaders";
import { addEvents, getEventsForFilters, openDB } from "nostr-idb";
import { Filter } from "nostr-tools";
import { bufferTime, filter } from "rxjs";
import { eventStore } from "./stores";

const db = await openDB();

export const cacheRequest: CacheRequest = (filters: Filter[]) =>
  getEventsForFilters(db, filters);

// save all events to cache
eventStore.insert$
  .pipe(
    filter((e) => !isFromCache(e)),
    bufferTime(1000),
    filter((b) => b.length > 0),
  )
  .subscribe((events) => {
    addEvents(db, events);
  });
