// src/app/services/verification.service.ts
import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { environment } from '../../environments/environment.dev';

const ABI = [
  'function isBookRegistered(bytes32 bookId) view returns (bool)',
  'function bookHashes(bytes32 bookId) view returns (bytes32)',
  'function isEventLogged(bytes32 eventHash) view returns (bool)',
];

export type VerificationStatus =
  | 'verified'
  | 'tampered'
  | 'pending'
  | 'not_on_chain';

@Injectable({ providedIn: 'root' })
export class VerificationService {
  private provider = new ethers.JsonRpcProvider(environment.rpcUrl);
  private contract = new ethers.Contract(
    environment.contractAddress,
    ABI,
    this.provider,
  );

  async verifyBook(book: {
    id?: string;
    title?: string;
    author?: string;
  }): Promise<VerificationStatus> {
    try {
      if (!book.id || !book.title || !book.author) return 'not_on_chain';

      const bookId = ethers.keccak256(
        ethers.toUtf8Bytes(book.id),
      ) as `0x${string}`;

      const isRegistered = await this.contract['isBookRegistered'](bookId);
      if (!isRegistered) return 'not_on_chain';

      const localHash = ethers.keccak256(
        ethers.toUtf8Bytes(`${book.id}::${book.title}::${book.author}`),
      );

      const chainHash = await this.contract['bookHashes'](bookId);

      return localHash === chainHash ? 'verified' : 'tampered';
    } catch {
      return 'pending';
    }
  }

  async verifyEvent(eventHash: string): Promise<VerificationStatus> {
    try {
      const hashBytes = `0x${eventHash}` as `0x${string}`;

      const isLogged = await this.contract['isEventLogged'](hashBytes);

      return isLogged ? 'verified' : 'not_on_chain';
    } catch (e) {
      console.error('verifyEvent error:', e);
      return 'pending';
    }
  }
}
