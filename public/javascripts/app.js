import { contactRowBp } from "./blueprints/contactRow.js";
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

  domCache.updateContact(contact);

  close(null, "manageContactModal");
});

document.addEventListener("contactAdded", (event) => {
  let contact = event.detail.contact,
      contactAmt = domCache.pushContact(contact),
      contactCard = domCache.allContacts().pop(),
      container;

  console.log(contact);
  console.log(contactAmt);
  console.log(contactCard);

  if (contactAmt % 2 === 0) {
    container = _ui.get({childrenOf: {id: 'cardContainer'}}).pop();
    console.log(container);
  } else {
    container = _ui.make(contactRowBp).firstElementChild;
    _ui.get({id: 'cardContainer'}).appendChild(container);
  }

  console.log(container);

  container.appendChild(contactCard);

  _ui.get({id: 'addContactForm'}).reset();

  close(null, "addContactModal");
});

document.addEventListener("contactDeleted", (event) => {
  let contact = event.detail.contact;

  _ui.get({childrenOf: {id: 'cardContainer'}}).pop().removeChild(contact);
  
  close(null, "manageContactModal");
});

_ui.loaded(() => {
  api.allContacts(loadContacts);
  _ui.click({class: "openModal"}, open);
  _ui.click({class: "openModal"}, updateForm);
  _ui.click({class: "closeModal"}, close);
  _ui.click({class: "onsubmit"}, onSubmit);
});