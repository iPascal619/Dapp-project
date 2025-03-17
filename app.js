// ABI definition - Replace with your actual contract ABI
const tokenABI = [
    {
        "inputs": [
            {
                "internalType": "string",
                "name": "name_",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "symbol_",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Approval",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": true,
                "internalType": "address",
                "name": "from",
                "type": "address"
            },
            {
                "indexed": true,
                "internalType": "address",
                "name": "to",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "value",
                "type": "uint256"
            }
        ],
        "name": "Transfer",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "spender",
                "type": "address"
            }
        ],
        "name": "allowance",
        "outputs": [
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
                "internalType": "address",
                "name": "spender",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "approve",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "account",
                "type": "address"
            }
        ],
        "name": "balanceOf",
        "outputs": [
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
        "name": "decimals",
        "outputs": [
            {
                "internalType": "uint8",
                "name": "",
                "type": "uint8"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "name",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "totalSupply",
        "outputs": [
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
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transfer",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "sender",
                "type": "address"
            },
            {
                "internalType": "address",
                "name": "recipient",
                "type": "address"
            },
            {
                "internalType": "uint256",
                "name": "amount",
                "type": "uint256"
            }
        ],
        "name": "transferFrom",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Replace with your deployed contract address
const tokenContractAddress = '0x1a463D03D301C520e7DBCC95B0d3F6462CC12f92';

// App state
let web3;
let tokenContract;
let userAccount;
let tokenDecimals = 18;
let transactions = [];

// DOM Elements
const connectWalletBtn = document.getElementById('connectWallet');
const walletButtonText = document.getElementById('walletButtonText');
const accountAddressEl = document.getElementById('accountAddress');
const networkNameEl = document.getElementById('networkName');
const tokenBalanceEl = document.getElementById('tokenBalance');
const transferForm = document.getElementById('transferForm');
const recipientAddressInput = document.getElementById('recipientAddress');
const transferAmountInput = document.getElementById('transferAmount');
const transactionsList = document.getElementById('transactionsList');
const notification = document.getElementById('notification');
const notificationIcon = document.getElementById('notificationIcon');
const notificationMessage = document.getElementById('notificationMessage');
const closeNotificationBtn = document.getElementById('closeNotification');

// Initialize the DApp
async function init() {
    // Event listeners
    connectWalletBtn.addEventListener('click', connectWallet);
    transferForm.addEventListener('submit', handleTransfer);
    closeNotificationBtn.addEventListener('click', hideNotification);

    // Check if MetaMask is installed
    if (typeof window.ethereum !== 'undefined') {
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', () => window.location.reload());

        // Check if already connected
        try {
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            if (accounts.length > 0) {
                await setupWeb3(accounts);
            }
        } catch (error) {
            console.error('Error checking existing connection:', error);
        }
    } else {
        showNotification('error', 'fa-exclamation-circle', 'MetaMask is not installed. Please install MetaMask to use this DApp.');
    }
}

// Connect wallet function
async function connectWallet() {
    try {
        if (typeof window.ethereum !== 'undefined') {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            await setupWeb3(accounts);
        } else {
            showNotification('error', 'fa-exclamation-circle', 'MetaMask is not installed. Please install MetaMask to use this DApp.');
        }
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('error', 'fa-exclamation-circle', 'Failed to connect wallet. Please try again.');
    }
}

// Set up Web3 instance and contract
async function setupWeb3(accounts) {
    web3 = new Web3(window.ethereum);
    tokenContract = new web3.eth.Contract(tokenABI, tokenContractAddress);
    userAccount = accounts[0];
    
    // Update UI
    updateAccountInfo();
    
    // Get token decimals
    try {
        const decimals = await tokenContract.methods.decimals().call();
        tokenDecimals = parseInt(decimals);
    } catch (error) {
        console.error('Error getting token decimals:', error);
    }

    // Get token balance
    await updateTokenBalance();
    
    // Load transaction history from local storage
    loadTransactionHistory();
}

// Handle account changes
function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected their wallet
        resetConnectionState();
    } else if (accounts[0] !== userAccount) {
        userAccount = accounts[0];
        updateAccountInfo();
        updateTokenBalance();
    }
}

// Reset connection state
function resetConnectionState() {
    userAccount = null;
    walletButtonText.textContent = 'Connect Wallet';
    accountAddressEl.textContent = 'Not connected';
    networkNameEl.textContent = 'Not connected';
    tokenBalanceEl.textContent = '0';
}

// Update account information
async function updateAccountInfo() {
    if (!userAccount) return;
    
    walletButtonText.textContent = 'Connected';
    accountAddressEl.textContent = shortenAddress(userAccount);
    
    try {
        const chainId = await web3.eth.getChainId();
        let networkName;
        
        switch (chainId) {
            case 1:
                networkName = 'Ethereum Mainnet';
                break;
            case 3:
                networkName = 'Ropsten Testnet';
                break;
            case 4:
                networkName = 'Rinkeby Testnet';
                break;
            case 5:
                networkName = 'Goerli Testnet';
                break;
            case 42:
                networkName = 'Kovan Testnet';
                break;
            case 11155111:
                networkName = 'Sepolia Testnet';
                break;
            default:
                networkName = `Chain ID: ${chainId}`;
        }
        
        networkNameEl.textContent = networkName;
    } catch (error) {
        console.error('Error getting network:', error);
        networkNameEl.textContent = 'Unknown';
    }
}

