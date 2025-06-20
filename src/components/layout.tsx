import { SettingsIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  Heading,
  IconButton,
  Image,
  Text,
} from "@chakra-ui/react";
import { useActiveAccount, useObservableState } from "applesauce-react/hooks";
import { Outlet, Link as RouterLink, useNavigate } from "react-router-dom";
import { IAccount } from "applesauce-accounts";

import logo from "../assets/nsite.svg";
import useProfile from "../hooks/use-profile";
import accountManager from "../services/accounts";
import WelcomeView from "../views/home/welcome";
import UserAvatar from "./user-avatar";
import UserName from "./user-name";

function AccountItem({ account }: { account: IAccount }) {
  const navigate = useNavigate();
  const profile = useProfile({ pubkey: account.pubkey });

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
      <Box>
        <UserName pubkey={account.pubkey} isTruncated fontWeight="bold" />
        <Text fontSize="sm" noOfLines={1}>
          {profile?.about}
        </Text>
      </Box>
    </Flex>
  );
}

function SideNav() {
  const accounts = useObservableState(accountManager.accounts$);

  return (
    <Flex
      direction="column"
      gap="2"
      w="xs"
      borderRightWidth={1}
      p="2"
      flexShrink={0}
    >
      <Flex gap="4" alignItems="center">
        <Image w="20" src={logo} />
        <Heading size="lg" py="2" as={RouterLink} to="/">
          Manager
        </Heading>
        <IconButton
          as={RouterLink}
          to="/settings/app"
          icon={<SettingsIcon boxSize={5} />}
          aria-label="Settings"
          ms="auto"
        />
      </Flex>
      <Button colorScheme="pink" as={RouterLink} to="/add">
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
  const account = useActiveAccount();
  if (!account) return <WelcomeView />;

  return (
    <Flex w="full" h="full">
      <SideNav />
      <Outlet />
    </Flex>
  );
}
