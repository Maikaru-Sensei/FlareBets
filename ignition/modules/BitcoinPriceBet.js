const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("BitcoinPriceBet", (m) => {
  const bitcoinPriceBet = m.contract("BitcoinPriceBet");
  return { bitcoinPriceBet };
});