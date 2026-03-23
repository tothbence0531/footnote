import { Injectable, signal } from '@angular/core';
import { ethers } from 'ethers';
import { environment } from '../../environments/environment.dev';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  walletAddress = signal<string | null>(null);
  isConnected = signal<boolean>(false);

  constructor(private http: HttpClient) {
    this.autoConnect();
  }

  private async autoConnect() {
    if (!window.ethereum) return;

    if (localStorage.getItem('wallet_disconnected') === 'true') return;

    const accounts = await window.ethereum.request({
      method: 'eth_accounts',
    });

    if (accounts.length > 0) {
      this.provider = new ethers.BrowserProvider(window.ethereum);
      this.signer = await this.provider.getSigner();
      this.walletAddress.set(accounts[0]);
      this.isConnected.set(true);
    }
  }

  async connect(): Promise<string> {
    if (!window.ethereum) {
      throw new Error("MetaMask isn't installed");
    }

    this.provider = new ethers.BrowserProvider(window.ethereum);

    await this.provider.send('eth_requestAccounts', []);

    this.signer = await this.provider.getSigner();
    const address = await this.signer.getAddress();

    this.walletAddress.set(address);
    this.isConnected.set(true);

    await this.saveWalletToBackend(address);

    window.ethereum.on('accountsChanged', (accounts: string[]) => {
      if (accounts.length === 0) {
        this.disconnect();
      } else {
        this.walletAddress.set(accounts[0]);
      }
    });

    localStorage.removeItem('wallet_disconnected');

    return address;
  }

  private saveWalletToBackend(address: string): Promise<void> {
    return new Promise((resolve) => {
      this.http
        .post(`${environment.apiUrl}/auth/users/wallet`, {
          walletAddress: address,
        })
        .pipe(take(1))
        .subscribe({
          next: () => resolve(),
          error: (err) => {
            console.error('Wallet mentés sikertelen:', err);
            resolve();
          },
        });
    });
  }

  disconnect() {
    this.provider = null;
    this.signer = null;
    this.walletAddress.set(null);
    this.isConnected.set(false);
    localStorage.setItem('wallet_disconnected', 'true');
  }

  async signBookEvent(
    bookId: string,
    eventHash: string,
    nonce: number,
  ): Promise<string> {
    if (!this.signer) throw new Error('Wallet not connected');

    console.log('signBookEvent nonce:', nonce, typeof nonce);

    if (nonce === undefined || nonce === null) {
      throw new Error('Cannot get nonce');
    }

    const value = {
      bookId: ethers.keccak256(ethers.toUtf8Bytes(bookId)) as `0x${string}`,
      eventHash: `0x${eventHash}` as `0x${string}`,
      signer: await this.signer.getAddress(),
      nonce: BigInt(nonce),
    };

    const domain = {
      name: 'BookTracker',
      version: '1',
      chainId: 11155111, // Sepolia
      verifyingContract: environment.contractAddress,
    };

    const types = {
      BookEvent: [
        { name: 'bookId', type: 'bytes32' },
        { name: 'eventHash', type: 'bytes32' },
        { name: 'signer', type: 'address' },
        { name: 'nonce', type: 'uint256' },
      ],
    };

    return await this.signer.signTypedData(domain, types, value);
  }

  async getAddress(): Promise<string | null> {
    return this.signer ? await this.signer.getAddress() : null;
  }

  async getNonce(walletAddress: string): Promise<number> {
    const response = await fetch(
      `${environment.apiUrl}/blockchain/nonce/${walletAddress}`,
    );
    console.log(`${environment.apiUrl}/blockchain/nonce/${walletAddress}`);
    const data = await response.json();
    return data.nonce;
  }

  async signBookRegistration(
    bookId: string,
    title: string,
    author: string,
  ): Promise<string> {
    if (!this.signer) throw new Error("Wallet isn't connected");

    const domain = {
      name: 'BookTracker',
      version: '1',
      chainId: 11155111, // Sepolia
      verifyingContract: environment.contractAddress,
    };

    const types = {
      BookRegistration: [
        { name: 'bookId', type: 'bytes32' },
        { name: 'bookHash', type: 'bytes32' },
        { name: 'owner', type: 'address' },
      ],
    };

    const bookHash = await this.computeBookHash(bookId, title, author);

    const value = {
      bookId: ethers.keccak256(ethers.toUtf8Bytes(bookId)) as `0x${string}`,
      bookHash: `0x${bookHash}` as `0x${string}`,
      owner: await this.signer.getAddress(),
    };

    return await this.signer.signTypedData(domain, types, value);
  }

  private async computeBookHash(
    bookId: string,
    title: string,
    author: string,
  ): Promise<string> {
    const input = `${bookId}::${title}::${author}`;
    const msgBuffer = new TextEncoder().encode(input);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }
}
