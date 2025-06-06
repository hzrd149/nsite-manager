import { Model } from "applesauce-core";
import { BLOSSOM_SERVER_LIST_KIND } from "applesauce-core/helpers";
import { UserBlossomServersModel } from "applesauce-core/models";
import { useActiveAccount, useEventModel } from "applesauce-react/hooks";
import { ProfilePointer } from "nostr-tools/nip19";
import { defer, EMPTY, ignoreElements, mergeWith } from "rxjs";

import { addressLoader } from "../services/loaders";

function UserServersQuery(pointer: ProfilePointer): Model<URL[]> {
  return (store) =>
    defer(() => {
      if (!store.hasReplaceable(BLOSSOM_SERVER_LIST_KIND, pointer.pubkey))
        return addressLoader({ kind: BLOSSOM_SERVER_LIST_KIND, ...pointer });
      else return EMPTY;
    }).pipe(
      ignoreElements(),
      mergeWith(store.model(UserBlossomServersModel, pointer.pubkey)),
    );
}

export default function useServers(pointer?: ProfilePointer) {
  const account = useActiveAccount();
  pointer = pointer || (account ? { pubkey: account.pubkey } : undefined);

  return useEventModel(UserServersQuery, pointer ? [pointer] : undefined);
}
