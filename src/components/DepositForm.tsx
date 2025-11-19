import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useLanguage } from '../contexts/LanguageContext';
import { web3Service } from '../services/web3';

interface DepositFormProps {
  onSuccess?: () => void;
  destinationWallet: string;
}

export const DepositForm = ({ onSuccess, destinationWallet }: DepositFormProps) => {
  const { address, isConnected, chainId, refreshBalance, usdtBalance } = useWallet();
  const { t } = useLanguage();
  const [amount, setAmount] = useState('');
  const [referrer, setReferrer] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Auto-fill referrer from URL parameter
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const refParam = urlParams.get('ref');

    if (refParam && /^0x[a-fA-F0-9]{40}$/.test(refParam)) {
      setReferrer(refParam);
    }
  }, []);

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!isConnected || !address) {
      setError(t('errors.connectWallet'));
      return;
    }

    if (!chainId || !web3Service.isCorrectChain(chainId)) {
      setError(t('errors.switchToBSC'));
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setError(t('errors.invalidAmount'));
      return;
    }

    // Check if user has enough USDT balance
    if (usdtBalance) {
      const balance = parseFloat(usdtBalance);
      const depositAmount = parseFloat(amount);
      if (depositAmount > balance) {
        setError(t('errors.insufficientBalance', {
          balance: balance.toFixed(2),
          amount: depositAmount.toFixed(2)
        }));
        return;
      }
    }

    if (referrer && !/^0x[a-fA-F0-9]{40}$/.test(referrer)) {
      setError(t('errors.invalidReferrer'));
      return;
    }

    try {
      setLoading(true);

      // Send USDT transaction
      const { txHash, blockNumber } = await web3Service.sendUSDT(
        destinationWallet,
        amount
      );

      setSuccess(t('deposit.txSent', { txHash }));

      // Record deposit in backend
      const response = await fetch('http://localhost:3001/api/deposits', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress: address,
          amount: parseFloat(amount),
          txHash,
          blockNumber,
          referrerAddress: referrer || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to record deposit in backend');
      }

      setSuccess(t('deposit.success'));
      setAmount('');
      setReferrer('');

      // Refresh balance
      await refreshBalance();

      if (onSuccess) onSuccess();
    } catch (err: any) {
      console.error('Deposit error:', err);
      setError(err.message || t('errors.depositError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h2 className="text-2xl font-bold gradient-text mb-6">{t('deposit.title')}</h2>

      <form onSubmit={handleDeposit} className="space-y-4">
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-dark-300">
              {t('deposit.amount')}
            </label>
            {usdtBalance && (
              <span className="text-xs text-dark-400">
                {t('deposit.available')}: <span className="text-primary-400 font-semibold">{parseFloat(usdtBalance).toFixed(2)} USDT</span>
              </span>
            )}
          </div>
          <input
            type="number"
            step="0.01"
            min="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="100.00"
            className="input-field"
            disabled={loading}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark-300 mb-2">
            {t('deposit.referrer')}
            {referrer && (
              <span className="ml-2 text-xs text-green-400">✓ {t('deposit.autoFilled')}</span>
            )}
          </label>
          <input
            type="text"
            value={referrer}
            onChange={(e) => setReferrer(e.target.value)}
            placeholder="0x..."
            className={`input-field ${referrer ? 'border-green-600/50 bg-green-900/10' : ''}`}
            disabled={loading}
          />
          <p className="text-xs text-dark-400 mt-1">
            {referrer
              ? `✨ ${t('deposit.referrerDetected')}`
              : t('deposit.referrerHelp')
            }
          </p>
        </div>

        {error && (
          <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/50 border border-green-500 rounded-lg p-3 text-green-200 text-sm">
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isConnected}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? t('deposit.processing') : t('deposit.submit')}
        </button>
      </form>

      <div className="mt-6 p-4 bg-dark-700 rounded-lg">
        <h3 className="font-semibold text-sm mb-2">💡 {t('deposit.info.title')}</h3>
        <ul className="text-xs text-dark-300 space-y-1">
          <li>• {t('deposit.info.destination', { wallet: destinationWallet.substring(0, 10) })}</li>
          <li>• {t('deposit.info.rewards')}</li>
          <li>• {t('deposit.info.yields')}</li>
          <li>• {t('deposit.info.educational')}</li>
        </ul>
      </div>
    </div>
  );
};
