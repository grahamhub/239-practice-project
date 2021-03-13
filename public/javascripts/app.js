import {contactAPI as api} from "./lib/contactAPI.js";
import * as eventHandlers from './lib/eventHandlers.js';
document.addEventListener("contactsLoaded", eventHandlers.getContactsDOM);
document.addEventListener("contactDeleted", eventHandlers.delContactsDOM);
document.addEventListener("contactUpdated", eventHandlers.updateContactDOM);
document.addEventListener("contactAdded", eventHandlers.addContactDOM);

_ui.loaded(() => {
  api.allContacts(eventHandlers.loadContacts);
  _ui.click({class: "openModal"}, eventHandlers.open);
  _ui.click({class: "openModal"}, eventHandlers.updateForm);
  _ui.click({class: "openDelModal"}, eventHandlers.updateDel);
  _ui.click({class: "closeModal"}, eventHandlers.close);
  _ui.click({class: "onsubmit"}, eventHandlers.onSubmit);
});