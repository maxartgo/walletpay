# 🚀 START HERE - WalletPay Setup Guide

## ⚡ Quick Links
- 📖 **[QUICKSTART.md](QUICKSTART.md)** - Setup completo passo-passo
- 💰 **[WALLET-INFO.md](WALLET-INFO.md)** - Info sul wallet di ricezione
- 📚 **[README.md](README.md)** - Documentazione completa
- 🛠️ **[SETUP.md](SETUP.md)** - Setup dettagliato con troubleshooting

## ✅ Wallet di Ricezione Configurato

**Indirizzo:** `0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372`

Tutti i depositi USDT verranno inviati a questo wallet su BNB Smart Chain.

## 🎯 Setup in 3 Passi

### Passo 1: Installazione (3 minuti)

Doppio click su: **`install.bat`**

Oppure manualmente:
```bash
npm install
cd backend && npm install && cd ..
```

### Passo 2: Database (2 minuti)

Doppio click su: **`setup-database.bat`**

Oppure manualmente:
```bash
psql -U postgres -c "CREATE DATABASE walletpay;"
psql -U postgres -d walletpay -f database\schema.sql
```

### Passo 3: Avvio (1 minuto)

**Terminal 1:** Doppio click su `start-backend.bat`
**Terminal 2:** Doppio click su `start-frontend.bat`

Oppure manualmente:
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
npm run dev
```

## 🌐 Accesso all'Applicazione

Apri il browser su: **http://localhost:5173**

## 📋 Checklist Prerequisiti

Prima di iniziare, assicurati di avere:

- [ ] Node.js 18+ installato ([Download](https://nodejs.org/))
- [ ] PostgreSQL 14+ installato ([Download](https://www.postgresql.org/download/))
- [ ] MetaMask installato ([Chrome Extension](https://metamask.io/))
- [ ] BNB per gas fees (se usi mainnet)

## 🎮 Primo Utilizzo

1. **Connetti Wallet**
   - Clicca "Connect Wallet"
   - Approva in MetaMask

2. **Switch a BSC**
   - Se richiesto, clicca "Switch to BSC"
   - Approva il cambio rete

3. **Fai un Deposito Test**
   - Inserisci importo USDT
   - Clicca "Deposit USDT"
   - Conferma transazione

## 🧪 Testing Sicuro

### Usa BSC Testnet (Raccomandato per Test)

1. In MetaMask, aggiungi BSC Testnet:
   - Network: `BNB Smart Chain Testnet`
   - RPC: `https://data-seed-prebsc-1-s1.binance.org:8545/`
   - Chain ID: `97`

2. Ottieni BNB testnet: https://testnet.binance.org/faucet-smart

3. In `backend\.env` cambia:
   ```env
   BNB_CHAIN_ID=97
   ```

## 📊 Funzionalità Principali

### ✅ Sistema Depositi
- Deposita USDT su rete BNB
- Transazioni on-chain verificabili
- Tracking in tempo reale

### ✅ Referral a 5 Livelli
- Livello 1: 10%
- Livello 2: 5%
- Livello 3: 3%
- Livello 4: 2%
- Livello 5: 1%

### ✅ Rendimenti Giornalieri
- 0.1% al giorno sui depositi
- Si attiva al raggiungimento obiettivi
- Calcolo automatico ogni 24h

### ✅ Obiettivi da Raggiungere
- 💰 10,000 USDT totali
- 👥 10,000 wallet paganti

## 🆘 Problemi Comuni

### ❌ "Database connection failed"
```bash
# Verifica che PostgreSQL sia in esecuzione
pg_isready

# Se non funziona, avvia il servizio
net start postgresql-x64-15
```

### ❌ "MetaMask not found"
- Installa l'estensione MetaMask
- Ricarica la pagina del browser

### ❌ "Wrong network"
- Clicca "Switch to BSC" nell'applicazione
- Oppure cambia manualmente in MetaMask

### ❌ "Transaction failed"
- Verifica saldo BNB per gas fees
- Verifica saldo USDT
- Assicurati di essere su rete BSC

## 📁 Struttura File Importanti

```
walletpay/
├── 📄 START-HERE.md          ← Stai leggendo questo
├── 📄 QUICKSTART.md          ← Setup dettagliato
├── 📄 WALLET-INFO.md         ← Info wallet ricezione
├── 📄 README.md              ← Documentazione completa
├── 📄 SETUP.md               ← Setup con troubleshooting
│
├── 🔧 install.bat            ← Installa dipendenze
├── 🔧 setup-database.bat     ← Setup database
├── 🔧 start-backend.bat      ← Avvia backend
├── 🔧 start-frontend.bat     ← Avvia frontend
│
├── ⚙️ .env                   ← Config frontend
├── backend/
│   └── ⚙️ .env               ← Config backend
│
├── src/                      ← Codice frontend
├── backend/src/              ← Codice backend
└── database/schema.sql       ← Schema database
```

## 🔐 Sicurezza e Disclaimer

### ⚠️ IMPORTANTE

Questo è un **progetto educativo** per scopi di:
- ✅ Apprendimento DeFi
- ✅ Testing blockchain
- ✅ Sviluppo competenze Web3

**NON è:**
- ❌ Production-ready
- ❌ Auditato per sicurezza
- ❌ Un investment reale
- ❌ Garantito contro perdite

### Prima di Usare Fondi Reali

1. **Testa su testnet** prima
2. **Inizia con piccole quantità**
3. **Comprendi i rischi** delle crypto
4. **Non investire** più di quanto puoi permetterti di perdere
5. **Consulta** esperti legali/finanziari se necessario

## 📞 Supporto

### Verificare lo Stato

**Backend:**
```
http://localhost:3001/api/health
```

**Statistiche:**
```
http://localhost:3001/api/stats/global
```

### Logs e Debug

- **Backend logs:** Guarda il terminal dove hai avviato `start-backend.bat`
- **Frontend logs:** Premi F12 nel browser → Console
- **Database:** Usa pgAdmin o psql

## 🎓 Learning Resources

### Cosa Imparerai

- ✅ Integrazione Web3 con React
- ✅ Smart contract interaction
- ✅ Wallet connection (MetaMask)
- ✅ Blockchain transactions
- ✅ Backend API development
- ✅ Database design per DeFi
- ✅ Real-time data updates
- ✅ Multi-level referral systems

### Tecnologie Utilizzate

**Frontend:**
- React 19 + TypeScript
- ethers.js (Web3)
- TailwindCSS
- Vite

**Backend:**
- Node.js + Express
- PostgreSQL
- TypeScript
- node-cron

## 🚀 Next Steps

1. ✅ Completa il setup seguendo questa guida
2. ✅ Testa su BSC Testnet
3. ✅ Esplora il codice in `src/` e `backend/src/`
4. ✅ Personalizza l'UI e le funzionalità
5. ✅ Leggi la documentazione completa in README.md

## 📬 Wallet Info

**Indirizzo di Ricezione:** `0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372`

**Block Explorer:**
- Mainnet: https://bscscan.com/address/0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372
- Testnet: https://testnet.bscscan.com/address/0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372

---

## ✨ Pronto per Iniziare!

1. Esegui `install.bat`
2. Esegui `setup-database.bat`
3. Esegui `start-backend.bat`
4. Esegui `start-frontend.bat`
5. Apri http://localhost:5173

**Buon apprendimento con WalletPay! 🎓**

---

*Per domande, problemi o approfondimenti, consulta gli altri file di documentazione.*
