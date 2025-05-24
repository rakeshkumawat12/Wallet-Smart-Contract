const hre = require("hardhat");

async function main() {
  const Wallet = await hre.ethers.getContractFactory("Wallet");
  const wallet = await Wallet.deploy();

  await wallet.waitForDeployment();

  const address = await wallet.getAddress(); 
  console.log("WalletContract deployed to:", address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});