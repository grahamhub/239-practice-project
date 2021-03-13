export let alert = {
  tag: 'div',
  classes: ['alert', 'alert-primary'],
  props: {
    blueprint: 'alert',
  },
  attr: {
    role: 'alert',
  },
  content: ["innerText"],
  states: {
    primary: ['alert-primary'],
    danger: ['alert-danger'],
    success: ['alert-success'],
    info: ['alert-info'],
  },
};