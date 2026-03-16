// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BookTracker is ERC1155, EIP712, Ownable {
    using ECDSA for bytes32;

    bytes32 public constant EVENT_TYPEHASH = keccak256(
        "BookEvent(bytes32 bookId,bytes32 eventHash,address signer,uint256 nonce)"
    );

    mapping(address => uint256) public nonces;
    mapping(bytes32 => bool) public loggedEvents;
    mapping(bytes32 => bool) public registeredBooks;
    mapping(bytes32 => bytes32) public bookHashes;

    event BookRegistered(bytes32 indexed bookId, bytes32 bookHash, uint256 timestamp);
    event EventLogged(bytes32 indexed bookId, bytes32 indexed eventHash, address indexed signer, uint256 timestamp);
    event BadgeMinted(address indexed user, uint256 indexed badgeId, uint256 timestamp);

    constructor(string memory uri)
        ERC1155(uri)
        EIP712("BookTracker", "1")
        Ownable(msg.sender)
    {}

    function registerBook(bytes32 bookId, bytes32 bookHash) external onlyOwner {
        require(!registeredBooks[bookId], "Already registered");
        registeredBooks[bookId] = true;
        bookHashes[bookId] = bookHash;
        emit BookRegistered(bookId, bookHash, block.timestamp);
    }

function logEvent(
    bytes32 bookId,
    bytes32 eventHash,
    address signer,
    bytes calldata signature
) external onlyOwner {
    require(registeredBooks[bookId], "Book not registered");
    require(!loggedEvents[eventHash], "Event already logged");

    // TODO: EIP-712 will be added later
    // bytes32 digest = _hashTypedDataV4(...);
    // address recovered = ECDSA.recover(digest, signature);
    // require(recovered == signer, "Invalid signature");

    nonces[signer]++;
    loggedEvents[eventHash] = true;
    emit EventLogged(bookId, eventHash, signer, block.timestamp);
}

    function mintBadge(address user, uint256 badgeId) external onlyOwner {
        require(balanceOf(user, badgeId) == 0, "Badge already owned");
        _mint(user, badgeId, 1, "");
        emit BadgeMinted(user, badgeId, block.timestamp);
    }

    function hasBadge(address user, uint256 badgeId) external view returns (bool) {
        return balanceOf(user, badgeId) > 0;
    }

    function isBookRegistered(bytes32 bookId) external view returns (bool) {
        return registeredBooks[bookId];
    }

    function isEventLogged(bytes32 eventHash) external view returns (bool) {
        return loggedEvents[eventHash];
    }
}