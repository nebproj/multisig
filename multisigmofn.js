

/**
 * m-of-n multisig contract.
 * user can deposit into this contract.  
 * require m amount of users to consent to release the fund.  
 */
class MultisigMofN {
  
  constructor() {
    LocalContractStorage.defineProperties(this, {
      addrs: null,
      mThreshold: null,
      lastCommand: null,
    });
  }

  /**
   * 
   * @param {array of strings} addrs - list of addresses that have control of this multisig fund.  format: array of strings.  eg. ["", "", ""]
   * @param {number} mThreshold - minimum threshold to release the fund.  the "m" number of m-of-n multisig contract. 
   *  
   */
  init(addrs, mThreshold) {
    if (typeof addrs === "undefined") {
      throw "addrs must be present";
    }
    if (!Array.isArray(addrs)) {
      throw "addrs must be an array";
    }
    if (addrs.length <= 1) {
      throw "addrs must be an array larger than 1 element";
    }
    if (typeof mThreshold !== "number") {
      throw "mThreshold must be a number";
    }
    if (mThreshold > addrs.length) {
      throw "m cannot be larger than n in m-of-n multisig";
    }

    this.addrs = addrs;
    this.mThreshold = mThreshold;
    this.lastCommand = {};

    // example lastCommand 
    // {
    //   "addr1": { toAddr: "addr101" }
    //   "addr2": { toADdr: "addr101" }
    // }
  }

  deposit() {
    // no need to do anything
  }

  /**
   * withdraw all available fund to the specified addr.
   * @param {string} toAddr - the addr to send the fund.
   * @param {number} amount - amount to withdraw in wei.  integer
   */
  withdraw(toAddr, amount) {
    let from = Blockchain.transaction.from;
    let payoutAmount = new BigNumber(amount);
    // withdraw command must come from addrs (the approved list of addr that controls this contract)
    if (this.addrs.includes(from)) {
      let lastCommand = eval(this.lastCommand);

      // put the new command in
      let commandObj = {
        toAddr: toAddr,
        amount: payoutAmount,
      };

      lastCommand[from] = commandObj;

      // check if the new command is enough to meet the threshold of payment
      // ie. we count all the command that matches this new command, see if the count is >= m
      let count = countEquivalentCommand(commandObj, lastCommand);
      if (count >= this.mThreshold) {
        // pay
        let contractAddr = Blockchain.transaction.to;
        let balance = Blockchain.getAccountState(contractAddr).balance;
        balance = new BigNumber(balance);
        
        if (payoutAmount.lte(balance)) {
          // release the money
          Blockchain.transfer(toAddr, payoutAmount);
          // reset variables
          this.lastCommand = {};
        } else {
          throw "amount too large";
        }
        

      } else {
        // set variables
        this.lastCommand = lastCommand;
      }
    }

    function isEquivalent(commandObj1, commandObj2) {
      return typeof commandObj1 !== "undefined"
        && typeof commandObj2 !== "undefined"
        && typeof commandObj1.toAddr !== "undefined"
        && typeof commandObj2.toAddr !== "undefined"
        && commandObj1.toAddr === commandObj2.toAddr;
    }

    function countEquivalentCommand(commandObj, lastCommand) {
      let count = 0;
      for (let prop in lastCommand) {
        let commandElem = lastCommand[prop];
        if (isEquivalent(commandObj, commandElem)) {
          count++;
        }
      }
      return count;
    }

  }

  who() {
    return {addr1: this.addr1, addr2: this.addr2};
  }

  balance() {
    let contractAddr = Blockchain.transaction.to;
    return Blockchain.getAccountState(contractAddr).balance;
  }

  getLastCommand() {
    return this.lastCommand;
  }

  
}

module.exports = MultisigMofN;
