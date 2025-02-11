import { safeRelayUrls } from "applesauce-core/helpers";

export const NSITE_KIND = 34128;

export const BLOSSOM_ADVERTIZEMENT_KIND = 36363;

export const DEFAULT_RELAYS = safeRelayUrls([
  "wss://relay.damus.io/",
  "wss://nos.lol/",
  "wss://relay.primal.net/",
  "wss://nostrue.com/",
]);

export const LOOKUP_RELAYS = safeRelayUrls(["wss://purplepag.es/"]);
