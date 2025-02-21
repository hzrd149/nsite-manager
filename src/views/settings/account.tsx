import { lastValueFrom } from "rxjs";
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
  useAccountManager,
  useActiveAccount,
  useEventFactory,
  useStoreQuery,
} from "applesauce-react/hooks";
import { Navigate, Link as RouterLink, useNavigate } from "react-router-dom";
import {
  addOutboxRelay,
  removeOutboxRelay,
  addBlossomServerTag,
  removeBlossomServerTag,
} from "applesauce-factory/operations/tag";
import {
  BLOSSOM_SERVER_LIST_KIND,
  getBlossomServersFromList,
} from "applesauce-core/helpers/blossom";
import { kinds } from "nostr-tools";

import rxNostr from "../../services/rx-nostr";
import ServerPicker from "../../components/server-picker";
import RelayPicker from "../../components/relay-picker";
import { ReplaceableQuery } from "applesauce-core/queries";
import { getOutboxes } from "applesauce-core/helpers";
import UserAvatar from "../../components/user-avatar";
import UserName from "../../components/user-name";
import { LOOKUP_RELAYS } from "../../const";

export default function SettingsView() {
  const account = useActiveAccount();
  if (!account) return <Navigate to="/signin" />;

  const navigate = useNavigate();
  const manager = useAccountManager();
  const removeAccount = () => {
    navigate("/");
    manager.removeAccount(account);
  };

  const factory = useEventFactory();
  const mailboxes = useStoreQuery(ReplaceableQuery, [
    kinds.RelayList,
    account.pubkey,
  ]);

  // create a list of outbox relays that include the common contact relays
  const outboxes = mailboxes
    ? [...getOutboxes(mailboxes), ...LOOKUP_RELAYS]
    : LOOKUP_RELAYS;

  const addRelay = async (relay: string) => {
    const draft = await factory.modifyTags(
      mailboxes || { kind: kinds.RelayList },
      { public: addOutboxRelay(relay) },
    );
    const signed = await account.signEvent(draft);
    await lastValueFrom(rxNostr.send(signed, { on: { relays: outboxes } }));
  };
  const removeRelay = async (relay: string) => {
    const draft = await factory.modifyTags(
      mailboxes || { kind: kinds.RelayList },
      { public: removeOutboxRelay(relay) },
    );
    const signed = await account.signEvent(draft);
    await lastValueFrom(rxNostr.send(signed, { on: { relays: outboxes } }));
  };

  const servers = useStoreQuery(ReplaceableQuery, [
    BLOSSOM_SERVER_LIST_KIND,
    account.pubkey,
  ]);
  const addServer = async (server: string) => {
    const draft = await factory.modifyTags(
      servers || { kind: BLOSSOM_SERVER_LIST_KIND },
      { public: addBlossomServerTag(server) },
    );
    const signed = await account.signEvent(draft);
    await lastValueFrom(rxNostr.send(signed, { on: { relays: outboxes } }));
  };
  const removeServer = async (server: string) => {
    const draft = await factory.modifyTags(
      servers || { kind: BLOSSOM_SERVER_LIST_KIND },
      { public: removeBlossomServerTag(server) },
    );
    const signed = await account.signEvent(draft);
    await lastValueFrom(rxNostr.send(signed, { on: { relays: outboxes } }));
  };

  return (
    <Flex
      h="full"
      w="full"
      overflow="auto"
      direction="column"
      alignItems="flex-start"
    >
      <Flex p="4">
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
        w="Full"
        direction="column"
        h="full"
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

        <Alert status="info" whiteSpace="pre-wrap" w="auto">
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
