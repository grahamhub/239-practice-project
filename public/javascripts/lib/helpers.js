import { alert } from '../blueprints/alert.js';

const partition = function partitionArr(arr, n) {
  return arr.length ? [arr.splice(0, n)].concat(partition(arr, n)) : [];
};

const toArray = function convertToArray(coll) {
  return Array.prototype.slice.call(coll);
};

// return doc frag containing a styled alert with passed in message / style
const makeAlert = function makeNoContactsAlert(style, message) {
  let noContactFrag = _ui.make(alert, [message]);

  _ui.state(noContactFrag.firstElementChild, style);

  return noContactFrag;
};

export {partition, toArray, makeAlert};