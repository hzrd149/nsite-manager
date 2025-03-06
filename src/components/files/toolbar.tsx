import { useContext, useRef, useState } from "react";
import {
  Button,
  ButtonGroup,
  Flex,
  Input,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

import { FilesSelectionContext } from "./context";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import RemoveModal from "../remove-modal";
import { useActiveAccount, useEventStore } from "applesauce-react/hooks";
import { NSITE_KIND } from "../../const";
import AddModal from "../add-modal";

export default function FileToolbar({ directory }: { directory: string }) {
  const account = useActiveAccount()!;
  const selection = useContext(FilesSelectionContext);
  if (!selection) throw new Error("Mission selection context");

  const eventStore = useEventStore();
  const selectedEvents = selection.selected
    .map((path) => eventStore.getReplaceable(NSITE_KIND, account.pubkey, path))
    .filter((e) => !!e);

  const filesRef = useRef<HTMLInputElement | null>(null);
  const [files, setFiles] = useState<FileList>();
  const removeModal = useDisclosure();

  return (
    <>
      <Flex p="2" gap="2" alignItems="center">
        {selection.selected.length > 0 && (
          <Text>{selection.selected.length} selected</Text>
        )}

        <Input
          type="file"
          hidden
          multiple
          onChange={(e) => setFiles(e.target.files ?? undefined)}
          ref={filesRef}
        />
        <ButtonGroup size="sm" ms="auto">
          {selection.selected.length === 0 ? (
            <Button
              leftIcon={<AddIcon />}
              colorScheme="pink"
              onClick={() => filesRef.current?.click()}
            >
              Add
            </Button>
          ) : (
            <Button
              leftIcon={<DeleteIcon />}
              colorScheme="red"
              isDisabled={selection.selected.length === 0}
              onClick={removeModal.onOpen}
            >
              Remove
            </Button>
          )}
        </ButtonGroup>
      </Flex>

      {removeModal.isOpen && (
        <RemoveModal
          events={selectedEvents}
          isOpen
          onClose={removeModal.onClose}
        />
      )}

      {files && (
        <AddModal
          files={files}
          onClose={() => setFiles(undefined)}
          isOpen
          size="2xl"
          directory={directory}
        />
      )}
    </>
  );
}
