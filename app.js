// TokenSwift DApp - Professional Enterprise-Grade Application
let web3;
let contract;
let currentAccount;
let currentNetwork = 'ethereum';
let transactionHistory = [];
let addressBook = [];
let priceChart;
let priceData = {
    current: 1.25,
    change24h: 0.08,
    changePercent: 6.84,
    chartData: [],
    lastUpdated: null
};

// Contract Configuration
const contractAddress = '0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB';
const contractABI = [
    {
        "inputs": [{"internalType": "address", "name": "to", "type": "address"}, {"internalType": "uint256", "name": "amount", "type": "uint256"}],
        "name": "transfer",
        "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"internalType": "address", "name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "symbol",
        "outputs": [{"internalType": "string", "name": "", "type": "string"}],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "decimals",
        "outputs": [{"internalType": "uint8", "name": "", "type": "uint8"}],
        "stateMutability": "view",
        "type": "function"
    }
];

// Network Configuration
const networks = {
    ethereum: {
        name: 'Ethereum',
        chainId: '0x1',
        rpcUrl: 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
        symbol: 'ETH',
        explorer: 'https://etherscan.io'
    },
    polygon: {
        name: 'Polygon',
        chainId: '0x89',
        rpcUrl: 'https://polygon-rpc.com',
        symbol: 'MATIC',
        explorer: 'https://polygonscan.com'
    },
    bsc: {
        name: 'BSC',
        chainId: '0x38',
        rpcUrl: 'https://bsc-dataseed.binance.org',
        symbol: 'BNB',
        explorer: 'https://bscscan.com'
    },
    arbitrum: {
        name: 'Arbitrum',
        chainId: '0xa4b1',
        rpcUrl: 'https://arb1.arbitrum.io/rpc',
        symbol: 'ETH',
        explorer: 'https://arbiscan.io'
    }
};

// Initialize DApp
document.addEventListener('DOMContentLoaded', function() {
    console.log('TokenSwift DApp initializing...');
    loadStoredData();
    initializeEventListeners();
    updateNetworkStatus();
    initializePriceChart();
    loadTransactionHistory();
    loadAddressBook();
    
    // Check if wallet is already connected
    if (typeof window.ethereum !== 'undefined') {
        window.ethereum.request({ method: 'eth_accounts' })
            .then(accounts => {
                if (accounts.length > 0) {
                    connectWallet();
                }
            });
    }
});

// Event Listeners
function initializeEventListeners() {
    // Wallet connection
    document.getElementById('connectWallet').addEventListener('click', connectWallet);
    
    // Token transfer
    document.getElementById('transferForm').addEventListener('submit', handleTransfer);
    
    // Gas estimation
    document.getElementById('refreshGas').addEventListener('click', updateGasEstimates);
    
    // Address book
    document.getElementById('addToAddressBook').addEventListener('click', addToAddressBook);
    document.getElementById('openAddressBook').addEventListener('click', openAddressBookModal);
    
    // Theme toggle
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    
    // Network switcher
    document.getElementById('networkSelector').addEventListener('change', switchNetwork);
    
    // Transaction filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => filterTransactions(e.target.dataset.filter));
    });
    
    // Chart time periods
    document.querySelectorAll('.time-btn').forEach(btn => {
        btn.addEventListener('click', (e) => updateChartPeriod(e.target.dataset.period));
    });
    
    // Modal close buttons
    document.querySelectorAll('.close').forEach(btn => {
        btn.addEventListener('click', (e) => closeModal(e.target.closest('.modal')));
    });
    
    // Confirm transfer button
    document.getElementById('confirmTransfer').addEventListener('click', confirmTransfer);
    
    // Real-time updates
    setInterval(updatePriceData, 30000); // Update every 30 seconds
    setInterval(checkPendingTransactions, 10000); // Check pending txs every 10 seconds
}

// Load stored data
function loadStoredData() {
    // Load theme preference
    const savedTheme = localStorage.getItem('tokenswift_theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeToggle(savedTheme);
    
    // Load network preference
    const savedNetwork = localStorage.getItem('tokenswift_network') || 'ethereum';
    currentNetwork = savedNetwork;
    document.getElementById('networkSelector').value = savedNetwork;
}

// Theme Management
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('tokenswift_theme', newTheme);
    updateThemeToggle(newTheme);
    
    showNotification(`Switched to ${newTheme} theme`, 'success');
}

