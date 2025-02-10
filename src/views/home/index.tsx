import { useActiveAccount } from "applesauce-react/hooks";
import WelcomeView from "./welcome";
import DashboardView from "./dashboard";

export default function HomeView() {
  const account = useActiveAccount();
  if (!account) return <WelcomeView />;
  else return <DashboardView />;
}
