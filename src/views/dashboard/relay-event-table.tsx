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
import { NostrEvent } from "nostr-tools";
import { getSeenRelays } from "applesauce-core/helpers";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  Title,
  ChartData,
  RadialLinearScale,
} from "chart.js";
import autocolors from "chartjs-plugin-autocolors";
import { PolarArea } from "react-chartjs-2";

// Setup chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  Title,
  autocolors,
);

import useMailboxes from "../../hooks/use-mailboxes";

function getEventsForRelay(events: NostrEvent[], relay: string) {
  const r1 = relay;
  const r2 = relay.replace(/\/$/, "");

  return events.filter(
    (e) => getSeenRelays(e)?.has(r1) || getSeenRelays(e)?.has(r2),
  );
}

export function RelayEventsChart({ events }: { events: NostrEvent[] }) {
  const mailboxes = useMailboxes();

  const data = useMemo<ChartData<"polarArea", number[]>>(() => {
    if (!mailboxes || !events) return { labels: [], datasets: [] };

    return {
      labels: mailboxes?.outboxes ?? [],
      datasets: [
        {
          label: "Events",
          data: mailboxes?.outboxes.map(
            (relay) => getEventsForRelay(events, relay).length,
          ),
        },
      ],
    };
  }, [events, mailboxes]);

  return (
    <PolarArea
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "Event distribution",
          },
          autocolors: {
            mode: "data",
          },
        },
      }}
    />
  );
}

export default function RelayEventTable({
  events,
  ...props
}: Omit<TableContainerProps, "children"> & { events: NostrEvent[] }) {
  const mailboxes = useMailboxes();

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
