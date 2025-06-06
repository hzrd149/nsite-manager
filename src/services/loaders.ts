import {
  addressPointerLoader,
  eventPointerLoader,
} from "applesauce-loaders/loaders";

import { cacheRequest } from "./cache";
import { pool } from "./pool";
import { defaultRelays$, lookupRelays$ } from "./settings";
import { eventStore } from "./stores";

export const addressLoader = addressPointerLoader(pool.request.bind(pool), {
  cacheRequest,
  lookupRelays: lookupRelays$,
  extraRelays: defaultRelays$,
  eventStore,
});

export const eventLoader = eventPointerLoader(pool.request.bind(pool), {
  cacheRequest,
  extraRelays: defaultRelays$,
  eventStore,
});
