import { useMemo } from "react";
import {
  Alert,
  AlertIcon,
  Button,
  ButtonGroup,
  Flex,
  Heading,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { Filter } from "nostr-tools";
import { Navigate, Link as RouterLink } from "react-router-dom";
import { useActiveAccount, useStoreQuery } from "applesauce-react/hooks";
import { ReadonlyAccount } from "applesauce-accounts/accounts";
import { TimelineQuery } from "applesauce-core/queries";

import UserName from "../../components/user-name";
import UserAvatar from "../../components/user-avatar";
import { NSITE_KIND } from "../../const";
import useMailboxes from "../../hooks/use-mailboxes";
import useTimeline from "../../hooks/use-timeline";
import useServers from "../../hooks/use-servers";

export default function DashboardView() {
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
  useTimeline(mailboxes?.inboxes, [filter]);

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
          <Button colorScheme="pink" as={RouterLink} to="/settings">
            Settings
          </Button>
        </ButtonGroup>
      </Flex>

      {account instanceof ReadonlyAccount && (
        <Alert status="info">
          <AlertIcon />
          This is a read only site, you cannot modify it
        </Alert>
      )}
      <Flex overflow="auto" p="4" direction="column">
        <SimpleGrid columns={{ base: 1, sm: 2, md: 3, lg: 4 }}>
          <Stat>
            <StatLabel>Files</StatLabel>
            <StatNumber>{events?.length}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Relays</StatLabel>
            <StatNumber>{mailboxes?.outboxes?.length}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Servers</StatLabel>
            <StatNumber>{servers?.length}</StatNumber>
          </Stat>
        </SimpleGrid>
        <Button colorScheme="pink" size="lg" as={RouterLink} to="/files" w="xs">
          View Files
        </Button>
      </Flex>
    </Flex>
  );
}
