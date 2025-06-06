import {
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Flex,
  Heading,
  Input,
  Text,
} from "@chakra-ui/react";
import { useObservableState } from "applesauce-react/hooks";
import { Link as RouterLink } from "react-router-dom";

import RelayPicker from "../../components/relay-picker";
import {
  defaultRelays$,
  lookupRelays$,
  nsiteGateway$,
} from "../../services/settings";

export default function AppSettingsView() {
  const relays = useObservableState(defaultRelays$);
  const lookup = useObservableState(lookupRelays$);
  const gateway = useObservableState(nsiteGateway$);

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
            onChange={(arr) => defaultRelays$.next(arr)}
          />
        </Flex>

        <Box mt="4">
          <Heading>Gateway</Heading>
          <Text fontStyle="italic">
            The gateway server that is used to view the static site
          </Text>
        </Box>

        <Flex direction="column" maxW="lg" gap="2">
          <Input
            type="url"
            value={gateway}
            onChange={(e) => nsiteGateway$.next(e.target.value)}
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
            onChange={(arr) => lookupRelays$.next(arr)}
          />
        </Flex>
      </Flex>
    </Flex>
  );
}
