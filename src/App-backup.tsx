import { useState } from 'react';
import { WalletProvider } from './contexts/WalletContext';
import { WalletButton } from './components/WalletButton';
import { GlobalStats } from './components/GlobalStats';
import { UserDashboard } from './components/UserDashboard';
import { DepositForm } from './components/DepositForm';

// IMPORTANT: Replace with your actual destination wallet address
const DESTINATION_WALLET = import.meta.env.VITE_DESTINATION_WALLET || '0x0000000000000000000000000000000000000000';

function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleDepositSuccess = () => {
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <WalletProvider>
      <div className="min-h-screen">
        {/* Header */}
        <header className="border-b border-dark-700 bg-dark-900/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center text-2xl">
                  💰
                </div>
                <div>
                  <h1 className="text-2xl font-bold gradient-text">WalletPay</h1>
                  <p className="text-xs text-dark-400">Educational DeFi Platform</p>
                </div>
              </div>
              <WalletButton />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12">
              <h2 className="text-5xl font-bold mb-4">
                <span className="gradient-text">Decentralized</span> Savings Platform
              </h2>
              <p className="text-xl text-dark-300 max-w-2xl mx-auto">
                Deposit USDT, earn daily yields, and get rewarded for referrals.
                Built on BNB Smart Chain for educational purposes.
              </p>
            </div>

            {/* Global Stats */}
            <div key={refreshKey}>
              <GlobalStats />
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - User Dashboard */}
              <div key={`dashboard-${refreshKey}`}>
                <UserDashboard />
              </div>

              {/* Right Column - Deposit Form */}
              <div>
                <DepositForm
                  destinationWallet={DESTINATION_WALLET}
                  onSuccess={handleDepositSuccess}
                />
              </div>
            </div>

            {/* Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="card-hover text-center">
                <div className="text-4xl mb-3">🔒</div>
                <h3 className="text-lg font-bold mb-2">Secure Deposits</h3>
                <p className="text-dark-400 text-sm">
                  All transactions are on-chain and transparent on BNB Smart Chain
                </p>
              </div>

              <div className="card-hover text-center">
                <div className="text-4xl mb-3">💎</div>
                <h3 className="text-lg font-bold mb-2">Daily Yields</h3>
                <p className="text-dark-400 text-sm">
                  Earn 0.1% daily on your deposits once goals are reached
                </p>
              </div>

              <div className="card-hover text-center">
                <div className="text-4xl mb-3">🤝</div>
                <h3 className="text-lg font-bold mb-2">5-Level Referrals</h3>
                <p className="text-dark-400 text-sm">
                  Earn commissions on 5 levels: 10%, 5%, 3%, 2%, 1%
                </p>
              </div>
            </div>

            {/* Disclaimer */}
            <div className="card bg-yellow-900/20 border-yellow-600/50">
              <div className="flex gap-3">
                <div className="text-2xl">⚠️</div>
                <div>
                  <h3 className="font-bold text-yellow-400 mb-2">Educational Purpose Only</h3>
                  <p className="text-sm text-dark-300">
                    This platform is designed for educational and testing purposes only.
                    It demonstrates blockchain integration, smart contract interaction, and DeFi concepts.
                    Do not use with real funds or for production purposes without proper audits and legal consultation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-dark-700 mt-16 py-8">
          <div className="container mx-auto px-4 text-center text-dark-400 text-sm">
            <p>WalletPay - Educational DeFi Platform</p>
            <p className="mt-2">Built with React, TypeScript, ethers.js, and BNB Smart Chain</p>
          </div>
        </footer>
      </div>
    </WalletProvider>
  );
}

export default App;
