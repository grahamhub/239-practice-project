export let tagBp = {
  tag: "span",
  classes: ["badge", "badge-secondary", "mr-1"],
  props: {
    blueprint: 'tag',
  },
  states: {
    default: ["badge-secondary"],
    active: ["badge-info"],
  },
  content: ["innerText"],
};