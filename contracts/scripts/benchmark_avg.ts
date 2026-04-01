import { network } from "hardhat";
import { keccak256, toUtf8Bytes, ZeroAddress } from "ethers";
import * as fs from "fs";

async function main() {
  const connection = await network.connect();
  const viem = (connection as any).viem;

  const contract = await viem.deployContract("BookTracker", [
    "http://localhost:3000/api/badges/",
  ]);
  const [, user] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const RUNS = 10;
  let counter = 0;

  async function getGas(txHash: `0x${string}`): Promise<number> {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    return Number(receipt.gasUsed);
  }

  async function measureGas(
    label: string,
    fn: () => Promise<`0x${string}`>,
  ): Promise<number> {
    console.log(`\nMeasuring: ${label}`);
    const gasList: number[] = [];
    for (let i = 0; i < RUNS; i++) {
      const gas = await getGas(await fn());
      gasList.push(gas);
      console.log(`  run ${i + 1}: ${gas.toLocaleString()} gas`);
    }
    const avg = Math.round(gasList.reduce((a, b) => a + b, 0) / gasList.length);
    console.log(`  → avg: ${avg.toLocaleString()} gas`);
    return avg;
  }

  const results: Record<string, number> = {};

  // registerBook
  results["registerBook"] = await measureGas("registerBook", async () => {
    const id = `bench-book-${counter++}`;
    const bookId = keccak256(toUtf8Bytes(id)) as `0x${string}`;
    const bookHash = keccak256(
      toUtf8Bytes(`${id}::Title::Author`),
    ) as `0x${string}`;
    return contract.write.registerBook([bookId, bookHash]);
  });

  // logEvent
  const sharedBookId = keccak256(toUtf8Bytes("shared-book")) as `0x${string}`;
  const sharedBookHash = keccak256(
    toUtf8Bytes("shared-book::Title::Author"),
  ) as `0x${string}`;
  await contract.write.registerBook([sharedBookId, sharedBookHash]);

  results["logEvent_no_sig"] = await measureGas(
    "logEvent (no signature)",
    async () => {
      const eventHash = keccak256(
        toUtf8Bytes(`event-nosig-${counter++}`),
      ) as `0x${string}`;
      return contract.write.logEvent([
        sharedBookId,
        eventHash,
        ZeroAddress,
        "0x",
      ]);
    },
  );

  // logEvent EIP-712
  results["logEvent_eip712"] = await measureGas(
    "logEvent (EIP-712)",
    async () => {
      const eventHash = keccak256(
        toUtf8Bytes(`event-sig-${counter++}`),
      ) as `0x${string}`;
      const nonce = await contract.read.nonces([user.account.address]);
      const signature = await user.signTypedData({
        domain: {
          name: "BookTracker",
          version: "1",
          chainId: 31337,
          verifyingContract: contract.address,
        },
        types: {
          BookEvent: [
            { name: "bookId", type: "bytes32" },
            { name: "eventHash", type: "bytes32" },
            { name: "signer", type: "address" },
            { name: "nonce", type: "uint256" },
          ],
        },
        primaryType: "BookEvent",
        message: {
          bookId: sharedBookId,
          eventHash,
          signer: user.account.address,
          nonce,
        },
      });
      return contract.write.logEvent([
        sharedBookId,
        eventHash,
        user.account.address,
        signature,
      ]);
    },
  );

  // mintBadge
  results["mintBadge"] = await measureGas("mintBadge", async () => {
    const badgeId = BigInt(counter++);
    return contract.write.mintBadge([user.account.address, badgeId]);
  });

  fs.writeFileSync("gas-results.json", JSON.stringify(results, null, 2));
  console.log("\nResults saved to gas-results.json");
  console.log(results);
}

main().catch(console.error);
