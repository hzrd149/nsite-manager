import {
  Button,
  ButtonGroup,
  Checkbox,
  ListItem,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Text,
  UnorderedList,
  useToast,
} from "@chakra-ui/react";
import { getReplaceableIdentifier, getTagValue } from "applesauce-core/helpers";
import { useActiveAccount, useEventFactory } from "applesauce-react/hooks";
import { NostrEvent } from "nostr-tools";
import { lastValueFrom } from "rxjs";
import rxNostr from "../services/rx-nostr";
import useMailboxes from "../hooks/use-mailboxes";
import { useState } from "react";
import { BlossomClient } from "blossom-client-sdk";
import useServers from "../hooks/use-servers";

export default function RemoveModal({
  events,
  onClose,
  ...props
}: { events: NostrEvent[] } & Omit<ModalProps, "children">) {
  const toast = useToast();

  const factory = useEventFactory();
  const account = useActiveAccount();
  const mailboxes = useMailboxes();
  const servers = useServers();

  const [deleteBlobs, setDeleteBlobs] = useState(true);
  const [loading, setLoading] = useState("");
  const removeEvents = async () => {
    try {
      if (!account) throw new Error("Missing account");

      if (deleteBlobs && servers) {
        setLoading("Deleting blobs...");
        let hashes = new Set(events.map((e) => getTagValue(e, "x")!));
        const auth = await BlossomClient.createDeleteAuth(
          async (d) => account.signEvent(d),
          Array.from(hashes),
          { message: `Delete ${hashes.size} blobs` },
        );

        let i = 1;
        for (const hash of hashes) {
          setLoading(`Deleting blob ${i}/${hashes.size}`);
          i++;

          // make requests to all server to delete the blob
          await Promise.allSettled(
            servers.map((server) =>
              BlossomClient.deleteBlob(server, hash, { auth }),
            ),
          );
        }
      }

      setLoading(`Deleting events...`);
      const deleteDraft = await factory.delete(events);
      const deleteEvent = await account.signEvent(deleteDraft);

      await lastValueFrom(
        rxNostr.send(deleteEvent, { on: { relays: mailboxes?.outboxes } }),
      );
      onClose();
    } catch (error) {
      if (error instanceof Error)
        toast({ status: "error", description: error.message });
    }
    setLoading("");
  };

  return (
    <Modal onClose={onClose} {...props}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Remove files?</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <Text>{loading}</Text>
          ) : (
            <>
              <Text>Are you sure you want to remove these files?</Text>
              <UnorderedList>
                {events.map((event) => (
                  <ListItem key={event.id}>
                    {getReplaceableIdentifier(event)}
                  </ListItem>
                ))}
              </UnorderedList>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Checkbox
            isChecked={deleteBlobs}
            onChange={(e) => setDeleteBlobs(e.target.checked)}
          >
            Delete blobs
          </Checkbox>
          <ButtonGroup ms="auto">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={removeEvents}
              isLoading={!!loading}
            >
              Remove
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
