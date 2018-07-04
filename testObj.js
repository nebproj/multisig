/**
 * test to see if storing obj works
 */
class Test {
  constructor() {
    LocalContractStorage.defineProperties(this, {
      obj: null
    });
  }

  init() {
    this.obj = {};  
  }

  set(obj) {
    this.obj = obj;
  }

  /** test adding a property to the obj */
  setProp(key, value) {
    // we can't simply do this.obj[key] = value;
    // it seems that we have to eval it
    // perhaps the vm does not know the serialized obj's type
    let obj = eval(this.obj);
    obj[key] = value;
    this.obj = obj;
    return this.obj;
  }

  get() {
    return this.obj;
  }

}

module.exports = Test;
