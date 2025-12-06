const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("🚀 Deploying TruthMint contracts to Flare...");

  const TruthHub = await hre.ethers.getContractFactory("TruthHub");
  const truthHub = await TruthHub.deploy();
  await truthHub.waitForDeployment();
  const truthHubAddress = await truthHub.getAddress();
  console.log("✅ TruthHub deployed to:", truthHubAddress);

  const KnowledgeNFT = await hre.ethers.getContractFactory("KnowledgeNFT");
  const knowledgeNFT = await KnowledgeNFT.deploy(truthHubAddress);
  await knowledgeNFT.waitForDeployment();
  const knowledgeNFTAddress = await knowledgeNFT.getAddress();
  console.log("✅ KnowledgeNFT deployed to:", knowledgeNFTAddress);

  const data = {
    truthHub: truthHubAddress,
    knowledgeNFT: knowledgeNFTAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString()
  };

  fs.writeFileSync("deployed-addresses.json", JSON.stringify(data, null, 2));

  console.log("\n📝 Contract addresses saved to deployed-addresses.json");
  console.log("🎉 Deployment complete!");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

