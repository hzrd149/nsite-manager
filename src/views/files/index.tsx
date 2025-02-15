import { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Link,
  Spacer,
  Spinner,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import {
  useActiveAccount,
  useObservable,
  useStoreQuery,
} from "applesauce-react/hooks";
import {
  Navigate,
  Link as RouterLink,
  useLocation,
  useParams,
} from "react-router-dom";
import { Filter, NostrEvent } from "nostr-tools";
import { join, resolve, extname } from "path-browserify";

import useTimeline from "../../hooks/use-timeline";
import useMailboxes from "../../hooks/use-mailboxes";
import { NSITE_KIND } from "../../const";
import { TimelineQuery } from "applesauce-core/queries";
import Timestamp from "../../components/timestamp";
import { formatBytes } from "../../helpers/number";
import {
  DirFile,
  DirFolder,
  getDirectoryFromEvents,
} from "../../helpers/directory";
import useServers from "../../hooks/use-servers";

function FileRow({ file, server }: { file: DirFile; server?: string }) {
  const size = 0;

  return (
    <Tr>
      <Td>
        <Link
          href={
            server &&
            new URL(file.sha256 + extname(file.name), server).toString()
          }
          isExternal
        >
          📄 {file.name}
        </Link>
      </Td>
      <Td fontFamily="monospace">{file.sha256}</Td>
      <Td isNumeric>{size ? formatBytes(size) : "?"}</Td>
      <Td isNumeric>
        <Timestamp timestamp={file.modified} />
      </Td>
    </Tr>
  );
}
function FolderRow({ folder }: { folder: DirFolder }) {
  const location = useLocation();

  return (
    <Tr>
      <Td>
        <Link as={RouterLink} to={join(location.pathname, folder.name, "/")}>
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

function FilesTable({
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
            <Th>Name</Th>
            <Th>Hash</Th>
            <Th isNumeric>Size</Th>
            <Th isNumeric>Modified</Th>
          </Tr>
        </Thead>
        <Tbody>
          {dir !== "/" && (
            <Tr>
              <Td>
                <Link
                  as={RouterLink}
                  to={resolve(location.pathname, "..") + "/"}
                  relative="route"
                >
                  📁 ../
                </Link>
              </Td>
              <Td></Td>
              <Td></Td>
              <Td></Td>
            </Tr>
          )}
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

export default function FilesView() {
  const account = useActiveAccount();
  if (!account) return <Navigate to="/signin" />;

  const params = useParams();
  const dir = "/" + params["*"];
  console.log("viewing", dir);

  const filter: Filter = useMemo(
    () => ({
      kinds: [NSITE_KIND],
      authors: [account.pubkey],
    }),
    [account.pubkey],
  );

  const mailboxes = useMailboxes();
  const servers = useServers();
  const timeline = useTimeline(mailboxes?.inboxes, [filter]);
  const loading = useObservable(timeline?.loading$);

  const events = useStoreQuery(TimelineQuery, [filter]);

  return (
    <Flex h="full" w="full" overflow="hidden" direction="column">
      <Flex p="4">
        <Breadcrumb fontSize="lg">
          <BreadcrumbItem>
            <BreadcrumbLink as={RouterLink} to="/">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>

          <BreadcrumbItem isCurrentPage={dir === "/"}>
            <BreadcrumbLink as={RouterLink} to="/files">
              Files
            </BreadcrumbLink>
          </BreadcrumbItem>

          {dir !== "/" &&
            dir
              .split("/")
              .slice(1, -1)
              .map((name, i, arr) => (
                <BreadcrumbItem key={name} isCurrentPage={i === arr.length - 1}>
                  <BreadcrumbLink
                    as={RouterLink}
                    to={"/files/" + arr.slice(0, i + 1).join("/") + "/"}
                  >
                    {name}
                  </BreadcrumbLink>
                </BreadcrumbItem>
              ))}
        </Breadcrumb>

        <Spacer />
        {loading ? (
          <Spinner flexShrink={0} />
        ) : (
          <Button
            colorScheme="pink"
            onClick={() => timeline?.next(-Infinity)}
            size="xs"
          >
            Load more
          </Button>
        )}
      </Flex>

      {events ? (
        <FilesTable
          dir={dir}
          events={events}
          server={servers?.[0]?.toString()}
        />
      ) : (
        <Spinner />
      )}
    </Flex>
  );
}
