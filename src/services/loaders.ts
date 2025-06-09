import {
  createAddressLoader,
  createEventLoader,
} from "applesauce-loaders/loaders";

import { cacheRequest } from "./cache";
import { pool } from "./pool";
import { defaultRelays$, lookupRelays$ } from "./settings";
import { eventStore } from "./stores";

export const addressLoader = createAddressLoader(pool, {
  cacheRequest,
  lookupRelays: lookupRelays$,
  extraRelays: defaultRelays$,
  eventStore,
});

export const eventLoader = createEventLoader(pool, {
  cacheRequest,
  extraRelays: defaultRelays$,
  eventStore,
});
