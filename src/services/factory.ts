import { EventFactory } from "applesauce-factory";
import accountManager from "./accounts";

const factory = new EventFactory({
  signer: accountManager.signer,
});

export default factory;
