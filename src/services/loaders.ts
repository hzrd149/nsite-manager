import { ReplaceableLoader } from "applesauce-loaders";

import { COMMON_CONTACT_RELAYS } from "../const";
import rxNostr from "./rx-nostr";
import { cacheRequest } from "./cache";
import { eventStore } from "./stores";

export const replaceableLoader = new ReplaceableLoader(rxNostr, {
  cacheRequest,
  bufferTime: 500,
  lookupRelays: COMMON_CONTACT_RELAYS,
});

replaceableLoader.subscribe((packet) =>
  eventStore.add(packet.event, packet.from),
);
