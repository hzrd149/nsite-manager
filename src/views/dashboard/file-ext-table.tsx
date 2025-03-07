import { useMemo } from "react";
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
import { getReplaceableIdentifier } from "applesauce-core/helpers";
import { NostrEvent } from "nostr-tools";
import { extname } from "path-browserify";
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
import { Pie } from "react-chartjs-2";

// Setup chart.js
ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
  Title,
  autocolors,
);

function countFileByExt(files: NostrEvent[]) {
  const byExt: Record<string, number> = {};
  for (const file of files) {
    const path = getReplaceableIdentifier(file);
    if (path) {
      const ext = extname(path);
      if (byExt[ext]) byExt[ext]++;
      else byExt[ext] = 1;
    }
  }

  return byExt;
}

export function FileExtChart({ files }: { files: NostrEvent[] }) {
  const byExt = useMemo(() => countFileByExt(files), [files]);
  const data = useMemo<ChartData<"pie", number[]>>(
    () => ({
      labels: Object.keys(byExt),
      datasets: [{ label: "Files", data: Object.values(byExt) }],
    }),
    [byExt],
  );

  return (
    <Pie
      data={data}
      options={{
        responsive: true,
        plugins: {
          legend: {
            display: false,
          },
          title: {
            display: true,
            text: "File types",
          },
          autocolors: {
            mode: "data",
          },
        },
      }}
    />
  );
}

export default function FileExtTable({
  files,
  ...props
}: Omit<TableContainerProps, "children"> & { files: NostrEvent[] }) {
  const byExt = useMemo(() => countFileByExt(files), [files]);

  return (
    <TableContainer {...props}>
      <Table size="sm">
        <Thead>
          <Tr>
            <Th>File type</Th>
            <Th isNumeric>Count</Th>
          </Tr>
        </Thead>
        <Tbody>
          {Object.entries(byExt).map(([ext, count]) => (
            <Tr key={ext}>
              <Td>{ext}</Td>
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
