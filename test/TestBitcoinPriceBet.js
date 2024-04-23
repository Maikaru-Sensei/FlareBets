const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BitcoinPriceBet", async function () {
    let bettingContract;
    let owner;
    let addr1;
    let addr2;
    beforeEach(async function () {
        [owner, addr1, addr2] = await ethers.getSigners();

        const BettingContract = await ethers.getContractFactory("BitcoinPriceBet");
        bettingContract = await BettingContract.deploy();
    });
    it("One winner (closest to target)", async function () {
        await bettingContract.connect(addr1).makeBet(1000, { value: ethers.parseEther("5") });
        await bettingContract.connect(addr2).makeBet(700, { value: ethers.parseEther("5") });

        await bettingContract.closeBetting();
        await bettingContract.determineWinner();

        const winnerEvent = (await bettingContract.queryFilter(bettingContract.filters.Winner()))[0];
        const winner = winnerEvent.args.winner;

        expect(winner).to.be.equal(addr1);
        expect(await ethers.provider.getBalance(bettingContract.target)).to.equal(0);
        expect(await ethers.provider.getBalance(winner)).to.be.greaterThanOrEqual(ethers.parseEther("10"));
    });
    it("Two winners (both closest to target)", async function () {
        await bettingContract.connect(addr1).makeBet(1000, { value: ethers.parseEther("5") });
        await bettingContract.connect(addr2).makeBet(1000, { value: ethers.parseEther("5") });

        await bettingContract.closeBetting();
        await bettingContract.determineWinner();

        const winnerEventA = (await bettingContract.queryFilter(bettingContract.filters.Winner()))[0];
        const winnerEventB = (await bettingContract.queryFilter(bettingContract.filters.Winner()))[1];
        const winnerA = winnerEventA.args.winner;
        const winnerB = winnerEventB.args.winner;

        expect(winnerA).to.be.equal(addr1);
        expect(winnerB).to.be.equal(addr2);
        
        expect(await ethers.provider.getBalance(bettingContract.target)).to.equal(0);
        expect(await ethers.provider.getBalance(winnerA)).to.be.greaterThanOrEqual(ethers.parseEther("5"));
        expect(await ethers.provider.getBalance(winnerB)).to.be.greaterThanOrEqual(ethers.parseEther("5"));
    });
});