require("dotenv").config();
const hre = require("hardhat");
const { upgrades } = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;

  console.log("=== Deploying TestNft Proxy ===\n");
  console.log("Deploying with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Get NFT config from environment variables
  const nftName = process.env.NFT_NAME || "TestNFT";
  const nftSymbol = process.env.NFT_SYMBOL || "TNFT";
  const baseURI = process.env.NFT_BASE_URI || "";
  const initialOwner = deployer.address;

  console.log("\n=== NFT Configuration ===");
  console.log("Name:", nftName);
  console.log("Symbol:", nftSymbol);
  console.log("Base URI:", baseURI || "(empty)");
  console.log("Owner:", initialOwner);

  // Deploy TestNft as upgradeable proxy
  const TestNft = await hre.ethers.getContractFactory("TestNft");
  console.log("\nDeploying proxy...");
  
  const testNft = await upgrades.deployProxy(
    TestNft,
    [nftName, nftSymbol, baseURI, initialOwner],
    { initializer: 'initialize' }
  );

  await testNft.waitForDeployment();
  const proxyAddress = await testNft.getAddress();
  
  console.log("\n=== Deployment Successful ===");
  console.log("Proxy Address:", proxyAddress);
  
  // Get implementation and admin addresses
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);
  
  console.log("Implementation Address:", implementationAddress);
  console.log("Admin Address:", adminAddress);

  // Verify deployment
  console.log("\n=== Verifying Deployment ===");
  const name = await testNft.name();
  const symbol = await testNft.symbol();
  const totalMinted = await testNft.totalMinted();
  const owner = await testNft.owner();
  
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Minted:", totalMinted.toString());
  console.log("Owner:", owner);

  // Save deployment info
  const deploymentsDir = path.join(__dirname, "..", "deployments");
  if (!fs.existsSync(deploymentsDir)) {
    fs.mkdirSync(deploymentsDir, { recursive: true });
  }

  const deploymentInfo = {
    network: network,
    contractType: "NFT",
    proxyAddress: proxyAddress,
    implementationAddress: implementationAddress,
    adminAddress: adminAddress,
    deployer: deployer.address,
    nftName: name,
    nftSymbol: symbol,
    baseURI: baseURI,
    deployedAt: new Date().toISOString(),
    version: "1.0.0"
  };

  const deploymentFile = path.join(deploymentsDir, `nft-${network}.json`);
  fs.writeFileSync(deploymentFile, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\n💾 Deployment info saved to: deployments/nft-${network}.json`);

  // Verify on Etherscan (if not localhost)
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n=== Verifying on Etherscan ===");
    console.log("Waiting for block confirmations...");
    
    // Wait for 5 block confirmations
    const deployTx = testNft.deploymentTransaction();
    if (deployTx) {
      await deployTx.wait(5);
    }

    try {
      // Verify implementation
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
        console.log("❌ Error verifying implementation:", error.message);
      }
    }

    console.log("\n=== Verification Complete ===");
    console.log("View on Etherscan:");
    console.log(`Proxy: https://sepolia.etherscan.io/address/${proxyAddress}`);
    console.log(`Implementation: https://sepolia.etherscan.io/address/${implementationAddress}`);
  }

  // Mint first NFT as test
  console.log("\n=== Minting Test NFT ===");
  const mintTx = await testNft.safeMint(deployer.address);
  await mintTx.wait();
  console.log("✅ Minted NFT #0 to:", deployer.address);
  console.log("Total Minted:", (await testNft.totalMinted()).toString());

  console.log("\n=== Deployment Summary ===");
  console.log("✅ TestNft proxy deployed successfully!");
  console.log("✅ Proxy Address:", proxyAddress);
  console.log("✅ Implementation Address:", implementationAddress);
  console.log("✅ Test NFT minted");
  console.log("\n🎉 Deployment completed!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
