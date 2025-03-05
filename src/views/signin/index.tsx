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
  useToast,
} from "@chakra-ui/react";
import { ExtensionAccount } from "applesauce-accounts/accounts";
import { ExtensionSigner } from "applesauce-signers";
import { Link as RouterLink, useNavigate } from "react-router-dom";

import accountManager from "../../services/accounts";
import { createAccountFromCredentials, njumpLink } from "../../services/njump";
import { useState } from "react";

export default function SigninView() {
  const toast = useToast();
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState("");

  const [loading, setLoading] = useState(false);
  const signin = async () => {
    setLoading(true);
    try {
      const account = await createAccountFromCredentials(credentials);

      if (account) {
        accountManager.addAccount(account);
        accountManager.setActive(account);
        navigate("/");
      }
    } catch (error) {
      if (error instanceof Error)
        toast({ status: "error", description: error.message });
    }
    setLoading(false);
  };

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
        <Input
          placeholder="nsec, ncryptsec, bunker://"
          value={credentials}
          onChange={(e) => setCredentials(e.target.value)}
        />
      </FormControl>

      <ButtonGroup colorScheme="pink">
        <Button colorScheme="purple" onClick={extension}>
          Use extension
        </Button>
        <Spacer />
        <Button as={Link} href={njumpLink.toString()} variant="link" p="2">
          Create account
        </Button>
        <Button
          onClick={signin}
          isLoading={loading}
          isDisabled={credentials.length <= 4}
        >
          Signin
        </Button>
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
