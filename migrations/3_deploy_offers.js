var Offers = artifacts.require("Offers");
var ContractRegistry = artifacts.require("ContractRegistry");

module.exports = function(deployer) {
  deployer.deploy(Offers, ContractRegistry.address).then((offers) => {
    ContractRegistry.deployed().then((contractRegistry) => {
      contractRegistry.setContractAddress.sendTransaction("offers", offers.address);
    });
  });
};
