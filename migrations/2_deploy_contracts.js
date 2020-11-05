var PolicyFactory = artifacts.require("./PolicyFactory.sol");
var Policy = artifacts.require("./Policy.sol");

module.exports = function(deployer) {
	var _initialSupply = "0";
  	deployer.deploy(PolicyFactory,_initialSupply);
};
