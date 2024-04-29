// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./BitcoinPriceBet.sol";

contract BetFactory {
    address public owner;
    address[] public bitcoinPriceBets;

    constructor() {
        owner = msg.sender;
    }

    function createNewBet() public onlyOwner returns(address) {
        address newBet = address(new BitcoinPriceBet());
        bitcoinPriceBets.push(newBet);

        return newBet;
    }

    function getAllBets() public view onlyOwner returns(address[] memory) {
        return bitcoinPriceBets;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "You are not the owner");
        _;
    }
}