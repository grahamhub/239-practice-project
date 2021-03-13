import { contactAPI as api } from "./contactAPI.js";
import { ContactData } from './contactData.js';
import { domCache } from './domCache.js';
import { contactsLoaded } from './events.js';
import { contactRowBp } from '../blueprints/contactRow.js';

export const logger = function logger(event) {
  console.log(event);
};

export const getContactsDOM = function getContactsDOMCallback(event) {
  let contactRows = event.detail.contacts(),
      tags = event.detail.tags();

  _ui.get({id: 'cardContainer'}).appendChild(contactRows);
  _ui.get({id: 'filterTags'}).appendChild(tags);
};

export const updateContactDOM = function updateContactDOMCallback(event) {
  let contact = event.detail.contact;

  domCache.updateContact(contact);

  close(null, "manageContactModal");
};

export const addContactDOM = function addContactDOMCallback(event) {
  let contact = event.detail.contact,
      contactAmt = domCache.pushContact(contact),
      contactCard = domCache.allContacts().pop(),
      container;

  if (contactAmt % 2 === 0) {
    container = _ui.get({childrenOf: {id: 'cardContainer'}}).pop();
  } else {
    container = _ui.make(contactRowBp).firstElementChild;
    _ui.get({id: 'cardContainer'}).appendChild(container);
  }

  container.appendChild(contactCard);

  _ui.get({id: 'addContactForm'}).reset();

  close(null, "addContactModal");
};

export const delContactsDOM = function delContactsDOMCallback(event) {
  let contact = event.detail.contact;
  console.log(event);
  _ui.get({id: 'cardContainer'}).lastElementChild.removeChild(contact);
  
  close(null, "delContactModal");
}

export const onSubmit = function onSubmittingForm(event) {
  event.preventDefault();

  let formId = event.target.value,
      form = _ui.get({id: formId}),
      contactId = form ? form.firstElementChild.value : formId,
      contactFormData = form ? new FormData(form) : null;

  if (formId.includes("edit")) {
    api.editContact(contactId, contactFormData);
  } else if (formId.includes("add")) {
    api.addContact(contactFormData);
  } else {
    api.delContact(contactId);
  }
};

export const updateForm = function updateManageForm(event) {
  if (event.target.value) {
    let formInputs = _ui.get({class: "mgContact"}),
        contactInfo = ContactData.marshal(event.target.parentElement);

    formInputs.forEach((input, idx) => {
      input.value = Object.values(contactInfo)[idx];
    });
  }
};

export const updateDel = function updateDelModal(event) {
  let contact,
      formInput = _ui.get({id: 'delContactForm'}).lastElementChild,
      tag = event.target;

  if (tag.tagName === "SPAN") {
    contact = tag.parentElement.parentElement;
  } else {
    contact = tag.parentElement;
  }

  _ui.get({id: 'nameSpan'}).innerText = ContactData.name(contact).trim();
  formInput.value = ContactData.id(contact);
};

export const loadContacts = function loadAllContacts(event) {
  if (api.method() === "get") {
    let allContacts = event.target.response;

    allContacts.forEach(contact => domCache.pushContact(contact));

    document.dispatchEvent(contactsLoaded);
  }
};

export const open = function openModal(event) {
  let id = event.target.dataset.modal,
      backdrop = _ui.get({class: "modal-backdrop"})[0],
      modal = _ui.get({id});

  backdrop.style.display = "block";
  modal.style.display = "block";
  modal.classList.add("show");
};

export const close = function closeModal(event, modalId=null) {
  let id = modalId ? modalId : event.target.dataset.modal,
      backdrop = _ui.get({class: "modal-backdrop"})[0],
      modal = _ui.get({id});

  backdrop.style.display = "none";
  modal.style.display = "none";
  modal.classList.remove("show");
};