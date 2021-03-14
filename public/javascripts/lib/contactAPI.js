import { contactAdded, contactUpdated, contactDeleted } from "./events.js";
import { domCache } from './domCache.js';

export let contactAPI;

(function() {
  const ContactAPI = (function() {
    const URI = 'http://localhost:3000/api/contacts';

    let xhRequest = new XMLHttpRequest(),
        currentMethod,
        activeCallback;

    xhRequest.addEventListener("loadend", () => {
      xhRequest.removeEventListener("load", activeCallback);
    });

    xhRequest.addEventListener("error", () => {
      statusMessage = "An error occurred trying to make your request. Please try again.";
    });

    const encode = function encodeForm(form) {
      let encodedStrings = [];
      
      for (let keyPair of form.entries()) {
        encodedStrings
          .push(keyPair
                  .map(val => encodeURIComponent(val))
                  .join("="));
      }

      return encodedStrings.join("&");
    };

    const request = function requestWithParams(method, params) {
      currentMethod = method.toLowerCase();

      let id = params.id,
          contactForm = params.contactForm,
          url = URI;

      activeCallback = params.callback;
      
      if (id) url += `/${id}`;
      
      xhRequest.open(method, url);
      xhRequest.responseType = 'json';

      xhRequest.addEventListener("load", activeCallback);

      if (contactForm) {
        xhRequest.withCredentials = true;
        xhRequest.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");

        xhRequest.send(encode(contactForm));
      } else {
        xhRequest.send();
      }
    };

    return {
      method() {
        return currentMethod;
      },

      allContacts(callback) {
        request('GET', {callback});
      },

      oneContact(id, callback) {
        request('GET', {id, callback});
      },

      addContact(contactForm) {
        const callback = function addContactCallback(event) {
          contactAdded.detail.contact = event.target.response;
          document.dispatchEvent(contactAdded);
        };

        request('POST', {contactForm, callback});
      },

      editContact(id, contactForm) {
        const callback = function updateContactCallback(event) {
          contactUpdated.detail.contact = event.target.response;
          document.dispatchEvent(contactUpdated);
        };

        request('PUT', {id, contactForm, callback});
      },

      delContact(id) {
        const callback = function delContactCallback(event) {
          let status = event.target.status,
              contactId = event.target.responseURL.split('/').pop();
        
          if (status === 204) {
            contactDeleted.detail.success = true;
            contactDeleted.detail.contact = domCache.spliceContact(contactId)[0];
          } else {
            contactDeleted.detail.success = false;
          }
        
          document.dispatchEvent(contactDeleted);
        };

        request('DELETE', {id, callback});
      },

      init() {
        return this;
      }
    }
  })();

  contactAPI = Object.create(ContactAPI).init();
})();