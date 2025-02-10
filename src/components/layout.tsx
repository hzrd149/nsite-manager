import { Button, Divider, Flex, Heading, Image } from "@chakra-ui/react";
import { useObservable } from "applesauce-react/hooks";
import { Link as RouterLink, Outlet, useNavigate } from "react-router-dom";

import accountManager from "../services/accounts";
import UserAvatar from "./user-avatar";
import { IAccount } from "applesauce-accounts";
import UserName from "./user-name";

function AccountItem({ account }: { account: IAccount }) {
  const navigate = useNavigate();

  return (
    <Flex
      css={{
        ":hover": { backgroundColor: "var(--chakra-colors-chakra-subtle-bg)" },
      }}
      gap="2"
      overflow="hidden"
      p="2"
      alignItems="center"
      onClick={() => {
        navigate("/");
        accountManager.setActive(account);
      }}
      cursor="pointer"
      tabIndex={0}
    >
      <UserAvatar pubkey={account.pubkey} />
      <UserName pubkey={account.pubkey} isTruncated fontWeight="bold" />
    </Flex>
  );
}

function SideNav() {
  const accounts = useObservable(accountManager.accounts$);

  return (
    <Flex
      direction="column"
      gap="2"
      w="xs"
      borderRightWidth={1}
      p="2"
      flexShrink={0}
    >
      <Flex gap="4">
        <Image w="20" src="/nsite.jpg" />
        <Heading size="lg" py="2" as={RouterLink} to="/">
          Manager
        </Heading>
      </Flex>
      <Button colorScheme="pink" as={RouterLink} to="/signin">
        Add site
      </Button>
      <Divider />

      {accounts.map((account) => (
        <AccountItem key={account.id} account={account} />
      ))}
    </Flex>
  );
}

export default function Layout() {
  return (
    <Flex w="full" h="full">
      <SideNav />
      <Outlet />
    </Flex>
  );
}
