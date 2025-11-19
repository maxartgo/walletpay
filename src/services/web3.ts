import { ethers, BrowserProvider } from 'ethers';

// USDT Contract on BSC Mainnet
const USDT_CONTRACT_ADDRESS = '0x55d398326f99059fF775485246999027B3197955';
const BSC_CHAIN_ID = 56;
const BSC_TESTNET_CHAIN_ID = 97;

// Minimal USDT ABI (ERC20)
const USDT_ABI = [
  'function balanceOf(address owner) view returns (uint256)',
  'function decimals() view returns (uint8)',
  'function transfer(address to, uint256 amount) returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
  'function approve(address spender, uint256 amount) returns (bool)',
];

export class Web3Service {
  private provider: BrowserProvider | null = null;
  private currentProvider: any = null;

  // Detect available wallets
  getAvailableWallets(): Array<{ name: string; provider: any; icon: string }> {
    const wallets: Array<{ name: string; provider: any; icon: string }> = [];

    if (!window.ethereum) {
      return wallets;
    }

    // Trust Wallet (check first as it may also set isMetaMask)
    if (window.ethereum?.isTrust) {
      wallets.push({
        name: 'Trust Wallet',
        provider: window.ethereum,
        icon: '🛡️',
      });
      return wallets;
    }

    // Coinbase Wallet
    if (window.ethereum?.isCoinbaseWallet) {
      wallets.push({
        name: 'Coinbase Wallet',
        provider: window.ethereum,
        icon: '💼',
      });
      return wallets;
    }

    // MetaMask
    if (window.ethereum?.isMetaMask) {
      wallets.push({
        name: 'MetaMask',
        provider: window.ethereum,
        icon: '🦊',
      });
      return wallets;
    }

    // Generic provider (fallback for any other wallet)
    wallets.push({
      name: 'Web3 Wallet',
      provider: window.ethereum,
      icon: '👛',
    });

    return wallets;
  }

  async connectWallet(providerToUse?: any): Promise<{
    address: string;
    chainId: number;
    balance: string;
  }> {
    const targetProvider = providerToUse || window.ethereum;

    if (!targetProvider) {
      throw new Error('No wallet found');
    }

    // Save the current provider for later use
    this.currentProvider = targetProvider;
    this.provider = new BrowserProvider(targetProvider);

    // Request account access
    const accounts = await targetProvider.request({
      method: 'eth_requestAccounts',
    });

    const address = accounts[0];
    const network = await this.provider.getNetwork();
    const chainId = Number(network.chainId);

    // Get ETH/BNB balance
    const balance = await this.provider.getBalance(address);
    const balanceFormatted = ethers.formatEther(balance);

    return {
      address,
      chainId,
      balance: balanceFormatted,
    };
  }

  async switchToBSC(): Promise<void> {
    // Use the saved provider instead of window.ethereum
    const provider = this.currentProvider || window.ethereum;

    if (!provider) {
      throw new Error('Wallet not found');
    }

    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${BSC_CHAIN_ID.toString(16)}` }],
      });
    } catch (error: any) {
      // Chain not added, add it
      if (error.code === 4902) {
        await provider.request({
          method: 'wallet_addEthereumChain',
          params: [
            {
              chainId: `0x${BSC_CHAIN_ID.toString(16)}`,
              chainName: 'BNB Smart Chain',
              nativeCurrency: {
                name: 'BNB',
                symbol: 'BNB',
                decimals: 18,
              },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/'],
            },
          ],
        });
      } else {
        throw error;
      }
    }
  }

  async getUSDTBalance(address: string): Promise<string> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const contract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      this.provider
    );

    const balance = await contract.balanceOf(address);
    const decimals = await contract.decimals();

    return ethers.formatUnits(balance, decimals);
  }

  async sendUSDT(
    toAddress: string,
    amount: string
  ): Promise<{ txHash: string; blockNumber: number }> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const signer = await this.provider.getSigner();
    const contract = new ethers.Contract(
      USDT_CONTRACT_ADDRESS,
      USDT_ABI,
      signer
    );

    const decimals = await contract.decimals();
    const amountInWei = ethers.parseUnits(amount, decimals);

    // Send transaction
    const tx = await contract.transfer(toAddress, amountInWei);

    // Wait for confirmation
    const receipt = await tx.wait();

    return {
      txHash: receipt.hash,
      blockNumber: receipt.blockNumber,
    };
  }

  async getCurrentChainId(): Promise<number> {
    if (!this.provider) {
      throw new Error('Provider not initialized');
    }

    const network = await this.provider.getNetwork();
    return Number(network.chainId);
  }

  isCorrectChain(chainId: number): boolean {
    return chainId === BSC_CHAIN_ID || chainId === BSC_TESTNET_CHAIN_ID;
  }

  getChainName(chainId: number): string {
    switch (chainId) {
      case 1:
        return 'Ethereum Mainnet';
      case 56:
        return 'BNB Smart Chain';
      case 97:
        return 'BNB Testnet';
      case 137:
        return 'Polygon';
      default:
        return `Chain ${chainId}`;
    }
  }
}

export const web3Service = new Web3Service();

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ethereum?: any;
  }
}
