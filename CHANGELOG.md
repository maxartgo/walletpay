# Changelog - WalletPay

## [1.0.0] - 2024-10-30

### Configurazioni Iniziali

#### Wallet di Ricezione
- ✅ Configurato wallet di ricezione: `0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372`
- ✅ Aggiornato in tutti i file .env e documentazione
- ✅ Aggiunto .gitignore per proteggere i file .env

#### Obiettivi Piattaforma
- ✅ **Goal Depositi Totali**: 10,000 USDT (modificato da 100,000)
- ✅ **Goal Wallet Paganti**: 10,000 wallet unici
- ✅ **Rendimento Giornaliero**: 0.1% al giorno

### File Configurati

#### Environment Variables
- `backend/.env` - Configurazione backend con wallet e goals
- `.env` - Configurazione frontend con wallet
- `backend/.env.example` - Template backend
- `.env.example` - Template frontend

#### Documentazione Creata
1. **START-HERE.md** - Guida principale di avvio rapido
2. **QUICKSTART.md** - Setup completo in 5 minuti
3. **WALLET-INFO.md** - Informazioni dettagliate sul wallet
4. **README.md** - Documentazione completa del progetto
5. **SETUP.md** - Setup dettagliato con troubleshooting
6. **CHANGELOG.md** - Questo file

#### Script Automazione Windows
1. **install.bat** - Installa dipendenze frontend e backend
2. **setup-database.bat** - Crea database PostgreSQL e schema
3. **start-backend.bat** - Avvia server backend
4. **start-frontend.bat** - Avvia applicazione frontend

### Funzionalità Implementate

#### Backend (Node.js + Express + TypeScript + PostgreSQL)
- ✅ API REST complete
  - Endpoints per utenti
  - Endpoints per depositi
  - Endpoints per statistiche
  - Endpoints per referral
  - Endpoints per rendimenti

- ✅ Database Schema
  - Tabella `users` - Gestione utenti
  - Tabella `deposits` - Tracking depositi
  - Tabella `referral_earnings` - Commissioni referral
  - Tabella `daily_yields` - Rendimenti giornalieri
  - Tabella `global_stats` - Statistiche globali

- ✅ Business Logic
  - Sistema referral a 5 livelli (10%, 5%, 3%, 2%, 1%)
  - Calcolo rendimenti giornalieri automatico
  - Tracking depositi in tempo reale
  - Sblocco prelievi al raggiungimento obiettivi

- ✅ Cron Jobs
  - Calcolo rendimenti ogni 24h (00:00)
  - Update automatico statistiche

#### Frontend (React 19 + TypeScript + Vite + TailwindCSS)
- ✅ Wallet Integration
  - Connessione MetaMask/Trust Wallet
  - Switch automatico a BSC
  - Visualizzazione saldi (BNB e USDT)

- ✅ Componenti UI
  - WalletButton - Gestione connessione wallet
  - GlobalStats - Dashboard statistiche globali
  - UserDashboard - Dashboard personale utente
  - DepositForm - Form per depositi USDT

- ✅ Servizi
  - Web3Service - Interazione blockchain
  - APIService - Chiamate backend
  - WalletContext - State management wallet

- ✅ Design
  - UI moderna con TailwindCSS
  - Gradients e animazioni
  - Responsive design
  - Dark theme

### Configurazioni Tecniche

#### Blockchain
- **Network**: BNB Smart Chain (BSC)
- **Chain ID Mainnet**: 56
- **Chain ID Testnet**: 97
- **USDT Contract**: 0x55d398326f99059fF775485246999027B3197955
- **Wallet Destinazione**: 0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372

#### Database
- **Sistema**: PostgreSQL 14+
- **Database Name**: walletpay
- **Tabelle**: 5
- **Indexes**: Ottimizzati per performance

#### Server
- **Backend Port**: 3001
- **Frontend Port**: 5173 (Vite default)
- **API Base**: http://localhost:3001/api

### Obiettivi e Meccaniche

#### Condizioni Sblocco Prelievi
Entrambe le condizioni devono essere soddisfatte:
1. ✅ Depositi totali ≥ 10,000 USDT
2. ✅ Wallet paganti ≥ 10,000

Quando sbloccato:
- ✅ Prelievi attivi
- ✅ Rendimenti giornalieri attivati
- ✅ Calcolo 0.1% giornaliero su tutti i depositi

#### Sistema Referral (5 Livelli)
- **Livello 1**: 10% commissione
- **Livello 2**: 5% commissione
- **Livello 3**: 3% commissione
- **Livello 4**: 2% commissione
- **Livello 5**: 1% commissione

Commissioni pagate immediatamente al deposito.

### Sicurezza e Disclaimer

⚠️ **IMPORTANTE**: Progetto educativo
- Solo per scopi di apprendimento e test
- NON usare con grandi quantità reali
- NON auditato per produzione
- Testare su BSC Testnet prima
- Comprendere rischi crypto

### Link Utili

#### Block Explorers
- **Mainnet**: https://bscscan.com/address/0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372
- **Testnet**: https://testnet.bscscan.com/address/0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372

#### Testnet Resources
- **Faucet BNB**: https://testnet.binance.org/faucet-smart
- **RPC Testnet**: https://data-seed-prebsc-1-s1.binance.org:8545/

### Struttura Progetto

```
walletpay/
├── Documentation/
│   ├── START-HERE.md
│   ├── QUICKSTART.md
│   ├── WALLET-INFO.md
│   ├── README.md
│   ├── SETUP.md
│   └── CHANGELOG.md
│
├── Scripts/
│   ├── install.bat
│   ├── setup-database.bat
│   ├── start-backend.bat
│   └── start-frontend.bat
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── services/
│   │   └── types/
│   └── .env
│
├── Backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── types/
│   └── .env
│
└── Database/
    └── schema.sql
```

### Prossimi Passi per l'Utente

1. ✅ Leggere START-HERE.md
2. ✅ Eseguire install.bat
3. ✅ Configurare PostgreSQL con setup-database.bat
4. ✅ Verificare password DB in backend/.env
5. ✅ Avviare backend con start-backend.bat
6. ✅ Avviare frontend con start-frontend.bat
7. ✅ Accedere a http://localhost:5173
8. ✅ Connettere wallet MetaMask
9. ✅ Testare su BSC Testnet prima

### Supporto e Risorse

**Verifiche Sistema:**
- Health Check: http://localhost:3001/api/health
- Global Stats: http://localhost:3001/api/stats/global

**Debug:**
- Backend logs nel terminal
- Frontend console (F12)
- Database via pgAdmin/psql

**Documentazione Dettagliata:**
Consulta i file markdown nella root del progetto.

---

**Version**: 1.0.0
**Data Rilascio**: 30 Ottobre 2024
**Wallet Configurato**: 0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372
**Obiettivo Depositi**: 10,000 USDT
**Obiettivo Wallet**: 10,000 wallet
