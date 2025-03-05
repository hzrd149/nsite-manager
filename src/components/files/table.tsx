import { useContext, useMemo } from "react";
import {
  Checkbox,
  Link,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import { extname, join, resolve } from "path-browserify";
import { Link as RouterLink } from "react-router-dom";
import { NostrEvent } from "nostr-tools";

import {
  DirFile,
  DirFolder,
  getDirectoryFromEvents,
} from "../../helpers/directory";
import { FilesSelectionContext, useFolderCwd } from "./context";
import { formatBytes } from "../../helpers/number";
import Timestamp from "../timestamp";
import { createGatewayURL } from "../../helpers/url";
import { useActiveAccount, useObservable } from "applesauce-react/hooks";
import { nsiteGateway } from "../../services/settings";

function FileRow({ file, server }: { file: DirFile; server?: string }) {
  const account = useActiveAccount();
  const gateway = useObservable(nsiteGateway);
  const selection = useContext(FilesSelectionContext);
  const size = 0;

  return (
    <Tr>
      {selection && (
        <Td p="1">
          <Checkbox
            isChecked={selection.selected.includes(file.path)}
            onChange={() => selection.toggle(file.path)}
          />
        </Td>
      )}
      <Td pl="0">
        <Link
          href={createGatewayURL(account!.pubkey, gateway, file.path)}
          isExternal
        >
          📄 {file.name}
        </Link>
      </Td>
      <Td fontFamily="monospace">
        <Link
          href={
            server &&
            new URL(file.sha256 + extname(file.name), server).toString()
          }
          isExternal
        >
          {file.sha256}
        </Link>
      </Td>
      <Td isNumeric>{size ? formatBytes(size) : "?"}</Td>
      <Td isNumeric>
        <Timestamp timestamp={file.modified} />
      </Td>
    </Tr>
  );
}
function FolderRow({ folder }: { folder: DirFolder }) {
  const { path, link } = useFolderCwd();

  return (
    <Tr>
      <Td />
      <Td pl="0">
        <Link as={RouterLink} to={link(join(path, folder.name, "/"))}>
          📁 {folder.name}
        </Link>
      </Td>
      <Td fontFamily="monospace"></Td>
      <Td isNumeric>{folder.children} files</Td>
      <Td isNumeric>
        <Timestamp timestamp={folder.modified} />
      </Td>
    </Tr>
  );
}

export function FolderUpRow() {
  const { path, link } = useFolderCwd();

  return (
    <Tr>
      <Td />
      <Td pl="0">
        <Link
          as={RouterLink}
          to={link(resolve(path, "..") + "/")}
          relative="route"
        >
          📁 ../
        </Link>
      </Td>
      <Td></Td>
      <Td></Td>
      <Td></Td>
    </Tr>
  );
}

export default function FilesTable({
  events,
  dir,
  server,
}: {
  dir: string;
  events: NostrEvent[];
  server?: string;
}) {
  const entries = useMemo(
    () => getDirectoryFromEvents(events, dir),
    [dir, events],
  );
  const folders = entries
    .filter((f) => f.type === "folder")
    .sort((a, b) => a.name.localeCompare(b.name));
  const files = entries
    .filter((f) => f.type === "file")
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <TableContainer overflowY="auto">
      <Table variant="striped" size="sm">
        <Thead>
          <Tr>
            <Th w="0" />
            <Th pl="0">Name</Th>
            <Th>Hash</Th>
            <Th isNumeric>Size</Th>
            <Th isNumeric>Modified</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dir !== "/" && <FolderUpRow />}
          {folders.map((folder) => (
            <FolderRow key={folder.name} folder={folder} />
          ))}
          {files.map((file) => (
            <FileRow key={file.name} file={file} server={server} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}
