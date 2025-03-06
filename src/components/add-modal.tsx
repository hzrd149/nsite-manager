import { useState } from "react";
import {
  Button,
  ButtonGroup,
  Checkbox,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalProps,
  Table,
  TableContainer,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  UnorderedList,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useActiveAccount, useEventFactory } from "applesauce-react/hooks";
import { multiServerUpload } from "blossom-client-sdk/actions/multi-server";
import { createUploadAuth, getBlobSha256 } from "blossom-client-sdk";
import { includeSingletonTag } from "applesauce-factory/operations/event";
import { join } from "path-browserify";

import { formatBytes } from "../helpers/number";
import useServers from "../hooks/use-servers";
import { NSITE_KIND } from "../const";
import rxNostr from "../services/rx-nostr";
import useMailboxes from "../hooks/use-mailboxes";

export default function AddModal({
  onClose,
  files,
  directory,
  ...props
}: Omit<ModalProps, "children"> & { files: FileList; directory: string }) {
  const toast = useToast();
  const account = useActiveAccount();
  const servers = useServers();
  const factory = useEventFactory();
  const mailboxes = useMailboxes();

  const replace = useDisclosure({ defaultIsOpen: true });
  const [folder, setFolder] = useState("");

  const [loading, setLoading] = useState("");
  const uploadFiles = async () => {
    try {
      if (!account) throw new Error("Missing account");
      if (!servers) throw new Error("Missing blossom servers");

      const filesArray: File[] = [];
      for (const file of files) filesArray.push(file);

      const auth = await createUploadAuth(
        async (draft) => account.signEvent(draft),
        filesArray,
        { message: `Upload ${files.length} files` },
      );

      for (const file of files) {
        try {
          const path = join("/", directory, folder, file.name);

          setLoading(`Hashing ${file.name}...`);
          const hash = await getBlobSha256(file);

          setLoading(`Uploading ${file.name}...`);
          await multiServerUpload(servers, file, {
            auth,
            onUpload: (server) => {
              setLoading(`Uploaded ${file.name} to ${server}`);
            },
          });

          setLoading(`Publishing ${file.name}...`);
          // create nsite event
          const draft = await factory.process(
            { kind: NSITE_KIND },
            includeSingletonTag(["d", path], true),
            includeSingletonTag(["x", hash], true),
          );

          // sign event
          const signed = await account.signEvent(draft);

          // publish event
          rxNostr.cast(signed, { on: { relays: mailboxes?.outboxes } });
        } catch (error) {
          if (error instanceof Error)
            toast({ status: "error", description: error.message });
        }
      }

      // finished, close modal
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
        <ModalCloseButton />
        <ModalHeader>Add Files</ModalHeader>
        <ModalBody>
          {loading ? (
            <Text>{loading}</Text>
          ) : (
            <>
              <Text>Are you sure you want to remove these files?</Text>

              <TableContainer>
                <Table size="sm">
                  <colgroup>
                    <col width="100%" />
                    <col width="0%" />
                    <col width="0%" />
                  </colgroup>
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Type</Th>
                      <Th isNumeric>size</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Array(files.length)
                      .fill(1)
                      .map((_, i) => files.item(i)!)
                      .map((file) => (
                        <Tr key={file.name}>
                          <Td isTruncated>{file.name}</Td>
                          <Td>{file.type}</Td>
                          <Td isNumeric>{formatBytes(file.size)}</Td>
                        </Tr>
                      ))}
                  </Tbody>
                </Table>
              </TableContainer>
              <UnorderedList></UnorderedList>
              <FormControl mt="4">
                <FormLabel htmlFor="folder">Subfolder</FormLabel>
                <Input
                  id="folder"
                  name="folder"
                  size="sm"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  rounded="md"
                />
                <FormHelperText>
                  A sub folder path to add these files to
                </FormHelperText>
              </FormControl>
            </>
          )}
        </ModalBody>
        <ModalFooter>
          <Checkbox isChecked={replace.isOpen} onChange={replace.onToggle}>
            Replace files
          </Checkbox>
          <ButtonGroup ms="auto">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="pink"
              onClick={uploadFiles}
              isLoading={!!loading}
            >
              Upload
            </Button>
          </ButtonGroup>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
