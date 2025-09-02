# TokenSwift DApp

A professional, enterprise-grade decentralized application for ERC-20 token transfers built with modern web technologies and blockchain integration.

## Overview

TokenSwift is a comprehensive DApp that provides secure, user-friendly token transfer capabilities with advanced features including real-time price tracking, multi-network support, transaction analytics, and enhanced security measures. Designed for both individual users and enterprise applications.

## Features

### Core Functionality
- **Secure Token Transfers**: Transfer ERC-20 tokens with enhanced validation and security checks
- **Multi-Network Support**: Compatible with Ethereum, Polygon, BSC, and Arbitrum networks
- **Real-time Balance Updates**: Automatic balance synchronization after transactions
- **Gas Fee Optimization**: Intelligent gas price estimation with slow/standard/fast options

### Advanced Features
- **Price Analytics**: Real-time token price tracking with 24-hour change indicators
- **Interactive Charts**: Professional price visualization using Chart.js
- **Portfolio Management**: Track total portfolio value and performance metrics
- **Transaction History**: Comprehensive transaction tracking with filtering and export capabilities
- **Address Book**: Save and manage frequently used addresses
- **Security Warnings**: Advanced validation with large amount and address verification alerts

### User Experience
- **Professional Interface**: Clean, corporate design suitable for enterprise use
- **Dark/Light Themes**: Toggle between professional theme options
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Real-time Updates**: Live transaction status tracking with confirmation counters
- **Export Functionality**: CSV export for transaction history and record keeping

## Technical Architecture

### Frontend
- **HTML5**: Semantic markup with accessibility considerations
- **CSS3**: Modern styling with CSS custom properties and responsive design
- **Vanilla JavaScript**: No framework dependencies for lightweight performance
- **Chart.js**: Professional data visualization library
- **Font Awesome**: Comprehensive icon library
- **Inter Font**: Professional typography

### Blockchain Integration
- **Web3.js**: Ethereum blockchain interaction library
- **MetaMask**: Wallet connection and transaction signing
- **ERC-20 Standard**: Compatible with all standard ERC-20 tokens
- **Multi-Network**: Support for major Ethereum-compatible networks

### Smart Contract
- **Solidity**: Smart contract written in Solidity ^0.8.0
- **ERC-20 Implementation**: Full ERC-20 token standard compliance
- **Security**: Implemented with best practices and security considerations

## Installation and Setup

### Prerequisites
- Modern web browser with JavaScript enabled
- MetaMask browser extension installed
- Access to Ethereum testnet or mainnet

### Local Development
1. Clone the repository:
   ```
   git clone https://github.com/iPascal619/Dapp-project.git
   cd Dapp-project
   ```

2. Open `index.html` in a web browser or serve using a local web server:
   ```
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx http-server
   ```

3. Connect MetaMask wallet and ensure you're on a supported network

### Configuration
- Update the `contractAddress` in `app.js` to point to your deployed token contract
- Modify network configurations in the `networks` object as needed
- Customize token symbol and decimals in the contract configuration

## Usage

### Getting Started
1. **Connect Wallet**: Click "Connect Wallet" to connect your MetaMask account
2. **Select Network**: Choose your preferred network from the dropdown
3. **View Balance**: Your token balance will be displayed automatically
4. **Transfer Tokens**: Enter recipient address and amount, then review and confirm

### Advanced Features
- **Gas Estimation**: Select preferred gas speed (slow/standard/fast) before transactions
- **Address Book**: Save frequently used addresses for quick access
- **Transaction History**: View, filter, and export your transaction history
- **Price Tracking**: Monitor token price and portfolio performance
- **Theme Toggle**: Switch between light and dark themes

## Smart Contract Details

### Contract Information
- **Name**: Simple Token (SMPL)
- **Decimals**: 18
- **Standard**: ERC-20 compliant
- **Features**: Transfer, balance inquiry, allowance management

### Deployed Addresses
- **Ethereum Mainnet**: `0x4B0897b0513fdC7C541B6d9D7E929C4e5364D2dB`
- **Other Networks**: Update configuration as needed

## Security Considerations

### User Security
- **Address Validation**: All addresses are validated before transactions
- **Transaction Preview**: Review all transaction details before confirmation
- **Security Warnings**: Alerts for large amounts and unknown addresses
- **Network Verification**: Automatic network detection and validation

### Smart Contract Security
- **Audited Code**: Contract follows OpenZeppelin standards
- **Access Control**: Proper permission management
- **Input Validation**: All inputs are validated and sanitized

## Browser Compatibility

### Supported Browsers
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Requirements
- JavaScript enabled
- MetaMask extension installed
- Modern CSS support

## Contributing

### Development Guidelines
1. Follow existing code style and conventions
2. Test thoroughly on multiple networks
3. Ensure responsive design compatibility
4. Update documentation for new features

### Code Structure
- `index.html`: Main application interface
- `styles.css`: Styling and responsive design
- `app.js`: Application logic and blockchain integration
- `SimpleToken.sol`: Smart contract implementation

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Support

For support, bug reports, or feature requests, please open an issue on the GitHub repository.

## Acknowledgments

- OpenZeppelin for smart contract standards
- MetaMask for wallet integration
- Chart.js for data visualization
- Font Awesome for icons
- The Ethereum community for development resources
