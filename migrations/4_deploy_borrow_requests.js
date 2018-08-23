const BorrowRequests = artifacts.require("BorrowRequests");
const ContractRegistry = artifacts.require("ContractRegistry");

module.exports = function(deployer) {
  deployer.deploy(BorrowRequests, ContractRegistry.address).then((borrowRequests) => {
    const contractRegistry = ContractRegistry.at(ContractRegistry.address);
    contractRegistry.setContractAddress.sendTransaction("borrowRequests", borrowRequests.address);
  });
};
