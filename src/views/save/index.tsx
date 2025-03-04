import { Flex, Heading, Image } from "@chakra-ui/react";

export default function SaveFileView() {
  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" alignItems="center">
        <Image w="20" src="/nsite.svg" />
        <Heading size="md">Manager</Heading>
      </Flex>
    </Flex>
  );
}
