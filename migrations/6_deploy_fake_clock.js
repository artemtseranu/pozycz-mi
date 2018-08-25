const FakeClock = artifacts.require("FakeClock");
const ContractRegistry = artifacts.require("ContractRegistry");

module.exports = function(deployer) {
  if (deployer.network !== "test") return;

  deployer.deploy(FakeClock).then((fakeClock) => {
    const contractRegistry = ContractRegistry.at(ContractRegistry.address);
    contractRegistry.setContractAddress("clock", fakeClock.address);
  });
};
