const TOTAL_DEPOSIT = "total_deposit";
const LAST_COMMAND = "last_command";

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
    });
  }

  init(addr1, addr2) {
    this.addr1 = addr1;
    this.addr2 = addr2;
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
   * @param {string} addr 
   */
  withdraw(addr) {
    let from = Blockchain.transaction.from;
    if (from === this.addr1 || from === this.addr2) {
      let lastCommand = LocalContractStorage.get(LAST_COMMAND);
      if (!lastCommand) {
        // add the last command
        lastCommand = {
          recipient: addr,
          firstSigner: from,
        };
        LocalContractStorage.set(LAST_COMMAND, lastCommand);
      } else {
        if (lastCommand && lastCommand.recipient && lastCommand.firstSigner) {
          if (lastCommand.recipient === addr) {
            if (lastCommand.firstSigner !== from) {
              // release the money
              Blockchain.transfer(addr, payoutAmount);
              LocalContractStorage.set(LAST_COMMAND, null);
              
            } else {
              // same signer, so do no action.
            }
          } else {
            // last command is replaced with the new one.
            lastCommand = {
              recipient: addr,
              firstSigner: from,
            };
            LocalContractStorage.set(LAST_COMMAND, lastCommand);
          }  
        }
      }
    }
  }

  who() {
    return {addr1: this.addr1, addr2: this.addr2};
  }
}

module.exports = HelloWorld;
