import { useMemo } from "react";
import {
  Table,
  TableContainer,
  TableContainerProps,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { TimelineQuery } from "applesauce-core/queries";
import { useActiveAccount, useStoreQuery } from "applesauce-react/hooks";
import { Filter, NostrEvent } from "nostr-tools";
import { getSeenRelays } from "applesauce-core/helpers";

import { NSITE_KIND } from "../../const";
import useMailboxes from "../../hooks/use-mailboxes";

function getEventsForRelay(events: NostrEvent[], relay: string) {
  const r1 = relay;
  const r2 = relay.replace(/\/$/, "");

  return events.filter(
    (e) => getSeenRelays(e)?.has(r1) || getSeenRelays(e)?.has(r2),
  );
}

export default function RelayEventTable({
  ...props
}: Omit<TableContainerProps, "children">) {
  const account = useActiveAccount()!;
  const mailboxes = useMailboxes();

  const filter: Filter = useMemo(
    () => ({
      kinds: [NSITE_KIND],
      authors: [account.pubkey],
    }),
    [account.pubkey],
  );
  const events = useStoreQuery(TimelineQuery, [filter]);

  return (
    <TableContainer {...props}>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Relay</Th>
            <Th isNumeric>Events</Th>
          </Tr>
        </Thead>
        <Tbody>
          {mailboxes?.outboxes.map((relay) => (
            <Tr key={relay}>
              <Td>{relay}</Td>
              <Td isNumeric>
                {events ? getEventsForRelay(events, relay).length : ""}
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
