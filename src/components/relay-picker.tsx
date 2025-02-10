import { useState, FormEventHandler } from "react";
import { Button, CloseButton, Flex, Input, Link, Text } from "@chakra-ui/react";
import { useStoreQuery } from "applesauce-react/hooks";
import { TimelineQuery } from "applesauce-core/queries";
import { getTagValue, unixNow } from "applesauce-core/helpers";
import { Filter } from "nostr-tools";

import Favicon from "./server-favicon";
import useTimeline from "../hooks/use-timeline";

const onlineFilter: Filter = {
  kinds: [30166],
  "#n": ["clearnet"],
  since: unixNow() - 60 * 60_000,
};

function AddRelayForm({ onSubmit }: { onSubmit: (relay: string) => void }) {
  const [relay, setRelay] = useState("");

  // fetch online relays
  useTimeline(["wss://relay.nostr.watch/"], onlineFilter);

  const handleSubmit: FormEventHandler = (e) => {
    e.preventDefault();
    if (relay.trim()) onSubmit(relay);
    setRelay("");
  };

  const online = useStoreQuery(TimelineQuery, [onlineFilter]);
  const relaySuggestions =
    new Set(
      online
        ?.map((event) => getTagValue(event, "d"))
        .filter((url) => !!url) as string[],
    ) ?? [];

  return (
    <Flex as="form" onSubmit={handleSubmit} gap="2">
      <Input
        type="url"
        value={relay}
        onChange={(e) => setRelay(e.target.value)}
        required
        placeholder="wss://relay.example.com"
        name="relay"
        list="relay-suggestions"
      />

      <datalist id="relay-suggestions">
        {Array.from(relaySuggestions).map((url) => (
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

function RelayCard({
  relay,
  onRemove,
}: {
  relay: string;
  onRemove: () => void;
}) {
  const httpUrl = new URL(relay);
  httpUrl.protocol = httpUrl.protocol === "wss:" ? "https:" : "http:";

  return (
    <Flex
      gap="2"
      p="2"
      alignItems="center"
      borderWidth="1px"
      borderRadius="lg"
      key={relay.toString()}
    >
      <Favicon host={httpUrl.toString()} size="sm" />
      <Link href={httpUrl.toString()} target="_blank" fontSize="lg">
        {new URL(relay).toString()}
      </Link>

      <CloseButton ml="auto" onClick={onRemove} />
    </Flex>
  );
}

export default function RelayPicker({
  relays,
  onChange,
}: {
  relays: string[];
  onChange: (relays: string[]) => void;
}) {
  return (
    <>
      <Flex direction="column" gap="2">
        {relays.map((relay) => (
          <RelayCard
            relay={relay}
            key={relay.toString()}
            onRemove={() => onChange(relays.filter((s) => s !== relay))}
          />
        ))}
      </Flex>
      <AddRelayForm onSubmit={(relay) => onChange([...relays, relay])} />

      <Text color="GrayText" fontSize="sm">
        Find more relays at{" "}
        <Link href="https://nostr.watch" isExternal color="blue.500">
          nostr.watch
        </Link>
      </Text>
    </>
  );
}
