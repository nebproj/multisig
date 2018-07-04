const TOTAL_DEPOSIT = "total_deposit";


/**
 * 2 of 2 multisig contract.
 * simplistic version.  
 * user can deposit into this contract.  
 * require both user to release the entire fund.  s
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
    // record the amount deposited
    let from = Blockchain.transaction.from;
    let value = Blockchain.transaction.value;
    Event.Trigger("deposit", "value: " + value);
    
    let totalDeposit = LocalContractStorage.get(TOTAL_DEPOSIT);
    if (!totalDeposit) {
      totalDeposit = new BigNumber(0);
    }

    totalDeposit = new BigNumber(totalDeposit);
    Event.Trigger("deposit", "total deposit before: " + totalDeposit);
    
    totalDeposit = totalDeposit.plus(value);
    Event.Trigger("deposit", "total deposit after: " + totalDeposit);

    LocalContractStorage.set(TOTAL_DEPOSIT, totalDeposit);
    return totalDeposit;
  }

  /**
   * withdraw all available fund to the specified addr.
   * @param {string} toAddr - the addr to send the fund.
   * @param {number} amount - amount to withdraw in wei.  integer
   */
  withdraw(toAddr) {
    let from = Blockchain.transaction.from;
    if (from === this.addr1 || from === this.addr2) {
      let lastCommand = eval(this.lastCommand);

      // put the new command in
      lastCommand[from] = {
        toAddr: toAddr,
      }

      // check if the new command is enough to meet the threshold of payment
      if (isEquivalent(lastCommand[this.addr1], lastCommand[this.addr2])) {
        // pay
        let payoutAmount = LocalContractStorage.get(TOTAL_DEPOSIT);
        payoutAmount = new BigNumber(payoutAmount);
        // release the money
        Blockchain.transfer(toAddr, payoutAmount);
        LocalContractStorage.set(TOTAL_DEPOSIT, new BigNumber(0));

        // reset variables
        this.lastCommand = {};
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

  total() {
    return LocalContractStorage.get(TOTAL_DEPOSIT);
  }

  getLastCommand() {
    return this.lastCommand;
  }

  
}

module.exports = Multisig2of2Simple;
