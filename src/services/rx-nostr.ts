import { createRxNostr } from "rx-nostr";
import { verifier } from "rx-nostr-crypto";
import { defaultRelays } from "./settings";

const rxNostr = createRxNostr({
  verifier,
  connectionStrategy: "lazy-keep",
});

// set default relays from app relays
defaultRelays.subscribe((relays) => rxNostr.setDefaultRelays(relays));

export default rxNostr;
