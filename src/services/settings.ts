import { safeParse } from "applesauce-core/helpers";
import { BehaviorSubject } from "rxjs";

import { DEFAULT_GATEWAY, DEFAULT_RELAYS, LOOKUP_RELAYS } from "../const";

// load settings from local storage
const defaultRelays = new BehaviorSubject<string[]>(
  safeParse(localStorage.relay) ?? DEFAULT_RELAYS,
);
const lookupRelays = new BehaviorSubject<string[]>(
  safeParse(localStorage.lookup) ?? LOOKUP_RELAYS,
);
const nsiteGateway = new BehaviorSubject<string>(
  safeParse(localStorage.gateway) ?? DEFAULT_GATEWAY,
);

// save changes
defaultRelays.subscribe(
  (relays) => (localStorage.relays = JSON.stringify(relays)),
);
lookupRelays.subscribe(
  (relays) => (localStorage.lookup = JSON.stringify(relays)),
);
nsiteGateway.subscribe((gateway) => (localStorage.gateway = gateway));

export { lookupRelays, defaultRelays, nsiteGateway };
