# Token Upgrade Guide

## Overview

This guide explains how to upgrade your token contract from V1 to V2 and update the token name and symbol.

## V2 Features

TestTokenV2 adds the following new features:
- ✅ **Update Token Name** - Change token name after deployment
- ✅ **Update Token Symbol** - Change token symbol after deployment  
- ✅ **Batch Update** - Update both name and symbol at once
- ✅ **Version Tracking** - Returns contract version
- ✅ **Event Emission** - Emits events when name/symbol change

## Prerequisites

1. Already deployed V1 token on Sepolia
2. Have deployment info in `deployments/sepolia.json`
3. Configured `.env` with new name/symbol (optional)

## Configuration

### Configuration Options

Add to your `.env` file:

```env
# Option 1: Update both name and symbol
TOKEN_NAME_V2=MyNewToken
TOKEN_SYMBOL_V2=MNT

# Option 2: Update only symbol (keep current name)
# TOKEN_NAME_V2=              # Leave empty or don't set
TOKEN_SYMBOL_V2=NEWMTK

# Option 3: Update only name (keep current symbol)
TOKEN_NAME_V2=UpdatedToken
# TOKEN_SYMBOL_V2=            # Leave empty or don't set

# Option 4: Keep both unchanged (upgrade logic only)
# TOKEN_NAME_V2=              # Don't set or leave empty
# TOKEN_SYMBOL_V2=            # Don't set or leave empty
```

**How it works:**
- If `TOKEN_NAME_V2` is set → Updates to new name
- If `TOKEN_NAME_V2` is empty/not set → Keeps current name from deployment
- Same logic applies to `TOKEN_SYMBOL_V2`

## Deployment Info Structure

The `deployments/sepolia.json` file stores:

```json
{
  "network": "sepolia",
  "proxyAddress": "0x...",
  "implementationAddress": "0x...",
  "adminAddress": "0x...",
  "deployer": "0x...",
  "tokenName": "testToken",
  "tokenSymbol": "MTK",
  "initialSupply": "1000000000.0",
  "deployedAt": "2026-01-30T...",
  "version": "1.0.0"
}
```

After upgrade, it will be updated with:

```json
{
  ...previous fields,
  "implementationAddress": "0x...new...",
  "tokenName": "MyNewToken",
  "tokenSymbol": "MNT",
  "version": "2.0.0",
  "upgradedAt": "2026-01-30T...",
  "upgradedBy": "0x..."
}
```

## Upgrade Steps

### 1. Check Current Deployment

```bash
# View current deployment info
cat deployments/sepolia.json
```

### 2. Configure New Name/Symbol

Edit `.env`:
```env
TOKEN_NAME_V2=MyNewToken
TOKEN_SYMBOL_V2=MNT
```

### 3. Run Upgrade

```bash
# Upgrade to V2 and update name/symbol
yarn upgrade:token
```

## Upgrade Process

The script will:

1. ✅ Load proxy address from `deployments/sepolia.json`
2. ✅ Display current token info (name, symbol, supply)
3. ✅ Upgrade implementation to TestTokenV2
4. ✅ Update token name and symbol
5. ✅ Verify new implementation on Etherscan
6. ✅ Update deployment JSON with new info
7. ✅ Display summary

## Example Output

```
=== Upgrading Token Contract ===

Upgrading with account: 0x...
Account balance: 1000000000000000000

📂 Loaded deployment info from: deployments/sepolia.json
Proxy Address: 0x3190A561931Aa6D7Bf70F1cBBfE7731EC081724a
Current Version: 1.0.0

=== Current Token Info ===
Name: testToken
Symbol: MTK
Owner: 0x0ef303a549722d0DDe364c430512E10C907cD510
Total Supply: 1000000000.0

=== New Token Info ===
New Name: MyNewToken
New Symbol: MNT

=== Upgrading to TestTokenV2 ===
Upgrading proxy...
✅ Proxy upgraded successfully!
Proxy Address: 0x3190A561931Aa6D7Bf70F1cBBfE7731EC081724a
New Implementation Address: 0x...

=== Updating Token Name and Symbol ===
Transaction hash: 0x...
Waiting for confirmation...
✅ Token info updated successfully!

=== Verifying Updated Token Info ===
Name: MyNewToken
Symbol: MNT
Version: 2.0.0
Total Supply: 1000000000.0

💾 Updated deployment info saved to: deployments/sepolia.json

=== Upgrade Summary ===
✅ Upgraded to TestTokenV2
✅ Updated name: MyNewToken
✅ Updated symbol: MNT
✅ All token balances preserved

🎉 Upgrade completed successfully!
```

## Important Notes

### ⚠️ Safety Checks

- Proxy address remains the same
- All token balances are preserved
- Total supply unchanged
- Owner remains the same
- Only new implementation is deployed

### 🔒 Security

- Only the owner can update name/symbol
- Upgrade requires owner's private key
- Cannot initialize V2 again (protected by initializer)

### 📊 On-Chain Data

After upgrade:
- Proxy address: **Same** (users don't need to update)
- Implementation address: **New** (V2 logic)
- Token balances: **Preserved**
- Name/Symbol: **Updated** via custom storage

## Manual Name/Symbol Update

If you want to update name/symbol again after upgrade:

```bash
# Using hardhat console
npx hardhat console --network sepolia

# In console:
const token = await ethers.getContractAt("TestTokenV2", "PROXY_ADDRESS")
await token.updateName("NewName")
await token.updateSymbol("NEWSYM")

# Or both at once:
await token.updateTokenInfo("NewName", "NEWSYM")
```

## Verify Contract

After upgrade, verify on Etherscan:

```bash
npx hardhat verify --network sepolia IMPLEMENTATION_ADDRESS
```

Or visit: https://sepolia.etherscan.io/address/PROXY_ADDRESS

## Troubleshooting

**Error: Deployment file not found**
- Make sure you deployed V1 first: `yarn deploy:sepolia`
- Check `deployments/sepolia.json` exists

**Error: Name cannot be empty**
- Check TOKEN_NAME_V2 in .env is set
- Or provide fallback values

**Error: Ownable: caller is not the owner**
- Make sure you're using the owner's private key
- Check PRIVATE_KEY in .env matches the deployer

**Error: Already Verified**
- Implementation is already verified, ignore this

## Rollback

If needed, you can upgrade to a new version or keep the proxy pointing to V2. Downgrading is not recommended as storage layout might be incompatible.

## V2 Contract Functions

```solidity
// New functions in V2
function updateName(string memory newName) public onlyOwner
function updateSymbol(string memory newSymbol) public onlyOwner  
function updateTokenInfo(string memory newName, string memory newSymbol) public onlyOwner
function version() public pure returns (string memory)

// Overridden functions
function name() public view override returns (string memory)
function symbol() public view override returns (string memory)

// Inherited from V1
function mint(address to, uint256 amount) public onlyOwner
// ... all ERC20 functions
```

## Support

For issues:
1. Check deployment info exists: `cat deployments/sepolia.json`
2. Verify .env configuration
3. Check you have enough ETH for gas
4. Review error messages carefully
