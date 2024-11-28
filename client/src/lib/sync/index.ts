import { SYNC_NOTES } from "lib/constants";
import { syncAddedNotes, syncDeletedNotes, syncUpdatedNotes } from "./notes";

export const triggerSyncTask = async (tag: string) => {
  const registration = await navigator.serviceWorker.ready;

  if ("sync" in registration) {
    try {
      await registration.sync.register(tag);
      console.log(`${tag} sync registered successfully`);
    } catch (err) {
      console.error(`${tag} sync registration failed`, err);
    }
  } else {
    console.log("Background sync is not supported in this browser.");
  }
};

export const syncEvent = (event: any) => {
  switch (event.tag) {
    case SYNC_NOTES.NEW:
      event.waitUntil(
        syncAddedNotes().then(() => sendPostMessage(SYNC_NOTES.SYNC_COMPLETE))
      );
      break;
    case SYNC_NOTES.DELETED:
      event.waitUntil(
        syncDeletedNotes().then(() => sendPostMessage(SYNC_NOTES.SYNC_COMPLETE))
      );
      break;
    case SYNC_NOTES.UPDATED:
      event.waitUntil(
        syncUpdatedNotes().then(() => sendPostMessage(SYNC_NOTES.SYNC_COMPLETE))
      );
      break;
    default:
      break;
  }
};

export const sendPostMessage = (action: string) => {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage({ action });
    });
  });
};
