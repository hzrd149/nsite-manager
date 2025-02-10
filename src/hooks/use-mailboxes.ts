import { useEffect } from "react";
import { useActiveAccount, useStoreQuery } from "applesauce-react/hooks";
import { MailboxesQuery } from "applesauce-core/queries";
import { ProfilePointer } from "nostr-tools/nip19";
import { kinds } from "nostr-tools";

import { replaceableLoader } from "../services/loaders";

export default function useMailboxes(
  pointer?: ProfilePointer,
  force?: boolean,
) {
  const account = useActiveAccount();
  pointer = pointer || account;

  useEffect(() => {
    if (pointer)
      replaceableLoader.next({
        kind: kinds.RelayList,
        pubkey: pointer?.pubkey,
        force,
      });
  }, [pointer]);

  return useStoreQuery(MailboxesQuery, pointer ? [pointer.pubkey] : undefined);
}
