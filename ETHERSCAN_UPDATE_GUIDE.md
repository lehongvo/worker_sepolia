# Etherscan Token Info Update Guide

## Problem

After upgrading your token contract and updating the name/symbol on-chain, **Etherscan still shows the old cached metadata**.

### ✅ On-Chain (Blockchain)
- Name: **LEVO**
- Symbol: **VL**
- Version: **2.0.0**

### ❌ Etherscan UI (Cached)
- Name: **testToken** (outdated)
- Symbol: **MTK** (outdated)

---

## Why This Happens

Etherscan caches token metadata when a contract is first indexed. This cache is **NOT automatically updated** when you change the token's name or symbol on-chain.

---

## ⚠️ IMPORTANT: Testnet-Specific Guide Available!

**For Sepolia Testnet users, see the detailed step-by-step guide:**
👉 **[SEPOLIA_TOKEN_UPDATE.md](./SEPOLIA_TOKEN_UPDATE.md)** 👈

This guide covers:
- ✅ How to verify address ownership with MetaMask
- ✅ Step-by-step process with screenshots
- ✅ How to use the "Update Token Info" button on testnet
- ✅ Specific forms and links for Sepolia

---

## Solution: Update Etherscan Metadata

### For Testnets (Sepolia, Goerli, etc.) - Contact Support Form

**⚠️ Note:** The "Update Token Info" button is **NOT available on testnets**. You must use the contact form.

1. **Visit the Etherscan Contact Form:**
   - Sepolia: https://sepolia.etherscan.io/contactus?id=7
   - Goerli: https://goerli.etherscan.io/contactus?id=7

2. **Fill in the form:**

   ```
   Subject: Update Token Information
   
   Contract Address: 0x2A1430BE8b1D1e6510BC67eBaEf758a2c0fc7E7a
   
   Token Name: LEVO
   Token Symbol: VL
   
   Message:
   Hello Etherscan Team,
   
   I have upgraded my token contract to V2 which includes updatable 
   name and symbol functionality.
   
   The token metadata has been updated on-chain:
   - New Name: LEVO (previously: testToken)
   - New Symbol: VL (previously: MTK)
   - Transaction Hash: 0x04c98f29ede154617652feff8c9acf6feadb9369c287d7cb1a5b9368bddf4dac
   - Block Number: 10154438
   
   Please update the token information displayed on Etherscan to 
   reflect the current on-chain values.
   
   You can verify the on-chain values by calling the name() and 
   symbol() functions on the proxy contract.
   
   Thank you!
   ```

3. **Submit** and wait for review (typically 1-3 business days)

---

### For Mainnet Only - Token Update Page

**✅ Only available on Mainnet (not testnets):**

1. Go to your token page: https://etherscan.io/token/YOUR_TOKEN_ADDRESS
2. Click **"Update Token Info"** button (appears near token name)
3. Connect wallet with owner address
4. Update Name, Symbol, and other metadata
5. Submit for review

**Note:** This feature requires:
- ✅ Token deployed on Ethereum Mainnet
- ✅ Wallet connected as contract owner
- ❌ NOT available on Sepolia, Goerli, or other testnets

---

## Verify On-Chain Data

Anyone can verify the actual on-chain values using our script:

```bash
# Run verification script
yarn verify:token
```

This script reads directly from the blockchain (not from Etherscan cache) and shows the real, current values:

```
📊 On-Chain Data (Direct from Blockchain):
Name: LEVO
Symbol: VL
Version: 2.0.0
Total Supply: 1000000000.0
Owner: 0x0ef303a549722d0DDe364c430512E10C907cD510
```

---

## Manual Verification via Etherscan

You can also manually verify on-chain values:

1. **Go to your proxy contract:**
   https://sepolia.etherscan.io/address/0x2A1430BE8b1D1e6510BC67eBaEf758a2c0fc7E7a

2. **Click "Contract" → "Read as Proxy"**

3. **Call the following functions:**
   - `name()` → Returns: `LEVO`
   - `symbol()` → Returns: `VL`
   - `version()` → Returns: `2.0.0`

This confirms the on-chain data is correct!

---

## Important Notes

- ✅ **Your contract IS updated on-chain** - the blockchain has the correct values
- ❌ **Etherscan UI is just cached** - it's only a display issue
- 🔄 **All interactions with your contract** use the real on-chain values
- 📱 **Wallets may also cache** - MetaMask, Trust Wallet, etc. may take time to update their cache
- ⏱️ **Etherscan updates typically take 1-3 days** after you submit the update request

---

## Summary

| Source | Name | Symbol | Status |
|--------|------|--------|--------|
| **Blockchain (Real Data)** | LEVO | VL | ✅ Correct |
| **Etherscan UI** | testToken | MTK | ❌ Cached (outdated) |
| **Contract Calls** | LEVO | VL | ✅ Correct |

**Your contract is working correctly!** The only issue is Etherscan's cached display, which will be fixed once they process your update request.

---

## Related Files

- `scripts/verifyTokenInfo.js` - Script to verify on-chain data
- `deployments/sepolia.json` - Deployment info with current metadata
- Transaction proof: [0x04c98f29...](https://sepolia.etherscan.io/tx/0x04c98f29ede154617652feff8c9acf6feadb9369c287d7cb1a5b9368bddf4dac)
