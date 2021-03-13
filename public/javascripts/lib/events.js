import { domCache } from "./domCache.js";

export const contactsLoaded = new CustomEvent("contactsLoaded", {
  detail: {
    contacts: domCache.contactRows,
    tags: domCache.tags,
  }
});

export const contactUpdated = new CustomEvent("contactUpdated", {
  detail: {
    contact: null,
  }
});