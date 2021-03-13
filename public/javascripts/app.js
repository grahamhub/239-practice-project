import {contactAPI as api} from "./lib/contactAPI.js";
import { domCache } from "./lib/domCache.js";
import { open, close, onSubmit, updateForm, loadContacts } from './lib/eventHandlers.js';

document.addEventListener("contactsLoaded", (event) => {
  let contactRows = event.detail.contacts(),
      tags = event.detail.tags();

  _ui.get({id: 'cardContainer'}).appendChild(contactRows);
  _ui.get({id: 'filterTags'}).appendChild(tags);
});

document.addEventListener("contactUpdated", (event) => {
  let contact = event.detail.contact;
  console.log(event);

  domCache.updateContact(contact);

  close(null, "manageContactModal");
});

_ui.loaded(() => {
  api.allContacts(loadContacts);
  _ui.click({class: "openModal"}, open);
  _ui.click({class: "openModal"}, updateForm);
  _ui.click({class: "closeModal"}, close);
  _ui.click({class: "onsubmit"}, onSubmit);
});