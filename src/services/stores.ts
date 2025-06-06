import { EventStore } from "applesauce-core";
import { verifyEvent } from "nostr-tools";

export const eventStore = new EventStore();

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
}
