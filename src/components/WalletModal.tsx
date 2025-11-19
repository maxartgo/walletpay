import { useLanguage } from '../contexts/LanguageContext';

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  wallets: Array<{ name: string; provider: any; icon: string }>;
  onSelectWallet: (provider: any) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  isOpen,
  onClose,
  wallets,
  onSelectWallet,
}) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 rounded-xl p-5 max-w-sm w-full border border-gray-700 shadow-2xl my-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-white">
            {t('wallet.selectWallet') || 'Seleziona Wallet'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors text-xl"
          >
            ✕
          </button>
        </div>

        {wallets.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-400 mb-3">
              {t('wallet.noWalletFound') || 'Nessun wallet trovato'}
            </p>
            <p className="text-xs text-gray-500">
              {t('wallet.installWallet') || 'Installa MetaMask, Trust Wallet o un altro wallet compatibile'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {wallets.map((wallet) => (
              <button
                key={wallet.name}
                onClick={() => {
                  onSelectWallet(wallet.provider);
                  onClose();
                }}
                className="w-full flex items-center gap-3 p-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-all duration-200 border border-gray-700 hover:border-primary-500"
              >
                <span className="text-3xl">{wallet.icon}</span>
                <div className="flex-1 text-left">
                  <h3 className="text-white font-semibold">{wallet.name}</h3>
                  <p className="text-gray-400 text-xs">
                    {t('wallet.detected') || 'Rilevato'}
                  </p>
                </div>
                <span className="text-primary-400 text-lg">→</span>
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 pt-4 border-t border-gray-700">
          <p className="text-xs text-gray-500 text-center">
            {t('wallet.secureConnection') || 'Connessione sicura tramite Web3'}
          </p>
        </div>
      </div>
    </div>
  );
};
