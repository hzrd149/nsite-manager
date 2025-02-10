import { EventStore, QueryStore } from "applesauce-core";

export const eventStore = new EventStore();
export const queryStore = new QueryStore(eventStore);
