import { useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
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
import { getReplaceableIdentifier, getTagValue } from "applesauce-core/helpers";
import {
  useActiveAccount,
  useObservable,
  useStoreQuery,
} from "applesauce-react/hooks";
import { Navigate, Link as RouterLink } from "react-router-dom";
import { Filter, NostrEvent } from "nostr-tools";

import useTimeline from "../../hooks/use-timeline";
import useMailboxes from "../../hooks/use-mailboxes";
import { NSITE_KIND } from "../../const";
import { TimelineQuery } from "applesauce-core/queries";
import Timestamp from "../../components/timestamp";
import { formatBytes } from "../../helpers/number";

type File = { name: string; sha256: string; modified: number; author: string };

function FileRow({ file }: { file: File }) {
  const size = 0;

  return (
    <Tr>
      <Td>{file.name}</Td>
      <Td fontFamily="monospace">{file.sha256}</Td>
      <Td isNumeric>{size ? formatBytes(size) : "?"}</Td>
      <Td isNumeric>
        <Timestamp timestamp={file.modified} />
      </Td>
    </Tr>
  );
}

function FilesTable({ events, path }: { path: string; events: NostrEvent[] }) {
  const folder = events
    .map((e) => ({
      name: getReplaceableIdentifier(e),
      sha256: getTagValue(e, "x")!,
      modified: e.created_at,
      author: e.pubkey,
    }))
    .filter(({ name }) => name.startsWith(path))
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
          {folder.map((file) => (
            <FileRow key={file.name} file={file} />
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );
}

export default function FilesView() {
  const account = useActiveAccount();
  if (!account) return <Navigate to="/signin" />;

  const filter: Filter = useMemo(
    () => ({
      kinds: [NSITE_KIND],
      authors: [account.pubkey],
    }),
    [account.pubkey],
  );

  const mailboxes = useMailboxes();
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

          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink as={RouterLink} to="/files">
              Files
            </BreadcrumbLink>
          </BreadcrumbItem>
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

      {events ? <FilesTable path="/" events={events} /> : <Spinner />}
    </Flex>
  );
}
