import {
  Table,
  TableContainer,
  TableContainerProps,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { useObservableState } from "applesauce-react/hooks";
import { BlobDescriptor } from "blossom-client-sdk";
import { NostrEvent } from "nostr-tools";
import { useMemo } from "react";

import { getTagValue } from "applesauce-core/helpers";
import {
  ArcElement,
  ChartData,
  Chart as ChartJS,
  Legend,
  RadialLinearScale,
  Title,
  Tooltip,
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

import { serverBlobs } from "../../services/blobs";

function countFilesByServer(
  files: NostrEvent[],
  serverBlobs: Record<string, BlobDescriptor[]>,
) {
  const hashes = new Set(files.map((f) => getTagValue(f, "x")));

  return Object.entries(serverBlobs).reduce<Record<string, number>>(
    (dir, [server, blobs]) => {
      const count = blobs.filter((b) => hashes.has(b.sha256)).length;

      return { ...dir, [server]: count };
    },
    {},
  );
}

export function ServerBlobsChart({ files }: { files: NostrEvent[] }) {
  const distribution = useObservableState(serverBlobs);
  const byServer = distribution
    ? countFilesByServer(files, distribution)
    : undefined;

  const data = useMemo<ChartData<"polarArea", number[]>>(() => {
    if (!byServer) return { labels: [], datasets: [] };

    return {
      labels: Object.keys(byServer),
      datasets: [
        {
          label: "Blobs",
          data: Object.values(byServer),
        },
      ],
    };
  }, [distribution]);

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
            text: "Blob distribution",
          },
          autocolors: {
            mode: "data",
          },
        },
      }}
    />
  );
}

export function ServerBlobsTable({
  files,
  ...props
}: Omit<TableContainerProps, "children"> & { files: NostrEvent[] }) {
  const distribution = useObservableState(serverBlobs);
  const byServer = distribution ? countFilesByServer(files, distribution) : {};

  return (
    <TableContainer {...props}>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>Server</Th>
            <Th isNumeric>Blobs</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(byServer).map(([server, count]) => (
            <Tr key={server}>
              <Td>{server}</Td>
              <Td isNumeric>{count}</Td>
            </Tr>
          ))}
        </Tbody>
        <Tfoot>
          <Tr>
            <Th></Th>
            <Th isNumeric>{files.length}</Th>
          </Tr>
        </Tfoot>
      </Table>
    </TableContainer>
  );
}
