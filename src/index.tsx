import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import {
  AccountsProvider,
  FactoryProvider,
  QueryStoreProvider,
} from "applesauce-react/providers";

import Layout from "./components/layout";
import accountManager from "./services/accounts";
import factory from "./services/factory";
import { queryStore } from "./services/stores";

// setup dayjs
import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(relativeTimePlugin);
dayjs.extend(localizedFormat);

const root = createRoot(document.getElementById("root")!);

import HomeView from "./views/home";
import ExploreSites from "./views/signin/explore";
import SigninView from "./views/signin";
import SettingsView from "./views/settings/account";
import FilesView from "./views/files";
import AppSettingsView from "./views/settings/app";

root.render(
  <ChakraProvider>
    <QueryStoreProvider queryStore={queryStore}>
      <AccountsProvider manager={accountManager}>
        <FactoryProvider factory={factory}>
          <BrowserRouter basename={import.meta.env.BASE_URL}>
            <Routes>
              <Route path="/signin" Component={SigninView} />
              <Route Component={Layout}>
                <Route path="/" Component={HomeView} />
                <Route path="/files/*" Component={FilesView} />
                <Route path="/settings/account" Component={SettingsView} />
                <Route path="/settings/app" Component={AppSettingsView} />
                <Route path="/add" Component={SigninView} />
                <Route path="/explore" Component={ExploreSites} />
              </Route>
            </Routes>
          </BrowserRouter>
        </FactoryProvider>
      </AccountsProvider>
    </QueryStoreProvider>
  </ChakraProvider>,
);
