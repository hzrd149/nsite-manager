import { useEffect } from "react";
import { useActiveAccount, useStoreQuery } from "applesauce-react/hooks";
import { ReplaceableQuery } from "applesauce-core/queries";
import { ProfilePointer } from "nostr-tools/nip19";
import { getServersFromServerListEvent } from "blossom-client-sdk";

import { replaceableLoader } from "../services/loaders";

export default function useServers(pointer?: ProfilePointer, force?: boolean) {
  const account = useActiveAccount();
  pointer = pointer || account;

  useEffect(() => {
    if (pointer)
      replaceableLoader.next({
        kind: 10063,
        pubkey: pointer?.pubkey,
        force,
      });
  }, [pointer]);

  const event = useStoreQuery(
    ReplaceableQuery,
    pointer ? [10063, pointer.pubkey] : undefined,
  );

  return event && getServersFromServerListEvent(event);
}
