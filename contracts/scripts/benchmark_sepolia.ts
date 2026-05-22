import { network } from "hardhat";
import { keccak256, toUtf8Bytes, ZeroAddress } from "ethers";
import * as fs from "fs";

const ETH_PRICE_USD = 2000;

async function main() {
  const connection = await network.connect();
  const viem = (connection as any).viem;

  const contract = await viem.deployContract("BookTracker", [
    "http://localhost:3000/api/badges/",
  ]);
  const wallets = await viem.getWalletClients();
  const signer = wallets[1] ?? wallets[0];
  const publicClient = await viem.getPublicClient();

  const results: Record<
    string,
    { gasUsed: number; timeMs: number; costUsd: string }
  > = {};

  async function measure(label: string, fn: () => Promise<`0x${string}`>) {
    const gasPrice = await publicClient.getGasPrice();
    const start = Date.now();
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: await fn(),
    });
    const timeMs = Date.now() - start;
    const gasUsed = Number(receipt.gasUsed);
    const costEth = (gasUsed * Number(gasPrice)) / 1e18;
    const costUsd = (costEth * ETH_PRICE_USD).toFixed(6);
    results[label] = { gasUsed, timeMs, costUsd };
    console.log(
      `${label}: ${gasUsed.toLocaleString()} gas | ${timeMs}ms | ~$${costUsd}`,
    );
  }

  const bookId = keccak256(toUtf8Bytes("bench-book")) as `0x${string}`;
  const bookHash = keccak256(
    toUtf8Bytes("bench-book::Title::Author"),
  ) as `0x${string}`;
  await measure("registerBook", () =>
    contract.write.registerBook([bookId, bookHash]),
  );

  const eventHash1 = keccak256(toUtf8Bytes("event-nosig")) as `0x${string}`;
  await measure("logEvent_no_sig", () =>
    contract.write.logEvent([bookId, eventHash1, ZeroAddress, "0x"]),
  );

  const eventHash2 = keccak256(toUtf8Bytes("event-sig")) as `0x${string}`;
  const nonce = await contract.read.nonces([signer.account.address]);
  const signature = await signer.signTypedData({
    domain: {
      name: "BookTracker",
      version: "1",
      chainId: 11155111,
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
      bookId,
      eventHash: eventHash2,
      signer: signer.account.address,
      nonce,
    },
  });
  await measure("logEvent_eip712", () =>
    contract.write.logEvent([
      bookId,
      eventHash2,
      signer.account.address,
      signature,
    ]),
  );

  await measure("mintBadge", () =>
    contract.write.mintBadge([signer.account.address, 1n]),
  );

  fs.writeFileSync(
    "gas-results-sepolia.json",
    JSON.stringify(results, null, 2),
  );
  console.log("\nSaved to gas-results-sepolia.json");
}

main().catch(console.error);
