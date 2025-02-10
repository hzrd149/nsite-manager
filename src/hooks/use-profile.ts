import { useEffect } from "react";
import { useActiveAccount, useStoreQuery } from "applesauce-react/hooks";
import { ProfileQuery } from "applesauce-core/queries";
import { ProfilePointer } from "nostr-tools/nip19";
import { kinds } from "nostr-tools";

import { replaceableLoader } from "../services/loaders";

export default function useProfile(pointer?: ProfilePointer, force?: boolean) {
  const account = useActiveAccount();
  pointer = pointer || account;

  useEffect(() => {
    if (pointer)
      replaceableLoader.next({
        kind: kinds.Metadata,
        pubkey: pointer?.pubkey,
        force,
      });
  }, [pointer]);

  return useStoreQuery(ProfileQuery, pointer ? [pointer.pubkey] : undefined);
}
