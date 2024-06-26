import { ethers } from "./ethers.js";

export const CONTRACT_OWNER = '0xC0B39308d50848788D879D5ebF74d1ca6066C88a';
export const FACTORY_CONTRACT_ADDRESS = '0x9bb3E475586d1DD466FF80e878187De91790e77e';
export const FACTORY_CONTRACT_ABI = [
    {
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
        "inputs": [
            {
                "internalType": "address",
                "name": "betAddress",
                "type": "address"
            }
        ],
        "name": "closeBetting",
        "outputs": [],
        "stateMutability": "nonpayable",
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
        "inputs": [
            {
                "internalType": "address",
                "name": "betAddress",
                "type": "address"
            }
        ],
        "name": "determineWinner",
        "outputs": [],
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
        "inputs": [
            {
                "internalType": "address",
                "name": "betAddress",
                "type": "address"
            }
        ],
        "name": "getWinner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
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
    }
];
export const BET_CONTRACT_ABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
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
        "inputs": [],
        "name": "getWinner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
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


export async function deployNewBet() {
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
    const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, provider);

    const betAddresses = await factoryContract.getAllBets();
    console.log(betAddresses);

    const betStates = [];

    for (const address of betAddresses) {
        try {
            const betContract = new ethers.Contract(address, BET_CONTRACT_ABI, provider);
            const state = await betContract.getState();
            console.log(state);

            const betState = {
                address: address,
                state: state[0],
                bets: state[1],
                balance: ethers.utils.formatEther(state[2]),
            };
            betStates.push(betState);
        } catch (error) {
            console.error(`Error fetching state for bet contract at address ${address}:`, error);
        }
    }

    await renderBetStates(provider, signer, betStates);
}

async function renderBetStates(provider, signer, betStates) {
    const betListElement = document.getElementById("betList");
    const accounts = await ethereum.request({method: 'eth_requestAccounts'});
    const account = accounts[0];

    betListElement.innerHTML = "";

    const list = document.createElement("ul");

    for (const state of betStates) {
        const listItem = document.createElement("li");

        const addressElement = document.createElement("span");
        const stateElement = document.createElement("span");
        const betsElement = document.createElement("span");
        const balanceElement = document.createElement("span");
        const closeBetElement = document.createElement("button");
        const makeBetInputElement = document.createElement("input");
        const makeBetElement = document.createElement("button");
        const winnerElement = document.createElement("span");

        addressElement.innerHTML = `<b>Address:</b> ${state.address}`;
        stateElement.textContent = `State: ${state.state ? "Closed" : "Open"}`;
        betsElement.textContent = `Bets: ${state.bets}`;
        balanceElement.textContent = `Balance: ${state.balance} C2FLR`;

        listItem.appendChild(addressElement);
        listItem.appendChild(document.createElement("br"));
        listItem.appendChild(stateElement);
        listItem.appendChild(document.createElement("br"));
        listItem.appendChild(betsElement);
        listItem.appendChild(document.createElement("br"));
        listItem.appendChild(balanceElement);

        if (!state.state && account.toLowerCase() === CONTRACT_OWNER.toLowerCase()) {
            listItem.appendChild(document.createElement("br"));
            closeBetElement.textContent = 'Close Bet';
            closeBetElement.onclick = async () => {
                const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, signer);

                const closeBettingTx = await factoryContract.closeBetting(state.address);
                await closeBettingTx.wait();

                const determineWinnerTx = await factoryContract.determineWinner(state.address);
                await determineWinnerTx.wait();

                console.log(determineWinnerTx.hash);

                closeBetElement.hidden = true;
                makeBetElement.hidden = true;
            };
            listItem.appendChild(closeBetElement);
        }

        if (!state.state) {
            listItem.appendChild(document.createElement("br"));
            listItem.appendChild(makeBetInputElement);
            makeBetElement.textContent = 'Make Bet';
            makeBetElement.onclick = async () => {
                const betContract = new ethers.Contract(state.address, BET_CONTRACT_ABI, signer);
                const betValue = ethers.utils.parseEther('2');
                const overrides = {
                    value: betValue
                };

                betContract.makeBet(parseInt(makeBetInputElement.value), overrides)
                    .then((transaction) => {
                        console.log('Transaction sent:', transaction);
                        return transaction.wait(); // Wait for the transaction to be mined
                    })
                    .then((receipt) => {
                        console.log('Transaction receipt:', receipt);
                    })
                    .catch((error) => {
                        console.error('Transaction error:', error);
                    });
            };
            listItem.appendChild(makeBetElement);
        }

        if (state.state) {
            const factoryContract = new ethers.Contract(FACTORY_CONTRACT_ADDRESS, FACTORY_CONTRACT_ABI, signer);
            const winnerResult = await factoryContract.getWinner(state.address);
            winnerElement.textContent = `winner: ${winnerResult[0]}, 
                guessedPrice: ${(winnerResult[1] / 100000).toFixed(5)} USD/BTC, 
                realPrice: ${(winnerResult[2] / 100000).toFixed(5)} USD/BTC`;

            listItem.appendChild(document.createElement("br"));
            listItem.appendChild(winnerElement);
        }


        list.appendChild(listItem);
    }

    betListElement.appendChild(list);
}