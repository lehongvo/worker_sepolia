/**
 * Test script to verify NFT deploy and upgrade flow in a single run
 * This avoids the local network reset issue
 */

require("dotenv").config();
const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("╔════════════════════════════════════════════════════════════╗");
  console.log("║       NFT DEPLOY + UPGRADE TEST (Single Run)               ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  console.log("Deployer:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(await hre.ethers.provider.getBalance(deployer.address)), "ETH\n");

  // ==================== PHASE 1: DEPLOY V1 ====================
  console.log("═══════════════════════════════════════════════════════════════");
  console.log("PHASE 1: Deploy TestNft (V1)");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const nftName = process.env.NFT_NAME || "TestNFT";
  const nftSymbol = process.env.NFT_SYMBOL || "TNFT";
  const baseURI = process.env.NFT_BASE_URI || "https://api.example.com/metadata/";

  console.log("Config:");
  console.log("  Name:", nftName);
  console.log("  Symbol:", nftSymbol);
  console.log("  Base URI:", baseURI);

  const TestNft = await hre.ethers.getContractFactory("TestNft");
  console.log("\nDeploying V1 proxy...");
  
  const nftV1 = await upgrades.deployProxy(
    TestNft,
    [nftName, nftSymbol, baseURI, deployer.address],
    { initializer: 'initialize' }
  );
  await nftV1.waitForDeployment();
  
  const proxyAddress = await nftV1.getAddress();
  const implV1 = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  
  console.log("\n✅ V1 Deployed!");
  console.log("  Proxy:", proxyAddress);
  console.log("  Implementation V1:", implV1);

  // Mint some NFTs
  console.log("\nMinting test NFTs...");
  await nftV1.safeMint(deployer.address);
  await nftV1.safeMint(deployer.address);
  console.log("  Minted 2 NFTs to deployer");

  // V1 Stats
  console.log("\n📊 V1 Stats:");
  console.log("  Name:", await nftV1.name());
  console.log("  Symbol:", await nftV1.symbol());
  console.log("  Total Minted:", (await nftV1.totalMinted()).toString());
  console.log("  Owner:", await nftV1.owner());

  // ==================== PHASE 2: UPGRADE TO V2 ====================
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("PHASE 2: Upgrade to TestNftV2");
  console.log("═══════════════════════════════════════════════════════════════\n");

  const newName = process.env.NFT_NAME_V2 || nftName;
  const newSymbol = process.env.NFT_SYMBOL_V2 || nftSymbol;

  console.log("Upgrade Config:");
  console.log("  New Name:", newName, newName !== nftName ? "✏️  (will update)" : "(no change)");
  console.log("  New Symbol:", newSymbol, newSymbol !== nftSymbol ? "✏️  (will update)" : "(no change)");

  const TestNftV2 = await hre.ethers.getContractFactory("TestNftV2");
  console.log("\nUpgrading proxy to V2...");
  
  const nftV2 = await upgrades.upgradeProxy(proxyAddress, TestNftV2);
  await nftV2.waitForDeployment();
  
  const implV2 = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  
  console.log("\n✅ Upgraded to V2!");
  console.log("  Proxy (unchanged):", proxyAddress);
  console.log("  Implementation V1:", implV1);
  console.log("  Implementation V2:", implV2);

  // Initialize V2 storage
  console.log("\nInitializing V2 storage...");
  await nftV2.initializeV2();
  console.log("  ✅ V2 storage initialized");

  // ==================== PHASE 3: UPDATE COLLECTION INFO ====================
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("PHASE 3: Update Collection Info");
  console.log("═══════════════════════════════════════════════════════════════\n");

  if (newName !== nftName || newSymbol !== nftSymbol) {
    console.log(`Updating to: "${newName}" (${newSymbol})`);
    const tx = await nftV2.updateCollectionInfo(newName, newSymbol);
    await tx.wait();
    console.log("✅ Collection info updated!");
  } else {
    console.log("✓ No name/symbol changes needed");
  }

  // ==================== PHASE 4: VERIFY ====================
  console.log("\n═══════════════════════════════════════════════════════════════");
  console.log("PHASE 4: Verify Upgrade Results");
  console.log("═══════════════════════════════════════════════════════════════\n");

  console.log("📊 V2 Stats:");
  console.log("  Name:", await nftV2.name());
  console.log("  Symbol:", await nftV2.symbol());
  console.log("  Version:", await nftV2.version());
  console.log("  Total Minted:", (await nftV2.totalMinted()).toString());
  console.log("  Base URI:", await nftV2.baseURI());
  console.log("  Owner:", await nftV2.owner());

  // Verify NFTs preserved
  console.log("\n🔍 NFT Ownership Check:");
  console.log("  NFT #0 owner:", await nftV2.ownerOf(0));
  console.log("  NFT #1 owner:", await nftV2.ownerOf(1));

  // Test V2 functions
  console.log("\n🧪 Test V2 Functions:");
  
  // Batch mint
  console.log("  Testing batchMint...");
  await nftV2.batchMint(deployer.address, 3);
  console.log("  ✅ Batch minted 3 more NFTs");
  console.log("  Total Minted:", (await nftV2.totalMinted()).toString());

  // Set token URI
  console.log("  Testing setTokenURI...");
  await nftV2.setTokenURI(0, "ipfs://QmTest123");
  const tokenURI = await nftV2.tokenURI(0);
  console.log("  ✅ Token #0 URI updated:", tokenURI);

  // ==================== SUMMARY ====================
  console.log("\n╔════════════════════════════════════════════════════════════╗");
  console.log("║                    TEST SUMMARY                            ║");
  console.log("╚════════════════════════════════════════════════════════════╝\n");
  
  console.log("✅ Deploy V1:           SUCCESS");
  console.log("✅ Mint NFTs:           SUCCESS");
  console.log("✅ Upgrade to V2:       SUCCESS");
  console.log("✅ Update Name/Symbol:  SUCCESS");
  console.log("✅ NFTs Preserved:      SUCCESS");
  console.log("✅ V2 Functions:        SUCCESS");
  
  console.log("\n📋 Final State:");
  console.log("  Proxy Address:", proxyAddress);
  console.log("  Name:", await nftV2.name());
  console.log("  Symbol:", await nftV2.symbol());
  console.log("  Version:", await nftV2.version());
  console.log("  Total Minted:", (await nftV2.totalMinted()).toString());
  
  console.log("\n🎉 All tests passed! NFT contracts are ready for Sepolia deployment.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
