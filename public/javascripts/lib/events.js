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

export const contactAdded = new CustomEvent("contactAdded", {
  detail: {
    contact: null,
  }
});

export const contactDeleted = new CustomEvent("contactDeleted", {
  detail: {
    contact: null,
    success: false,
  }
});

export const tagsUpdated = new CustomEvent("tagsUpdated", {
  detail: {
    tags: domCache.tags,
  }
});

export const alerted = new CustomEvent("alerted", {
  detail: {
    style: 'primary',
    message: 'No new alerts.',
  }
});