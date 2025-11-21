import { WalletButton } from './components/WalletButton';
import { UserDashboard } from './components/UserDashboard';
import { DepositForm } from './components/DepositForm';
import { LanguageSelector } from './components/LanguageSelector';
import { useWallet } from './contexts/WalletContext';
import { useLanguage } from './contexts/LanguageContext';

const DESTINATION_WALLET = '0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372';

function App() {
  const { isConnected } = useWallet();
  const { t } = useLanguage();

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between gap-2">
            {/* Logo and Title */}
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink min-w-0">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0">
                💰
              </div>
              <div className="min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold gradient-text truncate">{t('header.title')}</h1>
                <p className="text-xs text-dark-400 hidden sm:block">{t('header.subtitle')}</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
              <LanguageSelector />
              <WalletButton />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Hero Section */}
          <div className="text-center py-8 sm:py-12 px-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              <span className="gradient-text">{t('hero.title')}</span>
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-dark-300 max-w-2xl mx-auto">
              {t('hero.subtitle')}
            </p>
          </div>

          {/* User Dashboard - Only shown when wallet connected */}
          {isConnected && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <UserDashboard />
              </div>
              <div>
                <DepositForm
                  destinationWallet={DESTINATION_WALLET}
                  onSuccess={() => window.location.reload()}
                />
              </div>
            </div>
          )}

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="card-hover text-center">
              <div className="text-4xl mb-3">🔒</div>
              <h3 className="text-lg font-bold mb-2">{t('features.secureDeposits.title')}</h3>
              <p className="text-dark-400 text-sm">
                {t('features.secureDeposits.description')}
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="text-4xl mb-3">💎</div>
              <h3 className="text-lg font-bold mb-2">{t('features.dailyYields.title')}</h3>
              <p className="text-dark-400 text-sm">
                {t('features.dailyYields.description')}
              </p>
            </div>

            <div className="card-hover text-center">
              <div className="text-4xl mb-3">🤝</div>
              <h3 className="text-lg font-bold mb-2">{t('features.referrals.title')}</h3>
              <p className="text-dark-400 text-sm">
                {t('features.referrals.description')}
              </p>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="card bg-yellow-900/20 border-yellow-600/50">
            <div className="flex gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <h3 className="font-bold text-yellow-400 mb-2">{t('disclaimer.title')}</h3>
                <p className="text-sm text-dark-300">
                  {t('disclaimer.description')}
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-dark-700 mt-16 py-8">
        <div className="container mx-auto px-4 text-center text-dark-400 text-sm">
          <p>{t('footer.title')}</p>
          <p className="mt-2">{t('footer.built')}</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