// Update token balance
async function updateTokenBalance() {
    if (!userAccount || !tokenContract) return;
    
    try {
        const balance = await tokenContract.methods.balanceOf(userAccount).call();
        const formattedBalance = formatTokenAmount(balance);
        tokenBalanceEl.textContent = formattedBalance;
    } catch (error) {
        console.error('Error getting token balance:', error);
        tokenBalanceEl.textContent = 'Error';
    }
}

// Handle token transfer
async function handleTransfer(event) {
    event.preventDefault();
    
    if (!userAccount || !tokenContract) {
        showNotification('error', 'fa-exclamation-circle', 'Please connect your wallet first.');
        return;
    }
    
    const recipient = recipientAddressInput.value.trim();
    const amount = transferAmountInput.value.trim();
    
    if (!web3.utils.isAddress(recipient)) {
        showNotification('error', 'fa-exclamation-circle', 'Invalid recipient address.');
        return;
    }
    
    if (parseFloat(amount) <= 0) {
        showNotification('error', 'fa-exclamation-circle', 'Amount must be greater than 0.');
        return;
    }
    
    try {
        showNotification('pending', 'fa-spinner fa-pulse', 'Transaction pending. Please confirm in MetaMask...');
        
        // Convert amount to wei
        const amountInWei = web3.utils.toWei(amount, 'ether');
        
        // Send transaction
        const tx = await tokenContract.methods.transfer(recipient, amountInWei).send({ from: userAccount });
        
        // Add transaction to history
        addTransaction({
            type: 'sent',
            address: recipient,
            amount: amount,
            txHash: tx.transactionHash,
            timestamp: Date.now()
        });
        
        // Update token balance
        await updateTokenBalance();
        
        // Reset form
        transferForm.reset();
        
        showNotification('success', 'fa-check-circle', 'Transfer successful!');
    } catch (error) {
        console.error('Error transferring tokens:', error);
        showNotification('error', 'fa-exclamation-circle', 'Transfer failed. See console for details.');
    }
}

// Format token amount (from wei to token units)
function formatTokenAmount(amount) {
    if (!amount) return '0';
    
    try {
        return parseFloat(web3.utils.fromWei(amount, 'ether')).toFixed(4);
    } catch (error) {
        console.error('Error formatting token amount:', error);
        return '0';
    }
}

// Shorten address for display
function shortenAddress(address) {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
}

// Transaction history functions
function addTransaction(tx) {
    transactions.unshift(tx);
    
    // Keep only last 10 transactions
    if (transactions.length > 10) {
        transactions = transactions.slice(0, 10);
    }
    
    // Save to local storage
    saveTransactionHistory();
    
    // Update UI
    updateTransactionHistory();
}

function saveTransactionHistory() {
    localStorage.setItem(`txHistory_${userAccount}`, JSON.stringify(transactions));
}

function loadTransactionHistory() {
    if (!userAccount) return;
    
    const storedTransactions = localStorage.getItem(`txHistory_${userAccount}`);
    if (storedTransactions) {
        transactions = JSON.parse(storedTransactions);
        updateTransactionHistory();
    }
}

function updateTransactionHistory() {
    transactionsList.innerHTML = '';
    
    if (transactions.length === 0) {
        transactionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No transactions yet</p>
            </div>
        `;
        return;
    }
    
    transactions.forEach(tx => {
        const txElement = document.createElement('div');
        txElement.className = 'transaction-item';
        
        const formattedDate = new Date(tx.timestamp).toLocaleString();
        const formattedAddress = shortenAddress(tx.address);
        
        txElement.innerHTML = `
            <div class="transaction-details">
                <span class="transaction-type">${tx.type === 'sent' ? 'Sent' : 'Received'}</span>
                <span class="transaction-address">${formattedAddress}</span>
                <span class="transaction-status">${formattedDate}</span>
            </div>
            <div class="transaction-amount ${tx.type}">
                ${tx.type === 'sent' ? '-' : '+'} ${tx.amount} TST
            </div>
        `;
        
        transactionsList.appendChild(txElement);
    });
}

// Notification functions
function showNotification(type, iconClass, message) {
    notification.className = `notification ${type} show`;
    notificationIcon.className = `fas ${iconClass}`;
    notificationMessage.textContent = message;
    
    // Auto-hide success notifications after 5 seconds
    if (type === 'success') {
        setTimeout(hideNotification, 5000);
    }
}

function hideNotification() {
    notification.classList.remove('show');
}

// Initialize the app when the DOM is loaded
document.addEventListener('DOMContentLoaded', init);