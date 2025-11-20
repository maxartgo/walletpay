import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { web3Service } from '../services/web3';

export interface WalletState {
  address: string | null;
  balance: string | null;
  chainId: number | null;
  isConnected: boolean;
  isConnecting: boolean;
}

interface WalletContextType extends WalletState {
  connectWallet: (provider?: any) => Promise<void>;
  disconnectWallet: () => void;
  switchToBSC: () => Promise<void>;
  usdtBalance: string | null;
  refreshBalance: () => Promise<void>;
  availableWallets: Array<{ name: string; provider: any; icon: string }>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [walletState, setWalletState] = useState<WalletState>({
    address: null,
    balance: null,
    chainId: null,
    isConnected: false,
    isConnecting: false,
  });
  const [usdtBalance, setUsdtBalance] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<Array<{ name: string; provider: any; icon: string }>>([]);

  useEffect(() => {
    // Detect available wallets on mount
    const wallets = web3Service.getAvailableWallets();
    setAvailableWallets(wallets);
  }, []);

  const connectWallet = async (provider?: any) => {
    try {
      setWalletState((prev) => ({ ...prev, isConnecting: true }));

      // Ignore React synthetic events
      const actualProvider = provider && typeof provider === 'object' && !provider.nativeEvent ? provider : undefined;

      const { address, chainId, balance } = await web3Service.connectWallet(actualProvider);

      setWalletState({
        address,
        chainId,
        balance,
        isConnected: true,
        isConnecting: false,
      });

      // Get USDT balance if on correct chain
      if (web3Service.isCorrectChain(chainId)) {
        const usdt = await web3Service.getUSDTBalance(address);
        setUsdtBalance(usdt);
      }

      // Save to localStorage
      localStorage.setItem('walletAddress', address);
    } catch (error) {
      console.error('Error connecting wallet:', error);
      setWalletState((prev) => ({ ...prev, isConnecting: false }));
      throw error;
    }
  };

  const disconnectWallet = () => {
    setWalletState({
      address: null,
      balance: null,
      chainId: null,
      isConnected: false,
      isConnecting: false,
    });
    setUsdtBalance(null);
    localStorage.removeItem('walletAddress');
  };

  const switchToBSC = async () => {
    try {
      await web3Service.switchToBSC();
      // Reconnect to update state
      await connectWallet();
    } catch (error) {
      console.error('Error switching to BSC:', error);
      throw error;
    }
  };

  const refreshBalance = async () => {
    if (walletState.address && walletState.chainId) {
      try {
        if (web3Service.isCorrectChain(walletState.chainId)) {
          const usdt = await web3Service.getUSDTBalance(walletState.address);
          setUsdtBalance(usdt);
        }
      } catch (error) {
        console.error('Error refreshing balance:', error);
      }
    }
  };

  // Listen to account and chain changes
  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet();
        } else {
          connectWallet();
        }
      });

      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }

    // Try to reconnect on mount
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress && window.ethereum) {
      connectWallet().catch(console.error);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeAllListeners('accountsChanged');
        window.ethereum.removeAllListeners('chainChanged');
      }
    };
  }, []);

  const value: WalletContextType = {
    ...walletState,
    connectWallet,
    disconnectWallet,
    switchToBSC,
    usdtBalance,
    refreshBalance,
    availableWallets,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};
