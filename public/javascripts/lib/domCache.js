import { ContactData } from './contactData.js';
import { partition } from './helpers.js';
import { tagBp, contactBp, contactRowBp, alert } from '../blueprints/bundle.js';
import { tagsUpdated } from './events.js';

export let domCache;

(function() {
  const DomCache = (function() {
    let contacts = [],
        allTags = [],
        activeTags = [];

    const getByTags = function getByActiveTags() {
      let taggedContacts = contacts.filter(contact => {
        return activeTags.every(tag => ContactData.tags(contact).includes(tag));
      });

      if (taggedContacts.length) {
        return taggedContacts;
      } else {
        return false;
      }
    };

    const filterByName = function filterContactsByName(name, contactArr) {
      return contactArr.filter(contact => {
        return ContactData.name(contact).toLowerCase().includes(name);
      });
    };

    const copy = function copyCache(cache) {
      return [...cache];
    };

    const includes = function cacheIncludes(which, elem) {
      let isIncluded = false;

      if (which === "contacts") {
        isIncluded = contacts.some(contact => {
          return elem.id === ContactData.id(contact);
        });
      }
      
      else if (which === "tags") {
        isIncluded = allTags.map(tag => tag.innerText).includes(elem.innerText);
      }

      return isIncluded;
    };

    const indexOf = function indexOfCache(which, elem, id=null) {
      if (which === "contacts") {
        let contactId = id ? id : ContactData.id(elem);

        return contacts.map(ct => ContactData.id(ct)).indexOf(String(contactId));
      } else {
        return allTags.map(tag => tag.innerText).indexOf(elem.innerText);
      }
    };

    const buildRows = function buildContactRows(contactArr=contacts) {
      let frag = new DocumentFragment(),
          rows = partition(copy(contactArr), 2);

      rows.forEach(row => {
        let rowDiv = _ui.make(contactRowBp).firstElementChild;

        row.forEach(contact => rowDiv.appendChild(contact));

        frag.appendChild(rowDiv);
      });

      return frag;
    };

    const setContactTags = function setContactTags(tags, container) {
      let spans = tags.map(tagVal => {
        let tagSpan = _ui.make(tagBp, [tagVal.trim()]).firstElementChild;

        domCache.pushTag(tagSpan.cloneNode(true));

        return tagSpan;
      });

      container.replaceChildren(...spans);
    };

    const buildContact = function buildContactCard(contactJson) {
      let data = ContactData.unmarshal(contactJson),
          contactCard = _ui.make(contactBp, data),
          tagsContainer = contactCard.querySelector('.tags'),
          tags = contactJson.tags === null ? [] : contactJson.tags.split(',');

      setContactTags(tags, tagsContainer);
      
      return contactCard.firstElementChild;
    };

    const tagCount = function totalTagCount(tagVal) {
      let allContactTags = contacts.flatMap(ct => ContactData.tags(ct)),
          count = 0;

      return allContactTags.reduce((totalCount, currentTag) => {
        if (currentTag === tagVal) {
          return totalCount + 1;
        } else {
          return totalCount;
        }
      }, count);
    };


    const updateTags = function updateTagsContainer(thisArg) {
      let removedTags = [];

      allTags.map(tagSpan => tagSpan.innerText)
             .map(tagText => tagCount(tagText))
             .forEach((count, idx) => {
               console.log(count, idx, allTags[idx]);
                if (count === 0) {
                  removedTags.push(allTags[idx]);
                }
             });

      if (removedTags.length) {
        removedTags.forEach(tag => thisArg.removeTag(tag));
        _ui.get({id: 'filterTags'}).dispatchEvent(tagsUpdated);
      }
    };

    return {
      init() {
        return this;
      },

      activeContacts() {
        let taggedContacts = getByTags();

        if (taggedContacts) {
          return buildRows(taggedContacts);
        } else {
          let noContactAlert = _ui.make(alert, ['No contacts found!']);
          _ui.state(noContactAlert.firstElementChild, 'danger');
          return noContactAlert;
        }
      },
      
      allContacts() {
        return copy(contacts);
      },

      contactRows() {
        return buildRows();
      },
      
      tags() {
        let frag = new DocumentFragment();

        copy(allTags).forEach(tag => frag.appendChild(tag));
        
        return frag;
      },

      pushContact(contactJson) {
        if (!includes("contacts", contactJson)) {
          let contact = buildContact(contactJson);
          contacts.push(contact);
        }

        return contacts.length;
      },

      updateContact(contactJson) {
        let contactIdx = indexOf("contacts", null, contactJson.id),
            tags = contactJson.tags === null ? [] : contactJson.tags.split(',');

        console.log(contactJson);
        if (contactIdx !== -1) {
          ContactData.set(contacts[contactIdx], contactJson);
          let tagContainer = contacts[contactIdx].querySelector('.tags');

          setContactTags(tags, tagContainer);

          updateTags(this);
        }
      },

      removeContact(contactId) {
        let contactIdx = indexOf("contacts", null, contactId);

        if (contactIdx !== -1) {
          let spliced = contacts.splice(contactIdx, 1)[0];
          updateTags(this);
          return spliced;
        }
      },

      pushTag(tag) {
        if (!includes("tags", tag)) {
          tag.blueprint = 'tag';
          allTags.push(tag);
          _ui.get({id: 'filterTags'}).dispatchEvent(tagsUpdated);
        }

        return allTags.length;
      },

      removeTag(tag) {
        console.log(tag);
        let tagIdx = indexOf("tags", tag);

        if (tagIdx !== -1) {
          return allTags.splice(tagIdx, 1);
        }
      },

      toggleTag(tag) {
        let tagValue = tag.innerText,
            tagIdx = activeTags.indexOf(tagValue);

        if (tagIdx === -1) {
          activeTags.push(tagValue);
          _ui.get({class: 'badge'}).forEach(uniqTag => {
            if (activeTags.includes(uniqTag.innerText)) {
              _ui.state(uniqTag, 'active');
            }
          });
        } else {
          activeTags.splice(tagIdx, 1);
          _ui.get({class: 'badge'}).forEach(uniqTag => {
            if (!activeTags.includes(uniqTag.innerText)) {
              _ui.state(uniqTag, 'default');
            }
          });
        }
      },

      filterRows(name) {
        let taggedContacts = getByTags(),
            filterContacts;
        
        filterContacts = taggedContacts ? taggedContacts : contacts;

        return buildRows(filterByName(name.toLowerCase(), filterContacts));
      },
    };
  })();

  domCache = Object.create(DomCache).init();
})();