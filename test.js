/**
 * test to see if storing array works
 */
class Test {
  constructor() {
    LocalContractStorage.defineProperties(this, {
      array: null
    });
  }

  init() {
    this.array = [];  
  }

  setArray(array) {
    this.array = array;
  }

  pushArray(item) {
    let ar = eval(this.array);
    ar.push(item);
    this.array = ar;
    return this.array;
  }

  getArray() {
    return this.array;
  }

}

module.exports = Test;
