require("dotenv").config();
const hre = require("hardhat");
const { upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("=== Upgrading NFT Contract ===\n");
  console.log("Upgrading with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Load deployment info from JSON
  const deploymentFile = path.join(__dirname, "..", "deployments", `nft-${network}.json`);
  
  if (!fs.existsSync(deploymentFile)) {
    console.error(`\n❌ Error: Deployment file not found for network "${network}"!`);
    console.log(`Expected file: deployments/nft-${network}.json`);
    console.log("\nPlease deploy the NFT contract first:");
    console.log(`  yarn deploy:nft:${network}`);
    process.exit(1);
  }

  const deploymentInfo = JSON.parse(fs.readFileSync(deploymentFile, "utf8"));
  const proxyAddress = deploymentInfo.proxyAddress;
  
  console.log("\n📂 Loaded deployment info from:", `deployments/nft-${network}.json`);
  console.log("Proxy Address:", proxyAddress);
  console.log("Current Version:", deploymentInfo.version || "1.0.0");

  // Get current NFT info
  console.log("\n=== Current NFT Info ===");
  const currentNft = await hre.ethers.getContractAt("TestNft", proxyAddress);
  
  try {
    const currentName = await currentNft.name();
    const currentSymbol = await currentNft.symbol();
    const currentOwner = await currentNft.owner();
    const totalMinted = await currentNft.totalMinted();
    
    console.log("Name:", currentName);
    console.log("Symbol:", currentSymbol);
    console.log("Owner:", currentOwner);
    console.log("Total Minted:", totalMinted.toString());
  } catch (error) {
    console.log("⚠️  Could not fetch current info. Continuing with upgrade...");
  }

  // Get new name and symbol from .env
  const newName = process.env.NFT_NAME_V2 || deploymentInfo.nftName;
  const newSymbol = process.env.NFT_SYMBOL_V2 || deploymentInfo.nftSymbol;
  const newBaseURI = process.env.NFT_BASE_URI_V2;

  console.log("\n=== NFT Info Update ===");
  console.log("Current Name:", deploymentInfo.nftName);
  console.log("New Name:", newName);
  console.log(newName !== deploymentInfo.nftName ? "  ✏️  Will be updated" : "  ✓ No change");
  console.log("\nCurrent Symbol:", deploymentInfo.nftSymbol);
  console.log("New Symbol:", newSymbol);
  console.log(newSymbol !== deploymentInfo.nftSymbol ? "  ✏️  Will be updated" : "  ✓ No change");
  
  if (newBaseURI) {
    console.log("\nCurrent Base URI:", deploymentInfo.baseURI || "(empty)");
    console.log("New Base URI:", newBaseURI);
    console.log("  ✏️  Will be updated");
  }

  // Upgrade to V2
  console.log("\n=== Upgrading to TestNftV2 ===");
  const TestNftV2 = await hre.ethers.getContractFactory("TestNftV2");
  
  console.log("Upgrading proxy...");
  const upgradedNft = await upgrades.upgradeProxy(proxyAddress, TestNftV2);
  await upgradedNft.waitForDeployment();

  const upgradedAddress = await upgradedNft.getAddress();
  console.log("✅ Proxy upgraded successfully!");
  console.log("Proxy Address:", upgradedAddress);
  
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(upgradedAddress);
  console.log("New Implementation Address:", implementationAddress);

  // Check if we need to update name/symbol
  const shouldUpdateInfo = (newName !== deploymentInfo.nftName) || (newSymbol !== deploymentInfo.nftSymbol);
  
  if (shouldUpdateInfo) {
    console.log("\n=== Updating Collection Name and Symbol ===");
    
    // Verify we are the owner
    const currentOwner = await upgradedNft.owner();
    console.log("Contract Owner:", currentOwner);
    console.log("Upgrader Address:", deployer.address);
    
    if (currentOwner.toLowerCase() !== deployer.address.toLowerCase()) {
      console.log("❌ Error: You are not the owner of this contract!");
      console.log("Only the owner can update collection info.");
      process.exit(1);
    }
    
    try {
      console.log(`Updating to: "${newName}" (${newSymbol})`);
      const tx = await upgradedNft.updateCollectionInfo(newName, newSymbol);
      console.log("Transaction hash:", tx.hash);
      
      console.log("Waiting for confirmation...");
      const receipt = await tx.wait();
      console.log(`✅ Confirmed in block ${receipt.blockNumber}`);
      console.log("✅ Collection info updated successfully!");
    } catch (error) {
      console.log("❌ Error updating collection info:");
      console.log("   ", error.message);
      console.log("\nContinuing...");
    }
  } else {
    console.log("\n✓ No name/symbol changes needed");
  }

  // Update base URI if provided
  if (newBaseURI) {
    console.log("\n=== Updating Base URI ===");
    try {
      const tx = await upgradedNft.setBaseURI(newBaseURI);
      console.log("Transaction hash:", tx.hash);
      await tx.wait();
      console.log("✅ Base URI updated to:", newBaseURI);
    } catch (error) {
      console.log("❌ Error updating base URI:", error.message);
    }
  }

  // Verify new NFT info
  console.log("\n=== Verifying Updated NFT Info ===");
  const finalName = await upgradedNft.name();
  const finalSymbol = await upgradedNft.symbol();
  const totalMinted = await upgradedNft.totalMinted();
  const finalBaseURI = await upgradedNft.baseURI();
  
  let version = "2.0.0";
  try {
    version = await upgradedNft.version();
  } catch (error) {
    console.log("⚠️  Note: version() function not available");
  }
  
  console.log("Name:", finalName);
  console.log("Symbol:", finalSymbol);
  console.log("Version:", version);
  console.log("Total Minted:", totalMinted.toString());
  console.log("Base URI:", finalBaseURI || "(empty)");
  console.log("Owner:", await upgradedNft.owner());

  // Verify on Etherscan (if not localhost)
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n=== Verifying New Implementation on Etherscan ===");
    console.log("Waiting for block confirmations...");
    
    await new Promise(resolve => setTimeout(resolve, 30000));

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
    nftName: finalName,
    nftSymbol: finalSymbol,
    baseURI: finalBaseURI,
    version: version,
    upgradedAt: new Date().toISOString(),
    upgradedBy: deployer.address
  };

  fs.writeFileSync(deploymentFile, JSON.stringify(updatedDeploymentInfo, null, 2));
  console.log(`\n💾 Updated deployment info saved to: deployments/nft-${network}.json`);

  console.log("\n=== Upgrade Summary ===");
  console.log("✅ Upgraded to TestNftV2");
  console.log("✅ Collection name:", finalName);
  console.log("✅ Collection symbol:", finalSymbol);
  console.log("✅ All NFTs preserved");
  console.log("\n🎉 Upgrade completed successfully!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
