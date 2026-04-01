import { network } from "hardhat";
import { keccak256, toUtf8Bytes, ZeroAddress } from "ethers";
import * as fs from "fs";

async function main() {
  const connection = await network.connect();
  const viem = (connection as any).viem;

  const contract = await viem.deployContract("BookTracker", [
    "http://localhost:3000/api/badges/",
  ]);
  const [owner, user] = await viem.getWalletClients();
  const publicClient = await viem.getPublicClient();

  const results: Record<string, number> = {};

  async function getGas(txHash: `0x${string}`): Promise<number> {
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    return Number(receipt.gasUsed);
  }

  // registerBook
  const bookId = keccak256(toUtf8Bytes("bench-book")) as `0x${string}`;
  const bookHash = keccak256(
    toUtf8Bytes("bench-book::Title::Author"),
  ) as `0x${string}`;
  results["registerBook"] = await getGas(
    await contract.write.registerBook([bookId, bookHash]),
  );

  // logEvent no signature
  const eventHash1 = keccak256(toUtf8Bytes("event-nosig")) as `0x${string}`;
  results["logEvent_no_sig"] = await getGas(
    await contract.write.logEvent([bookId, eventHash1, ZeroAddress, "0x"]),
  );

  // logEvent EIP-712
  const eventHash2 = keccak256(toUtf8Bytes("event-sig")) as `0x${string}`;
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
      bookId,
      eventHash: eventHash2,
      signer: user.account.address,
      nonce,
    },
  });
  results["logEvent_eip712"] = await getGas(
    await contract.write.logEvent([
      bookId,
      eventHash2,
      user.account.address,
      signature,
    ]),
  );

  // mintBadge
  results["mintBadge"] = await getGas(
    await contract.write.mintBadge([user.account.address, 1n]),
  );

  console.log("Gas results:", results);
  fs.writeFileSync("gas-results.json", JSON.stringify(results, null, 2));
}

main().catch(console.error);
