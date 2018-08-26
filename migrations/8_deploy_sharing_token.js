const SharingToken = artifacts.require("SharingToken");
const ContractRegistry = artifacts.require("ContractRegistry");

module.exports = function(deployer) {
  deployer.deploy(SharingToken).then((sharingToken) => {
    const contractRegistry = ContractRegistry.at(ContractRegistry.address);
    contractRegistry.setContractAddress("sharingToken", sharingToken.address);
  });
};
