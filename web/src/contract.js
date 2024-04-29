import { ethers } from "./ethers.js";

export const FACTORY_CONTRACT_ADDRESS = '0xD4e4625DAE1CC45BD7517A7e62782D6E6c2FC59b';
export const RPC_ENDPOINT = 'https://coston2-api.flare.network/ext/bc/C/rpc';
export const FACTORY_CONTRACT_ABI = [{
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
},
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "bitcoinPriceBets",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "createNewBet",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getAllBets",
        "outputs": [
            {
                "internalType": "address[]",
                "name": "",
                "type": "address[]"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }];
export const BET_CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "winner",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "guessedPrice",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "realPrice",
                "type": "uint256"
            }
        ],
        "name": "Winner",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "closeBetting",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "determineWinner",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "getState",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            },
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "bet",
                "type": "uint256"
            }
        ],
        "name": "makeBet",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "participants",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];


export async function makeNewBet() {
    if (window.ethereum) {
        await ethereum.request({ method: 'eth_requestAccounts' });
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        const signer = provider.getSigner();

        const contract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, signer);

        try {
            const transaction = await contract.createNewBet();

            await transaction.wait();

            console.log('Transaction successful:', transaction.hash);
        } catch (error) {
            console.error('Transaction failed:', error);
        }
    } else {
        console.error('MetaMask is not installed');
    }
}

export async function viewBets() {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const signer = provider.getSigner();
    const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, signer);

    const betAddresses = await factoryContract.getAllBets();

    const betStates = [];

    for (const address of betAddresses) {
        try {
            const betContract = new ethers.Contract(address, BET_CONTRACT_ABI, provider);
            const state = await betContract.getState();

            const betState = {
                address: address,
                state: state[0],
                bets: state[1].toNumber(),
                balance: state[2].toNumber(),
            };
            betStates.push(betState);
        } catch (error) {
            console.error(`Error fetching state for bet contract at address ${address}:`, error);
        }
    }

    renderBetStates(betStates);
}

function renderBetStates(betStates) {
    const betListElement = document.getElementById("betList");

    betListElement.innerHTML = "";

    const list = document.createElement("ul");

    betStates.forEach((state, index) => {
        const listItem = document.createElement("li");

        const addressElement = document.createElement("span");
        const stateElement = document.createElement("span");
        const betsElement = document.createElement("span");
        const balanceElement = document.createElement("span");

        addressElement.innerHTML = `<b>Address:</b> ${state.address}`;
        stateElement.textContent = `State: ${state.status ? "Open" : "Closed"}`;
        betsElement.textContent = `Bets: ${state.bets}`;
        balanceElement.textContent = `Balance: ${state.balance}`;

        listItem.appendChild(addressElement);
        listItem.appendChild(document.createElement("br"));
        listItem.appendChild(stateElement);
        listItem.appendChild(document.createElement("br"));
        listItem.appendChild(betsElement);
        listItem.appendChild(document.createElement("br"));
        listItem.appendChild(balanceElement);

        list.appendChild(listItem);
    });

    betListElement.appendChild(list);
}