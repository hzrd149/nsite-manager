import { createRxNostr } from "rx-nostr";
import { verifier } from "rx-nostr-crypto";

const rxNostr = createRxNostr({ verifier, connectionStrategy: "lazy-keep" });

export default rxNostr;
