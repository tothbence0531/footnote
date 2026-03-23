import * as badgeDao from "../daos/badge.dao.js";
import * as userDao from "../daos/user.dao.js";
import { mintBadgeOnChain, hasBadgeOnChain } from "./blockchain.service.js";

const BADGES = {
  FIRST_STEP: { id: 1, tokenId: 1 },
  BOOKWORM: { id: 2, tokenId: 2 },
  FOUNDER: { id: 3, tokenId: 3 },
  TRAVELER: { id: 4, tokenId: 4 },
  CRITIC: { id: 5, tokenId: 5 },
  FAST_READER: { id: 6, tokenId: 6 },
};

export async function checkEventBadges(userId) {
  const stats = await badgeDao.getUserStats(userId);
  const existingBadges = await badgeDao.getUserBadgeIds(userId);
  const user = await userDao.selectUserById(userId);
  const walletAddress = user.wallet_address;
  const toAward = [];

  if (stats.total_events >= 1 && !existingBadges.includes(1))
    toAward.push(BADGES.FIRST_STEP);
  if (stats.distinct_books >= 5 && !existingBadges.includes(2))
    toAward.push(BADGES.BOOKWORM);
  if (stats.distinct_locations >= 3 && !existingBadges.includes(4))
    toAward.push(BADGES.TRAVELER);
  if (stats.total_ratings >= 3 && !existingBadges.includes(5))
    toAward.push(BADGES.CRITIC);
  if (stats.events_this_week >= 3 && !existingBadges.includes(6))
    toAward.push(BADGES.FAST_READER);

  for (const badge of toAward) {
    await awardBadge(userId, badge, walletAddress);
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export async function checkBookBadges(userId) {
  const stats = await badgeDao.getUserStats(userId);
  const existingBadges = await badgeDao.getUserBadgeIds(userId);
  const user = await userDao.selectUserById(userId);
  const walletAddress = user.wallet_address;

  if (stats.owned_books >= 1 && !existingBadges.includes(3)) {
    await awardBadge(userId, BADGES.FOUNDER, walletAddress);
  }
}

async function awardBadge(userId, badge, walletAddress) {
  try {
    await badgeDao.insertUserBadge(userId, badge.id);
    console.log(`Badge ${badge.id} awarded to user ${userId}`);

    if (walletAddress) {
      setImmediate(async () => {
        try {
          const alreadyOwned = await hasBadgeOnChain(
            walletAddress,
            badge.tokenId,
          );
          if (alreadyOwned) {
            console.log(`Badge ${badge.id} already on chain, skipping mint`);
            return;
          }

          const txHash = await mintBadgeOnChain(walletAddress, badge.tokenId);
          await badgeDao.updateUserBadgeChainTx(userId, badge.id, txHash);
          console.log(`Badge ${badge.id} minted on chain: ${txHash}`);
        } catch (err) {
          console.error(`Badge mint failed for user ${userId}:`, err);
        }
      });
    }
  } catch (err) {
    console.error(`Badge award failed:`, err);
  }
}
