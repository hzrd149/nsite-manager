import { safeParse } from "applesauce-core/helpers";
import { BehaviorSubject } from "rxjs";

import { DEFAULT_RELAYS, LOOKUP_RELAYS } from "../const";

// load settings from local storage
const defaultRelays = new BehaviorSubject<string[]>(
  safeParse(localStorage.relay) ?? DEFAULT_RELAYS,
);
const lookupRelays = new BehaviorSubject<string[]>(
  safeParse(localStorage.lookup) ?? LOOKUP_RELAYS,
);

// save changes
defaultRelays.subscribe(
  (relays) => (localStorage.relays = JSON.stringify(relays)),
);
lookupRelays.subscribe(
  (relays) => (localStorage.lookup = JSON.stringify(relays)),
);

export { lookupRelays, defaultRelays };
