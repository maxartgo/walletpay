import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '../types';

interface InvestmentFormProps {
  user: User;
  onInvestmentCreated: () => void;
}

export function InvestmentForm({ user, onInvestmentCreated }: InvestmentFormProps) {
  const { t } = useLanguage();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAvailable = user.available_balance + user.referral_balance;
  const canInvest = totalAvailable >= 100;

  const handleCreateInvestment = async () => {
    if (!canInvest) return;

    setIsCreating(true);
    setError(null);

    try {
      const { apiService } = await import('../services/api');
      const result = await apiService.createInvestment(user.wallet_address);

      if (result.success) {
        onInvestmentCreated();
      } else {
        setError(result.message || t('errors.investmentError'));
      }
    } catch (err: any) {
      console.error('Error creating investment:', err);
      setError(err.response?.data?.message || t('errors.investmentError'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold text-white mb-4">💎 {t('staking.createNew')}</h3>

      <div className="space-y-4">
        <div className="bg-gray-800/50 rounded-lg p-4">
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">{t('dashboard.availableBalance')}</span>
            <span className="text-white font-medium">{user.available_balance.toFixed(2)} USDT</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-400">{t('dashboard.referralBalance')}</span>
            <span className="text-green-400 font-medium">
              {user.referral_balance.toFixed(2)} USDT
            </span>
          </div>
          <div className="border-t border-gray-700 my-2" />
          <div className="flex justify-between">
            <span className="text-white font-medium">{t('staking.totalAvailable')}</span>
            <span className="text-blue-400 font-bold text-lg">{totalAvailable.toFixed(2)} USDT</span>
          </div>
        </div>

        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <h4 className="text-blue-400 font-medium mb-2">📊 {t('staking.details')}</h4>
          <ul className="space-y-2 text-sm">
            <li className="flex justify-between">
              <span className="text-gray-400">{t('staking.fixedAmount')}:</span>
              <span className="text-white font-medium">100 USDT</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">{t('staking.dailyYield')}:</span>
              <span className="text-green-400 font-medium">1% compound</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">{t('staking.yieldGoal')}:</span>
              <span className="text-purple-400 font-medium">+100 USDT (100% ROI)</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">{t('staking.unlockValue')}:</span>
              <span className="text-blue-400 font-medium">200 USDT</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">{t('staking.estimatedTime')}:</span>
              <span className="text-white font-medium">~70 {t('staking.days')}</span>
            </li>
          </ul>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <button
          onClick={handleCreateInvestment}
          disabled={!canInvest || isCreating}
          className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
        >
          {isCreating ? (
            `⏳ ${t('staking.creating')}`
          ) : !canInvest ? (
            `❌ ${t('staking.insufficientBalance')}`
          ) : (
            `🚀 ${t('staking.stake100')}`
          )}
        </button>

        {!canInvest && (
          <p className="text-sm text-gray-400 text-center">
            {t('staking.missing', { amount: (100 - totalAvailable).toFixed(2) })}
          </p>
        )}
      </div>
    </div>
  );
}
