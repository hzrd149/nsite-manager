import { createContext, useContext, useMemo, useState } from "react";
import {
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { join, resolve } from "path-browserify";
import { Link as RouterLink } from "react-router-dom";
import { NostrEvent } from "nostr-tools";

import {
  DirFile,
  DirFolder,
  getDirectoryFromEvents,
} from "../../helpers/directory";
import { formatBytes } from "../../helpers/number";
import Timestamp from "../../components/timestamp";

const PathContext = createContext({
  path: "",
  setPath: (_path: string) => {},
});

function FileRow({ file, onClick }: { file: DirFile; onClick?: () => void }) {
  const size = 0;

  return (
    <Tr>
      <Td>
        <Link onClick={onClick}>📄 {file.name}</Link>
      </Td>
      <Td isNumeric>{size ? formatBytes(size) : "?"}</Td>
      <Td isNumeric>
        <Timestamp timestamp={file.modified} />
      </Td>
    </Tr>
  );
}
function FolderRow({ folder }: { folder: DirFolder }) {
  const { path, setPath } = useContext(PathContext);

  return (
    <Tr>
      <Td>
        <Link onClick={() => setPath(join(path, folder.name, "/"))}>
          📁 {folder.name}
        </Link>
      </Td>
      <Td isNumeric>{folder.children} files</Td>
      <Td isNumeric>
        <Timestamp timestamp={folder.modified} />
      </Td>
    </Tr>
  );
}

export function FolderUpRow() {
  const { path, setPath } = useContext(PathContext);

  return (
    <Tr>
      <Td>
        <Link
          as={RouterLink}
          onClick={() => setPath(resolve(path, "../"))}
          relative="route"
        >
          📁 ../
        </Link>
      </Td>
      <Td></Td>
      <Td></Td>
    </Tr>
  );
}

export default function PickFilesTable({
  events,
  onSelect,
}: {
  events: NostrEvent[];
  onSelect?: (event: NostrEvent) => void;
}) {
  const [path, setPath] = useState("/");
  const entries = useMemo(
    () => getDirectoryFromEvents(events, path),
    [path, events],
  );
  const folders = entries
    .filter((f) => f.type === "folder")
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = entries
    .filter((f) => f.type === "file")
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <PathContext value={{ path, setPath }}>
      <TableContainer p="2">
        <Table variant="striped" size="sm">
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th isNumeric>Size</Th>
              <Th isNumeric>Modified</Th>
            </Tr>
          </Thead>
          <Tbody>
            {path !== "/" && <FolderUpRow />}
            {folders.map((folder) => (
              <FolderRow key={folder.name} folder={folder} />
            ))}
            {files.map((file) => (
              <FileRow
                key={file.name}
                file={file}
                onClick={() => onSelect && onSelect(file.event)}
              />
            ))}
          </Tbody>
        </Table>
      </TableContainer>
    </PathContext>
  );
}
