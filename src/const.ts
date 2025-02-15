import { normalizeURL } from "applesauce-core/helpers";

export const NSITE_KIND = 34128;

export const BLOSSOM_ADVERTIZEMENT_KIND = 36363;

export const DEFAULT_RELAYS = [
  "wss://relay.damus.io/",
  "wss://nos.lol/",
  "wss://relay.primal.net/",
  "wss://nostrue.com/",
].map(normalizeURL);

export const LOOKUP_RELAYS = ["wss://purplepag.es/"].map(normalizeURL);
