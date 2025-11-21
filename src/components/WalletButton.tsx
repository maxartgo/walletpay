import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useLanguage } from '../contexts/LanguageContext';
import { web3Service } from '../services/web3';
import { WalletModal } from './WalletModal';

export const WalletButton = () => {
  const { address, isConnected, isConnecting, chainId, connectWallet, disconnectWallet, switchToBSC, availableWallets } = useWallet();
  const { t } = useLanguage();
  const [showModal, setShowModal] = useState(false);

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  const isWrongChain = chainId && !web3Service.isCorrectChain(chainId);

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-2">
        {isWrongChain && (
          <button
            onClick={switchToBSC}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-semibold py-2 px-2 sm:px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
          >
            <span className="hidden sm:inline">{t('common.switchToBSC')}</span>
            <span className="sm:hidden">BSC</span>
          </button>
        )}
        <div className="flex items-center gap-1.5 sm:gap-2 bg-dark-700 px-2 sm:px-4 py-2 rounded-lg border border-primary-600">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="font-mono text-xs sm:text-sm">{formatAddress(address)}</span>
        </div>
        <button
          onClick={disconnectWallet}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-2 sm:px-4 rounded-lg transition-all duration-200 text-xs sm:text-sm whitespace-nowrap"
        >
          <span className="hidden sm:inline">{t('common.disconnect')}</span>
          <span className="sm:hidden">❌</span>
        </button>
      </div>
    );
  }

  const handleConnectClick = () => {
    if (availableWallets.length > 1) {
      // Show modal if multiple wallets available
      setShowModal(true);
    } else if (availableWallets.length === 1) {
      // Connect directly if only one wallet
      connectWallet(availableWallets[0].provider);
    } else {
      // No specific wallet detected, try default
      connectWallet();
    }
  };

  const handleSelectWallet = async (provider: any) => {
    await connectWallet(provider);
  };

  return (
    <>
      <button
        onClick={handleConnectClick}
        disabled={isConnecting}
        className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm px-3 sm:px-4 py-2 whitespace-nowrap"
      >
        {isConnecting ? t('common.connecting') : t('common.connect')}
      </button>

      <WalletModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        wallets={availableWallets}
        onSelectWallet={handleSelectWallet}
      />
    </>
  );
};
