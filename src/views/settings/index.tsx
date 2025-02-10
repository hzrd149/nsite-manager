import {
  Alert,
  AlertIcon,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Heading,
  Link,
  Text,
} from "@chakra-ui/react";
import { useActiveAccount } from "applesauce-react/hooks";
import { Navigate, Link as RouterLink } from "react-router-dom";
import ServerPicker from "../../components/server-picker";
import RelayPicker from "../../components/relay-picker";

export default function SettingsView() {
  const account = useActiveAccount();
  if (!account) return <Navigate to="/signin" />;

  return (
    <Flex h="full" w="full" overflow="auto" direction="column">
      <Flex p="4">
        <Breadcrumb fontSize="lg">
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink>Settings</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Flex>

      <Flex px="4" pb="10" overflow="auto" w="Full" direction="column" h="full">
        <Box>
          <Heading>Relays</Heading>
          <Text fontStyle="italic">
            Relays store the file metadata and keep track of changes
          </Text>
        </Box>

        <Alert status="info" whiteSpace="pre-wrap">
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
          <RelayPicker relays={[]} onChange={() => {}} />
        </Flex>

        <Box mt="4">
          <Heading>Blossom servers</Heading>
          <Text fontStyle="italic">
            Blossom servers store the files themselves
          </Text>
        </Box>

        <Flex direction="column" maxW="lg" gap="2">
          <ServerPicker servers={[]} onChange={() => {}} />
        </Flex>
      </Flex>
    </Flex>
  );
}