function updateThemeToggle(theme) {
    const toggle = document.getElementById('themeToggle');
    const icon = toggle.querySelector('i');
    
    if (theme === 'dark') {
        icon.className = 'fas fa-sun';
        toggle.title = 'Switch to light theme';
    } else {
        icon.className = 'fas fa-moon';
        toggle.title = 'Switch to dark theme';
    }
}

// Wallet Connection
async function connectWallet() {
    try {
        if (typeof window.ethereum === 'undefined') {
            showNotification('Please install MetaMask to use this DApp', 'error');
            return;
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        currentAccount = accounts[0];
        
        web3 = new Web3(window.ethereum);
        contract = new web3.eth.Contract(contractABI, contractAddress);
        
        await updateAccountInfo();
        await updateGasEstimates();
        await updatePriceData();
        
        showNotification('Wallet connected successfully!', 'success');
        
        // Listen for account changes
        window.ethereum.on('accountsChanged', handleAccountsChanged);
        window.ethereum.on('chainChanged', handleChainChanged);
        
    } catch (error) {
        console.error('Error connecting wallet:', error);
        showNotification('Failed to connect wallet', 'error');
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        // User disconnected wallet
        currentAccount = null;
        document.getElementById('walletSection').style.display = 'block';
        document.getElementById('mainApp').style.display = 'none';
        showNotification('Wallet disconnected', 'warning');
    } else {
        currentAccount = accounts[0];
        updateAccountInfo();
    }
}

function handleChainChanged(chainId) {
    // Reload the page to reset the dapp state
    window.location.reload();
}

// Account Management
async function updateAccountInfo() {
    if (!currentAccount || !contract) return;
    
    try {
        const balance = await contract.methods.balanceOf(currentAccount).call();
        const formattedBalance = web3.utils.fromWei(balance, 'ether');
        
        document.getElementById('walletAddress').textContent = 
            `${currentAccount.slice(0, 6)}...${currentAccount.slice(-4)}`;
        document.getElementById('tokenBalance').textContent = parseFloat(formattedBalance).toFixed(4);
        
        // Update portfolio value
        const portfolioValue = (parseFloat(formattedBalance) * priceData.current).toFixed(2);
        document.getElementById('portfolioValue').textContent = `$${portfolioValue}`;
        
        // Calculate 24h change
        const change24h = (parseFloat(formattedBalance) * priceData.change24h).toFixed(2);
        const changeElement = document.getElementById('portfolio24hChange');
        changeElement.textContent = `${change24h >= 0 ? '+' : ''}$${change24h}`;
        changeElement.className = `change ${change24h >= 0 ? 'positive' : 'negative'}`;
        
        document.getElementById('walletSection').style.display = 'none';
        document.getElementById('mainApp').style.display = 'block';
        
    } catch (error) {
        console.error('Error updating account info:', error);
        showNotification('Failed to fetch account information', 'error');
    }
}

// Network Management
async function switchNetwork(event) {
    const networkKey = event.target.value;
    const network = networks[networkKey];
    
    try {
        await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: network.chainId }],
        });
        
        currentNetwork = networkKey;
        localStorage.setItem('tokenswift_network', networkKey);
        updateNetworkStatus();
        showNotification(`Switched to ${network.name}`, 'success');
        
    } catch (error) {
        if (error.code === 4902) {
            // Network not added to wallet
            await addNetwork(network);
        } else {
            console.error('Error switching network:', error);
            showNotification('Failed to switch network', 'error');
        }
    }
}

async function addNetwork(network) {
    try {
        await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
                chainId: network.chainId,
                chainName: network.name,
                nativeCurrency: {
                    name: network.symbol,
                    symbol: network.symbol,
                    decimals: 18,
                },
                rpcUrls: [network.rpcUrl],
                blockExplorerUrls: [network.explorer],
            }],
        });
    } catch (error) {
        console.error('Error adding network:', error);
        showNotification('Failed to add network', 'error');
    }
}

