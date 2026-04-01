import { network } from "hardhat";

async function main() {
  const connection = await network.connect();
  const viem = (connection as any).viem;

  console.log("Deploying BookTracker...");

  const contract = await viem.deployContract("BookTracker", [
    "http://localhost:3000/api/badges/",
  ]);

  console.log("BookTracker deployed to:", contract.address);
}

main().catch(console.error);
