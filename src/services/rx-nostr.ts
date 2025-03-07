import { createRxNostr, noopVerifier } from "rx-nostr";
import { defaultRelays } from "./settings";

const rxNostr = createRxNostr({
  verifier: noopVerifier,
  connectionStrategy: "lazy-keep",
});

// set default relays from app relays
defaultRelays.subscribe((relays) => rxNostr.setDefaultRelays(relays));

export default rxNostr;