function updateNetworkStatus() {
    const network = networks[currentNetwork];
    const statusElement = document.getElementById('networkStatus');
    const connectedElement = document.getElementById('networkConnected');
    
    if (network) {
        statusElement.textContent = network.name;
        connectedElement.style.display = 'block';
        document.getElementById('networkDisconnected').style.display = 'none';
    } else {
        connectedElement.style.display = 'none';
        document.getElementById('networkDisconnected').style.display = 'block';
    }
}

// Price Data Management
async function updatePriceData() {
    try {
        // Simulate price data (in real app, would fetch from API)
        const mockPrice = 1.25 + (Math.random() - 0.5) * 0.1;
        const mockChange = (Math.random() - 0.5) * 0.2;
        
        priceData.current = mockPrice;
        priceData.change24h = mockChange;
        priceData.changePercent = (mockChange / mockPrice * 100);
        priceData.lastUpdated = new Date();
        
        // Update UI
        document.getElementById('currentPrice').textContent = `$${mockPrice.toFixed(4)}`;
        
        const changeElement = document.getElementById('priceChange24h');
        const changeText = `${mockChange >= 0 ? '+' : ''}$${mockChange.toFixed(4)} (${priceData.changePercent.toFixed(2)}%)`;
        changeElement.textContent = changeText;
        changeElement.className = `change ${mockChange >= 0 ? 'positive' : 'negative'}`;
        
        // Add data point to chart
        addPriceDataPoint(mockPrice);
        
        // Update account info if connected
        if (currentAccount) {
            updateAccountInfo();
        }
        
    } catch (error) {
        console.error('Error updating price data:', error);
    }
}

