import { nip19 } from "nostr-tools";

export function createGatewayURL(
  pubkey: string,
  gateway: string,
  path: string = "/",
) {
  const url = new URL(path, gateway);
  url.hostname = nip19.npubEncode(pubkey) + "." + url.hostname;
  return url.toString();
}
