import "./index.css";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ChakraProvider } from "@chakra-ui/react";
import {
  AccountsProvider,
  FactoryProvider,
  QueryStoreProvider,
} from "applesauce-react/providers";
import { createFeedbackButton } from "nostr-feedback-button/feedback.js";
import "nostr-feedback-button/styles.css";

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
import SaveFileView from "./views/save";
import LoadFileView from "./views/load";

import "./services/event-metadata";

// add shout button to page
createFeedbackButton({
  developer: "266815e0c9210dfa324c6cba3573b14bee49da4209a9456f9484e5106cd408a5",
  namespace: "nsite-manager",
  relays: ["wss://relay.damus.io/"],
  getMetadataBlock: () => {
    return [`location: ${location.href}`].join("/n");
  },
  signEvent: (draft) => {
    if (accountManager.active) return accountManager.active.signEvent(draft);
    else throw new Error("No active account");
  },
});

root.render(
  <ChakraProvider>
    <QueryStoreProvider queryStore={queryStore}>
      <AccountsProvider manager={accountManager}>
        <FactoryProvider factory={factory}>
          <BrowserRouter
            basename={import.meta.env.BASE_URL}
            future={{ v7_relativeSplatPath: true, v7_startTransition: true }}
          >
            <Routes>
              <Route path="/signin" Component={SigninView} />
              <Route path="/signin/explore" Component={ExploreSites} />

              {/* pickers */}
              <Route path="/save" Component={SaveFileView} />
              <Route path="/load" Component={LoadFileView} />

              <Route Component={Layout}>
                <Route path="/" Component={HomeView} />
                <Route path="/files/*" Component={FilesView} />
                <Route path="/settings/account" Component={SettingsView} />
                <Route path="/settings/app" Component={AppSettingsView} />
                <Route path="/add" Component={SigninView} />
                <Route path="/add/explore" Component={ExploreSites} />
              </Route>
            </Routes>
          </BrowserRouter>
        </FactoryProvider>
      </AccountsProvider>
    </QueryStoreProvider>
  </ChakraProvider>,
);