// Price Chart Management
function initializePriceChart() {
    const ctx = document.getElementById('priceChart').getContext('2d');
    
    // Generate initial chart data
    const now = new Date();
    const initialData = [];
    for (let i = 23; i >= 0; i--) {
        const time = new Date(now - i * 60 * 60 * 1000);
        const price = 1.25 + (Math.random() - 0.5) * 0.2;
        initialData.push({
            x: time,
            y: price
        });
    }
    
    priceData.chartData = initialData;
    
    priceChart = new Chart(ctx, {
        type: 'line',
        data: {
            datasets: [{
                label: 'TKNS Price',
                data: initialData,
                borderColor: '#1976d2',
                backgroundColor: 'rgba(25, 118, 210, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'hour',
                        displayFormats: {
                            hour: 'HH:mm'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: false,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '$' + value.toFixed(4);
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    });
}

function addPriceDataPoint(price) {
    if (!priceChart) return;
    
    const now = new Date();
    priceData.chartData.push({
        x: now,
        y: price
    });
    
    // Keep only last 24 hours of data
    const cutoff = new Date(now - 24 * 60 * 60 * 1000);
    priceData.chartData = priceData.chartData.filter(point => point.x > cutoff);
    
    priceChart.data.datasets[0].data = priceData.chartData;
    priceChart.update('none');
}

function updateChartPeriod(period) {
    // Update active button
    document.querySelectorAll('.time-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-period="${period}"]`).classList.add('active');
    
    // In a real app, would fetch different data ranges
    showNotification(`Chart updated to ${period} view`, 'info');
}

// Gas Fee Estimation
async function updateGasEstimates() {
    if (!web3) {
        updateGasUI(20, 25, 30);
        return;
    }
    
    const refreshBtn = document.getElementById('refreshGas');
    refreshBtn.classList.add('spinning');
    
    try {
        const gasPrice = await web3.eth.getGasPrice();
        const gasPriceGwei = web3.utils.fromWei(gasPrice, 'gwei');
        
        // Calculate different priority levels
        const slowGas = Math.round(gasPriceGwei * 0.8);
        const standardGas = Math.round(gasPriceGwei);
        const fastGas = Math.round(gasPriceGwei * 1.2);
        
        updateGasUI(slowGas, standardGas, fastGas);
        
    } catch (error) {
        console.error('Error updating gas estimates:', error);
        updateGasUI(20, 25, 30); // Fallback values
    } finally {
        refreshBtn.classList.remove('spinning');
    }
}

function updateGasUI(slow, standard, fast) {
    // Estimate gas limit for token transfer
    const gasLimit = 21000;
    
    // Calculate costs (approximate ETH price)
    const ethPrice = 2000;
    const slowCost = (slow * gasLimit / 1e9 * ethPrice).toFixed(2);
    const standardCost = (standard * gasLimit / 1e9 * ethPrice).toFixed(2);
    const fastCost = (fast * gasLimit / 1e9 * ethPrice).toFixed(2);
    
    document.getElementById('slowGas').innerHTML = `
        <div class="gas-speed">Slow</div>
        <div class="gas-price">${slow} gwei</div>
        <div class="gas-cost">~$${slowCost}</div>
        <div class="gas-time">~5 min</div>
    `;
    
    document.getElementById('standardGas').innerHTML = `
        <div class="gas-speed">Standard</div>
        <div class="gas-price">${standard} gwei</div>
        <div class="gas-cost">~$${standardCost}</div>
        <div class="gas-time">~2 min</div>
    `;
    
    document.getElementById('fastGas').innerHTML = `
        <div class="gas-speed">Fast</div>
        <div class="gas-price">${fast} gwei</div>
        <div class="gas-cost">~$${fastCost}</div>
        <div class="gas-time">~30 sec</div>
    `;
    
    // Select standard by default
    document.querySelectorAll('.gas-option').forEach(opt => opt.classList.remove('selected'));
    document.getElementById('standardGas').classList.add('selected');
}

// Gas option selection
document.addEventListener('click', function(e) {
    if (e.target.closest('.gas-option')) {
        document.querySelectorAll('.gas-option').forEach(opt => opt.classList.remove('selected'));
        e.target.closest('.gas-option').classList.add('selected');
    }
});

// Token Transfer with Enhanced Security
async function handleTransfer(event) {
    event.preventDefault();
    
    if (!currentAccount || !contract) {
        showNotification('Please connect your wallet first', 'error');
        return;
    }
    
    const recipient = document.getElementById('recipient').value.trim();
    const amount = document.getElementById('amount').value;
    
    // Enhanced validation
    if (!validateAddress(recipient)) {
        showNotification('Invalid recipient address', 'error');
        return;
    }
    
    if (!validateAmount(amount)) {
        showNotification('Invalid amount', 'error');
        return;
    }
    
    // Show transaction preview
    await showTransactionPreview(recipient, amount);
}

function validateAddress(address) {
    return web3.utils.isAddress(address);
}

function validateAmount(amount) {
    const num = parseFloat(amount);
    return num > 0 && !isNaN(num);
}

async function showTransactionPreview(recipient, amount) {
    const gasPrice = getSelectedGasPrice();
    const gasLimit = 21000;
    const gasCostEth = web3.utils.fromWei((gasPrice * gasLimit).toString(), 'ether');
    const gasCostUsd = (parseFloat(gasCostEth) * 2000).toFixed(2); // Approximate ETH price
    
    document.getElementById('previewTo').textContent = recipient;
    document.getElementById('previewAmount').textContent = `${amount} TKNS`;
    document.getElementById('previewGas').textContent = `${web3.utils.fromWei(gasPrice.toString(), 'gwei')} gwei`;
    document.getElementById('previewTotal').textContent = `$${(parseFloat(amount) * priceData.current + parseFloat(gasCostUsd)).toFixed(2)}`;
    
    // Show security warnings
    updateSecurityWarnings(recipient, amount);
    
    // Show preview modal
    document.getElementById('transactionPreviewModal').classList.add('show');
}

function updateSecurityWarnings(recipient, amount) {
    const warnings = [];
    
    // Check if it's a large amount
    if (parseFloat(amount) > 1000) {
        warnings.push('⚠️ Large amount transfer detected');
    }
    
    // Check if address is in address book
    const inAddressBook = addressBook.some(entry => entry.address.toLowerCase() === recipient.toLowerCase());
    if (!inAddressBook) {
        warnings.push('⚠️ Recipient not in address book');
    }
    
    // Check if it's same as sender
    if (recipient.toLowerCase() === currentAccount.toLowerCase()) {
        warnings.push('⚠️ Sending to your own address');
    }
    
    const warningsElement = document.getElementById('securityWarnings');
    if (warnings.length > 0) {
        warningsElement.innerHTML = warnings.map(w => `<div class="security-warning">${w}</div>`).join('');
        warningsElement.style.display = 'block';
    } else {
        warningsElement.style.display = 'none';
    }
}

async function confirmTransfer() {
    const recipient = document.getElementById('recipient').value.trim();
    const amount = document.getElementById('amount').value;
    const amountWei = web3.utils.toWei(amount, 'ether');
    const gasPrice = getSelectedGasPrice();
    
    try {
        closeModal(document.getElementById('transactionPreviewModal'));
        showTransactionStatus('pending', 'Transaction Pending', 'Your transaction is being processed...');
        
        const tx = await contract.methods.transfer(recipient, amountWei).send({
            from: currentAccount,
            gasPrice: gasPrice.toString()
        });
        
        // Add to transaction history
        const transaction = {
            hash: tx.transactionHash,
            type: 'sent',
            to: recipient,
            amount: amount,
            status: 'confirmed',
            timestamp: new Date().toISOString(),
            gasPrice: web3.utils.fromWei(gasPrice.toString(), 'gwei'),
            confirmations: 0,
            network: currentNetwork
        };
        
        addTransactionToHistory(transaction);
        showTransactionStatus('success', 'Transaction Successful!', `Sent ${amount} TKNS to ${recipient.slice(0, 6)}...${recipient.slice(-4)}`);
        
        // Reset form
        document.getElementById('transferForm').reset();
        
        // Update balance
        await updateAccountInfo();
        
    } catch (error) {
        console.error('Transfer error:', error);
        showTransactionStatus('error', 'Transaction Failed', error.message || 'Transaction was rejected or failed');
    }
}

function getSelectedGasPrice() {
    const selectedOption = document.querySelector('.gas-option.selected');
    if (!selectedOption) return web3.utils.toWei('25', 'gwei'); // Default
    
    const gasPriceText = selectedOption.querySelector('.gas-price').textContent;
    const gasPriceGwei = parseInt(gasPriceText.replace(' gwei', ''));
    return web3.utils.toWei(gasPriceGwei.toString(), 'gwei');
}

// Continue in next part...
// Transaction Status Modal
function showTransactionStatus(type, title, message) {
    const modal = document.getElementById('transactionStatusModal');
    const icon = modal.querySelector('.status-icon i');
    const titleEl = modal.querySelector('h3');
    const messageEl = modal.querySelector('.modal-body p');
    
    // Update icon and content
    icon.className = getStatusIcon(type);
    titleEl.textContent = title;
    messageEl.textContent = message;
    
    // Update progress if pending
    if (type === 'pending') {
        updateTransactionProgress(0);
        simulateTransactionProgress();
    }
    
    modal.classList.add('show');
}

function getStatusIcon(type) {
    switch (type) {
        case 'pending': return 'fas fa-clock pending';
        case 'success': return 'fas fa-check-circle success';
        case 'error': return 'fas fa-times-circle error';
        default: return 'fas fa-info-circle';
    }
}

function updateTransactionProgress(percentage) {
    const progressFill = document.querySelector('.progress-fill');
    const progressText = document.querySelector('.progress-text');
    
    if (progressFill && progressText) {
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = `${percentage}% Complete`;
    }
}

function simulateTransactionProgress() {
    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 100) {
            progress = 100;
            clearInterval(interval);
        }
        updateTransactionProgress(Math.round(progress));
    }, 500);
}

// Transaction History Management
function loadTransactionHistory() {
    const stored = localStorage.getItem('tokenswift_transactions');
    if (stored) {
        transactionHistory = JSON.parse(stored);
        renderTransactionHistory();
    }
}

function saveTransactionHistory() {
    localStorage.setItem('tokenswift_transactions', JSON.stringify(transactionHistory));
}

function addTransactionToHistory(transaction) {
    transactionHistory.unshift(transaction);
    // Keep only last 100 transactions
    if (transactionHistory.length > 100) {
        transactionHistory = transactionHistory.slice(0, 100);
    }
    saveTransactionHistory();
    renderTransactionHistory();
}

function renderTransactionHistory() {
    const container = document.getElementById('transactionList');
    
    if (transactionHistory.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-history"></i>
                <p>No transactions yet</p>
                <small>Your token transfers will appear here</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactionHistory.map(tx => `
        <div class="transaction-item ${tx.type} ${tx.status}">
            <div class="transaction-details">
                <div class="transaction-type">
                    <i class="fas ${tx.type === 'sent' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                    ${tx.type === 'sent' ? 'Sent' : 'Received'}
                </div>
                <div class="transaction-address">${tx.to ? tx.to.slice(0, 10) + '...' + tx.to.slice(-6) : 'Unknown'}</div>
                <div class="transaction-status status-${tx.status}">${tx.status}</div>
                ${tx.confirmations !== undefined ? `<div class="transaction-confirmations">${tx.confirmations} confirmations</div>` : ''}
            </div>
            <div>
                <div class="transaction-amount">${tx.type === 'sent' ? '-' : '+'}${tx.amount} TKNS</div>
                <div class="transaction-actions">
                    <button class="btn-icon" onclick="viewTransactionDetails('${tx.hash}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="openInExplorer('${tx.hash}')" title="View on Explorer">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function filterTransactions(filter) {
    // Update active filter button
    document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-filter="${filter}"]`).classList.add('active');
    
    const filtered = filter === 'all' 
        ? transactionHistory 
        : transactionHistory.filter(tx => tx.type === filter || tx.status === filter);
    
    renderFilteredTransactions(filtered);
    showNotification(`Filtered transactions: ${filter}`, 'info');
}

function renderFilteredTransactions(transactions) {
    const container = document.getElementById('transactionList');
    
    if (transactions.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-filter"></i>
                <p>No transactions found</p>
                <small>Try a different filter</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = transactions.map(tx => `
        <div class="transaction-item ${tx.type} ${tx.status}">
            <div class="transaction-details">
                <div class="transaction-type">
                    <i class="fas ${tx.type === 'sent' ? 'fa-arrow-up' : 'fa-arrow-down'}"></i>
                    ${tx.type === 'sent' ? 'Sent' : 'Received'}
                </div>
                <div class="transaction-address">${tx.to ? tx.to.slice(0, 10) + '...' + tx.to.slice(-6) : 'Unknown'}</div>
                <div class="transaction-status status-${tx.status}">${tx.status}</div>
            </div>
            <div>
                <div class="transaction-amount">${tx.type === 'sent' ? '-' : '+'}${tx.amount} TKNS</div>
                <div class="transaction-actions">
                    <button class="btn-icon" onclick="viewTransactionDetails('${tx.hash}')" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-icon" onclick="openInExplorer('${tx.hash}')" title="View on Explorer">
                        <i class="fas fa-external-link-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

function viewTransactionDetails(hash) {
    const tx = transactionHistory.find(t => t.hash === hash);
    if (!tx) return;
    
    const modal = document.getElementById('transactionDetailsModal');
    const container = modal.querySelector('.transaction-details-modal');
    
    container.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">Transaction Hash:</span>
            <span class="detail-value">${tx.hash}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Type:</span>
            <span class="detail-value">${tx.type}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Amount:</span>
            <span class="detail-value">${tx.amount} TKNS</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">To/From:</span>
            <span class="detail-value">${tx.to}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Status:</span>
            <span class="detail-value">${tx.status}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Network:</span>
            <span class="detail-value">${networks[tx.network]?.name || 'Unknown'}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Gas Price:</span>
            <span class="detail-value">${tx.gasPrice} gwei</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">Date:</span>
            <span class="detail-value">${new Date(tx.timestamp).toLocaleString()}</span>
        </div>
    `;
    
    modal.classList.add('show');
}

function openInExplorer(hash) {
    const network = networks[currentNetwork];
    if (network) {
        const url = `${network.explorer}/tx/${hash}`;
        window.open(url, '_blank');
    }
}

function exportTransactionHistory() {
    if (transactionHistory.length === 0) {
        showNotification('No transactions to export', 'warning');
        return;
    }
    
    const csvContent = [
        ['Hash', 'Type', 'Amount', 'To/From', 'Status', 'Network', 'Date'],
        ...transactionHistory.map(tx => [
            tx.hash,
            tx.type,
            tx.amount,
            tx.to,
            tx.status,
            networks[tx.network]?.name || 'Unknown',
            new Date(tx.timestamp).toLocaleString()
        ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tokenswift-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    
    showNotification('Transaction history exported', 'success');
}

// Address Book Management
function loadAddressBook() {
    const stored = localStorage.getItem('tokenswift_addressbook');
    if (stored) {
        addressBook = JSON.parse(stored);
        renderAddressBook();
    }
}

function saveAddressBook() {
    localStorage.setItem('tokenswift_addressbook', JSON.stringify(addressBook));
}

function addToAddressBook() {
    const address = document.getElementById('recipient').value.trim();
    const label = prompt('Enter a label for this address:');
    
    if (!address || !validateAddress(address)) {
        showNotification('Please enter a valid address', 'error');
        return;
    }
    
    if (!label || label.trim() === '') {
        showNotification('Please enter a label', 'error');
        return;
    }
    
    // Check if address already exists
    if (addressBook.some(entry => entry.address.toLowerCase() === address.toLowerCase())) {
        showNotification('Address already in address book', 'warning');
        return;
    }
    
    addressBook.push({
        label: label.trim(),
        address: address,
        addedDate: new Date().toISOString()
    });
    
    saveAddressBook();
    renderAddressBook();
    showNotification('Address added to address book', 'success');
}

function openAddressBookModal() {
    document.getElementById('addressBookModal').classList.add('show');
}

function renderAddressBook() {
    const container = document.getElementById('addressBookList');
    
    if (addressBook.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-address-book"></i>
                <p>No saved addresses</p>
                <small>Add frequently used addresses for quick access</small>
            </div>
        `;
        return;
    }
    
    container.innerHTML = addressBook.map((entry, index) => `
        <div class="address-item">
            <div class="address-info">
                <div class="address-label">${entry.label}</div>
                <div class="address-value">${entry.address}</div>
            </div>
            <div class="address-actions">
                <button class="btn-icon" onclick="useAddress('${entry.address}')" title="Use Address">
                    <i class="fas fa-arrow-right"></i>
                </button>
                <button class="btn-icon danger" onclick="removeAddress(${index})" title="Remove">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

function useAddress(address) {
    document.getElementById('recipient').value = address;
    closeModal(document.getElementById('addressBookModal'));
    showNotification('Address filled in', 'success');
}

function removeAddress(index) {
    if (confirm('Are you sure you want to remove this address?')) {
        addressBook.splice(index, 1);
        saveAddressBook();
        renderAddressBook();
        showNotification('Address removed', 'success');
    }
}

// Modal Management
function closeModal(modal) {
    if (modal) {
        modal.classList.remove('show');
    }
}

// Check pending transactions
function checkPendingTransactions() {
    const pendingTxs = transactionHistory.filter(tx => tx.status === 'pending');
    
    pendingTxs.forEach(async (tx) => {
        try {
            if (web3) {
                const receipt = await web3.eth.getTransactionReceipt(tx.hash);
                if (receipt) {
                    tx.status = receipt.status ? 'confirmed' : 'failed';
                    tx.confirmations = await web3.eth.getBlockNumber() - receipt.blockNumber;
                    saveTransactionHistory();
                    renderTransactionHistory();
                }
            }
        } catch (error) {
            console.error('Error checking transaction status:', error);
        }
    });
}

// Token Allowance Management (placeholder)
function loadTokenAllowances() {
    // In a real app, would check allowances for various dApps
    const container = document.getElementById('allowancesList');
    container.innerHTML = `
        <div class="empty-allowances">
            <i class="fas fa-shield-alt"></i>
            <p>No active allowances</p>
            <small>Your token allowances will appear here</small>
        </div>
    `;
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        <span>${message}</span>
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => notification.classList.add('show'), 100);
    
    // Remove after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Utility Functions
function formatAddress(address, length = 6) {
    if (!address) return 'Unknown';
    return `${address.slice(0, length)}...${address.slice(-4)}`;
}

function formatAmount(amount, decimals = 4) {
    return parseFloat(amount).toFixed(decimals);
}

function formatCurrency(amount, currency = 'USD') {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency
    }).format(amount);
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('Copied to clipboard', 'success');
    }).catch(() => {
        showNotification('Failed to copy', 'error');
    });
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Additional initialization
    loadTokenAllowances();
    
    // Add export button functionality
    const exportBtn = document.getElementById('exportHistory');
    if (exportBtn) {
        exportBtn.addEventListener('click', exportTransactionHistory);
    }
});
