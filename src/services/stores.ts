import { EventStore, QueryStore } from "applesauce-core";
import { verifyEvent } from "nostr-tools";

export const eventStore = new EventStore();
export const queryStore = new QueryStore(eventStore);

try {
  const { initNostrWasm } = await import("nostr-wasm");
  const wasm = await initNostrWasm();

  eventStore.verifyEvent = (event) => {
    try {
      return wasm.verifyEvent(event) ?? true;
    } catch (error) {
      return false;
    }
  };
} catch (error) {
  eventStore.verifyEvent = verifyEvent;
}

if (import.meta.env.DEV) {
  // @ts-expect-error
  window.eventStore = eventStore;
  // @ts-expect-error
  window.queryStore = queryStore;
}
