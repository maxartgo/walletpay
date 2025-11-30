import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { User } from '../types';

interface InvestmentFormProps {
  user: User;
  onInvestmentCreated: () => void;
  stakingEligibility?: {
    hasUsedStarter: boolean;
    premiumCount: number;
    nextPremiumPercentage: number;
  };
}

export function InvestmentForm({ user, onInvestmentCreated, stakingEligibility }: InvestmentFormProps) {
  const { t } = useLanguage();
  const [isCreatingStarter, setIsCreatingStarter] = useState(false);
  const [isCreatingPremium, setIsCreatingPremium] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalAvailable = user.available_balance + user.referral_balance;
  const canCreateStarter = !stakingEligibility?.hasUsedStarter && totalAvailable >= 50;
  const canCreatePremium = totalAvailable >= 100;

  const handleCreateStarter = async () => {
    if (!canCreateStarter) return;

    setIsCreatingStarter(true);
    setError(null);

    try {
      const { apiService } = await import('../services/api');
      const result = await apiService.createStarterInvestment(user.wallet_address);

      if (result.success) {
        onInvestmentCreated();
      } else {
        setError(result.message || t('errors.investmentError'));
      }
    } catch (err: any) {
      console.error('Error creating starter investment:', err);
      setError(err.response?.data?.error || t('errors.investmentError'));
    } finally {
      setIsCreatingStarter(false);
    }
  };

  const handleCreatePremium = async () => {
    if (!canCreatePremium) return;

    setIsCreatingPremium(true);
    setError(null);

    try {
      const { apiService } = await import('../services/api');
      const result = await apiService.createPremiumInvestment(user.wallet_address);

      if (result.success) {
        onInvestmentCreated();
      } else {
        setError(result.message || t('errors.investmentError'));
      }
    } catch (err: any) {
      console.error('Error creating premium investment:', err);
      setError(err.response?.data?.error || t('errors.investmentError'));
    } finally {
      setIsCreatingPremium(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 rounded-lg p-6 border border-purple-500/30">
      <h3 className="text-xl font-bold text-white mb-4">💎 {t('staking.createNew')}</h3>

      {/* Balance Summary */}
      <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
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

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* STARTER PACKAGE */}
        {!stakingEligibility?.hasUsedStarter && (
          <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-lg p-4 border border-green-500/30">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-green-400 font-bold text-lg">🌱 {t('staking.starter.title')}</h4>
              <span className="text-xs bg-green-500/20 text-green-400 px-2 py-1 rounded">
                {t('staking.starter.oneTime')}
              </span>
            </div>

            <ul className="space-y-2 text-sm mb-4">
              <li className="flex justify-between">
                <span className="text-gray-400">{t('staking.fixedAmount')}:</span>
                <span className="text-white font-medium">50 USDT</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">{t('staking.dailyYield')}:</span>
                <span className="text-green-400 font-medium">0.45% compound</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">{t('staking.yieldGoal')}:</span>
                <span className="text-purple-400 font-medium">+50 USDT (100% ROI)</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">{t('staking.unlockValue')}:</span>
                <span className="text-blue-400 font-medium">100 USDT</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-400">{t('staking.estimatedTime')}:</span>
                <span className="text-white font-medium">~154 {t('staking.days')}</span>
              </li>
            </ul>

            <button
              onClick={handleCreateStarter}
              disabled={!canCreateStarter || isCreatingStarter}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-bold hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
            >
              {isCreatingStarter ? (
                `⏳ ${t('staking.creating')}`
              ) : !canCreateStarter ? (
                `❌ ${t('staking.insufficientBalance')}`
              ) : (
                `🌱 ${t('staking.starter.button')}`
              )}
            </button>

            {!canCreateStarter && totalAvailable < 50 && (
              <p className="text-sm text-gray-400 text-center mt-2">
                {t('staking.missing', { amount: (50 - totalAvailable).toFixed(2) })}
              </p>
            )}
          </div>
        )}

        {/* PREMIUM PACKAGE */}
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-blue-400 font-bold text-lg">💎 {t('staking.premium.title')}</h4>
            {stakingEligibility && stakingEligibility.premiumCount > 0 && (
              <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-1 rounded">
                #{stakingEligibility.premiumCount + 1}
              </span>
            )}
          </div>

          <ul className="space-y-2 text-sm mb-4">
            <li className="flex justify-between">
              <span className="text-gray-400">{t('staking.fixedAmount')}:</span>
              <span className="text-white font-medium">100 USDT</span>
            </li>
            <li className="flex justify-between">
              <span className="text-gray-400">{t('staking.dailyYield')}:</span>
              <span className="text-green-400 font-medium">
                {stakingEligibility?.nextPremiumPercentage?.toFixed(4) || '0.7758'}% compound
              </span>
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
              <span className="text-white font-medium">
                ~{stakingEligibility?.premiumCount === 0 ? '90' : stakingEligibility?.premiumCount === 1 ? '108' : '127'} {t('staking.days')}
              </span>
            </li>
          </ul>

          <button
            onClick={handleCreatePremium}
            disabled={!canCreatePremium || isCreatingPremium}
            className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-3 rounded-lg font-bold hover:from-purple-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
          >
            {isCreatingPremium ? (
              `⏳ ${t('staking.creating')}`
            ) : !canCreatePremium ? (
              `❌ ${t('staking.insufficientBalance')}`
            ) : (
              `💎 ${t('staking.premium.button')}`
            )}
          </button>

          {!canCreatePremium && (
            <p className="text-sm text-gray-400 text-center mt-2">
              {t('staking.missing', { amount: (100 - totalAvailable).toFixed(2) })}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
