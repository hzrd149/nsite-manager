import { useContext } from "react";
import { Flex, Text } from "@chakra-ui/react";

import { FilesSelectionContext } from "./context";

export default function FileToolbar() {
  const selection = useContext(FilesSelectionContext);
  if (!selection) throw new Error("Mission selection context");

  return (
    <Flex p="2" gap="2" alignItems="center">
      {selection.selected.length > 0 && (
        <Text>{selection.selected.length} selected</Text>
      )}
    </Flex>
  );
}
