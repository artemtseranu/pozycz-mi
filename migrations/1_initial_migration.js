var Migrations = artifacts.require("./Migrations.sol");
var Offers = artifacts.require("Offers");

module.exports = function(deployer) {
  deployer.deploy(Migrations);
  deployer.deploy(Offers);
};
