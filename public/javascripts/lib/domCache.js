import { ContactData } from './contactData.js';
import { partition, makeAlert } from './helpers.js';
import { tagBp, contactBp, contactRowBp } from '../blueprints/bundle.js';
import { alerted, tagsUpdated } from './events.js';

export let domCache;

(function() {
  const DomCache = (function() {
    let contacts = [],
        allTags = [],
        activeTags = [];

    // get contacts by their active tags
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

    // filter a contactArr by name
    const filterByName = function filterContactsByName(name, contactArr) {
      return contactArr.filter(contact => {
        return ContactData.name(contact).toLowerCase().includes(name);
      });
    };

    // return a non-mutable copy of a cache
    const copy = function copyCache(cache) {
      return [...cache];
    };

    // cache agnostic includes
    const includes = function cacheIncludes(searchElem) {
      let isIncluded = false,
          isTag = searchElem instanceof HTMLSpanElement,
          isContact = searchElem.full_name,
          isStr = typeof searchElem === "string";

      if (isContact) {
        isIncluded = contacts.some(contact => {
          return searchElem.id === ContactData.id(contact);
        });
      }
      
      else if (isTag) {
        isIncluded = allTags.map(tag => tag.innerText).includes(searchElem.innerText);
      }

      else if (isStr) {
        isIncluded = activeTags.includes(searchElem);
      }

      return isIncluded;
    };

    // cache agnostic indexOf
    const indexOf = function indexOfCache(searchElem) {
      let isTag = searchElem instanceof HTMLSpanElement,
          isContact = searchElem instanceof HTMLDivElement,
          isContactJson = searchElem.full_name,
          isStr = typeof searchElem === "string";

      if (isContact || isContactJson) {
        let id = isContact ? ContactData.id(searchElem) : String(searchElem.id);

        return contacts.map(ct => ContactData.id(ct)).indexOf(id);
      }
      
      else if (isTag) {
        return allTags.map(tag => tag.innerText).indexOf(searchElem.innerText);
      }

      else if (isStr) {
        return activeContacts.indexOf(searchElem);
      }

      return -1;
    };

    // build rows containing contact cards
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

    // append tag spans to contact card
    const setContactTags = function setContactTags(tags, container) {
      let spans = tags.map(tagVal => {
        let tagSpan = _ui.make(tagBp, [tagVal.trim()]).firstElementChild;

        domCache.pushTag(tagSpan.cloneNode(true));

        return tagSpan;
      });

      container.replaceChildren(...spans);
    };

    // build contact card based on json data
    const buildContact = function buildContactCard(contactJson) {
      let data = ContactData.unmarshal(contactJson),
          contactCard = _ui.make(contactBp, data),
          tagsContainer = contactCard.querySelector('.tags'),
          tags = contactJson.tags === null ? [] : contactJson.tags.split(',');

      setContactTags(tags, tagsContainer);
      
      return contactCard.firstElementChild;
    };

    // get count of tag / tag values across all contacts
    const tagCount = function totalTagCount(tag) {
      tag = typeof tag === "string" ? tag : tag.innerText;

      let allContactTags = contacts.flatMap(ct => ContactData.tags(ct)),
          count = 0;

      return allContactTags.reduce((totalCount, currentTag) => {
        if (currentTag === tag) {
          return totalCount + 1;
        } else {
          return totalCount;
        }
      }, count);
    };

    // removes any non-existant tags then dispatches `tagsUpdated`
    const updateTags = function updateTagsContainer(thisArg) {
      let removedTags = [];

      allTags.map(tag => tagCount(tag))
             .forEach((count, idx) => {
               console.log(count, idx, allTags[idx]);
                if (count === 0) {
                  removedTags.push(allTags[idx]);
                }
             });

      if (removedTags.length) {
        removedTags.forEach(tag => thisArg.spliceTag(tag));
        _ui.get({id: 'filterTags'}).dispatchEvent(tagsUpdated);
      }
    };

    // update element state based on `activeTags`
    const tagState = function setTagState(state) {
      let condition;

      if (state === 'active') {
        condition = (tag) => includes(tag.innerText);
      } else {
        condition = (tag) => !includes(tag.innerText);
      }

      _ui.get({class: 'badge'}).forEach(uniqTag => {
        if (condition(uniqTag)) {
          _ui.state(uniqTag, state);
        }
      });
    };

    return {
      init() {
        return this;
      },

      // visual bug fix when going from no contacts back to contact rows
      activateTags() {
        tagState('active');
      },

      // check for active tags then return doc frag from `buildRows`
      activeContacts() {
        let taggedContacts = getByTags();

        if (taggedContacts) {
          return buildRows(taggedContacts);
        } else {
          return makeAlert('danger', 'No contacts found.');
        }
      },
      
      // return a non-mutable copy of `contacts`
      allContacts() {
        return copy(contacts);
      },

      // return doc frag from `buildRows` with default parameter
      contactRows() {
        return buildRows();
      },
      
      // return a doc frag containing all existing tag spans
      tags() {
        let frag = new DocumentFragment();

        copy(allTags).forEach(tag => frag.appendChild(tag));
        
        return frag;
      },

      // if contact doesn't exist in `contacts`, add it, then return length of `contacts`
      pushContact(contactJson) {
        if (!includes(contactJson)) {
          contacts.push(buildContact(contactJson));
        }

        return contacts.length;
      },

      // update a contact with provided json data (will overwrite all fields with new vals)
      updateContact(contactJson) {
        let contactIdx = indexOf(contactJson),
            tags = contactJson.tags === null ? [] : contactJson.tags.split(',');

        if (contactIdx !== -1) {
          ContactData.set(contacts[contactIdx], contactJson);
          let tagContainer = contacts[contactIdx].querySelector('.tags');

          setContactTags(tags, tagContainer);

          updateTags(this);
        }
      },

      // if contact exists, splice it, returning array containing spliced contact or empty if not found
      spliceContact(contactId) {
        let contactIdx = indexOf({full_name: "fake_contact_json", id: contactId});

        if (contactIdx !== -1) {
          let spliced = contacts.splice(contactIdx, 1);
          updateTags(this);
          return spliced;
        }

        return [];
      },

      // if tag doesn't exist in `allTags`, add it then return length
      pushTag(tag) {
        if (!includes(tag)) {
          tag.blueprint = 'tag';
          allTags.push(tag);
          _ui.get({id: 'filterTags'}).dispatchEvent(tagsUpdated);
        }

        return allTags.length;
      },

      // if tag exists, splice it, returning array containing spliced tag or empty if not found
      spliceTag(tag) {
        let tagIdx = indexOf(tag);

        if (tagIdx !== -1) {
          return allTags.splice(tagIdx, 1);
        }

        return [];
      },

      // toggle active tag state for filtering
      toggleTag(tag) {
        let tagValue = tag.innerText,
            tagIdx = activeTags.indexOf(tagValue);

        if (tagIdx === -1) {
          activeTags.push(tagValue);
        } else {
          activeTags.splice(tagIdx, 1);
          tagState('default');
        }
      },

      // filter rows by name, returning doc frag from `buildRows`
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