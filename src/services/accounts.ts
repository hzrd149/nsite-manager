import { AccountManager, SerializedAccount } from "applesauce-accounts";
import {
  AmberClipboardAccount,
  registerCommonAccountTypes,
} from "applesauce-accounts/accounts";
import { safeParse } from "applesauce-core/helpers/json";
import { onlyEvents } from "applesauce-relay";
import { NostrConnectSigner } from "applesauce-signers";

import { pool } from "./pool";
import { lastValueFrom } from "rxjs";

// Setup nostr connect signer
NostrConnectSigner.subscriptionMethod = (relays, filters) =>
  pool.subscription(relays, filters).pipe(onlyEvents());
NostrConnectSigner.publishMethod = async (relays, event) => {
  await lastValueFrom(pool.publish(relays, event));
};

const accountManager = new AccountManager();
registerCommonAccountTypes(accountManager);
accountManager.registerType(AmberClipboardAccount);

// load all accounts
if (localStorage.getItem("accounts")) {
  const json = safeParse<SerializedAccount<any, any>[]>(
    localStorage.getItem("accounts")!,
  );
  if (json) accountManager.fromJSON(json);
}

// save accounts to database when they change
accountManager.accounts$.subscribe(async () => {
  localStorage.setItem("accounts", JSON.stringify(accountManager.toJSON()));
});

// set active account
if (localStorage.active) accountManager.setActive(localStorage.active);

// save changes
accountManager.active$.subscribe((account) => {
  if (account) localStorage.setItem("active", account.id);
  else localStorage.removeItem("active");
});

export default accountManager;
