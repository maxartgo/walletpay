import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../contexts/AdminContext';

interface Withdrawal {
  id: number;
  wallet_address: string;
  amount: string;
  type: string;
  status: string;
  created_at: string;
  admin_note?: string;
  processed_by_username?: string;
  processed_at?: string;
  user_balance?: number;
  user_total_deposited?: number;
  user_is_veteran?: boolean;
  user_withdrawal_count?: number;
}

interface Stats {
  pending_count: string;
  completed_count: string;
  rejected_count: string;
  pending_amount: string;
  completed_amount: string;
  rejected_amount: string;
}

export const AdminDashboard = () => {
  const { admin, token, logout, isAuthenticated } = useAdmin();
  const navigate = useNavigate();
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'rejected'>('pending');
  const [processingId, setProcessingId] = useState<number | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [expandedRow, setExpandedRow] = useState<number | null>(null);
  const [userDetails, setUserDetails] = useState<{[key: string]: any}>({});

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin/login');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [filter, isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load stats
      const statsRes = await fetch('http://localhost:3001/api/admin/stats', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Load withdrawals
      const endpoint = filter === 'all'
        ? 'http://localhost:3001/api/admin/withdrawals'
        : filter === 'pending'
        ? 'http://localhost:3001/api/admin/withdrawals/pending'
        : `http://localhost:3001/api/admin/withdrawals?status=${filter}`;

      const withdrawalsRes = await fetch(endpoint, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const withdrawalsData = await withdrawalsRes.json();
      if (withdrawalsData.success) {
        setWithdrawals(withdrawalsData.withdrawals);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserDetails = async (walletAddress: string) => {
    if (userDetails[walletAddress]) {
      return; // Already loaded
    }

    try {
      const response = await fetch(`http://localhost:3001/api/users/${walletAddress}`);
      const data = await response.json();

      if (data.user) {
        // Load user's withdrawal history
        const withdrawalsRes = await fetch(`http://localhost:3001/api/withdrawals/${walletAddress}`);
        const withdrawalsData = await withdrawalsRes.json();

        setUserDetails(prev => ({
          ...prev,
          [walletAddress]: {
            ...data.user,
            withdrawalHistory: withdrawalsData.withdrawals || []
          }
        }));
      }
    } catch (error) {
      console.error('Error loading user details:', error);
    }
  };

  const toggleRow = async (withdrawalId: number, walletAddress: string) => {
    if (expandedRow === withdrawalId) {
      setExpandedRow(null);
    } else {
      setExpandedRow(withdrawalId);
      await loadUserDetails(walletAddress);
    }
  };

  const handleApprove = async (id: number) => {
    if (!confirm('Are you sure you want to approve this withdrawal?')) return;

    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:3001/api/admin/withdrawals/${id}/approve`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note: 'Approved by admin' }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Withdrawal approved successfully!');
        loadData();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: number) => {
    const note = prompt('Enter rejection reason:');
    if (!note) return;

    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:3001/api/admin/withdrawals/${id}/reject`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ note }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Withdrawal rejected! Refunded ${data.refundedAmount.toFixed(2)} USDT`);
        loadData();
      } else {
        throw new Error(data.error);
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setProcessingId(null);
    }
  };

  const handleLogout = () => {
    if (confirm('Are you sure you want to logout?')) {
      logout();
      navigate('/admin/login');
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');

    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      setPasswordError('All fields are required');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/change-password', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to change password');
      }

      alert('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      setPasswordError(error.message || 'Failed to change password');
    }
  };

  if (loading && !stats) {
    return (
      <div className="min-h-screen bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-dark-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900/20 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="card flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-dark-400 mt-1">Welcome back, {admin?.username}!</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowPasswordModal(true)}
              className="px-4 py-2 bg-dark-700 hover:bg-dark-600 rounded-lg transition-colors"
            >
              Change Password
            </button>
            <button
              onClick={handleLogout}
              className="btn-secondary"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="card bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-600/50">
              <div className="text-sm text-dark-400 mb-1">Pending Withdrawals</div>
              <div className="text-3xl font-bold text-yellow-400">{stats.pending_count}</div>
              <div className="text-sm text-dark-400 mt-1">
                Total: ${parseFloat(stats.pending_amount).toFixed(2)} USDT
              </div>
            </div>

            <div className="card bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-600/50">
              <div className="text-sm text-dark-400 mb-1">Completed Withdrawals</div>
              <div className="text-3xl font-bold text-green-400">{stats.completed_count}</div>
              <div className="text-sm text-dark-400 mt-1">
                Total: ${parseFloat(stats.completed_amount).toFixed(2)} USDT
              </div>
            </div>

            <div className="card bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-600/50">
              <div className="text-sm text-dark-400 mb-1">Rejected Withdrawals</div>
              <div className="text-3xl font-bold text-red-400">{stats.rejected_count}</div>
              <div className="text-sm text-dark-400 mt-1">
                Total: ${parseFloat(stats.rejected_amount).toFixed(2)} USDT
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card">
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              Pending
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              Completed
            </button>
            <button
              onClick={() => setFilter('rejected')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              Rejected
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filter === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'bg-dark-700 text-dark-300 hover:bg-dark-600'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Withdrawals Table */}
        <div className="card overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0">
          <h3 className="text-xl font-bold mb-4">
            {filter === 'all' ? 'All' : filter.charAt(0).toUpperCase() + filter.slice(1)} Withdrawals
          </h3>

          {loading ? (
            <div className="text-center py-8 text-dark-400">Loading...</div>
          ) : withdrawals.length === 0 ? (
            <div className="text-center py-8 text-dark-400">No withdrawals found</div>
          ) : (
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="text-left border-b border-dark-700">
                  <th className="pb-3 text-dark-400 font-medium">Details</th>
                  <th className="pb-3 text-dark-400 font-medium">ID</th>
                  <th className="pb-3 text-dark-400 font-medium">Wallet</th>
                  <th className="pb-3 text-dark-400 font-medium">Amount</th>
                  <th className="pb-3 text-dark-400 font-medium">Type</th>
                  <th className="pb-3 text-dark-400 font-medium">Status</th>
                  <th className="pb-3 text-dark-400 font-medium">Date</th>
                  <th className="pb-3 text-dark-400 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {withdrawals.map((w) => {
                  const details = userDetails[w.wallet_address];
                  const isExpanded = expandedRow === w.id;

                  return (
                    <>
                      <tr key={w.id} className="border-b border-dark-800 hover:bg-dark-800/50">
                        <td className="py-4">
                          <button
                            onClick={() => toggleRow(w.id, w.wallet_address)}
                            className="text-primary-400 hover:text-primary-300 text-sm"
                          >
                            {isExpanded ? '▼' : '▶'}
                          </button>
                        </td>
                        <td className="py-4 text-dark-300">#{w.id}</td>
                        <td className="py-4 font-mono text-sm text-primary-400">
                          {w.wallet_address.substring(0, 10)}...
                          {details && details.is_veteran && (
                            <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-900/50 text-purple-300 rounded">VET</span>
                          )}
                        </td>
                        <td className="py-4 text-green-400 font-semibold">
                          ${parseFloat(w.amount).toFixed(2)}
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            w.type === 'referral'
                              ? 'bg-purple-900/50 text-purple-300'
                              : 'bg-blue-900/50 text-blue-300'
                          }`}>
                            {w.type}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded text-xs ${
                            w.status === 'pending'
                              ? 'bg-yellow-900/50 text-yellow-300'
                              : w.status === 'completed'
                              ? 'bg-green-900/50 text-green-300'
                              : 'bg-red-900/50 text-red-300'
                          }`}>
                            {w.status}
                          </span>
                        </td>
                        <td className="py-4 text-dark-400 text-sm">
                          {new Date(w.created_at).toLocaleString()}
                        </td>
                        <td className="py-4">
                          {w.status === 'pending' ? (
                            <div className="flex gap-2 flex-wrap">
                              <button
                                onClick={() => handleApprove(w.id)}
                                disabled={processingId === w.id}
                                className="px-3 py-1.5 sm:py-1 bg-green-600 hover:bg-green-700 rounded text-sm disabled:opacity-50 min-w-[70px] touch-manipulation"
                              >
                                {processingId === w.id ? '...' : 'Approve'}
                              </button>
                              <button
                                onClick={() => handleReject(w.id)}
                                disabled={processingId === w.id}
                                className="px-3 py-1.5 sm:py-1 bg-red-600 hover:bg-red-700 rounded text-sm disabled:opacity-50 min-w-[70px] touch-manipulation"
                              >
                                {processingId === w.id ? '...' : 'Reject'}
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs text-dark-500">
                              {w.processed_by_username && `By ${w.processed_by_username}`}
                              {w.admin_note && <div className="mt-1">Note: {w.admin_note}</div>}
                            </div>
                          )}
                        </td>
                      </tr>

                      {/* Expanded Row with User Details */}
                      {isExpanded && details && (
                        <tr className="bg-dark-800/30">
                          <td colSpan={8} className="py-4 px-4 sm:px-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                              {/* User Balance Info */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-primary-400 mb-2">💰 Balance Info</h4>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Total Deposited:</span>
                                    <span className="text-green-400 font-semibold">${details.total_deposited?.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Withdrawable Balance:</span>
                                    <span className="text-yellow-400 font-semibold">${details.withdrawable_balance?.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Total Yield Earned:</span>
                                    <span className="text-blue-400 font-semibold">${details.total_yield_earned?.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Total Referral Earned:</span>
                                    <span className="text-purple-400 font-semibold">${details.total_referral_earned?.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* User Status */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-primary-400 mb-2">👤 User Status</h4>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Account Type:</span>
                                    <span className={details.is_veteran ? 'text-purple-400 font-semibold' : 'text-yellow-400 font-semibold'}>
                                      {details.is_veteran ? '👑 Veteran' : '🆕 New User'}
                                    </span>
                                  </div>
                                  {details.first_cycle_completed && (
                                    <div className="flex justify-between">
                                      <span className="text-dark-400">First Cycle Completed:</span>
                                      <span className="text-green-400 font-semibold">Cycle #{details.first_cycle_completed}</span>
                                    </div>
                                  )}
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Member Since:</span>
                                    <span className="text-dark-300">{new Date(details.created_at).toLocaleDateString()}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Withdrawal History */}
                              <div className="space-y-2">
                                <h4 className="font-semibold text-primary-400 mb-2">📋 Withdrawal History</h4>
                                <div className="text-sm space-y-1">
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Total Withdrawals:</span>
                                    <span className="text-white font-semibold">{details.withdrawalHistory?.length || 0}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Completed:</span>
                                    <span className="text-green-400 font-semibold">
                                      {details.withdrawalHistory?.filter((wh: any) => wh.status === 'completed').length || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Pending:</span>
                                    <span className="text-yellow-400 font-semibold">
                                      {details.withdrawalHistory?.filter((wh: any) => wh.status === 'pending').length || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-dark-400">Rejected:</span>
                                    <span className="text-red-400 font-semibold">
                                      {details.withdrawalHistory?.filter((wh: any) => wh.status === 'rejected').length || 0}
                                    </span>
                                  </div>
                                  <div className="flex justify-between pt-1 border-t border-dark-700">
                                    <span className="text-dark-400">Total Withdrawn:</span>
                                    <span className="text-green-400 font-semibold">
                                      ${details.withdrawalHistory
                                        ?.filter((wh: any) => wh.status === 'completed')
                                        .reduce((sum: number, wh: any) => sum + parseFloat(wh.amount), 0)
                                        .toFixed(2) || '0.00'}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPasswordModal(false)}>
            <div className="card max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">Change Password</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter current password"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="input-field"
                    placeholder="Enter new password (min 6 characters)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark-300 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="input-field"
                    placeholder="Confirm new password"
                  />
                </div>

                {passwordError && (
                  <div className="bg-red-900/50 border border-red-500 rounded-lg p-3 text-red-200 text-sm">
                    {passwordError}
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={handleChangePassword}
                    className="btn-primary flex-1"
                  >
                    Change Password
                  </button>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                      setPasswordError('');
                    }}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
