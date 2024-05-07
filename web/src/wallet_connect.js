import { deployNewBet, viewBets } from './contract.js';

if (typeof window.ethereum !== 'undefined') {
    const deployBet = document.getElementById("deployBet");
    const vBets = document.getElementById("viewBets");

    deployBet.addEventListener("click", async() => {
        await deployNewBet();
    });

    vBets.addEventListener("click", async() => {
        await viewBets();
    })

} else {
    console.log("MetaMask not installed. Please install MetaMask to use this feature.");
}