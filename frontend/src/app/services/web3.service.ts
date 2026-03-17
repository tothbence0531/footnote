import { Injectable, signal } from '@angular/core';
import { ethers } from 'ethers';
import { environment } from '../../environments/environment.dev';

@Injectable({ providedIn: 'root' })
export class Web3Service {
  private provider: ethers.BrowserProvider | null = null;
  private signer: ethers.JsonRpcSigner | null = null;

  walletAddress = signal<string | null>(null);
  isConnected = signal<boolean>(false);

  constructor() {
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

    const domain = {
      name: 'BookTracker',
      version: '1',
      chainId: 31337,
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

    const value = {
      bookId: ethers.keccak256(ethers.toUtf8Bytes(bookId)) as `0x${string}`,
      eventHash: `0x${eventHash}` as `0x${string}`,
      signer: await this.signer.getAddress(),
      nonce: BigInt(nonce),
    };

    return await this.signer.signTypedData(domain, types, value);
  }

  async getAddress(): Promise<string | null> {
    return this.signer ? await this.signer.getAddress() : null;
  }

  async getNonce(contractAddress: string, abi: any[]): Promise<number> {
    if (!this.provider) throw new Error('Provider not initialized');
    const contract = new ethers.Contract(contractAddress, abi, this.provider);
    const address = await this.getAddress();
    if (!address) throw new Error('No wallet address');
    const nonce = await contract['nonces'](address);
    return Number(nonce);
  }
}
