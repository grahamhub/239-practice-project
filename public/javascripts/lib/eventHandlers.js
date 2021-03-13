import { contactsLoaded, contactUpdated, contactAdded } from './events.js';
import { ContactData } from './contactData.js';
import { domCache } from './domCache.js';
import { contactAPI as api } from "./contactAPI.js";

export const logger = function logger(event) {
  console.log(event);
};

const updateContact = function updateContactCallback(event) {
  let contact = event.target.response;

  contactUpdated.detail.contact = contact;

  document.dispatchEvent(contactUpdated);
};

const addContact = function addContactCallback(event) {
  let contact = event.target.response;

  contactAdded.detail.contact = contact;

  document.dispatchEvent(contactAdded);
};

export const onSubmit = function onSubmittingForm(event) {
  event.preventDefault();

  let formId = event.target.value,
      form = _ui.get({id: formId}),
      contactId = form.firstElementChild.value,
      contactFormData = new FormData(form);

  if (formId.includes("edit")) {
    api.editContact(contactId, contactFormData, updateContact);
  } else if (formId.includes("add")) {
    api.addContact(contactFormData, addContact);
  // } else {
  //   api.delContact(contactId, logger);
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