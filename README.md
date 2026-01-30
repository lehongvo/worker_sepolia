# Lotus Test Proxy - Hardhat Project

Hardhat project with upgradeable ERC20 Token contract using OpenZeppelin.

## Requirements

- Node.js v22.x (using nvm)
- Yarn v1.22.x
- Sepolia testnet ETH (get from [faucet](https://sepoliafaucet.com/))

## Installation

```bash
# Use Node.js 22
nvm use 22

# Install dependencies
yarn install

# Copy .env.example and fill in your details
cp .env.example .env
```

## Environment Variables Configuration

Create a `.env` file and fill in the following information:

```env
# Token Configuration
TOKEN_NAME=YourTokenName
TOKEN_SYMBOL=YTK

# Network Configuration
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY

# Etherscan API Key (for contract verification)
ETHERSCAN_API_KEY=your_etherscan_api_key
```

### How to get the required information:

1. **Private Key**: Export from MetaMask (Settings > Security & Privacy > Show Private Key)

2. **Sepolia RPC URL** - Choose one:
   - **With API Key (Recommended)**:
     - [Alchemy](https://www.alchemy.com/) - `https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY`
     - [Infura](https://infura.io/) - `https://sepolia.infura.io/v3/YOUR_KEY`
   
   - **Free Public RPCs (No API key)**:
     - `https://ethereum-sepolia.rpc.subquery.network/public`
     - `https://eth-sepolia.api.onfinality.io/public`
     - `https://api.zan.top/eth-sepolia`
     - `https://ethereum-sepolia.gateway.tatum.io`
     - `https://sepolia.gateway.tenderly.co`
   
   📖 See [RPC_PROVIDERS.md](./RPC_PROVIDERS.md) for details

3. **Etherscan API Key**: Sign up for free at [Etherscan](https://etherscan.io/myapikey)

## Basic Commands

```bash
# Check .env configuration
yarn check

# Compile contracts
yarn compile

# Run tests
yarn test

# Deploy to Localhost (testing)
yarn deploy:local

# Deploy to Sepolia (auto-verify)
yarn deploy:sepolia

# Clean artifacts and cache
yarn clean
```

### Or use npx:

```bash
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js
npx hardhat run scripts/deploy.js --network sepolia
npx hardhat clean
```

## Deploy to Sepolia

```bash
# 1. Check configuration first
yarn check

# 2. Make sure you have SepoliaETH in your wallet
# 3. Run deploy command:
yarn deploy:sepolia

# Or use npx:
npx hardhat run scripts/deploy.js --network sepolia
```

The deploy script will automatically:
- ✅ Deploy Proxy and Implementation contracts
- ✅ Initialize token with name and symbol from .env
- ✅ Verify contracts on Etherscan
- ✅ Display contract addresses and links

## Smart Contract: TestToken

The `TestToken` contract is an upgradeable ERC20 token with the following features:

### Key Features:
- ✅ **Upgradeable**: Uses OpenZeppelin Upgrades plugin
- ✅ **ERC20 Standard**: Standard token with name/symbol from .env
- ✅ **Ownable**: Only owner can mint tokens
- ✅ **Initial Supply**: 1 billion tokens minted on initialization
- ✅ **Proxy Pattern**: Deployed via TransparentUpgradeableProxy

### Functions:
- `initialize(name, symbol, recipient, owner)` - Initialize token (can only be called once)
- `mint(to, amount)` - Mint additional tokens (onlyOwner)
- Standard ERC20: `transfer`, `balanceOf`, `approve`, `transferFrom`, etc.

## Project Structure

```
lotus_test_proxy/
├── contracts/
│   ├── Token.sol              # V1 Upgradeable ERC20 Token
│   └── TokenV2.sol            # V2 with name/symbol update
├── scripts/
│   ├── deploy.js              # Deploy + Verify + Save JSON
│   ├── upgradeNameSymbol.js   # Upgrade to V2 + Update info
│   └── check-config.js        # Configuration checker
├── deployments/
│   └── sepolia.json           # Deployment info (auto-generated)
├── test/
│   └── Token.js               # Token contract tests
├── .env                       # Environment variables (gitignored)
├── .env.example               # Template for .env
├── hardhat.config.js          # Hardhat configuration + Networks
├── package.json               # Dependencies + Scripts
├── QUICKSTART.md              # Quick start guide
├── UPGRADE_GUIDE.md           # Upgrade instructions
├── GIT_GUIDE.md               # Git setup guide
└── README.md                  # This file
```

## Deploy Output Example

```
=== Token Configuration ===
Name: MyToken
Symbol: MTK

Deploying proxy...

=== Deployment Successful ===
Proxy Address: 0x1234...
Implementation Address: 0x5678...
Admin Address: 0x9abc...

=== Token Details ===
Name: MyToken
Symbol: MTK
Total Supply: 1000000000.0 MTK

=== Verifying Contracts on Etherscan ===
Waiting for block confirmations...

Verifying Implementation...
✅ Implementation verified!

Verifying Proxy...
✅ Proxy verified!

=== Verification Complete ===
View on Etherscan:
Proxy: https://sepolia.etherscan.io/address/0x1234...
Implementation: https://sepolia.etherscan.io/address/0x5678...
```

## Yarn Scripts

```bash
yarn check           # Check .env configuration
yarn compile         # Compile contracts
yarn test            # Run tests
yarn deploy:local    # Deploy to localhost
yarn deploy:sepolia  # Deploy to Sepolia + verify
yarn upgrade:token   # Upgrade to V2 + update name/symbol
yarn clean           # Clean cache and artifacts
```

## Upgrade Contract

### Upgrade to V2 with Name/Symbol Update

TokenV2 adds the ability to update token name and symbol:

```bash
# Upgrade and update name/symbol
yarn upgrade:token <PROXY_ADDRESS> "New Name" "NEW"

# Or use values from .env
yarn upgrade:token <PROXY_ADDRESS>
```

See [UPGRADE_GUIDE.md](./UPGRADE_GUIDE.md) for detailed upgrade instructions.

### Manual Upgrade (Advanced)

```javascript
const TestTokenV2 = await ethers.getContractFactory("TestTokenV2");
const upgraded = await upgrades.upgradeProxy(proxyAddress, TestTokenV2);
console.log("Upgraded to:", await upgraded.getAddress());

// Update name and symbol
await upgraded.updateTokenInfo("New Name", "NEW");
```

## Manual Verification (if needed)

```bash
# Verify Implementation
npx hardhat verify --network sepolia IMPLEMENTATION_ADDRESS

# Verify Proxy (usually automatic)
npx hardhat verify --network sepolia PROXY_ADDRESS
```

## Technology Stack

- Hardhat v2.28.4
- Solidity ^0.8.28
- Ethers.js v6.16.0
- OpenZeppelin Contracts v5.4.0
- OpenZeppelin Contracts Upgradeable v5.4.0
- OpenZeppelin Hardhat Upgrades v3.9.1
- Hardhat Verify v2.1.3
- dotenv v17.2.3

## Security Notes

- ⚠️ **DO NOT** commit the `.env` file to git
- ⚠️ **DO NOT** share your private key with anyone
- Constructor has `_disableInitializers()` to prevent implementation contract initialization
- Uses `initializer` modifier to ensure initialize is only called once
- Owner has permission to mint unlimited tokens - use caution in production

## Troubleshooting

**Error: "insufficient funds for intrinsic transaction cost"**
- Need to add SepoliaETH to wallet from faucet

**Error: "Invalid API Key"**
- Check ETHERSCAN_API_KEY in .env file

**Error: "Already Verified"**
- Contract is already verified, no need to verify again

**Error: Verification failed**
- Wait a few more blocks and try manual verification
- Make sure ETHERSCAN_API_KEY is correct

## Updating Token Info on Etherscan

After upgrading to V2 and updating token name/symbol on-chain, the Etherscan UI still shows cached metadata from the initial deployment.

### Quick Reference

```bash
# Display all links and info needed to update Etherscan
yarn update:links

# Verify current on-chain data (shows actual blockchain values)
yarn verify:token
```

### Current Status

- ✅ **On-Chain (Blockchain):** LEVO (VL) - Version 2.0.0
- ⏳ **Etherscan UI:** testToken (MTK) - Needs manual update

### Update Process

**Step 1: Verify Address Ownership (One-time)**
1. Login to https://sepolia.etherscan.io/
2. Go to "Verified Address" (hover username → dropdown)
3. Click "Add Address" and sign with MetaMask

**Step 2: Submit Update Request**
1. After verifying ownership, click "Update Token Information"
2. Fill form with new name (LEVO) and symbol (VL)
3. Submit for Etherscan team review (1-3 business days)

**For detailed step-by-step guide with screenshots:**
- See [SEPOLIA_TOKEN_UPDATE.md](./SEPOLIA_TOKEN_UPDATE.md) - Testnet-specific guide
- See [ETHERSCAN_UPDATE_GUIDE.md](./ETHERSCAN_UPDATE_GUIDE.md) - General guide

### Why This Happens

Etherscan caches token metadata when a contract is first indexed. This cache is **NOT automatically updated** when you change the token's name or symbol on-chain. Only the contract owner can update this information by verifying address ownership and submitting an update request.

## Useful Links

- [Sepolia Faucet](https://sepoliafaucet.com/)
- [Alchemy Dashboard](https://dashboard.alchemy.com/)
- [Etherscan Sepolia](https://sepolia.etherscan.io/)
- [OpenZeppelin Docs](https://docs.openzeppelin.com/)
- [Hardhat Docs](https://hardhat.org/docs)

## Support

For issues or questions:
1. Check the QUICKSTART.md for quick reference
2. Review error messages carefully
3. Ensure all environment variables are set correctly
4. Verify you have enough SepoliaETH for deployment

## License

MIT
