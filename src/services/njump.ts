import { NostrConnectSigner, PasswordSigner } from "applesauce-signers";
import { createNostrConnectConnection } from "./nostr-connect-connection";
import {
  NostrConnectAccount,
  PasswordAccount,
  SimpleAccount,
} from "applesauce-accounts/accounts";
import accountManager from "./accounts";
import { nip19 } from "nostr-tools";

const njumpLink = new URL("https://start.njump.me");
njumpLink.searchParams.append("an", "nsite manager");
njumpLink.searchParams.append("at", "web");
njumpLink.searchParams.append("ac", location.href);

export async function createAccountFromCredentials(credentials: string) {
  if (credentials.startsWith("bunker://")) {
    // handle bunker
    const signer = await NostrConnectSigner.fromBunkerURI(
      credentials,
      createNostrConnectConnection(),
    );
    const pubkey = await signer.getPublicKey();
    const account = new NostrConnectAccount(pubkey, signer);

    return account;
  } else if (credentials.startsWith("nsec")) {
    // handle nsec
    const decode = nip19.decode(credentials);
    if (decode.type === "nsec") {
      const account = SimpleAccount.fromKey(decode.data);

      return account;
    }
  } else if (credentials.startsWith("ncryptsec")) {
    // handle ncryptsec
    const signer = new PasswordSigner();
    signer.ncryptsec = credentials;
    const pubkey = await signer.getPublicKey();
    const account = new PasswordAccount(pubkey, signer);

    return account;
  }
}

// handle credentials
if (window.location.hash && window.location.hash.startsWith("#nostr-login")) {
  const credentials = window.location.hash.replace(/^#nostr-login=/, "");

  const account = await createAccountFromCredentials(credentials);
  if (account) {
    accountManager.addAccount(account);
    accountManager.setActive(account);
  }

  // remove from URL
  history.replaceState(null, "", "/");
}

export { njumpLink };
