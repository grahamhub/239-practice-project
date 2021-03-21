import { contactAPI as api } from "./contactAPI.js";
import { ContactData } from './contactData.js';
import { domCache } from './domCache.js';
import { contactsLoaded, alerted } from './events.js';
import { contactRowBp, tagBp } from '../blueprints/bundle.js';
import { makeAlert } from './helpers.js';

export const logger = function logger(event) {
  console.log(event);
};

// ALERTS
export const showAlert = function showMainAlert(event) {
  let style = event.detail.style,
      message = event.detail.message,
      alert = makeAlert(style, message).firstElementChild;

  _ui.get({id: 'alertBox'}).replaceChildren(alert);

  setTimeout(() => {
    _ui.state(alert, 'fadeOut');
    removeAlert();
  }, 3000);
};

const removeAlert = function removeAlert() {
  setTimeout(() => {
    _ui.get({id: 'alertBox'}).replaceChildren();
  }, 1000);
};

// TAGS
export const updateTagsDOM = function updateTagsDOMCallback(event) {
  event.target.replaceChildren(event.detail.tags());
};

export const toggleTag = function toggleTagCallback(event) {
  if (!event.target.classList.contains('inputTag')) {
    domCache.toggleTag(event.target);
    _ui.get({id: 'cardContainer'}).replaceChildren(domCache.activeContacts());
    domCache.activateTags();
  }
};

export const tagHandler = function handleTagTextarea(event) {
  let parent = event.target.parentElement,
      tagInput = parent.previousElementSibling;
      

  console.log(event);
  if ([" ", ",", "Enter"].includes(event.key)) {
    event.preventDefault();
    
    let tagVal = tagInput.value.split(",").pop();
    
    let tagSpan = _ui.make(tagBp, [tagVal]).firstElementChild;

    tagSpan.classList.add("inputTag");

    parent.insertBefore(tagSpan, event.target);
    event.target.replaceChildren();

    tagInput.value += ",";
  } else {
    if (/^\w$/.test(event.key)) {
      tagInput.value += event.key;
    }

    else if (event.key === "Backspace") {
      tagInput.value = tagInput.value.slice(0, tagInput.value.length - 1);
    }
  }
};

// CONTACT HANDLING
export const filterContacts = function filterContactsCallback(event) {
  _ui.get({id: 'cardContainer'}).replaceChildren(domCache.filterRows(event.target.value));
};

export const loadContacts = function loadAllContacts(event) {
  if (api.method() === "get") {
    let allContacts = event.target.response;

    allContacts.forEach(contact => domCache.pushContact(contact));

    document.dispatchEvent(contactsLoaded);
  }
};

export const getContactsDOM = function getContactsDOMCallback(event) {
  let contactRows = event.detail.contacts();

  _ui.get({id: 'cardContainer'}).appendChild(contactRows);
};

export const updateContactDOM = function updateContactDOMCallback(event) {
  let contact = event.detail.contact;

  domCache.updateContact(contact);

  alerted.detail.style = 'success';
  alerted.detail.message = 'Successfully updated contact.';
  _ui.get({id: 'alertBox'}).dispatchEvent(alerted);

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

  alerted.detail.style = 'success';
  alerted.detail.message = 'Successfully created contact.';
  _ui.get({id: 'alertBox'}).dispatchEvent(alerted);

  close(null, "addContactModal");
};

export const delContactsDOM = function delContactsDOMCallback(event) {
  let contact = event.detail.contact;
  _ui.get({id: 'cardContainer'}).lastElementChild.removeChild(contact);

  alerted.detail.style = 'success';
  alerted.detail.message = 'Successfully deleted contact.'
  _ui.get({id: 'alertBox'}).dispatchEvent(alerted);
  
  close(null, "delContactModal");
}

// FORM HANDLING
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

export const updateForm = function updateManageForm(event) {
  if (event.target.value) {
    let formInputs = _ui.get({class: "mgContact"}),
        contactInfo = ContactData.marshal(event.target.parentElement);

    formInputs.forEach((input, idx) => {
      input.value = Object.values(contactInfo)[idx];
    });

    showTags(contactInfo.tags.split(','), _ui.get({query: '#editContactForm .tag-holder'})[0]);
  }
};

// MODALS
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
  clearTags(modal);
};

const showTags = function showTagSpans(tags, container) {
  tags.forEach(tagVal => {
    let tagSpan = _ui.make(tagBp, [tagVal]).firstElementChild;

    container.insertBefore(tagSpan, _ui.get({query: '#editContactForm .tag-entry'})[0]);
  });
}

const clearTags = function clearTagSpans(modal) {
  let tagEntry = modal.querySelector('.tag-entry'),
      tagHolder = modal.querySelector('.tag-holder');

  while (tagEntry.previousElementSibling) {
    tagHolder.removeChild(tagEntry.previousElementSibling);
  }

  tagEntry.innerText = '';
}