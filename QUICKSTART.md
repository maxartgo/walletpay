# Quick Start - WalletPay

## Wallet di Ricezione Configurato
✅ **Indirizzo:** `0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372`

Tutti i depositi USDT verranno inviati a questo indirizzo sulla rete BNB Smart Chain.

## Setup Rapido (5 minuti)

### 1. Installa Dipendenze

```bash
# Frontend
npm install

# Backend
cd backend
npm install
cd ..
```

### 2. Setup Database PostgreSQL

**Opzione A - Usando psql (Command Prompt come Administrator):**
```bash
psql -U postgres -c "CREATE DATABASE walletpay;"
psql -U postgres -d walletpay -f database\schema.sql
```

**Opzione B - Usando pgAdmin:**
1. Apri pgAdmin
2. Connettiti al server PostgreSQL
3. Click destro su "Databases" → Create → Database
4. Nome: `walletpay`
5. Click destro su `walletpay` → Query Tool
6. Apri e esegui il file `database\schema.sql`

### 3. Configura Password PostgreSQL

Modifica `backend\.env` se la tua password di PostgreSQL è diversa da "postgres":

```env
DB_PASSWORD=la_tua_password_postgres
```

### 4. Avvia l'Applicazione

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

Dovresti vedere:
```
✓ Database connected successfully
🚀 WalletPay Backend Server
📡 Server running on port 3001
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

Dovresti vedere:
```
VITE ready
➜  Local:   http://localhost:5173/
```

### 5. Apri nel Browser

Vai su: **http://localhost:5173**

### 6. Collega il Wallet

1. Clicca "Connect Wallet"
2. Seleziona MetaMask
3. Approva la connessione
4. Se necessario, clicca "Switch to BSC" per passare alla rete BNB Smart Chain

## Test dell'Applicazione

### Per Testare su BSC Testnet (Consigliato)

1. **Aggiungi BSC Testnet a MetaMask:**
   - Network Name: `BNB Smart Chain Testnet`
   - RPC URL: `https://data-seed-prebsc-1-s1.binance.org:8545/`
   - Chain ID: `97`
   - Currency Symbol: `BNB`
   - Block Explorer: `https://testnet.bscscan.com`

2. **Ottieni BNB di test:**
   - Vai su: https://testnet.binance.org/faucet-smart
   - Inserisci il tuo wallet address
   - Richiedi BNB testnet

3. **Modifica configurazione per testnet:**

   In `backend\.env`:
   ```env
   BNB_CHAIN_ID=97
   ```

### Per Usare su BSC Mainnet (Fondi Reali)

⚠️ **ATTENZIONE**: Usa solo per scopi educativi con piccole quantità!

La configurazione attuale è già impostata per BSC Mainnet (Chain ID: 56).

## Verifica Funzionamento

### 1. Backend Health Check
Apri: http://localhost:3001/api/health

Dovresti vedere:
```json
{"status":"ok","timestamp":"2024-..."}
```

### 2. Global Stats
Apri: http://localhost:3001/api/stats/global

Dovresti vedere statistiche con valori iniziali a 0.

### 3. Frontend
- Dashboard dovrebbe mostrare statistiche globali
- "Connect Wallet" dovrebbe funzionare
- Dopo connessione, dovresti vedere il tuo saldo

## Funzionalità Disponibili

### ✅ Connessione Wallet
- MetaMask
- Trust Wallet
- Altri wallet compatibili Web3

### ✅ Depositi
- Inserisci l'importo in USDT
- Opzionale: inserisci indirizzo referrer
- Clicca "Deposit USDT"
- Conferma la transazione in MetaMask

### ✅ Sistema Referral
- Condividi il tuo wallet address
- Guadagni commissioni su 5 livelli:
  - Livello 1: 10%
  - Livello 2: 5%
  - Livello 3: 3%
  - Livello 4: 2%
  - Livello 5: 1%

### ✅ Rendimenti Giornalieri
- Si sbloccano al raggiungimento degli obiettivi:
  - 100,000 USDT di depositi totali
  - 10,000 wallet paganti
- Rendimento: 0.1% giornaliero
- Calcolo automatico ogni giorno alle 00:00

## Obiettivi da Raggiungere

### Goal 1: Depositi Totali
- **Target:** 10,000 USDT
- **Progresso:** Visualizzato nella dashboard globale

### Goal 2: Wallet Paganti
- **Target:** 10,000 wallet unici che hanno depositato
- **Progresso:** Visualizzato nella dashboard globale

### Sblocco Prelievi
Quando entrambi gli obiettivi sono raggiunti:
- ✅ I prelievi vengono sbloccati
- ✅ Inizia il calcolo dei rendimenti giornalieri
- ✅ Gli utenti possono prelevare il loro saldo

## Wallet di Ricezione

**Indirizzo:** `0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372`

Questo wallet riceverà:
- Tutti i depositi USDT
- Su rete BNB Smart Chain (BSC)

Puoi verificare le transazioni su:
- **Mainnet:** https://bscscan.com/address/0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372
- **Testnet:** https://testnet.bscscan.com/address/0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372

## Struttura Dashboard

### Dashboard Globale
- Depositi totali
- Wallet paganti
- Utenti totali
- Stato prelievi (locked/unlocked)
- Progress bar verso gli obiettivi

### Dashboard Personale
- Saldo USDT del wallet
- Totale depositato
- Saldo prelevabile
- Guadagni da referral
- Guadagni da rendimenti
- Numero referral per livello
- Link referral personale

## Problemi Comuni

### ❌ "MetaMask not found"
- Installa l'estensione MetaMask
- Ricarica la pagina

### ❌ "Wrong network"
- Clicca "Switch to BSC"
- Oppure cambia manualmente la rete in MetaMask

### ❌ "Transaction failed"
- Verifica di avere abbastanza BNB per il gas
- Verifica di avere abbastanza USDT
- Controlla di essere sulla rete corretta

### ❌ "Database connection failed"
- Verifica che PostgreSQL sia in esecuzione
- Controlla la password in `backend\.env`
- Verifica che il database `walletpay` esista

## Contatti e Support

Per problemi o domande:
1. Controlla i log del backend nel terminal
2. Controlla la console del browser (F12)
3. Verifica la configurazione in `.env`

---

## ⚠️ DISCLAIMER

**Questo è un progetto educativo per scopi di testing e apprendimento.**

- NON usare con grandi quantità di denaro reale
- NON considerare questa piattaforma come investment
- Testa prima su BSC Testnet
- Comprendi i rischi delle criptovalute
- Questo codice NON è stato auditato per la produzione

---

✅ **Sei pronto! Buon testing con WalletPay!**
