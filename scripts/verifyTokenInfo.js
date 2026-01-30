require("dotenv").config();
const hre = require("hardhat");

async function main() {
  const proxyAddress = "0x2A1430BE8b1D1e6510BC67eBaEf758a2c0fc7E7a";
  
  console.log("=== Verifying On-Chain Token Info ===\n");
  console.log("Proxy Address:", proxyAddress);
  
  // Connect to V2 contract
  const TokenV2 = await hre.ethers.getContractFactory("TestTokenV2");
  const token = TokenV2.attach(proxyAddress);
  
  // Read from blockchain (not Etherscan cache)
  const name = await token.name();
  const symbol = await token.symbol();
  const version = await token.version();
  const totalSupply = await token.totalSupply();
  const owner = await token.owner();
  
  console.log("\n📊 On-Chain Data (Direct from Blockchain):");
  console.log("Name:", name);
  console.log("Symbol:", symbol);
  console.log("Version:", version);
  console.log("Total Supply:", hre.ethers.formatEther(totalSupply));
  console.log("Owner:", owner);
  
  console.log("\n✅ This is the REAL data stored on blockchain!");
  console.log("⚠️  Etherscan UI shows cached metadata from initial deployment.");
  console.log("\n📝 To update Etherscan display, follow the guide below.");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
