import { useEffect, useMemo } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  Flex,
  Spacer,
  Spinner,
} from "@chakra-ui/react";
import {
  useActiveAccount,
  useObservable,
  useStoreQuery,
} from "applesauce-react/hooks";
import {
  Navigate,
  Link as RouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";
import { Filter, kinds } from "nostr-tools";

import useTimeline from "../../hooks/use-timeline";
import useMailboxes from "../../hooks/use-mailboxes";
import { NSITE_KIND } from "../../const";
import { TimelineQuery } from "applesauce-core/queries";
import useServers from "../../hooks/use-servers";
import FilesTable from "../../components/files/table";
import {
  FilesCwdContext,
  FilesSelectionContext,
} from "../../components/files/context";
import { join } from "path-browserify";
import useToggleArray from "../../hooks/use-toggle-array";
import FileToolbar from "../../components/files/toolbar";
import useRequest from "../../hooks/use-request";

export default function FilesView() {
  const account = useActiveAccount();
  if (!account) return <Navigate to="/signin" />;

  const navigate = useNavigate();

  const params = useParams();
  const dir = "/" + params["*"];

  const filter: Filter = useMemo(
    () => ({
      kinds: [NSITE_KIND],
      authors: [account.pubkey],
    }),
    [account.pubkey],
  );

  const mailboxes = useMailboxes();
  const servers = useServers();
  const timeline = useTimeline(mailboxes?.outboxes, [filter]);
  const loading = useObservable(timeline?.loading$);

  // load delete events
  useRequest(mailboxes?.outboxes, {
    kinds: [kinds.EventDeletion],
    authors: [account.pubkey],
    "#k": [String(NSITE_KIND)],
  });

  const events = useStoreQuery(TimelineQuery, [filter]);

  const selected = useToggleArray();
  useEffect(() => {
    // reset the selection array when dir changes
    selected.replace([]);
  }, [dir]);

  const cwd = {
    path: dir,
    link: (p: string) => join("/files", p),
    change: (p: string) => navigate(join("/files", p)),
  };

  return (
    <Flex h="full" w="full" overflow="hidden" direction="column">
      <Flex py="2" ps="4" pe="2">
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
        <FilesCwdContext.Provider value={cwd}>
          <FilesSelectionContext value={selected}>
            <FileToolbar />
            <FilesTable
              dir={dir}
              events={events}
              server={servers?.[0]?.toString()}
            />
          </FilesSelectionContext>
        </FilesCwdContext.Provider>
      ) : (
        <Spinner />
      )}
    </Flex>
  );
}
