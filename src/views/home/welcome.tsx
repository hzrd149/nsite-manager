import { Button, Divider, Flex, Heading, Image, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useObservable } from "applesauce-react/hooks";
import accountManager from "../../services/accounts";
import UserName from "../../components/user-name";

export default function WelcomeView() {
  const accounts = useObservable(accountManager.accounts$);

  return (
    <Flex
      h="full"
      w="full"
      alignItems="center"
      direction="column"
      gap="2"
      py="10"
      px="2"
    >
      <Image src="/nsite.jpg" h="48" />
      <Heading size="lg" mt="4">
        Welcome to nsite manager
      </Heading>
      <Text>Start by selecting an account</Text>

      {accounts.map((account) => (
        <Button
          key={account.id}
          onClick={() => accountManager.setActive(account)}
          w="sm"
          colorScheme="pink"
          variant="outline"
        >
          <UserName as="span" pubkey={account.pubkey} />
        </Button>
      ))}

      <Flex gap="2" alignItems="center" w="xl">
        <Divider />
        OR
        <Divider />
      </Flex>

      <Button as={RouterLink} to="/signin" w="sm" colorScheme="pink">
        Signin
      </Button>
    </Flex>
  );
}
