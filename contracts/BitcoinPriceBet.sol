// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@flarenetwork/flare-periphery-contracts/flare/util-contracts/userInterfaces/IFlareContractRegistry.sol";
import "@flarenetwork/flare-periphery-contracts/flare/ftso/userInterfaces/IFtsoRegistry.sol";

contract BitcoinPriceBet {
    address private constant FLARE_CONTRACT_REGISTRY = 0xaD67FE66660Fb8dFE9d6b1b4240d8650e30F6019;
    address payable private owner;
    mapping (address => uint) private bets;
    address[] public participants;
    uint private depositValue;
    uint private balance;
    bool private bettingClosed;
    string private symbol;

    event Winner(address indexed winner, uint256 amount, uint guessedPrice, uint realPrice);

    constructor() {
        owner = payable(msg.sender);
        symbol = "testBTC";
    }

    function makeBet(uint bet) public payable betsOpen {
        if (bets[msg.sender] == 0) {
            participants.push(msg.sender);
        }

        bets[msg.sender] = bet;
        balance += msg.value;
    }

    function closeBetting() public onlyOwner {
        bettingClosed = true;
    }

    function determineWinner() external onlyOwner {
        require(bettingClosed, "Betting is still open");
        require(balance > 0, "No bets yet");

        uint256 _bitcoinPrice = getBitcoinPrice(symbol);
        
        address payable[] memory exactWinners;
        address payable[] memory closestWinners;
        uint256 closestDistance = type(uint256).max;
        
        for (uint256 i = 0; i < participants.length; i++) {
            address participant = participants[i];
            uint256 betAmount = bets[participant];
            uint256 distance = betAmount > _bitcoinPrice ? betAmount - _bitcoinPrice : _bitcoinPrice - betAmount;

            if (distance == 0) {
                if (exactWinners.length == 0) {
                    exactWinners[0] = payable(participant);
                } else {
                    address payable[] memory newExactWinners = new address payable[](exactWinners.length + 1);
                    for (uint256 j = 0; j < exactWinners.length; j++) {
                        newExactWinners[j] = exactWinners[j];
                    }
                    newExactWinners[exactWinners.length] = payable(participant);
                    exactWinners = newExactWinners;
                }
            } else if (distance < closestDistance) {
                closestDistance = distance;
                delete closestWinners;
                closestWinners = new address payable[](1);
                closestWinners[0] = payable(participant);
            } else if (distance == closestDistance) {
                address payable[] memory newClosestWinners = new address payable[](closestWinners.length + 1);
                for (uint256 j = 0; j < closestWinners.length; j++) {
                    newClosestWinners[j] = closestWinners[j];
                }
                newClosestWinners[closestWinners.length] = payable(participant);
                closestWinners = newClosestWinners;
            }
        }
        
        address payable[] memory winners = exactWinners.length > 0 ? exactWinners : closestWinners;
        distributeToWinners(winners, _bitcoinPrice);
    }

    function distributeToWinners(address payable[] memory winners, uint256 realPrice) internal {
        uint256 winningsPerWinner = balance / winners.length;

        for (uint256 i = 0; i < winners.length; i++) {
            payable(winners[i]).transfer(winningsPerWinner);
            emit Winner(winners[i], winningsPerWinner, bets[winners[i]], realPrice);
        }
    }

    function getBitcoinPrice(
        string memory _symbol
    ) internal view onlyOwner returns(
        uint256 _price) 
    {
        IFlareContractRegistry contractRegistry = IFlareContractRegistry(
            FLARE_CONTRACT_REGISTRY);

        IFtsoRegistry ftsoRegistry = IFtsoRegistry(
            contractRegistry.getContractAddressByName('FtsoRegistry'));

        (_price,,) =
            ftsoRegistry.getCurrentPriceWithDecimals(_symbol);
    }

    modifier betsOpen {
        require(!bettingClosed, "Betting is closed");
        _;
    }

    modifier onlyOwner {
        require(msg.sender == owner, "You are not the owner");
        _;
    }
}