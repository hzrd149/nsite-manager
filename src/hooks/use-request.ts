import { mapEventsToStore } from "applesauce-core";
import { makeCacheRequest } from "applesauce-loaders/helpers";
import { useEventStore } from "applesauce-react/hooks";
import hash_sum from "hash-sum";
import { Filter } from "nostr-tools";
import { useEffect } from "react";
import { merge } from "rxjs";

import { cacheRequest } from "../services/cache";
import { pool } from "../services/pool";

export default function useRequest(
  relays?: string[],
  filters?: Filter | Filter[],
) {
  if (filters && !Array.isArray(filters)) filters = [filters];

  const eventStore = useEventStore();

  useEffect(() => {
    if (!relays || !filters) return;

    const sub = merge(
      makeCacheRequest(cacheRequest, filters),
      pool.request(relays, filters),
    )
      .pipe(mapEventsToStore(eventStore))
      .subscribe();

    return () => sub.unsubscribe();
  }, [hash_sum(filters), relays?.join("|"), eventStore]);
}
