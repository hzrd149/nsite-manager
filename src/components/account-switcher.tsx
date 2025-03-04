import { AddIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Button,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  MenuProps,
} from "@chakra-ui/react";
import UserName from "./user-name";
import {
  useAccountManager,
  useAccounts,
  useActiveAccount,
} from "applesauce-react/hooks";
import UserAvatar from "./user-avatar";
import { useNavigate } from "react-router-dom";

export default function AccountSwitcher({
  ...props
}: Omit<MenuProps, "children">) {
  const navigate = useNavigate();
  const active = useActiveAccount();
  const accounts = useAccounts();
  const manager = useAccountManager();

  return (
    <Menu {...props}>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        leftIcon={
          active ? <UserAvatar pubkey={active.pubkey} size="xs" /> : undefined
        }
      >
        {active ? (
          <>
            <UserName pubkey={active.pubkey} />
          </>
        ) : (
          "pick account"
        )}
      </MenuButton>
      <MenuList>
        {accounts
          .filter((a) => a !== active)
          .map((account) => (
            <MenuItem minH="48px" onClick={() => manager.setActive(account)}>
              <UserAvatar pubkey={account.pubkey} mr="2" size="sm" />
              <UserName pubkey={account.pubkey} fontWeight="bold" />
            </MenuItem>
          ))}
        <MenuItem
          icon={<AddIcon />}
          onClick={() =>
            navigate("/signin", { state: { return: location.pathname } })
          }
        >
          Add account
        </MenuItem>
      </MenuList>
    </Menu>
  );
}
