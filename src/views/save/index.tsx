import { Flex, Heading, Image } from "@chakra-ui/react";

import logo from "../../assets/nsite.svg";
export default function SaveFileView() {
  return (
    <Flex direction="column" gap="2">
      <Flex gap="2" alignItems="center">
        <Image w="20" src={logo} />
        <Heading size="md">Manager</Heading>
      </Flex>
    </Flex>
  );
}
