import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Heading,
  Text,
} from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useObservable } from "applesauce-react/hooks";

import RelayPicker from "../../components/relay-picker";
import { defaultRelays, lookupRelays } from "../../services/settings";

export default function AppSettingsView() {
  const relays = useObservable(defaultRelays);
  const lookup = useObservable(lookupRelays);

  return (
    <Flex h="full" w="full" overflow="auto" direction="column">
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
            <BreadcrumbLink>App</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>
      </Flex>

      <Flex
        px="4"
        pb="10"
        overflow="hidden"
        w="full"
        direction="column"
        h="full"
        gap="2"
      >
        <Box mt="4">
          <Heading>Default relays</Heading>
          <Text fontStyle="italic">
            Default relays are used across the whole app and help discover other
            nsites
          </Text>
        </Box>

        <Flex direction="column" maxW="lg" gap="2">
          <RelayPicker
            relays={relays}
            onChange={(arr) => defaultRelays.next(arr)}
          />
        </Flex>

        <Box mt="4">
          <Heading>Lookup relays</Heading>
          <Text fontStyle="italic">
            Lookup relays are used to lookup user metadata and relay lists
          </Text>
        </Box>

        <Flex direction="column" maxW="lg" gap="2">
          <RelayPicker
            relays={lookup}
            onChange={(arr) => lookupRelays.next(arr)}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
