import { useState, useEffect } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';

interface WithdrawFormProps {
  onSuccess?: () => void;
}

export const WithdrawForm = ({ onSuccess }: WithdrawFormProps) => {
  const { address, isConnected } = useWallet();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [withdrawableData, setWithdrawableData] = useState<any>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (isConnected && address) {
      loadWithdrawableAmount();
    }
  }, [isConnected, address]);

  const loadWithdrawableAmount = async () => {
    if (!address) return;

    try {
      setLoadingData(true);
      const data = await apiService.getWithdrawableAmount(address);
      setWithdrawableData(data);
    } catch (err) {
      console.error('Error loading withdrawable amount:', err);
    } finally {
      setLoadingData(false);
    }
  };

  const handleWithdraw = async () => {
    setError('');
    setSuccess('');

    if (!isConnected || !address) {
      setError(t('errors.connectWallet'));
      return;
    }

    if (!withdrawableData || !withdrawableData.canWithdraw) {
      setError(t('withdrawal.noFunds'));
      return;
    }

    const { grossAmount, taxAmount, netAmount } = withdrawableData;

    // Show confirmation with tax details
    const confirmed = window.confirm(
      t('withdrawal.confirmMessage', {
        gross: grossAmount.toFixed(2),
        tax: taxAmount.toFixed(2),
        net: netAmount.toFixed(2)
      })
    );

    if (!confirmed) return;

    try {
      setLoading(true);

      const result = await apiService.createWithdrawal(address);

      if (result.success) {
        setSuccess(
          t('withdrawal.successMessage', {
            gross: result.grossAmount.toFixed(2),
            tax: result.taxAmount.toFixed(2),
            net: result.netAmount.toFixed(2)
          })
        );

        if (onSuccess) {
          setTimeout(() => onSuccess(), 3000);
        }
      } else {
        setError(result.message || t('errors.withdrawalError'));
      }
    } catch (err: any) {
      console.error('Withdrawal error:', err);
      setError(err.response?.data?.message || t('errors.withdrawalError'));
    } finally {
      setLoading(false);
    }
  };

  if (!isConnected) {
    return null;
  }

  if (loadingData) {
    return (
      <div className="card bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-600/50">
        <p className="text-center text-gray-400">{t('withdrawal.loadingData')}</p>
      </div>
    );
  }

  if (!withdrawableData) {
    return (
      <div className="card bg-gradient-to-br from-green-900/20 to-blue-900/20 border-green-600/50">
        <p className="text-center text-red-400">{t('errors.loadingError')}</p>
      </div>
    );
  }

  const { breakdown, grossAmount, taxAmount, netAmount, canWithdraw } = withdrawableData;

  // Convert string values to numbers
  const breakdownNumbers = {
    availableBalance: Number(breakdown.availableBalance),
    lockedProfits: Number(breakdown.lockedProfits),
    unlockedInvestments: Number(breakdown.unlockedInvestments),
  };
  const gross = Number(grossAmount);
  const tax = Number(taxAmount);
  const net = Number(netAmount);

  return (
    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-500/30">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
        💰 {t('withdrawal.withdrawFunds')}
      </h3>

      <div className="space-y-4">
        {/* Breakdown */}
        <div className="bg-gray-800/50 rounded-lg p-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-300 mb-3">📊 {t('withdrawal.fundsBreakdown')}</h4>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('dashboard.availableBalance')}:</span>
            <span className="text-white">{breakdownNumbers.availableBalance.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('dashboard.lockedProfits')}:</span>
            <span className="text-purple-400">{breakdownNumbers.lockedProfits.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">{t('withdrawal.unlockedStakings')}:</span>
            <span className="text-blue-400">{breakdownNumbers.unlockedInvestments.toFixed(2)} USDT</span>
          </div>
        </div>


        {/* Referral Requirements Notice */}
        <div className="bg-yellow-900/20 border border-yellow-500/40 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-yellow-400 text-lg">⚠️</span>
            <div className="text-xs text-yellow-200">
              <strong>Requisiti per prelevare:</strong>
              <ul className="mt-1 space-y-1 ml-2">
                <li>• Almeno 2 referral L1 con Premium attivo</li>
                <li>• Almeno 4 referral L2 con Premium attivo</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Minimum Withdrawal Notice */}
        <div className="bg-blue-900/30 border border-blue-500/40 rounded-lg p-3">
          <div className="flex items-start gap-2">
            <span className="text-blue-400 text-lg">ℹ️</span>
            <div className="text-xs text-blue-300">
              <strong>{t('withdrawal.minimumNotice')}</strong> {t('withdrawal.minimumAmount')}
              <br />
              <span className="text-blue-400">{t('withdrawal.minimumGross')}</span>
            </div>
          </div>
        </div>

        {/* Calculation */}
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-300">{t('withdrawal.grossAmount')}:</span>
              <span className="text-white font-medium">{gross.toFixed(2)} USDT</span>
            </div>
            <div className="flex justify-between text-yellow-400">
              <span>{t('withdrawal.tax')}:</span>
              <span className="font-medium">-{tax.toFixed(2)} USDT</span>
            </div>
            <div className="border-t border-gray-700 my-2" />
            <div className="flex justify-between">
              <span className="text-green-400 font-bold text-lg">{t('withdrawal.youReceive')}:</span>
              <span className={`font-bold text-lg ${net >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                {net.toFixed(2)} USDT {net < 50 ? t('withdrawal.belowMinimum') : ''}
              </span>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 text-green-400 text-sm whitespace-pre-line">
            {success}
          </div>
        )}

        <button
          onClick={handleWithdraw}
          disabled={loading || !canWithdraw}
          className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {loading ? `⏳ ${t('withdrawal.processing')}` : !canWithdraw ? `❌ ${t('withdrawal.noFunds')}` : `💸 ${t('withdrawal.withdraw')} ${net.toFixed(2)} USDT`}
        </button>

        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <p className="text-xs text-yellow-300">
            ⚠️ {t('withdrawal.warning')}
          </p>
        </div>
      </div>
    </div>
  );
};
