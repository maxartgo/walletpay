import { useState } from 'react';
import { useWallet } from '../contexts/WalletContext';
import { useLanguage } from '../contexts/LanguageContext';
import { apiService } from '../services/api';

interface AdminLoginProps {
  onLoginSuccess: () => void;
}

export const AdminLogin = ({ onLoginSuccess }: AdminLoginProps) => {
  const { address, isConnected, connectWallet } = useWallet();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAdminLogin = async () => {
    if (!isConnected || !address) {
      setError(t('errors.connectWallet'));
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await apiService.adminLogin(address);

      if (result.success) {
        // Store admin session in localStorage
        localStorage.setItem('admin_wallet', address);
        onLoginSuccess();
      } else {
        setError(t('admin.noPermission'));
      }
    } catch (err: any) {
      console.error('Admin login error:', err);
      setError(err.response?.data?.error || t('admin.notAuthorized'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-sm rounded-lg p-8 border border-purple-500/30">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-bold text-white mb-2">{t('admin.title')}</h1>
          <p className="text-gray-400">{t('admin.connectPrompt')}</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          {!isConnected ? (
            <button
              onClick={connectWallet}
              className="w-full bg-gradient-to-r from-purple-500 to-blue-600 text-white py-4 rounded-lg font-bold text-lg hover:from-purple-600 hover:to-blue-700 transition-all shadow-lg"
            >
              🔗 {t('common.connect')}
            </button>
          ) : (
            <>
              <div className="bg-gray-700/50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-400 mb-1">{t('admin.connectedWallet')}:</p>
                <p className="text-white font-mono text-sm break-all">{address}</p>
              </div>

              <button
                onClick={handleAdminLogin}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-4 rounded-lg font-bold text-lg hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
              >
                {loading ? `⏳ ${t('admin.verifying')}` : `✅ ${t('admin.loginButton')}`}
              </button>
            </>
          )}
        </div>

        <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
          <p className="text-xs text-yellow-300">
            ⚠️ {t('admin.warning')}
          </p>
        </div>
      </div>
    </div>
  );
};
