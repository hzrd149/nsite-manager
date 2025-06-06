import {
  Box,
  Button,
  Flex,
  Heading,
  Image,
  Input,
  Spacer,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import { getTagValue } from "applesauce-core/helpers";
import { useActiveAccount, useEventModel } from "applesauce-react/hooks";
import { BlossomClient, getBlobSha256 } from "blossom-client-sdk";
import { Filter, NostrEvent } from "nostr-tools";
import { basename } from "path-browserify";
import { useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";

import { TimelineModel } from "applesauce-core/models";
import AccountSwitcher from "../../components/account-switcher";
import { NSITE_KIND } from "../../const";
import useMailboxes from "../../hooks/use-mailboxes";
import useServers from "../../hooks/use-servers";
import useTimeline from "../../hooks/use-timeline";
import PickFilesTable from "./table";

export default function LoadFileView() {
  const toast = useToast();
  const account = useActiveAccount();
  if (!account)
    return <Navigate to="/signin" state={{ return: location.pathname }} />;

  if (!window.opener) return <Navigate to="/" />;

  const [search, setSearch] = useState("");

  const filter: Filter = useMemo(
    () => ({
      kinds: [NSITE_KIND],
      authors: [account.pubkey],
    }),
    [account.pubkey],
  );

  const mailboxes = useMailboxes();
  const servers = useServers();
  useTimeline(mailboxes?.inboxes, [filter]);
  const events = useEventModel(TimelineModel, [filter]);

  const [loading, setLoading] = useState("");

  const onSelect = async (event: NostrEvent) => {
    try {
      if (!servers) throw new Error("Missing servers");
      if (!window.opener) throw new Error("Missing window.opener");

      setLoading("Downloading...");

      const hash = getTagValue(event, "x");
      const path = getTagValue(event, "d");
      if (!hash) throw new Error("Missing hash");
      if (!path) throw new Error("Missing path");

      let file: File | undefined = undefined;
      for (const server of servers) {
        try {
          let res = await BlossomClient.downloadBlob(server, hash);

          if (res.ok) {
            let blob = await res.blob();
            if ((await getBlobSha256(blob)) !== hash)
              throw new Error("Hash mismatch");

            file = new File([blob], basename(path), {
              // get mime type from headers
              type: res.headers.get("content-type") ?? undefined,
            });
          }
        } catch (error) {
          // failed to download from server, next
        }
      }

      if (!file) throw new Error("Failed to download file");

      setLoading("Sending file...");

      window.opener.postMessage(file, "*");
      window.opener.postMessage("complete", "*");
    } catch (error) {
      if (error instanceof Error)
        toast({ status: "error", description: error.message });
    }

    setLoading("");
  };

  useEffect(() => {
    if (window.opener) window.opener.postMessage("ready", "*");
  }, []);

  const cancel = () => {
    if (window.opener) window.opener.postMessage("cancel", "*");
  };

  return (
    <Flex direction="column" h="100vh">
      <Flex gap="2" alignItems="center" p="2">
        <Image w="20" src="/nsite.svg" />
        <Heading size="md">Manager</Heading>

        <Spacer />

        <AccountSwitcher />
      </Flex>

      {loading ? (
        <Flex
          h="full"
          w="full"
          alignItems="center"
          justifyContent="center"
          gap="2"
        >
          <Spinner />
          <Text fontSize="lg">{loading}</Text>
        </Flex>
      ) : events ? (
        <Box overflow="auto" w="full" h="full">
          <PickFilesTable events={events} onSelect={onSelect} />
        </Box>
      ) : (
        <Spinner />
      )}

      <Flex gap="2" p="2">
        <Button onClick={cancel}>Cancel</Button>

        <Input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          rounded="md"
          placeholder="Search"
          maxW="xs"
        />
        {/* <Button colorScheme="pink" ms="auto">
          Pick
        </Button> */}
      </Flex>
    </Flex>
  );
}
