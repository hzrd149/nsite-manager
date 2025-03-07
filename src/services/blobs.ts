import {
  combineLatest,
  distinctUntilKeyChanged,
  EMPTY,
  filter,
  from,
  Observable,
  of,
  shareReplay,
  startWith,
  switchMap,
  tap,
} from "rxjs";
import { IAccount } from "applesauce-accounts";
import { UserBlossomServersQuery } from "applesauce-core/queries";
import { BlobDescriptor, BlossomClient } from "blossom-client-sdk";
import { NostrEvent } from "nostr-tools";

import accountManager from "./accounts";
import { queryStore } from "./stores";

const listAuthCache = new Map<string, NostrEvent>();
async function getListAuth(account: IAccount) {
  let auth = listAuthCache.get(account.pubkey);

  if (!auth) {
    auth = await BlossomClient.createListAuth(async (d) =>
      account.signEvent(d),
    );
    listAuthCache.set(account.pubkey, auth);
  }

  return auth;
}

function getServerBlobs(
  account: IAccount,
  servers: URL[],
): Observable<Record<string, BlobDescriptor[]>> {
  return from(getListAuth(account)).pipe(
    switchMap((auth) =>
      combineLatest(
        servers.reduce<Record<string, Observable<BlobDescriptor[]>>>(
          (dir, server) => ({
            ...dir,
            [server.toString()]: from(
              BlossomClient.listBlobs(server, account.pubkey, {
                auth,
              }),
            ).pipe(startWith([])),
          }),
          {},
        ),
      ).pipe(tap((blobs) => console.log(blobs))),
    ),
  );
}

export const serverBlobs = accountManager.active$.pipe(
  // ignore empty accounts
  filter((a) => a !== undefined),
  // wait for pubkey to change
  distinctUntilKeyChanged("pubkey"),
  // when account updates, get blossom servers
  switchMap((account) =>
    combineLatest([
      of(account),
      queryStore.createQuery(UserBlossomServersQuery, account.pubkey),
    ]),
  ),
  // fetch lists of each server
  switchMap(([account, servers]) =>
    servers ? from(getServerBlobs(account, servers)) : EMPTY,
  ),
  // reply result
  shareReplay(1),
);
