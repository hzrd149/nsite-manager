import { ActionHub } from "applesauce-actions";
import factory from "./factory";
import { eventStore } from "./stores";

const actions = new ActionHub(eventStore, factory);

export default actions;
