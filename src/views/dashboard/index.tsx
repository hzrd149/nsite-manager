import { useMemo } from "react";
import {
  Alert,
  AlertIcon,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  Link,
  SimpleGrid,
} from "@chakra-ui/react";
import { ExternalLinkIcon } from "@chakra-ui/icons";
import { Filter, kinds } from "nostr-tools";
import { Navigate, Link as RouterLink } from "react-router-dom";
import {
  useActiveAccount,
  useObservable,
  useStoreQuery,
} from "applesauce-react/hooks";
import { ReadonlyAccount } from "applesauce-accounts/accounts";
import { TimelineQuery } from "applesauce-core/queries";

import UserName from "../../components/user-name";
import UserAvatar from "../../components/user-avatar";
import { NSITE_KIND } from "../../const";
import useMailboxes from "../../hooks/use-mailboxes";
import useTimeline from "../../hooks/use-timeline";
import { nsiteGateway } from "../../services/settings";
import { createGatewayURL } from "../../helpers/url";
import useRequest from "../../hooks/use-request";
import RelayEventTable, { RelayEventsChart } from "./relay-event-table";
import FileExtTable, { FileExtChart } from "./file-ext-table";
import { ServerBlobsChart, ServerBlobsTable } from "./server-blobs-table";
import useServers from "../../hooks/use-servers";

export default function DashboardView() {
  const gateway = useObservable(nsiteGateway);
  const account = useActiveAccount();
  if (!account) return <Navigate to="/signin" />;

  const filter: Filter = useMemo(
    () => ({
      kinds: [NSITE_KIND],
      authors: [account.pubkey],
    }),
    [account.pubkey],
  );

  const mailboxes = useMailboxes();
  const servers = useServers();
  useTimeline(mailboxes?.outboxes, [filter]);

  // load delete events
  useRequest(mailboxes?.outboxes, {
    kinds: [kinds.EventDeletion],
    authors: [account.pubkey],
    "#k": [String(NSITE_KIND)],
  });

  const events = useStoreQuery(TimelineQuery, [filter]);

  return (
    <Flex h="full" w="full" overflow="auto" direction="column">
      <Flex p="2" alignItems="center" gap="2">
        <UserAvatar pubkey={account.pubkey} />
        <Heading size="lg">
          <UserName pubkey={account.pubkey} />
          's nsite
        </Heading>

        <ButtonGroup ml="auto">
          <Button
            as={Link}
            href={createGatewayURL(account.pubkey, gateway)}
            isExternal
            leftIcon={<ExternalLinkIcon boxSize={5} />}
          >
            Open
          </Button>
          <Button colorScheme="pink" as={RouterLink} to="/settings/account">
            Settings
          </Button>
        </ButtonGroup>
      </Flex>

      {(!mailboxes || mailboxes.outboxes.length === 0) && (
        <Alert status="warning">
          <AlertIcon />
          Missing nostr relays, you should add some in the
          <Link as={RouterLink} to="/settings/account" ms="2">
            settings
          </Link>
        </Alert>
      )}
      {!servers && (
        <Alert status="warning">
          <AlertIcon />
          Missing blossom servers, you should add some in the
          <Link as={RouterLink} to="/settings/account" ms="2">
            settings
          </Link>
        </Alert>
      )}

      {account instanceof ReadonlyAccount && (
        <Alert status="info">
          <AlertIcon />
          This is a read only site, you cannot modify it
        </Alert>
      )}
      <Flex overflow="auto" p="4" direction="column">
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }}>
          <Flex direction="column" gap="2">
            <FileExtChart files={events ?? []} />
            <FileExtTable maxH="xs" overflowY="auto" files={events ?? []} />
          </Flex>
          <Flex direction="column" gap="2">
            <ServerBlobsChart files={events ?? []} />
            <ServerBlobsTable files={events ?? []} />
          </Flex>
          <Flex direction="column" gap="2">
            <RelayEventsChart events={events ?? []} />
            <RelayEventTable maxH="xs" overflowY="auto" events={events ?? []} />
          </Flex>
        </SimpleGrid>
        <Button colorScheme="pink" size="lg" as={RouterLink} to="/files" w="xs">
          View Files
        </Button>
      </Flex>
    </Flex>
  );
}
