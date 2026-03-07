import { useEffect, useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';
import type { User, Investment } from '../types';
import { InvestmentForm } from './InvestmentForm';
import { InvestmentCard } from './InvestmentCard';
import { WithdrawForm } from './WithdrawForm';
import { ReferralWithdrawForm } from './ReferralWithdrawForm';

export const UserDashboard = () => {
  const { address, isConnected, usdtBalance, refreshBalance, chainId } = useWallet();
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeReferralCounts, setActiveReferralCounts] = useState<any>(null);
  const [globalStats, setGlobalStats] = useState<any>(null);
  const [requirementsProgress, setRequirementsProgress] = useState<any>(null);

  useEffect(() => {
    if (address && isConnected) {
      loadUserData();
    }
  }, [address, isConnected]);

  const loadUserData = async () => {
    if (!address) return;

    setLoading(true);
    try {
      console.log('Loading user data for:', address);

      // Load user data
      const userData = await apiService.getUser(address);
      console.log('User data:', userData);
      if (userData) {
        setUser(userData);
      }

      // Load investments
      const investmentData = await apiService.getUserInvestments(address);
      console.log('Investment data:', investmentData);
      if (investmentData) {
        setInvestments(investmentData.investments || []);
        setStats({
          ...investmentData.stats,
          stakingEligibility: investmentData.stakingEligibility,
        });
        setActiveReferralCounts(investmentData.activeReferralCounts || null);
      }

      // Refresh USDT balance from wallet
      await refreshBalance();

      // Load global stats
      try {
        const globalData = await apiService.getGlobalStats();
        setGlobalStats(globalData);
      } catch (error) {
        console.error('Error loading global stats:', error);
      }

      // Load personal requirements progress
      try {
        const requirementsData = await apiService.getRequirementsProgress(address);
        setRequirementsProgress(requirementsData.requirements);
      } catch (error) {
        console.error('Error loading requirements progress:', error);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReinvest = async (investmentId: number) => {
    if (!address) return;

    try {
      const result = await apiService.reinvestInvestment(address, investmentId);

      if (result.success) {
        alert(
          t('dashboard.reinvestSuccess', {
            lockedProfit: result.lockedProfit.toFixed(2)
          })
        );
        await loadUserData();
      } else {
        alert(result.message || t('errors.reinvestError'));
      }
    } catch (err: any) {
      console.error('Error reinvesting:', err);
      alert(err.response?.data?.message || t('errors.reinvestError'));
    }
  };

  if (!isConnected) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-6 text-center">
          <p className="text-yellow-300 text-lg">🔌 {t('dashboard.connectWallet')}</p>
        </div>
      </div>
    );
  }

  if (loading && !user) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-center text-gray-400">
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 sm:p-8 text-center space-y-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">👋 {t('dashboard.welcome')}</h2>
          <p className="text-blue-300 text-base sm:text-lg">
            {t('dashboard.noDeposits')}
          </p>
          <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4">
            <p className="text-gray-400 text-xs sm:text-sm mb-2">{t('dashboard.wallet')}:</p>
            <p className="text-white font-mono text-xs sm:text-sm break-all">{address}</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4 sm:p-6 mt-4">
            <h3 className="text-white font-bold mb-3 text-sm sm:text-base">🚀 {t('dashboard.gettingStarted.title')}</h3>
            <ol className="text-left text-gray-300 space-y-2 text-sm sm:text-base">
              <li>{t('dashboard.gettingStarted.step1')}</li>
              <li>{t('dashboard.gettingStarted.step2')}</li>
              <li>{t('dashboard.gettingStarted.step3')}</li>
              <li>{t('dashboard.gettingStarted.step4')}</li>
              <li>{t('dashboard.gettingStarted.step5')}</li>
            </ol>
          </div>
          <p className="text-xs sm:text-sm text-gray-400 mt-4">
            💡 {t('dashboard.afterFirstDeposit')}
          </p>
        </div>
      </div>
    );
  }

  const activeInvestments = investments.filter((i) => i.status === 'active');
  const unlockedInvestments = investments.filter((i) => i.status === 'unlocked');
  const totalInvested = Number(stats?.totalInvested || 0);
  const totalValue = Number(stats?.totalValue || 0);
  const totalYield = Number(stats?.totalYield || 0);

  // Convert string values to numbers for display
  const userWithNumbers = {
    ...user,
    available_balance: Number(user.available_balance),
    referral_balance: Number(user.referral_balance),
    locked_profits: Number(user.locked_profits),
    total_deposited: Number(user.total_deposited),
    total_referral_earned: Number(user.total_referral_earned),
    total_withdrawn: Number(user.total_withdrawn),
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Wallet Balance */}
      <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 rounded-lg p-6 border border-green-500/30">
        <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
          👛 {t('dashboard.walletBalance')}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Saldo USDT disponibile</p>
            <p className="text-green-400 text-3xl font-bold">
              {usdtBalance && chainId === 56 ? Number(usdtBalance).toFixed(2) : '—'} USDT
            </p>
            {chainId !== 56 && (
              <p className="text-yellow-400 text-xs mt-2">⚠️ Passa a BSC per vedere il saldo USDT</p>
            )}
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">Wallet</p>
            <p className="text-white text-sm font-mono break-all">{address}</p>
            <p className="text-xs text-gray-500 mt-2">
              Network: {chainId === 56 ? '🟢 BSC Mainnet' : chainId === 97 ? '🟡 BSC Testnet' : `⚠️ Chain ${chainId}`}
            </p>
          </div>
        </div>
      </div>

      {/* Global Stats - Total Deposited */}
      {globalStats && (
        <div className="bg-gradient-to-br from-amber-900/30 to-orange-900/30 rounded-lg p-6 border border-amber-500/30">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            🌍 {t('dashboard.globalStats')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">{t('dashboard.totalDepositedAllUsers')}</p>
              <p className="text-amber-400 text-3xl font-bold">
                {Number(globalStats.total_deposits || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USDT
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">{t('dashboard.totalUsers')}</p>
              <p className="text-orange-400 text-3xl font-bold">
                {globalStats.total_users || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Personal Requirements Progress */}
      {requirementsProgress && requirementsProgress.hasActivatedPremium && (
        <div className="bg-gradient-to-br from-indigo-900/30 to-violet-900/30 rounded-lg p-6 border border-indigo-500/30">
          <h2 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
            🎯 {t('dashboard.yourProgress')}
          </h2>
          <div className="bg-gray-800/50 rounded-lg p-3 mb-4">
            <p className="text-xs text-indigo-300">
              Dal tuo attivazione Premium: {requirementsProgress.premiumActivationDate
                ? new Date(requirementsProgress.premiumActivationDate).toLocaleDateString('it-IT')
                : 'N/A'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Deposit Globali dal tuo Premium</p>
              <p className="text-indigo-400 text-2xl font-bold">
                {Number(requirementsProgress.globalDeposits || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} / {requirementsProgress.depositsRequired.toLocaleString()} USDT
              </p>
              <div className="mt-2 bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                  style={{ width: `${Math.min((requirementsProgress.globalDeposits / requirementsProgress.depositsRequired) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((requirementsProgress.globalDeposits / requirementsProgress.depositsRequired) * 100).toFixed(1)}% completato
              </p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">Utenti Premium attivi dopo di te</p>
              <p className="text-violet-400 text-2xl font-bold">
                {requirementsProgress.activePremiumUsers || 0} / {requirementsProgress.premiumUsersRequired}
              </p>
              <div className="mt-2 bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all duration-500"
                  style={{ width: `${Math.min((requirementsProgress.activePremiumUsers / requirementsProgress.premiumUsersRequired) * 100, 100)}%` }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {((requirementsProgress.activePremiumUsers / requirementsProgress.premiumUsersRequired) * 100).toFixed(1)}% completato
              </p>
            </div>
          </div>
          {requirementsProgress.canWithdraw && (
            <div className="mt-4 bg-green-900/30 border border-green-500/40 rounded-lg p-3 text-center">
              <p className="text-green-300 text-sm font-semibold">🎉 {t('dashboard.requirementsMet')}</p>
            </div>
          )}
        </div>
      )}

      {/* User Overview */}
      <div className="bg-gradient-to-br from-blue-900/30 to-purple-900/30 rounded-lg p-6 border border-blue-500/30">
        <h2 className="text-2xl font-bold text-white mb-4">👤 {t('dashboard.myAccount')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">{t('dashboard.availableBalance')}</p>
            <p className="text-white text-2xl font-bold">{userWithNumbers.available_balance.toFixed(2)} USDT</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">{t('dashboard.referralBalance')}</p>
            <p className="text-green-400 text-2xl font-bold">{userWithNumbers.referral_balance.toFixed(2)} USDT</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">{t('dashboard.lockedProfits')}</p>
            <p className="text-purple-400 text-2xl font-bold">{userWithNumbers.locked_profits.toFixed(2)} USDT</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">{t('dashboard.totalDeposited')}</p>
            <p className="text-blue-400 text-xl font-bold">{userWithNumbers.total_deposited.toFixed(2)} USDT</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">{t('dashboard.totalReferralEarned')}</p>
            <p className="text-green-400 text-xl font-bold">{userWithNumbers.total_referral_earned.toFixed(2)} USDT</p>
          </div>
          <div className="bg-gray-800/50 rounded-lg p-4">
            <p className="text-gray-400 text-sm mb-1">{t('dashboard.totalWithdrawn')}</p>
            <p className="text-yellow-400 text-xl font-bold">{userWithNumbers.total_withdrawn.toFixed(2)} USDT</p>
          </div>
        </div>

        {/* Referrals */}
        <div className="mt-4 bg-gray-800/50 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-2">👥 {t('dashboard.referralNetwork')}</h3>
          <div className="grid grid-cols-5 gap-2 text-center">
            <div>
              <p className="text-gray-400 text-xs">{t('dashboard.level')} 1</p>
              <p className="text-white font-bold">{userWithNumbers.direct_referrals}</p>
              {activeReferralCounts && (
                <p className="text-xs mt-1">
                  <span className="text-green-400">✓ {activeReferralCounts.level1Active}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-red-400">✗ {userWithNumbers.direct_referrals - activeReferralCounts.level1Active}</span>
                </p>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-xs">{t('dashboard.level')} 2</p>
              <p className="text-white font-bold">{userWithNumbers.level2_referrals}</p>
              {activeReferralCounts && (
                <p className="text-xs mt-1">
                  <span className="text-green-400">✓ {activeReferralCounts.level2Active}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-red-400">✗ {userWithNumbers.level2_referrals - activeReferralCounts.level2Active}</span>
                </p>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-xs">{t('dashboard.level')} 3</p>
              <p className="text-white font-bold">{userWithNumbers.level3_referrals}</p>
              {activeReferralCounts && (
                <p className="text-xs mt-1">
                  <span className="text-green-400">✓ {activeReferralCounts.level3Active}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-red-400">✗ {userWithNumbers.level3_referrals - activeReferralCounts.level3Active}</span>
                </p>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-xs">{t('dashboard.level')} 4</p>
              <p className="text-white font-bold">{userWithNumbers.level4_referrals}</p>
              {activeReferralCounts && (
                <p className="text-xs mt-1">
                  <span className="text-green-400">✓ {activeReferralCounts.level4Active}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-red-400">✗ {userWithNumbers.level4_referrals - activeReferralCounts.level4Active}</span>
                </p>
              )}
            </div>
            <div>
              <p className="text-gray-400 text-xs">{t('dashboard.level')} 5</p>
              <p className="text-white font-bold">{userWithNumbers.level5_referrals}</p>
              {activeReferralCounts && (
                <p className="text-xs mt-1">
                  <span className="text-green-400">✓ {activeReferralCounts.level5Active}</span>
                  <span className="text-gray-500 mx-1">/</span>
                  <span className="text-red-400">✗ {userWithNumbers.level5_referrals - activeReferralCounts.level5Active}</span>
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Referral Link */}
        <div className="mt-4 bg-gradient-to-r from-green-900/30 to-emerald-900/30 rounded-lg p-4 border border-green-500/30">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            🔗 {t('dashboard.yourReferralLink')}
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              readOnly
              value={`${window.location.origin}?ref=${address}`}
              className="flex-1 bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 text-sm font-mono"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}?ref=${address}`);
                alert(t('dashboard.linkCopied'));
              }}
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg font-bold transition-colors"
            >
              📋 {t('dashboard.copy')}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {t('dashboard.shareLink')}
          </p>
        </div>
      </div>

      {/* Staking Summary */}
      {stats && (
        <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg p-6 border border-purple-500/30">
          <h2 className="text-2xl font-bold text-white mb-4">📊 {t('dashboard.stakingSummary')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">{t('dashboard.totalStaked')}</p>
              <p className="text-blue-400 text-2xl font-bold">{totalInvested.toFixed(2)} USDT</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">{t('dashboard.currentValue')}</p>
              <p className="text-green-400 text-2xl font-bold">{totalValue.toFixed(2)} USDT</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">{t('dashboard.totalYield')}</p>
              <p className="text-purple-400 text-2xl font-bold">{totalYield.toFixed(2)} USDT</p>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-4">
              <p className="text-gray-400 text-sm mb-1">{t('dashboard.activeStakings')}</p>
              <p className="text-white text-2xl font-bold">{activeInvestments.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Staking Form */}
      <InvestmentForm
        user={userWithNumbers}
        onInvestmentCreated={loadUserData}
        stakingEligibility={stats?.stakingEligibility}
      />

      {/* Active Staking */}
      {activeInvestments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-4">💎 {t('dashboard.activeStakings')}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {activeInvestments.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onReinvest={handleReinvest}
              />
            ))}
          </div>
        </div>
      )}

      {/* Unlocked Staking */}
      {unlockedInvestments.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">🔓 {t('dashboard.unlockedStakings')}</h2>
          
          {/* Reinvest Requirements Notice */}
          <div className="bg-yellow-900/20 border border-yellow-500/40 rounded-lg p-3 mb-4">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 text-lg">🎯</span>
              <div className="text-xs text-yellow-200">
                <strong>Requisiti personali per nuovo staking:</strong> Devi aver attivato il Premium. Dal momento della tua attivazione, devono essere raggiunti 10.000 USDT di depositi globali e 100 utenti Premium attivati dopo di te
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {unlockedInvestments.map((investment) => (
              <InvestmentCard
                key={investment.id}
                investment={investment}
                onReinvest={handleReinvest}
              />
            ))}
          </div>
        </div>
      )}

      {/* Withdraw Forms */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <WithdrawForm onSuccess={loadUserData} />
        <ReferralWithdrawForm onSuccess={loadUserData} />
      </div>
    </div>
  );
};
