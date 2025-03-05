import { useEffect } from "react";
import { map, merge } from "rxjs";
import { useEventStore } from "applesauce-react/hooks";
import hash_sum from "hash-sum";
import { createRxOneshotReq } from "rx-nostr";
import { Filter } from "nostr-tools";
import { addSeenRelay } from "applesauce-core/helpers";

import { cacheRequest } from "../services/cache";
import rxNostr from "../services/rx-nostr";

export default function useRequest(
  relays?: string[],
  filters?: Filter | Filter[],
) {
  if (filters && !Array.isArray(filters)) filters = [filters];

  const eventStore = useEventStore();

  useEffect(() => {
    if (!relays || !filters) return;

    const req = createRxOneshotReq({ filters });

    const sub = merge(
      cacheRequest(filters),
      rxNostr.use(req).pipe(
        map((p) => {
          addSeenRelay(p.event, p.from);
          return p.event;
        }),
      ),
    ).subscribe((event) => eventStore.add(event));

    return () => sub.unsubscribe();
  }, [hash_sum(filters), relays?.join("|"), eventStore]);
}
