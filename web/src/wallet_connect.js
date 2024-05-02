import { deployNewBet, viewBets } from './contract.js';

if (typeof window.ethereum !== 'undefined') {
    const connectButton = document.getElementById("connectButton");
    const deployBet = document.getElementById("deployBet");
    const vBets = document.getElementById("viewBets");
    const status = document.getElementById('status');

    connectButton.addEventListener("click", async () => {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            console.log("Connected to account:", account);
            status.textContent = 'Metamask connected';
            connectButton.hidden = true;
        } catch (error) {
            console.error("Error connecting to MetaMask:", error.message);
        }
    });

    deployBet.addEventListener("click", async() => {
        await deployNewBet();
    });

    vBets.addEventListener("click", async() => {
        await viewBets();
    })

} else {
    console.log("MetaMask not installed. Please install MetaMask to use this feature.");
}