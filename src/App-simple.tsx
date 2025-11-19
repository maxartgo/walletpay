function App() {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '20px' }}>
          💰 WalletPay
        </h1>
        <p style={{ fontSize: '1.5rem', marginBottom: '30px' }}>
          Educational DeFi Platform
        </p>
        <div style={{
          background: 'rgba(255,255,255,0.1)',
          padding: '20px',
          borderRadius: '10px',
          marginTop: '20px'
        }}>
          <p>✅ React is working!</p>
          <p>✅ Vite is working!</p>
          <p>⚠️ Components loading issue - debugging...</p>
        </div>
      </div>
    </div>
  );
}

export default App;
