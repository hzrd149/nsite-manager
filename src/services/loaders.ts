import { ReplaceableLoader } from "applesauce-loaders";

import rxNostr from "./rx-nostr";
import { cacheRequest } from "./cache";
import { eventStore } from "./stores";
import { lookupRelays } from "./settings";

export const replaceableLoader = new ReplaceableLoader(rxNostr, {
  cacheRequest,
  bufferTime: 500,
  lookupRelays: lookupRelays.value,
});

// update lookup relays when they change
lookupRelays.subscribe((relays) => {
  replaceableLoader.lookupRelays = relays;
});

// start loader and send events to eventStore
replaceableLoader.subscribe((packet) =>
  eventStore.add(packet.event, packet.from),
);
