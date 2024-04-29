const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BetFactory", (m) => {
  const betFactory = m.contract("BetFactory");
  return { betFactory };
});