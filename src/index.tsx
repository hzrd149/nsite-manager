import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import {
  AccountsProvider,
  QueryStoreProvider,
} from "applesauce-react/providers";

import HomeView from "./views/home";
import Layout from "./components/layout";
import accountManager from "./services/accounts";
import { queryStore } from "./services/stores";
import ExploreSites from "./views/signin/explore";
import SigninView from "./views/signin";
import SettingsView from "./views/settings";
import FilesView from "./views/files";

// setup dayjs
import dayjs from "dayjs";
import relativeTimePlugin from "dayjs/plugin/relativeTime";
import localizedFormat from "dayjs/plugin/localizedFormat";
dayjs.extend(relativeTimePlugin);
dayjs.extend(localizedFormat);

const root = createRoot(document.getElementById("root")!);

root.render(
  <ChakraProvider>
    <QueryStoreProvider queryStore={queryStore}>
      <AccountsProvider manager={accountManager}>
        <BrowserRouter>
          <Routes>
            <Route Component={Layout}>
              <Route path="/" Component={HomeView} />
              <Route path="/files" Component={FilesView} />
              <Route path="/settings" Component={SettingsView} />
              <Route path="/signin" Component={SigninView} />
              <Route path="/explore" Component={ExploreSites} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AccountsProvider>
    </QueryStoreProvider>
  </ChakraProvider>,
);
