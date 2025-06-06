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
  useEventModel,
  useObservableState,
} from "applesauce-react/hooks";
import { Filter, kinds } from "nostr-tools";
import { useEffect, useMemo } from "react";
import {
  Navigate,
  Link as RouterLink,
  useNavigate,
  useParams,
} from "react-router-dom";

import { TimelineModel } from "applesauce-core/models";
import { join } from "path-browserify";
import {
  FilesCwdContext,
  FilesSelectionContext,
} from "../../components/files/context";
import FilesTable from "../../components/files/table";
import FileToolbar from "../../components/files/toolbar";
import { NSITE_KIND } from "../../const";
import useMailboxes from "../../hooks/use-mailboxes";
import useRequest from "../../hooks/use-request";
import useServers from "../../hooks/use-servers";
import useTimeline from "../../hooks/use-timeline";
import useToggleArray from "../../hooks/use-toggle-array";
import { defaultRelays$ } from "../../services/settings";
import { mergeRelaySets } from "applesauce-core/helpers";

export default function FilesView() {
  const account = useActiveAccount();
  if (!account) return <Navigate to="/signin" />;

  const defaultRelays = useObservableState(defaultRelays$);
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
  const relays = useMemo(
    () => mergeRelaySets(defaultRelays, mailboxes?.outboxes ?? []),
    [defaultRelays, mailboxes?.outboxes],
  );
  const servers = useServers();
  const timeline = useTimeline(relays, [filter]);

  // load delete events
  useRequest(relays, {
    kinds: [kinds.EventDeletion],
    authors: [account.pubkey],
    "#k": [String(NSITE_KIND)],
  });

  const events = useEventModel(TimelineModel, [filter]);

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
        {timeline && (
          <Button colorScheme="pink" onClick={() => timeline()} size="xs">
            Load more
          </Button>
        )}
      </Flex>

      {events ? (
        <FilesCwdContext.Provider value={cwd}>
          <FilesSelectionContext value={selected}>
            <FileToolbar directory={dir} />
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
