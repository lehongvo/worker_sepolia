require("dotenv").config();

async function main() {
  console.log("=== Checking Configuration ===\n");

  // Check Token Config
  console.log("📝 Token Configuration:");
  console.log(`   TOKEN_NAME: ${process.env.TOKEN_NAME || "❌ NOT SET"}`);
  console.log(`   TOKEN_SYMBOL: ${process.env.TOKEN_SYMBOL || "❌ NOT SET"}`);

  // Check Network Config
  console.log("\n🌐 Network Configuration:");
  const hasPrivateKey = process.env.PRIVATE_KEY && process.env.PRIVATE_KEY.length > 0;
  const hasRpcUrl = process.env.SEPOLIA_RPC_URL && process.env.SEPOLIA_RPC_URL.length > 0;
  
  console.log(`   PRIVATE_KEY: ${hasPrivateKey ? "✅ Set" : "❌ NOT SET"}`);
  console.log(`   SEPOLIA_RPC_URL: ${hasRpcUrl ? "✅ Set" : "❌ NOT SET"}`);

  // Check Etherscan Config
  console.log("\n🔍 Etherscan Configuration:");
  const hasEtherscanKey = process.env.ETHERSCAN_API_KEY && process.env.ETHERSCAN_API_KEY.length > 0;
  console.log(`   ETHERSCAN_API_KEY: ${hasEtherscanKey ? "✅ Set" : "⚠️  Not set (verification will fail)"}`);

  // Summary
  console.log("\n=== Summary ===");
  const canDeploy = hasPrivateKey && hasRpcUrl;
  
  if (canDeploy) {
    console.log("✅ Ready to deploy to Sepolia!");
    console.log("\nRun: npx hardhat run scripts/deploy.js --network sepolia");
  } else {
    console.log("❌ Missing required configuration!");
    console.log("\nPlease check your .env file and make sure you have:");
    if (!hasPrivateKey) console.log("   - PRIVATE_KEY");
    if (!hasRpcUrl) console.log("   - SEPOLIA_RPC_URL");
    console.log("\nRefer to .env.example for the required format.");
  }

  if (!hasEtherscanKey && canDeploy) {
    console.log("\n⚠️  Warning: ETHERSCAN_API_KEY not set. Contracts won't be verified automatically.");
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
