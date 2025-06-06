import { useActiveAccount, useEventModel } from "applesauce-react/hooks";
import { kinds } from "nostr-tools";
import { ProfilePointer } from "nostr-tools/nip19";

import { Model } from "applesauce-core";
import { MailboxesModel } from "applesauce-core/models";
import { defer, EMPTY, ignoreElements, mergeWith } from "rxjs";
import { addressLoader } from "../services/loaders";

function UserMailboxesQuery(pointer: ProfilePointer): Model<
  | {
      inboxes: string[];
      outboxes: string[];
    }
  | undefined
> {
  return (store) =>
    defer(() => {
      if (!store.hasReplaceable(kinds.RelayList, pointer.pubkey))
        return addressLoader({ kind: kinds.RelayList, ...pointer });
      else return EMPTY;
    }).pipe(
      ignoreElements(),
      mergeWith(store.model(MailboxesModel, pointer.pubkey)),
    );
}

export default function useMailboxes(pointer?: ProfilePointer) {
  const account = useActiveAccount();
  pointer = pointer || (account ? { pubkey: account.pubkey } : undefined);

  return useEventModel(UserMailboxesQuery, pointer ? [pointer] : undefined);
}
