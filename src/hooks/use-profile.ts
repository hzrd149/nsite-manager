import { Model } from "applesauce-core";
import { ProfileContent } from "applesauce-core/helpers";
import { ProfileModel } from "applesauce-core/models";
import { useActiveAccount, useEventModel } from "applesauce-react/hooks";
import { kinds } from "nostr-tools";
import { ProfilePointer } from "nostr-tools/nip19";

import { defer, EMPTY, ignoreElements, mergeWith } from "rxjs";
import { addressLoader } from "../services/loaders";

/** A custom query that loads the profile event and returns the parsed profile */
function UserProfileQuery(
  pointer: ProfilePointer,
): Model<ProfileContent | undefined> {
  return (store) =>
    defer(() => {
      // Request the profile from the loader if its not in the store
      if (!store.hasReplaceable(kinds.Metadata, pointer.pubkey))
        return addressLoader({ kind: kinds.Metadata, ...pointer });
      // Do nothing
      else return EMPTY;
    }).pipe(
      // Ignore events from the loader
      ignoreElements(),
      // Set output to the profile model from store
      mergeWith(store.model(ProfileModel, pointer.pubkey)),
    );
}

export default function useProfile(pointer?: ProfilePointer) {
  const account = useActiveAccount();
  pointer = pointer || (account ? { pubkey: account.pubkey } : undefined);

  return useEventModel(UserProfileQuery, pointer ? [pointer] : undefined);
}
