import { Avatar, AvatarProps } from "@chakra-ui/react";
import useProfile from "../hooks/use-profile";
import { getDisplayName } from "applesauce-core/helpers";

export default function UserAvatar({
  pubkey,
  ...props
}: { pubkey: string } & Omit<AvatarProps, "src">) {
  const profile = useProfile({ pubkey });

  return (
    <Avatar src={profile?.picture} title={getDisplayName(profile)} {...props} />
  );
}
