import { timelineLoader } from "applesauce-loaders/loaders";
import { useEventStore } from "applesauce-react/hooks";
import hash_sum from "hash-sum";
import { Filter } from "nostr-tools";
import { useEffect, useMemo } from "react";

import { cacheRequest } from "../services/cache";
import { pool } from "../services/pool";

export default function useTimeline(
  relays?: string[],
  filters?: Filter | Filter[],
) {
  const eventStore = useEventStore();
  const timeline = useMemo(() => {
    if (!relays || !filters) return;

    return timelineLoader(pool.request.bind(pool), relays, filters, {
      cache: cacheRequest,
      eventStore,
    });
  }, [hash_sum(filters), relays?.join("|")]);

  // load first page on mount
  useEffect(() => {
    if (timeline) timeline().subscribe();
  }, [eventStore, timeline]);

  return timeline;
}
