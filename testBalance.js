/**
 * test to see if we can get balance from inside the contract
 */
class Test {
  constructor() {
  }

  init() {
  }

  deposit() {
    
  }

  balance() {
    let contractAddr = Blockchain.transaction.to;
    return Blockchain.getAccountState(contractAddr).balance;
  }

  contractState() {
    let contractAddr = Blockchain.transaction.to;
    return Blockchain.getAccountState(contractAddr);
  }

  txInfo() {
    return Blockchain.transaction;
  }

}

module.exports = Test;
