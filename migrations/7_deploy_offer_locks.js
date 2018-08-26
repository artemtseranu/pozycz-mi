const OfferLocks = artifacts.require("OfferLocks");
const ContractRegistry = artifacts.require("ContractRegistry");

module.exports = function(deployer) {
  deployer.deploy(OfferLocks, ContractRegistry.address).then((offerLocks) => {
    const contractRegistry = ContractRegistry.at(ContractRegistry.address);
    contractRegistry.setContractAddress("offerLocks", offerLocks.address);
  });
};
