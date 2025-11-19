import { useEffect, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const GlobalStats = () => {
  const { t } = useLanguage();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:3001/api/stats/global');
      const data = await response.json();

      setStats(data.stats);
      setLoading(false);
    } catch (err: any) {
      console.error('Error loading stats:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="card">
        <p className="text-center">{t('common.loadingStats')} ⏳</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card bg-red-900/20 border-red-600">
        <p className="text-red-400">{t('errors.statsError')}: {error}</p>
        <button onClick={loadStats} className="btn-primary mt-4">
          {t('common.retry')}
        </button>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="card">
        <p>{t('common.noStats')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat-card">
          <div className="stat-value">
            ${stats.total_deposits?.toLocaleString() || '0'}
          </div>
          <div className="stat-label">{t('stats.totalDeposits')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.paying_users || 0}</div>
          <div className="stat-label">{t('stats.payingWallets')}</div>
        </div>

        <div className="stat-card">
          <div className="stat-value">{stats.total_users || 0}</div>
          <div className="stat-label">{t('stats.totalUsers')}</div>
        </div>

        <div className="stat-card">
          <div className={`text-3xl font-bold ${stats.withdrawals_unlocked ? 'text-green-500' : 'text-yellow-500'}`}>
            {stats.withdrawals_unlocked ? `🔓 ${t('stats.unlocked')}` : `🔒 ${t('stats.locked')}`}
          </div>
          <div className="stat-label">{t('stats.withdrawalsStatus')}</div>
        </div>
      </div>
    </div>
  );
};
