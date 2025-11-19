import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import type { Investment } from '../types';

interface InvestmentCardProps {
  investment: Investment;
  onReinvest: (investmentId: number) => void;
}

export function InvestmentCard({ investment, onReinvest }: InvestmentCardProps) {
  const { t } = useLanguage();
  const [isReinvesting, setIsReinvesting] = useState(false);

  // Convert string values to numbers
  const amount = Number(investment.amount);
  const currentValue = Number(investment.current_value);
  const yieldEarned = Number(investment.yield_earned);
  const yieldGoal = Number(investment.yield_goal);
  const dailyPercentage = Number(investment.daily_percentage);

  const progress = (yieldEarned / yieldGoal) * 100;
  const daysElapsed = Math.floor(
    (new Date().getTime() - new Date(investment.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );

  const handleReinvest = async () => {
    setIsReinvesting(true);
    try {
      await onReinvest(investment.id);
    } finally {
      setIsReinvesting(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">
            {t('staking.stakingNumber', { id: investment.id.toString() })}
          </h3>
          <p className="text-sm text-gray-400">
            {new Date(investment.created_at).toLocaleDateString()}
          </p>
        </div>
        <span
          className={`px-3 py-1 rounded-full text-xs font-medium ${
            investment.status === 'active'
              ? 'bg-blue-500/20 text-blue-400'
              : investment.status === 'unlocked'
              ? 'bg-green-500/20 text-green-400'
              : 'bg-gray-500/20 text-gray-400'
          }`}
        >
          {investment.status === 'active'
            ? t('staking.status.active')
            : investment.status === 'unlocked'
            ? t('staking.status.unlocked')
            : t('staking.status.withdrawn')}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-gray-400">{t('staking.stakedAmount')}</span>
          <span className="text-white font-medium">{amount.toFixed(2)} USDT</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">{t('dashboard.currentValue')}</span>
          <span className="text-green-400 font-medium">
            {currentValue.toFixed(2)} USDT
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">{t('staking.yieldEarned')}</span>
          <span className="text-blue-400 font-medium">
            {yieldEarned.toFixed(2)} USDT
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">{t('staking.yieldGoal')}</span>
          <span className="text-white">{yieldGoal.toFixed(2)} USDT</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">{t('staking.dailyYield')}</span>
          <span className="text-purple-400 font-medium">{dailyPercentage.toFixed(2)}%</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-400">{t('staking.daysElapsed')}</span>
          <span className="text-white">{daysElapsed}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {investment.status === 'active' && (
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-400">{t('staking.progress')}</span>
            <span className="text-white">{progress.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Reinvest Button */}
      {investment.status === 'unlocked' && (
        <div className="mt-4">
          <button
            onClick={handleReinvest}
            disabled={isReinvesting}
            className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-lg font-medium hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isReinvesting ? t('staking.reinvesting') : `🔁 ${t('staking.reinvest100')}`}
          </button>
          <p className="text-xs text-gray-400 mt-2 text-center">
            {t('staking.reinvestNote', { amount: (currentValue - 100).toFixed(2) })}
          </p>
        </div>
      )}

      {investment.status === 'unlocked' && (
        <div className="mt-2 p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <p className="text-sm text-green-400 text-center">
            ✅ {t('staking.unlockedMessage')}
          </p>
        </div>
      )}
    </div>
  );
}
