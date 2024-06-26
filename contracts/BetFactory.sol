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

    function getAllBets() public view returns(address[] memory) {
        return bitcoinPriceBets;
    }

    function determineWinner(address betAddress) public onlyOwner {
        require(betAddress != address(0), "Invalid bet address");
        BitcoinPriceBet betInstance = BitcoinPriceBet(betAddress);
        betInstance.determineWinner();
    }

    function closeBetting(address betAddress) public onlyOwner {
        require(betAddress != address(0), "Invalid bet address");
        BitcoinPriceBet betInstance = BitcoinPriceBet(betAddress);
        betInstance.closeBetting();
    }

    function getWinner(address betAddress) public view returns(address, uint, uint) {
        require(betAddress != address(0), "Invalid bet address");
        BitcoinPriceBet betInstance = BitcoinPriceBet(betAddress);
        return betInstance.getWinner();
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Factory, You are not the owner");
        _;
    }
}