import {
  Table,
  TableContainer,
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

export default function FileExtTable({ files }: { files: NostrEvent[] }) {
  const byExt: Record<string, number> = {};
  for (const file of files) {
    const path = getReplaceableIdentifier(file);
    if (path) {
      const ext = extname(path);
      if (byExt[ext]) byExt[ext]++;
      else byExt[ext] = 1;
    }
  }

  return (
    <TableContainer maxH="xs" overflow="auto">
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
