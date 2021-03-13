export let contactBp;

(function () {
  let contactName = {
    tag: "h5",
    classes: ["card-title"],
    props: {
      blueprint: "contactName",
    },
    states: {},
    content: ["innerText"],
  };
  
  let contactEmail = {
    tag: "h6",
    classes: ["card-subtitle", "mb-2", "text-muted"],
    props: {
      blueprint: "contactEmail",
    },
    states: {},
    content: ["innerText"],
  };
  
  let contactPhone = {
    tag: "p",
    classes: ["card-text"],
    props: {
      blueprint: "contactPhone",
    },
    states: {},
    content: ["innerText"],
  };
  
  let contactBtn = {
    tag: "button",
    classes: ["btn", "btn-primary", "openModal"],
    props: {
      blueprint: "contactBtn",
      innerText: "Manage Contact",
    },
    attr: {
      "data-modal": "manageContactModal",
    },
    states: {},
    content: ["value"],
  };
  
  let contactTags = {
    tag: "div",
    classes: ["tags", "mt-2"],
    props: {
      blueprint: "contactTags",
    },
    states: {},
  };
  
  let contactBody = {
    tag: "div",
    classes: ["card-body"],
    props: {
      blueprint: "contactBody",
    },
    states: {},
    children: [
      contactName,
      contactEmail,
      contactPhone,
      contactBtn,
      contactTags,
    ],
  };
  
  contactBp = {
    tag: "div",
    classes: ["card"],
    props: {
      blueprint: "contact",
      style: "width: 18rem;",
    },
    states: {},
    children: [
      contactBody,
    ],
  }
})();