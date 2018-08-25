const Clock = artifacts.require("Clock");
const ContractRegistry = artifacts.require("ContractRegistry");

module.exports = function(deployer) {
  deployer.deploy(Clock).then((clock) => {
    const contractRegistry = ContractRegistry.at(ContractRegistry.address);
    contractRegistry.setContractAddress.sendTransaction("clock", clock.address);
  });
};
