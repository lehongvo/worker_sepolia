require("dotenv").config();
const hre = require("hardhat");
const { upgrades } = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying TestToken Proxy with account:", deployer.address);
  console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

  // Get token config from environment variables
  const tokenName = process.env.TOKEN_NAME || "testToken";
  const tokenSymbol = process.env.TOKEN_SYMBOL || "MTK";
  const recipient = deployer.address; // Mint initial supply to deployer
  const initialOwner = deployer.address; // Set deployer as owner

  console.log("\n=== Token Configuration ===");
  console.log("Name:", tokenName);
  console.log("Symbol:", tokenSymbol);

  // Deploy TestToken as upgradeable proxy
  const TestToken = await hre.ethers.getContractFactory("TestToken");
  console.log("\nDeploying proxy...");
  
  const testToken = await upgrades.deployProxy(
    TestToken,
    [tokenName, tokenSymbol, recipient, initialOwner],
    { initializer: 'initialize' }
  );

  await testToken.waitForDeployment();

  const proxyAddress = await testToken.getAddress();
  const implementationAddress = await upgrades.erc1967.getImplementationAddress(proxyAddress);
  const adminAddress = await upgrades.erc1967.getAdminAddress(proxyAddress);

  console.log("\n=== Deployment Successful ===");
  console.log("Proxy Address:", proxyAddress);
  console.log("Implementation Address:", implementationAddress);
  console.log("Admin Address:", adminAddress);
  console.log("Initial supply minted to:", recipient);
  console.log("Owner:", initialOwner);

  // Get token details
  const name = await testToken.name();
  const symbol = await testToken.symbol();
  const totalSupply = await testToken.totalSupply();
  const balance = await testToken.balanceOf(recipient);

  console.log("\n=== Token Details ===");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply), symbol);
  console.log("Deployer Balance:", hre.ethers.formatEther(balance), symbol);

  // Verify contracts on Etherscan (only if not on localhost/hardhat network)
  const network = hre.network.name;
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n=== Verifying Contracts on Etherscan ===");
    console.log("Waiting for block confirmations...");
    
    // Wait for 5 block confirmations
    await testToken.deploymentTransaction().wait(5);

    try {
      console.log("\nVerifying Implementation...");
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

    try {
      console.log("\nVerifying Proxy...");
      await hre.run("verify:verify", {
        address: proxyAddress,
        constructorArguments: [],
      });
      console.log("✅ Proxy verified!");
    } catch (error) {
      if (error.message.includes("Already Verified")) {
        console.log("✅ Proxy already verified!");
      } else {
        console.log("❌ Error verifying proxy:", error.message);
        console.log("Note: Proxy contracts are often auto-verified by Etherscan");
      }
    }

    console.log("\n=== Verification Complete ===");
    console.log("View on Etherscan:");
    console.log(`Proxy: https://sepolia.etherscan.io/address/${proxyAddress}`);
    console.log(`Implementation: https://sepolia.etherscan.io/address/${implementationAddress}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
