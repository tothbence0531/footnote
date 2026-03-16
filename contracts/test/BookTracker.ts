import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toUtf8Bytes } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-viem-assertions/predicates";

describe("BookTracker", async function () {
  const connection = await network.connect();
  const viem = (connection as any).viem;

  const BADGE_URI = "https://api.example.com/badges/{id}.json";

  async function deploy() {
    const contract = await viem.deployContract("BookTracker", [BADGE_URI]);
    return { contract };
  }

  it("sikeresen regisztrál egy könyvet", async function () {
    const { contract } = await deploy();

    const bookId = keccak256(toUtf8Bytes("test-uuid-123")) as `0x${string}`;
    const bookHash = keccak256(
      toUtf8Bytes("test-uuid-123::Egri csillagok::Gárdonyi Géza"),
    ) as `0x${string}`;

    await contract.write.registerBook([bookId, bookHash]);

    const isRegistered = await contract.read.isBookRegistered([bookId]);
    assert.equal(isRegistered, true);

    const storedHash = await contract.read.bookHashes([bookId]);
    assert.equal(storedHash, bookHash);
  });

  it("BookRegistered eseményt emittál", async function () {
    const { contract } = await deploy();

    const bookId = keccak256(toUtf8Bytes("test-uuid-456")) as `0x${string}`;
    const bookHash = keccak256(
      toUtf8Bytes("test-uuid-456::A Pál utcai fiúk::Molnár Ferenc"),
    ) as `0x${string}`;

    await viem.assertions.emitWithArgs(
      contract.write.registerBook([bookId, bookHash]),
      contract,
      "BookRegistered",
      [bookId, bookHash, anyValue],
    );
  });

  it("nem lehet ugyanazt a könyvet kétszer regisztrálni", async function () {
    const { contract } = await deploy();

    const bookId = keccak256(toUtf8Bytes("test-uuid-789")) as `0x${string}`;
    const bookHash = keccak256(
      toUtf8Bytes("test-uuid-789::Légy jó mindhalálig::Móricz Zsigmond"),
    ) as `0x${string}`;

    await contract.write.registerBook([bookId, bookHash]);

    await assert.rejects(
      contract.write.registerBook([bookId, bookHash]),
      /Already registered/,
    );
  });

  it("csak az owner tud könyvet regisztrálni", async function () {
    const { contract } = await deploy();
    const [, otherUser] = await viem.getWalletClients();

    const bookId = keccak256(toUtf8Bytes("test-uuid-999")) as `0x${string}`;
    const bookHash = keccak256(
      toUtf8Bytes("test-uuid-999::Valami könyv::Valaki"),
    ) as `0x${string}`;

    await assert.rejects(
      contract.write.registerBook([bookId, bookHash], {
        account: otherUser.account,
      }),
    );
  });
});
