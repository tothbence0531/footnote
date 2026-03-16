// services/blockchain.service.js
import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const abi = JSON.parse(
  readFileSync(join(__dirname, "../blockchain/BookTracker.json"), "utf8"),
).abi;

const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const wallet = new ethers.Wallet(process.env.SERVER_PRIVATE_KEY, provider);
const contract = new ethers.Contract(process.env.CONTRACT_ADDRESS, abi, wallet);

export async function registerBookOnChain(bookUuid, title, author) {
  const bookId = ethers.keccak256(ethers.toUtf8Bytes(bookUuid));
  const bookHash = ethers.keccak256(
    ethers.toUtf8Bytes(`${bookUuid}::${title}::${author}`),
  );
  const nonce = await provider.getTransactionCount(wallet.address, "pending");
  const tx = await contract.registerBook(bookId, bookHash, { nonce });
  await tx.wait();
  return tx.hash;
}

export async function logEventOnChain(bookUuid, eventHash, signerAddress) {
  const signer = signerAddress ?? ethers.ZeroAddress;
  const bookId = ethers.keccak256(ethers.toUtf8Bytes(bookUuid));
  const eventHashBytes = `0x${eventHash}`;
  const emptySig = "0x" + "00".repeat(65);
  const nonce = await provider.getTransactionCount(wallet.address, "pending");
  const tx = await contract.logEvent(bookId, eventHashBytes, signer, emptySig, {
    nonce,
  });
  await tx.wait();
  return tx.hash;
}

export async function mintBadgeOnChain(walletAddress, badgeId) {
  const nonce = await provider.getTransactionCount(wallet.address, "pending");
  const tx = await contract.mintBadge(walletAddress, badgeId, { nonce });
  await tx.wait();
  return tx.hash;
}

export async function getUserNonce(walletAddress) {
  return await contract.nonces(walletAddress);
}
