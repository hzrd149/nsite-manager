import { safeRelayUrls } from "applesauce-core/helpers";

export const NSITE_KIND = 34128;

export const BLOSSOM_ADVERTIZEMENT_KIND = 36363;

export const EXPLORE_RELAYS = safeRelayUrls([
  "wss://nostrue.com",
  "wss://relay.damus.io",
  "wss://nos.lol",
  "wss://relay.primal.net",
]);

export const COMMON_CONTACT_RELAYS = safeRelayUrls(["wss://purplepag.es/"]);
