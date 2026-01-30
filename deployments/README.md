# Deployments

This folder contains deployment information for each network.

## Files

- `sepolia.json` - Sepolia testnet deployment
- `mainnet.json` - Ethereum mainnet deployment (when deployed)
- `localhost.json` - Local deployment (for testing)

## Structure

Each deployment file contains:

```json
{
  "network": "sepolia",
  "proxyAddress": "0x...",           // Main contract address (use this)
  "implementationAddress": "0x...",  // Logic contract
  "adminAddress": "0x...",           // ProxyAdmin address
  "deployer": "0x...",               // Deployer account
  "tokenName": "testToken",          // Token name
  "tokenSymbol": "MTK",              // Token symbol
  "initialSupply": "1000000000.0",   // Initial supply
  "deployedAt": "2026-01-30T...",    // Deploy timestamp
  "version": "1.0.0",                // Contract version
  "upgradedAt": "2026-01-30T...",    // Upgrade timestamp (if upgraded)
  "upgradedBy": "0x..."              // Upgrader account (if upgraded)
}
```

## Usage

### Deploy Script
Automatically creates/updates deployment file when running:
```bash
yarn deploy:sepolia
```

### Upgrade Script
Reads from deployment file and updates after upgrade:
```bash
yarn upgrade:token
```

## Important

- ⚠️ **Proxy Address** is the main address users interact with
- ⚠️ Never delete these files - they're needed for upgrades
- ✅ Commit these files to git (they contain public addresses only)
- ✅ Backup before major upgrades

## Git

These files are tracked by git (not in .gitignore) because they only contain public blockchain addresses, not secrets.

To ignore them (optional), add to `.gitignore`:
```
deployments/*.json
```
