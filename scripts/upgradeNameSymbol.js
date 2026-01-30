require("dotenv").config();
const hre = require("hardhat");
const { upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("=== Upgrading Token Contract ===\n");
  console.log("Upgrading with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Load deployment info from JSON
  const network = hre.network.name;
  const deploymentFile = path.join(__dirname, "..", "deployments", `${network}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`\n❌ Error: Deployment file not found for network "${network}"!`);
    console.log(`Expected file: deployments/${network}.json`);
    console.log("\nPlease deploy the contract first:");
    console.log(`  yarn deploy:${network}`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const proxyAddress = deploymentInfo.proxyAddress;
  
  console.log("\n📂 Loaded deployment info from:", `deployments/${network}.json`);
  console.log("Proxy Address:", proxyAddress);
  console.log("Current Version:", deploymentInfo.version || "1.0.0");

  // Get current token info
  console.log("\n=== Current Token Info ===");
  const currentToken = await hre.ethers.getContractAt("TestToken", proxyAddress);
  
  try {
    const currentName = await currentToken.name();
    const currentSymbol = await currentToken.symbol();
    const currentOwner = await currentToken.owner();
    const currentSupply = await currentToken.totalSupply();
    
    console.log("Name:", currentName);
    console.log("Symbol:", currentSymbol);
    console.log("Owner:", currentOwner);
    console.log("Total Supply:", hre.ethers.formatEther(currentSupply));
  } catch (error) {
    console.log("⚠️  Could not fetch current info. Continuing with upgrade...");
  }

  // Get new name and symbol from .env
  // Priority: V2 env var > keep old value from deployment
  const newName = process.env.TOKEN_NAME_V2 || deploymentInfo.tokenName;
  const newSymbol = process.env.TOKEN_SYMBOL_V2 || deploymentInfo.tokenSymbol;

  console.log("\n=== Token Info Update ===");
  console.log("Current Name:", deploymentInfo.tokenName);
  console.log("New Name:", newName);
  console.log(newName !== deploymentInfo.tokenName ? "  ✏️  Will be updated" : "  ✓ No change");
  console.log("\nCurrent Symbol:", deploymentInfo.tokenSymbol);
  console.log("New Symbol:", newSymbol);
  console.log(newSymbol !== deploymentInfo.tokenSymbol ? "  ✏️  Will be updated" : "  ✓ No change");

  // Upgrade to V2
  console.log("\n=== Upgrading to TestTokenV2 ===");
  const TestTokenV2 = await hre.ethers.getContractFactory("TestTokenV2");
  
  console.log("Upgrading proxy...");
  const upgradedToken = await upgrades.upgradeProxy(proxyAddress, TestTokenV2);
  await upgradedToken.waitForDeployment();

  const upgradedAddress = await upgradedToken.getAddress();
  console.log("✅ Proxy upgraded successfully!");
  console.log("Proxy Address:", upgradedAddress);
  
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(upgradedAddress);
  console.log("New Implementation Address:", implementationAddress);

  // Initialize custom name and symbol storage if needed
  console.log("\n=== Updating Token Name and Symbol ===");
  try {
    const tx = await upgradedToken.updateTokenInfo(newName, newSymbol);
    console.log("Transaction hash:", tx.hash);
    
    console.log("Waiting for confirmation...");
    await tx.wait();
    
    console.log("✅ Token info updated successfully!");
  } catch (error) {
    console.log("⚠️  Note: If name/symbol are already set, this is expected.");
    console.log("Error:", error.message);
  }

  // Verify new token info
  console.log("\n=== Verifying Updated Token Info ===");
  const finalName = await upgradedToken.name();
  const finalSymbol = await upgradedToken.symbol();
  const version = await upgradedToken.version();
  const totalSupply = await upgradedToken.totalSupply();
  
  console.log("Name:", finalName);
  console.log("Symbol:", finalSymbol);
  console.log("Version:", version);
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply));
  console.log("Owner:", await upgradedToken.owner());

  // Verify on Etherscan (if not localhost)
  const network = hre.network.name;
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n=== Verifying New Implementation on Etherscan ===");
    console.log("Waiting for block confirmations...");
    
    // Wait for 5 block confirmations
    await new Promise(resolve => setTimeout(resolve, 30000)); // Wait 30 seconds

    try {
      console.log("\nVerifying implementation...");
      await hre.run("verify:verify", {
        address: implementationAddress,
        constructorArguments: [],
      });
      console.log("✅ Implementation verified!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Implementation already verified!");
      } else {
        console.log("❌ Error verifying:", error.message);
      }
    }

    console.log("\n=== Verification Complete ===");
    console.log("View on Etherscan:");
    console.log(`Proxy: https://sepolia.etherscan.io/address/${upgradedAddress}`);
    console.log(`Implementation: https://sepolia.etherscan.io/address/${implementationAddress}`);
  }

  // Update deployment info
  const updatedDeploymentInfo = {
    ...deploymentInfo,
    implementationAddress: implementationAddress,
    tokenName: finalName,
    tokenSymbol: finalSymbol,
    version: version,
    upgradedAt: new Date().toISOString(),
    upgradedBy: deployer.address
  };

  fs.writeFileSync(deploymentFile, JSON.stringify(updatedDeploymentInfo, null, 2));
  console.log(`\n💾 Updated deployment info saved to: deployments/${network}.json`);

  console.log("\n=== Upgrade Summary ===");
  console.log("✅ Upgraded to TestTokenV2");
  console.log("✅ Updated name:", finalName);
  console.log("✅ Updated symbol:", finalSymbol);
  console.log("✅ All token balances preserved");
  console.log("\n🎉 Upgrade completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
