import { useState, useEffect } from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';

export const AdminDashboard = () => {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'users'>('withdrawals');
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState<string>('pending');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  useEffect(() => {
    loadData();
  }, [activeTab, filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'withdrawals') {
        const data = await apiService.adminGetWithdrawals(filter === 'all' ? undefined : filter);
        setWithdrawals(data.withdrawals);
      } else {
        const data = await apiService.adminGetUsers();
        setUsers(data.users);
      }

      const statsData = await apiService.adminGetStats();
      setStats(statsData.stats);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (withdrawalId: number) => {
    const txHash = prompt(t('admin.enterTxHash'));
    if (!txHash || !txHash.startsWith('0x')) {
      alert(t('admin.invalidTxHash'));
      return;
    }

    setActionLoading(withdrawalId);
    try {
      await apiService.adminApproveWithdrawal(withdrawalId, txHash);
      alert(t('admin.approveSuccess'));
      loadData();
    } catch (error: any) {
      alert('❌ ' + t('common.error') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (withdrawalId: number) => {
    if (!confirm(t('admin.confirmReject'))) {
      return;
    }

    setActionLoading(withdrawalId);
    try {
      await apiService.adminRejectWithdrawal(withdrawalId);
      alert(t('admin.rejectSuccess'));
      loadData();
    } catch (error: any) {
      alert('❌ ' + t('common.error') + ': ' + (error.response?.data?.error || error.message));
    } finally {
      setActionLoading(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_wallet');
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-purple-500/30 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🔐</div>
              <div>
                <h1 className="text-2xl font-bold text-white">{t('admin.title')}</h1>
                <p className="text-xs text-purple-400">{t('admin.management')}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-lg hover:bg-red-500/30 transition-colors"
            >
              🚪 {t('admin.logout')}
            </button>
          </div>
        </div>
      </header>

      {/* Stats Overview */}
      {stats && (
        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-4 border border-purple-500/30">
              <p className="text-gray-400 text-sm mb-1">{t('admin.stats.totalUsers')}</p>
              <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-900/30 rounded-lg p-4 border border-blue-500/30">
              <p className="text-gray-400 text-sm mb-1">{t('admin.stats.pendingWithdrawals')}</p>
              <p className="text-3xl font-bold text-blue-400">{stats.withdrawals.pending_count}</p>
            </div>
            <div className="bg-green-900/30 rounded-lg p-4 border border-green-500/30">
              <p className="text-gray-400 text-sm mb-1">{t('admin.stats.completedWithdrawals')}</p>
              <p className="text-3xl font-bold text-green-400">{stats.withdrawals.completed_count}</p>
            </div>
            <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
              <p className="text-gray-400 text-sm mb-1">{t('admin.stats.taxCollected')}</p>
              <p className="text-3xl font-bold text-purple-400">{Number(stats.withdrawals.total_tax).toFixed(2)} USDT</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex gap-2 bg-gray-800/50 rounded-lg p-1 border border-purple-500/30 inline-flex">
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'withdrawals'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            💸 {t('admin.tabs.withdrawals')}
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-purple-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            👥 {t('admin.tabs.users')}
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 pb-8">
        {activeTab === 'withdrawals' && (
          <div>
            {/* Filter */}
            <div className="mb-4 flex gap-2">
              {['pending', 'completed', 'rejected', 'all'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                    filter === f
                      ? 'bg-purple-500 text-white'
                      : 'bg-gray-800/50 text-gray-400 hover:text-white border border-gray-700'
                  }`}
                >
                  {f === 'pending' && `⏳ ${t('admin.filter.pending')}`}
                  {f === 'completed' && `✅ ${t('admin.filter.completed')}`}
                  {f === 'rejected' && `❌ ${t('admin.filter.rejected')}`}
                  {f === 'all' && `📋 ${t('admin.filter.all')}`}
                </button>
              ))}
            </div>

            {/* Withdrawals List */}
            <div className="space-y-4">
              {loading ? (
                <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-purple-500/30">
                  <p className="text-gray-400">{t('common.loading')}</p>
                </div>
              ) : withdrawals.length === 0 ? (
                <div className="bg-gray-800/50 rounded-lg p-8 text-center border border-purple-500/30">
                  <p className="text-gray-400">{t('admin.noWithdrawals')}</p>
                </div>
              ) : (
                withdrawals.map((w) => (
                  <div
                    key={w.id}
                    className="bg-gray-800/50 rounded-lg p-6 border border-purple-500/30"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-white font-bold text-lg">{t('admin.withdrawal')} #{w.id}</h3>
                        <p className="text-sm text-gray-400 font-mono">{w.wallet_address}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(w.created_at).toLocaleString()}
                        </p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          w.status === 'pending'
                            ? 'bg-blue-500/20 text-blue-400'
                            : w.status === 'completed'
                            ? 'bg-green-500/20 text-green-400'
                            : w.status === 'rejected'
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-gray-500/20 text-gray-400'
                        }`}
                      >
                        {w.status === 'pending' && `⏳ ${t('admin.filter.pending')}`}
                        {w.status === 'completed' && `✅ ${t('admin.status.completed')}`}
                        {w.status === 'rejected' && `❌ ${t('admin.status.rejected')}`}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-400">{t('withdrawal.grossAmount')}</p>
                        <p className="text-white font-medium">{Number(w.gross_amount).toFixed(2)} USDT</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t('withdrawal.tax')}</p>
                        <p className="text-yellow-400 font-medium">-{Number(w.tax_amount).toFixed(2)} USDT</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">{t('withdrawal.youReceive')}</p>
                        <p className="text-green-400 font-bold">{Number(w.net_amount).toFixed(2)} USDT</p>
                      </div>
                    </div>

                    {w.tx_hash && (
                      <div className="mb-4">
                        <p className="text-xs text-gray-400 mb-1">TX Hash:</p>
                        <p className="text-xs text-purple-400 font-mono break-all">{w.tx_hash}</p>
                      </div>
                    )}

                    {w.status === 'pending' && (
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleApprove(w.id)}
                          disabled={actionLoading === w.id}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading === w.id ? '⏳' : '✅'} {t('admin.approve')}
                        </button>
                        <button
                          onClick={() => handleReject(w.id)}
                          disabled={actionLoading === w.id}
                          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {actionLoading === w.id ? '⏳' : '❌'} {t('admin.reject')}
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-gray-800/50 rounded-lg border border-purple-500/30 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-purple-900/30">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase">{t('dashboard.wallet')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{t('dashboard.totalDeposited')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{t('dashboard.availableBalance')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{t('dashboard.referralBalance')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{t('dashboard.totalWithdrawn')}</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-400 uppercase">{t('admin.referrals')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        {t('common.loading')}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                        {t('admin.noUsers')}
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr key={user.id} className="hover:bg-gray-700/30">
                        <td className="px-4 py-3">
                          <p className="text-white font-mono text-sm">{user.wallet_address}</p>
                          <p className="text-xs text-gray-500">{new Date(user.created_at).toLocaleDateString()}</p>
                        </td>
                        <td className="px-4 py-3 text-right text-white">{Number(user.total_deposited).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-green-400">{Number(user.available_balance).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-purple-400">{Number(user.referral_balance).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-blue-400">{Number(user.total_withdrawn).toFixed(2)}</td>
                        <td className="px-4 py-3 text-right text-yellow-400">{user.direct_referrals}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
