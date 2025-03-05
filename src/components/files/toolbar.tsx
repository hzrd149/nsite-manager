import { useContext } from "react";
import {
  Button,
  ButtonGroup,
  Flex,
  Text,
  useDisclosure,
} from "@chakra-ui/react";

import { FilesSelectionContext } from "./context";
import { AddIcon, DeleteIcon } from "@chakra-ui/icons";
import RemoveModal from "../remove-modal";
import { useActiveAccount, useEventStore } from "applesauce-react/hooks";
import { NSITE_KIND } from "../../const";

export default function FileToolbar() {
  const account = useActiveAccount()!;
  const selection = useContext(FilesSelectionContext);
  if (!selection) throw new Error("Mission selection context");

  const eventStore = useEventStore();
  const selectedEvents = selection.selected
    .map((path) => eventStore.getReplaceable(NSITE_KIND, account.pubkey, path))
    .filter((e) => !!e);

  const removeModal = useDisclosure();

  return (
    <>
      <Flex p="2" gap="2" alignItems="center">
        {selection.selected.length > 0 && (
          <Text>{selection.selected.length} selected</Text>
        )}

        <ButtonGroup size="sm" ms="auto">
          {selection.selected.length === 0 ? (
            <Button leftIcon={<AddIcon />} colorScheme="pink">
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
    </>
  );
}
