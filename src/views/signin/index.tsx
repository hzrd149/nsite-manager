import {
  Button,
  ButtonGroup,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Link,
  Spacer,
} from "@chakra-ui/react";
import { ExtensionAccount } from "applesauce-accounts/accounts";
import { ExtensionSigner } from "applesauce-signers";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import accountManager from "../../services/accounts";

export default function SigninView() {
  const navigate = useNavigate();

  const extension = async () => {
    const signer = new ExtensionSigner();
    const pubkey = await signer.getPublicKey();
    if (accountManager.getAccountForPubkey(pubkey))
      throw new Error("Site already added");
    const account = new ExtensionAccount(pubkey, signer);
    accountManager.addAccount(account);
    accountManager.setActive(account);
    navigate("/");
  };

  return (
    <Flex w="lg" mx="auto" direction="column" pt="4" pb="12" gap="2">
      <Heading textAlign="center">Add site</Heading>

      <Divider my="4" />

      <FormControl>
        <FormLabel>Nostr login</FormLabel>
        <Input placeholder="nostr address, nsec, bunker://" />
      </FormControl>

      <ButtonGroup colorScheme="pink">
        <Button colorScheme="purple" onClick={extension}>
          Use extension
        </Button>
        <Spacer />
        <Button
          as={Link}
          href="https://start.njump.me/"
          target="_blank"
          variant="link"
          p="2"
        >
          Create account
        </Button>
        <Button>Signin</Button>
      </ButtonGroup>

      <Button
        as={RouterLink}
        to="/explore"
        mx="8"
        colorScheme="pink"
        variant="outline"
        mt="4"
      >
        Explore sites
      </Button>
    </Flex>
  );
}
