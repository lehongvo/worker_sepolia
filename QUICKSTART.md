# Quick Start Guide

## 🚀 Deploy in 3 Steps

### 1️⃣ Setup

```bash
# Install dependencies
yarn install

# Copy .env.example
cp .env.example .env
```

### 2️⃣ Configure .env

```env
TOKEN_NAME=YourToken
TOKEN_SYMBOL=YTK
PRIVATE_KEY=your_private_key_here
SEPOLIA_RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY
ETHERSCAN_API_KEY=your_etherscan_key
```

### 3️⃣ Deploy

```bash
# Check configuration
yarn check

# Deploy to Sepolia
yarn deploy:sepolia
```

## 📋 Yarn Scripts

| Command | Description |
|---------|-------------|
| `yarn check` | Check .env configuration |
| `yarn compile` | Compile contracts |
| `yarn test` | Run tests |
| `yarn deploy:local` | Deploy to localhost |
| `yarn deploy:sepolia` | Deploy to Sepolia + verify |
| `yarn clean` | Clean cache |

## 🔗 Important Links

- [Sepolia Faucet](https://sepoliafaucet.com/) - Get test ETH
- [Alchemy](https://www.alchemy.com/) - RPC Provider
- [Etherscan API](https://etherscan.io/myapikey) - API key for verification

## ✅ Pre-deployment Checklist

- [ ] Node.js 22 installed
- [ ] Have SepoliaETH in wallet
- [ ] All fields filled in .env
- [ ] `yarn check` shows ✅ all green
- [ ] Compiled successfully: `yarn compile`

## 🎯 Sample Deploy Output

```
✅ Ready to deploy to Sepolia!

=== Deployment Successful ===
Proxy Address: 0x1234...
Implementation Address: 0x5678...

=== Verifying Contracts on Etherscan ===
✅ Implementation verified!
✅ Proxy verified!

View on Etherscan:
Proxy: https://sepolia.etherscan.io/address/0x1234...
```

---

📖 See [README.md](./README.md) for full documentation
