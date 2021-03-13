const partition = function partitionArr(arr, n) {
  return arr.length ? [arr.splice(0, n)].concat(partition(arr, n)) : [];
};

const toArray = function convertToArray(coll) {
  return Array.prototype.slice.call(coll);
};

export {partition, toArray};