import { makeNewBet, viewBets } from './contract.js';

if (typeof window.ethereum !== 'undefined') {
    const connectButton = document.getElementById("connectButton");
    const makeBet = document.getElementById("makeBet");
    const vBets = document.getElementById("viewBets");
    const status = document.getElementById('status');

    connectButton.addEventListener("click", async () => {
        try {
            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            console.log("Connected to account:", account);
            status.textContent = 'Metamask connected';

            const balance = await ethereum.request({ method: 'eth_getBalance', params: [account, 'latest'] });
            console.log("Account balance:", balance);
        } catch (error) {
            console.error("Error connecting to MetaMask:", error.message);
        }
    });

    makeBet.addEventListener("click", async() => {
        await makeNewBet();
    });

    vBets.addEventListener("click", async() => {
        await viewBets();
    })

} else {
    console.log("MetaMask not installed. Please install MetaMask to use this feature.");
}