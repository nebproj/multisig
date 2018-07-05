

/**
 * 2 of 2 multisig contract.
 * simplistic version.  
 * user can deposit into this contract.  
 * require both user to release the entire fund.  
 * 
 * @version 2 - this version has simpler logic than v1.
 * @version 3 - instead of tracking the contract balance, find balance using Blockchain api
 * @version 4 - allow withdraw of arbitrary amount instead of full amount.
 */
class Multisig2of2Simple {
  
  constructor() {
    LocalContractStorage.defineProperties(this, {
      addr1: null,
      addr2: null,
      lastCommand: null,
    });
  }

  init(addr1, addr2) {
    this.addr1 = addr1;
    this.addr2 = addr2;
    this.lastCommand = {};
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
    if (from === this.addr1 || from === this.addr2) {
      let lastCommand = eval(this.lastCommand);

      // put the new command in
      lastCommand[from] = {
        toAddr: toAddr,
      }

      // check if the new command is enough to meet the threshold of payment
      if (isEquivalent(lastCommand[this.addr1], lastCommand[this.addr2])) {
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

module.exports = Multisig2of2Simple;
