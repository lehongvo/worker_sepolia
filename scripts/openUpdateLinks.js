#!/usr/bin/env node

/**
 * Quick Reference Script for Updating Token Info on Etherscan
 * 
 * This script displays all necessary links and information needed
 * to update your token information on Sepolia Etherscan.
 */

const PROXY_ADDRESS = "0x2A1430BE8b1D1e6510BC67eBaEf758a2c0fc7E7a";
const IMPLEMENTATION_ADDRESS = "0xb26aBEd1E0b71E1e0D406339cFF290e9040eAc1E";
const UPGRADE_TX = "0x04c98f29ede154617652feff8c9acf6feadb9369c287d7cb1a5b9368bddf4dac";
const DEPLOYER_ADDRESS = "0x0ef303a549722d0DDe364c430512E10C907cD510";

console.log("\n╔══════════════════════════════════════════════════════════════╗");
console.log("║     Sepolia Token Update - Quick Reference Links            ║");
console.log("╚══════════════════════════════════════════════════════════════╝\n");

console.log("📋 STEP 1: Login/Register Etherscan Account");
console.log("   🔗 https://sepolia.etherscan.io/login\n");

console.log("📋 STEP 2: Verify Address Ownership (ONE-TIME ONLY)");
console.log("   🔗 https://sepolia.etherscan.io/myaccount");
console.log("   👉 Hover username → Click 'Verified Address'");
console.log("   👉 Click 'Add Address' → Sign with MetaMask\n");

console.log("📋 STEP 3: Update Token Information");
console.log("   Method A - Direct Link:");
console.log(`   🔗 https://sepolia.etherscan.io/token/${PROXY_ADDRESS}`);
console.log("   👉 Click token ticker → More → Update Token Info\n");
console.log("   Method B - From Verified Address:");
console.log("   🔗 https://sepolia.etherscan.io/myaccount");
console.log("   👉 Go to 'Verified Address' → Click 'Update Token Information'\n");

console.log("═══════════════════════════════════════════════════════════════\n");

console.log("📊 VERIFY ON-CHAIN DATA (While Waiting for Approval):\n");

console.log("   Method 1 - Run Script:");
console.log("   $ yarn verify:token\n");

console.log("   Method 2 - Manual Check:");
console.log(`   🔗 https://sepolia.etherscan.io/address/${PROXY_ADDRESS}#readProxyContract`);
console.log("   👉 Call name() → Should return: LEVO");
console.log("   👉 Call symbol() → Should return: VL");
console.log("   👉 Call version() → Should return: 2.0.0\n");

console.log("═══════════════════════════════════════════════════════════════\n");

console.log("📝 INFORMATION TO SUBMIT IN UPDATE FORM:\n");
console.log("   Request Type: Existing Token Info Update");
console.log("   Token Name: LEVO");
console.log("   Token Symbol: VL");
console.log("   Contract Address:", PROXY_ADDRESS);
console.log("   Deployer Address:", DEPLOYER_ADDRESS, "\n");

console.log("   Update Reason:");
console.log(`   Token upgraded to V2 with updatable name/symbol.
   
   Previous: testToken (MTK)
   Updated: LEVO (VL)
   
   Upgrade Transaction: ${UPGRADE_TX}
   Block: 10154438
   
   Verify on-chain: Call name() and symbol() functions on proxy contract.`);

console.log("\n═══════════════════════════════════════════════════════════════\n");

console.log("🔗 USEFUL LINKS:\n");
console.log(`   Token Page:    https://sepolia.etherscan.io/token/${PROXY_ADDRESS}`);
console.log(`   Proxy:         https://sepolia.etherscan.io/address/${PROXY_ADDRESS}`);
console.log(`   Implementation: https://sepolia.etherscan.io/address/${IMPLEMENTATION_ADDRESS}`);
console.log(`   Upgrade Tx:    https://sepolia.etherscan.io/tx/${UPGRADE_TX}`);
console.log("\n═══════════════════════════════════════════════════════════════\n");

console.log("📚 DOCUMENTATION:");
console.log("   See SEPOLIA_TOKEN_UPDATE.md for detailed step-by-step guide\n");

console.log("⏱️  EXPECTED TIMELINE:");
console.log("   1-3 business days for Etherscan team review and approval\n");
