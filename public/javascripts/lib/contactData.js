import { toArray } from './helpers.js';

export const ContactData = {
  unmarshal(contactJson) {
    return [
      {contactName: [contactJson.full_name]},
      {contactPhone: [contactJson.phone_number]},
      {contactEmail: [contactJson.email]},
      {contactBtn: [contactJson.id]},
    ];
  },

  marshal(contactElement) {
    return {
      id: this.id(contactElement),
      full_name: this.name(contactElement),
      email: this.email(contactElement),
      phone_number: this.phone(contactElement),
      tags: this.tags(contactElement, true),
    };
  },

  set(contactElement, contactJson) {
    console.log(contactElement);
    contactElement.querySelector('.card-title').innerText = contactJson.full_name;
    contactElement.querySelector('.card-subtitle').innerText = contactJson.email;
    contactElement.querySelector('.card-text').innerText = contactJson.phone_number;
  },

  name(contactElement) {
    return contactElement.querySelector('.card-title').innerText;
  },

  email(contactElement) {
    return contactElement.querySelector('.card-subtitle').innerText;
  },

  phone(contactElement) {
    return contactElement.querySelector('.card-text').innerText;
  },

  tags(contactElement, str=false) {
    let tags = contactElement.querySelector('.tags').children,
        tagArr = toArray(tags).map(tag => tag.innerText);

    if (str) {
      return tagArr.join(',');
    } else {
      return tagArr;
    }
  },

  id(contactElement) {
    return contactElement.querySelector('button').value;
  },
};