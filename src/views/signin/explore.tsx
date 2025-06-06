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
import { ReadonlyAccount } from "applesauce-accounts/accounts";
import { useEventModel, useObservableState } from "applesauce-react/hooks";
import { useNavigate } from "react-router-dom";

import { getEventUID } from "applesauce-core/helpers";
import { TimelineModel } from "applesauce-core/models";
import { NostrEvent } from "nostr-tools";
import UserAvatar from "../../components/user-avatar";
import UserName from "../../components/user-name";
import { NSITE_KIND } from "../../const";
import useProfile from "../../hooks/use-profile";
import useTimeline from "../../hooks/use-timeline";
import accountManager from "../../services/accounts";
import { defaultRelays$ } from "../../services/settings";

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
  const relays = useObservableState(defaultRelays$);
  const timeline = useTimeline(relays, filters);
  const sites = useEventModel(TimelineModel, [filters]);

  return (
    <Flex direction="column" p="4" w="full" h="full" overflow="auto" pb="10">
      <Heading>Explore nsites</Heading>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
        {sites?.map((site) => <SiteCard key={getEventUID(site)} site={site} />)}
      </SimpleGrid>

      <Flex justifyContent="center" mt="4">
        {timeline && (
          <Button colorScheme="pink" onClick={() => timeline()}>
            Load more
          </Button>
        )}
      </Flex>
    </Flex>
  );
}
