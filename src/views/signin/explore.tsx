import {
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardHeader,
  Flex,
  Heading,
  SimpleGrid,
} from "@chakra-ui/react";
import { useStoreQuery } from "applesauce-react/hooks";
import { TimelineQuery } from "applesauce-core/queries";
import { ReadonlyAccount } from "applesauce-accounts/accounts";
import { useNavigate } from "react-router-dom";

import { DEFAULT_RELAYS, NSITE_KIND } from "../../const";
import useTimeline from "../../hooks/use-timeline";
import UserName from "../../components/user-name";
import { getEventUID } from "applesauce-core/helpers";
import UserAvatar from "../../components/user-avatar";
import { NostrEvent } from "nostr-tools";
import useProfile from "../../hooks/use-profile";
import accountManager from "../../services/accounts";

const filters = {
  kinds: [NSITE_KIND],
  "#d": ["/index.html"],
};

function SiteCard({ site }: { site: NostrEvent }) {
  const navigate = useNavigate();
  const profile = useProfile({ pubkey: site.pubkey });

  const addSite = async () => {
    if (accountManager.getAccountForPubkey(site.pubkey))
      throw new Error("Site already added");
    const account = ReadonlyAccount.fromPubkey(site.pubkey);
    accountManager.addAccount(account);
    accountManager.setActive(account);
    navigate("/");
  };

  return (
    <Card size="sm">
      <CardHeader display="flex" gap="4" alignItems="center">
        <UserAvatar pubkey={site.pubkey} />
        <UserName pubkey={site.pubkey} fontWeight="bold" fontSize="md" />
        <ButtonGroup ml="auto">
          <Button onClick={addSite}>Add</Button>
        </ButtonGroup>
      </CardHeader>
      {profile?.about && <CardBody>{profile?.about}</CardBody>}
    </Card>
  );
}

export default function ExploreSites() {
  const timeline = useTimeline(DEFAULT_RELAYS, filters);
  const sites = useStoreQuery(TimelineQuery, [filters]);

  return (
    <Flex direction="column" p="4" w="full" h="full" overflow="auto" pb="10">
      <Heading>Explore nsites</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {sites?.map((site) => <SiteCard key={getEventUID(site)} site={site} />)}
      </SimpleGrid>

      <Flex justifyContent="center" mt="4">
        <Button colorScheme="pink" onClick={() => timeline?.next(-Infinity)}>
          Load more
        </Button>
      </Flex>
    </Flex>
  );
}
