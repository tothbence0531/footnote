import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { network } from "hardhat";
import { keccak256, toUtf8Bytes, ZeroAddress } from "ethers";
import { anyValue } from "@nomicfoundation/hardhat-viem-assertions/predicates";

describe("BookTracker Contract", async function () {
  const connection = await network.connect();
  const viem = (connection as any).viem;

  const BASE_URI = "http://localhost:3000/api/uploads/badges/";

  async function deploy() {
    const contract = await viem.deployContract("BookTracker", [BASE_URI]);
    const [owner, user] = await viem.getWalletClients();
    return { contract, owner, user };
  }

  function createBook(id: string, content: string) {
    const bookId = keccak256(toUtf8Bytes(id)) as `0x${string}`;
    const bookHash = keccak256(toUtf8Bytes(content)) as `0x${string}`;
    return { bookId, bookHash };
  }

  // -------------------------
  // BOOK REGISTRATION
  // -------------------------

  it("should register a book successfully", async function () {
    const { contract } = await deploy();
    const { bookId, bookHash } = createBook("book-1", "Egri csillagok");

    await contract.write.registerBook([bookId, bookHash]);

    const isRegistered = await contract.read.isBookRegistered([bookId]);
    assert.equal(isRegistered, true);

    const storedHash = await contract.read.bookHashes([bookId]);
    assert.equal(storedHash, bookHash);
  });

  it("should emit BookRegistered event", async function () {
    const { contract } = await deploy();
    const { bookId, bookHash } = createBook("book-2", "Pál utcai fiúk");

    await viem.assertions.emitWithArgs(
      contract.write.registerBook([bookId, bookHash]),
      contract,
      "BookRegistered",
      [bookId, bookHash, anyValue],
    );
  });

  it("should not allow duplicate book registration", async function () {
    const { contract } = await deploy();
    const { bookId, bookHash } = createBook("book-3", "Duplicate test");

    await contract.write.registerBook([bookId, bookHash]);

    await assert.rejects(
      contract.write.registerBook([bookId, bookHash]),
      /Already registered/,
    );
  });

  it("should restrict book registration to owner", async function () {
    const { contract, user } = await deploy();
    const { bookId, bookHash } = createBook("book-4", "Unauthorized");

    await assert.rejects(
      contract.write.registerBook([bookId, bookHash], {
        account: user.account,
      }),
    );
  });

  // -------------------------
  // EVENT LOGGING
  // -------------------------

  it("should log an event without signature if signer is zero address", async function () {
    const { contract } = await deploy();
    const { bookId, bookHash } = createBook("book-5", "No signature");

    await contract.write.registerBook([bookId, bookHash]);

    const eventHash = keccak256(toUtf8Bytes("event-1")) as `0x${string}`;

    await contract.write.logEvent([bookId, eventHash, ZeroAddress, "0x"]);

    const isLogged = await contract.read.isEventLogged([eventHash]);
    assert.equal(isLogged, true);
  });

  it("should not log event for unregistered book", async function () {
    const { contract } = await deploy();

    const bookId = keccak256(toUtf8Bytes("nonexistent")) as `0x${string}`;
    const eventHash = keccak256(toUtf8Bytes("event-2")) as `0x${string}`;

    await assert.rejects(
      contract.write.logEvent([bookId, eventHash, ZeroAddress, "0x"]),
      /Book not registered/,
    );
  });

  it("should not allow duplicate event logging", async function () {
    const { contract } = await deploy();
    const { bookId, bookHash } = createBook("book-6", "Duplicate event");

    await contract.write.registerBook([bookId, bookHash]);

    const eventHash = keccak256(toUtf8Bytes("event-3")) as `0x${string}`;

    await contract.write.logEvent([bookId, eventHash, ZeroAddress, "0x"]);

    await assert.rejects(
      contract.write.logEvent([bookId, eventHash, ZeroAddress, "0x"]),
      /Event already logged/,
    );
  });

  // -------------------------
  // BADGE MINTING
  // -------------------------

  it("should mint a badge successfully", async function () {
    const { contract, user } = await deploy();

    const badgeId = 1n;

    await contract.write.mintBadge([user.account.address, badgeId]);

    const hasBadge = await contract.read.hasBadge([
      user.account.address,
      badgeId,
    ]);

    assert.equal(hasBadge, true);
  });

  it("should not mint duplicate badge", async function () {
    const { contract, user } = await deploy();

    const badgeId = 2n;

    await contract.write.mintBadge([user.account.address, badgeId]);

    await assert.rejects(
      contract.write.mintBadge([user.account.address, badgeId]),
      /Badge already owned/,
    );
  });

  it("should restrict badge minting to owner", async function () {
    const { contract, user } = await deploy();

    await assert.rejects(
      contract.write.mintBadge([user.account.address, 3n], {
        account: user.account,
      }),
    );
  });

  // -------------------------
  // URI HANDLING
  // -------------------------

  it("should return correct token URI", async function () {
    const { contract } = await deploy();

    const uri = await contract.read.uri([1n]);
    assert.equal(uri, `${BASE_URI}1.json`);
  });

  // -------------------------
  // SIGNATURE TESTS (EIP712)
  // -------------------------

  it("should log event with valid EIP712 signature", async function () {
    const { contract, user } = await deploy();

    const { bookId, bookHash } = createBook("book-sig-1", "Signed book");
    await contract.write.registerBook([bookId, bookHash]);

    const eventHash = keccak256(toUtf8Bytes("event-signed-1")) as `0x${string}`;
    const nonce = 0n;

    const domain = {
      name: "BookTracker",
      version: "1",
      chainId: 31337,
      verifyingContract: contract.address,
    };

    const types = {
      BookEvent: [
        { name: "bookId", type: "bytes32" },
        { name: "eventHash", type: "bytes32" },
        { name: "signer", type: "address" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const value = {
      bookId,
      eventHash,
      signer: user.account.address,
      nonce,
    };

    const signature = await user.signTypedData({
      domain,
      types,
      primaryType: "BookEvent",
      message: value,
    });

    await contract.write.logEvent([
      bookId,
      eventHash,
      user.account.address,
      signature,
    ]);

    const isLogged = await contract.read.isEventLogged([eventHash]);
    assert.equal(isLogged, true);
  });

  it("should reject invalid signature", async function () {
    const { contract, user, owner } = await deploy();

    const { bookId, bookHash } = createBook("book-sig-2", "Invalid sig");
    await contract.write.registerBook([bookId, bookHash]);

    const eventHash = keccak256(toUtf8Bytes("event-signed-2")) as `0x${string}`;

    const fakeSignature = "0x" + "11".repeat(65);

    await assert.rejects(
      contract.write.logEvent([
        bookId,
        eventHash,
        user.account.address,
        fakeSignature,
      ]),
      /ECDSAInvalidSignature/,
    );
  });

  it("should increment nonce after successful signed event", async function () {
    const { contract, user } = await deploy();

    const { bookId, bookHash } = createBook("book-sig-3", "Nonce test");
    await contract.write.registerBook([bookId, bookHash]);

    const eventHash = keccak256(toUtf8Bytes("event-signed-3")) as `0x${string}`;

    const nonceBefore = await contract.read.nonces([user.account.address]);

    const domain = {
      name: "BookTracker",
      version: "1",
      chainId: 31337,
      verifyingContract: contract.address,
    };

    const types = {
      BookEvent: [
        { name: "bookId", type: "bytes32" },
        { name: "eventHash", type: "bytes32" },
        { name: "signer", type: "address" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const value = {
      bookId,
      eventHash,
      signer: user.account.address,
      nonce: nonceBefore,
    };

    const signature = await user.signTypedData({
      domain,
      types,
      primaryType: "BookEvent",
      message: value,
    });

    await contract.write.logEvent([
      bookId,
      eventHash,
      user.account.address,
      signature,
    ]);

    const nonceAfter = await contract.read.nonces([user.account.address]);

    assert.equal(nonceAfter, nonceBefore + 1n);
  });

  it("should prevent replay attack with same signature", async function () {
    const { contract, user } = await deploy();

    const { bookId, bookHash } = createBook("book-sig-4", "Replay test");
    await contract.write.registerBook([bookId, bookHash]);

    const eventHash = keccak256(toUtf8Bytes("event-signed-4")) as `0x${string}`;

    const domain = {
      name: "BookTracker",
      version: "1",
      chainId: 31337,
      verifyingContract: contract.address,
    };

    const types = {
      BookEvent: [
        { name: "bookId", type: "bytes32" },
        { name: "eventHash", type: "bytes32" },
        { name: "signer", type: "address" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const value = {
      bookId,
      eventHash,
      signer: user.account.address,
      nonce: 0n,
    };

    const signature = await user.signTypedData({
      domain,
      types,
      primaryType: "BookEvent",
      message: value,
    });

    // INFO: first call OK
    await contract.write.logEvent([
      bookId,
      eventHash,
      user.account.address,
      signature,
    ]);

    // INFO: second call with SAME signature should fail
    await assert.rejects(
      contract.write.logEvent([
        bookId,
        eventHash,
        user.account.address,
        signature,
      ]),
    );
  });
});
