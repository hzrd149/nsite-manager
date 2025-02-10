import { useState, FormEventHandler } from "react";
import { Button, CloseButton, Flex, Input, Link, Text } from "@chakra-ui/react";
import { useStoreQuery } from "applesauce-react/hooks";
import { TimelineQuery } from "applesauce-core/queries";
import { getTagValue } from "applesauce-core/helpers";

import { BLOSSOM_ADVERTIZEMENT_KIND, EXPLORE_RELAYS } from "../const";
import useTimeline from "../hooks/use-timeline";
import Favicon from "./server-favicon";

function AddServerForm({ onSubmit }: { onSubmit: (server: string) => void }) {
  const [server, setServer] = useState("");

  useTimeline(EXPLORE_RELAYS, {
    kinds: [BLOSSOM_ADVERTIZEMENT_KIND],
  });

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (server.trim()) onSubmit(server);
    setServer("");
  };

  const servers = useStoreQuery(TimelineQuery, [
    { kinds: [BLOSSOM_ADVERTIZEMENT_KIND] },
  ]);
  const serversSuggestions =
    new Set(
      servers
        ?.map((event) => getTagValue(event, "d"))
        .filter((url) => !!url) as string[],
    ) ?? [];

  return (
    <Flex as="form" onSubmit={handleSubmit} gap="2">
      <Input
        type="url"
        value={server}
        onChange={(e) => setServer(e.target.value)}
        required
        placeholder="https://nostr.download"
        name="server"
        list="server-suggestions"
      />

      <datalist id="server-suggestions">
        {Array.from(serversSuggestions).map((url) => (
          <option key={url} value={url}>
            {url}
          </option>
        ))}
      </datalist>
      <Button type="submit" colorScheme="pink">
        Add
      </Button>
    </Flex>
  );
}

function ServerCard({
  server,
  onRemove,
}: {
  server: string;
  onRemove: () => void;
}) {
  return (
    <Flex
      gap="2"
      p="2"
      alignItems="center"
      borderWidth="1px"
      borderRadius="lg"
      key={server.toString()}
    >
      <Favicon host={server.toString()} size="sm" />
      <Flex direction="column" lineHeight={1} gap="1">
        <Link href={server.toString()} target="_blank" fontSize="lg">
          {new URL(server).toString()}
        </Link>
      </Flex>

      <CloseButton ml="auto" onClick={onRemove} />
    </Flex>
  );
}

export default function ServerPicker({
  servers,
  onChange,
}: {
  servers: string[];
  onChange: (servers: string[]) => void;
}) {
  return (
    <>
      {servers.length > 0 && (
        <Flex direction="column" gap="2">
          {servers.map((server) => (
            <ServerCard
              key={server}
              server={server}
              onRemove={() => onChange(servers.filter((s) => s !== server))}
            />
          ))}
        </Flex>
      )}
      <AddServerForm onSubmit={(server) => onChange([...servers, server])} />

      <Text color="GrayText" fontSize="sm">
        Find more servers at{" "}
        <Link href="https://blossomservers.com" isExternal color="blue.500">
          blossomservers.com
        </Link>
      </Text>
    </>
  );
}
