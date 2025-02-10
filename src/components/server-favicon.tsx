import { useMemo } from "react";
import { Avatar, AvatarProps, Icon } from "@chakra-ui/react";

export type RelayFaviconProps = Omit<AvatarProps, "src"> & {
  host: string;
};
export default function Favicon({ host, ...props }: RelayFaviconProps) {
  const url = useMemo(() => {
    const url = new URL(host);
    url.pathname = "/favicon.ico";
    return url.toString();
  }, [host]);

  return (
    <Avatar
      src={url}
      icon={<Icon boxSize={6} />}
      overflow="hidden"
      {...props}
    />
  );
}
