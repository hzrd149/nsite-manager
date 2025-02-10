import { Text, TextProps } from "@chakra-ui/react";
import useProfile from "../hooks/use-profile";
import { getDisplayName } from "applesauce-core/helpers";
import { npubEncode } from "nostr-tools/nip19";

export default function UserName({
  pubkey,
  ...props
}: { pubkey: string } & Omit<TextProps, "children">) {
  const profile = useProfile({ pubkey });

  return (
    <Text as="span" {...props}>
      {getDisplayName(profile) || npubEncode(pubkey).slice(0, 10)}
    </Text>
  );
}
