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
  _ui.get({id: 'filterTags'}).addEventListener("tagsUpdated", eventHandlers.updateTagsDOM);
  _ui.get({id: 'alertBox'}).addEventListener("alerted", eventHandlers.showAlert);
  _ui.click({class: 'badge'}, eventHandlers.toggleTag);
  _ui.get({id: 'searchBar'}).oninput = eventHandlers.filterContacts;
  _ui.keydown({query: 'div.tag-entry'}, eventHandlers.tagHandler);
  _ui.click({class: 'tag-holder'}, () => _ui.get({class: 'tag-entry'})[0].focus());
});