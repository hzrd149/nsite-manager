import {
  Alert,
  AlertIcon,
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";
import {
  AddBlossomServer,
  AddOutboxRelay,
  RemoveBlossomServer,
  RemoveOutboxRelay,
} from "applesauce-actions/actions";
import { getOutboxes, mergeRelaySets } from "applesauce-core/helpers";
import {
  BLOSSOM_SERVER_LIST_KIND,
  getBlossomServersFromList,
} from "applesauce-core/helpers/blossom";
import { ReplaceableModel } from "applesauce-core/models";
import {
  useAccountManager,
  useActionHub,
  useActiveAccount,
  useEventModel,
  useObservableState,
} from "applesauce-react/hooks";
import { kinds } from "nostr-tools";
import { Navigate, Link as RouterLink, useNavigate } from "react-router-dom";

import RelayPicker from "../../components/relay-picker";
import ServerPicker from "../../components/server-picker";
import UserAvatar from "../../components/user-avatar";
import UserName from "../../components/user-name";
import { pool } from "../../services/pool";
import { defaultRelays$ } from "../../services/settings";

export default function SettingsView() {
  const account = useActiveAccount();
  if (!account) return <Navigate to="/signin" />;

  const navigate = useNavigate();
  const manager = useAccountManager();
  const actions = useActionHub();
  const removeAccount = () => {
    navigate("/");
    manager.removeAccount(account);
  };

  const defaultRelays = useObservableState(defaultRelays$);
  const mailboxes = useEventModel(ReplaceableModel, [
    kinds.RelayList,
    account.pubkey,
  ]);

  // create a list of outbox relays that include the common contact relays
  const outboxes = mailboxes
    ? [...getOutboxes(mailboxes), ...defaultRelays]
    : defaultRelays;

  const addRelay = async (relay: string) => {
    await actions
      .exec(AddOutboxRelay, relay)
      .forEach((event) =>
        pool.publish(mergeRelaySets(outboxes, [relay]), event),
      );
  };
  const removeRelay = async (relay: string) => {
    await actions
      .exec(RemoveOutboxRelay, relay)
      .forEach((event) =>
        pool.publish(mergeRelaySets(outboxes, [relay]), event),
      );
  };

  const servers = useEventModel(ReplaceableModel, [
    BLOSSOM_SERVER_LIST_KIND,
    account.pubkey,
  ]);
  const addServer = async (server: string) => {
    await actions
      .exec(AddBlossomServer, server)
      .forEach((event) => pool.publish(mergeRelaySets(outboxes), event));
  };
  const removeServer = async (server: string) => {
    await actions
      .exec(RemoveBlossomServer, server)
      .forEach((event) => pool.publish(mergeRelaySets(outboxes), event));
  };

  return (
    <Flex
      h="full"
      w="full"
      overflow="hidden"
      direction="column"
      alignItems="flex-start"
    >
      <Flex p="4" w="full">
        <Breadcrumb fontSize="lg">
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem>
            <BreadcrumbLink>Settings</BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Account</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Flex>

      <Flex
        px="4"
        pb="10"
        overflow="auto"
        direction="column"
        h="full"
        w="full"
        gap="2"
      >
        <Box>
          <Heading>Account</Heading>
        </Box>

        {/* account settings */}
        <Flex direction="column" maxW="lg" gap="2" overflow="hidden">
          <Flex gap="2" alignItems="center" w="full" overflow="hidden">
            <UserAvatar pubkey={account.pubkey} />
            <Box overflow="hidden">
              <UserName
                fontSize="lg"
                fontStyle="bold"
                pubkey={account.pubkey}
                isTruncated
              />
              <br />
              <Badge>{account.type}</Badge>
            </Box>
            <Button
              colorScheme="red"
              ml="auto"
              variant="link"
              onClick={removeAccount}
            >
              Remove
            </Button>
          </Flex>
        </Flex>

        <Box mt="4">
          <Heading>Relays</Heading>
          <Text fontStyle="italic">
            Relays store the file metadata and keep track of changes
          </Text>
        </Box>

        <Alert status="info" whiteSpace="pre-wrap" w="auto" flexShrink={0}>
          <AlertIcon />
          These are your{" "}
          <Link
            href="https://github.com/nostr-protocol/nips/blob/master/65.md"
            target="_blank"
          >
            NIP-65
          </Link>{" "}
          Outbox relays. changes here will be reflected in other apps
        </Alert>

        <Flex direction="column" maxW="lg" gap="2">
          <RelayPicker
            relays={mailboxes ? getOutboxes(mailboxes) : []}
            onAdd={addRelay}
            onRemove={removeRelay}
          />
        </Flex>

        <Box mt="4">
          <Heading>Blossom servers</Heading>
          <Text fontStyle="italic">
            Blossom servers store the files themselves
          </Text>
        </Box>

        <Flex direction="column" maxW="lg" gap="2">
          <ServerPicker
            servers={
              servers
                ? getBlossomServersFromList(servers).map((u) => u.toString())
                : []
            }
            onAdd={addServer}
            onRemove={removeServer}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
