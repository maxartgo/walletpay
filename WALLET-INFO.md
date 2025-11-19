# Informazioni Wallet di Ricezione

## 📍 Wallet Configurato

**Indirizzo:** `0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372`

Questo wallet è stato configurato come destinatario per tutti i depositi USDT effettuati tramite l'applicazione WalletPay.

## 🔗 Links Blockchain

### BNB Smart Chain Mainnet
- **Block Explorer:** https://bscscan.com/address/0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372
- **Chain ID:** 56
- **Network:** BNB Smart Chain

### BNB Smart Chain Testnet (per test)
- **Block Explorer:** https://testnet.bscscan.com/address/0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372
- **Chain ID:** 97
- **Network:** BNB Testnet

## 📊 Cosa Riceverà Questo Wallet

### Depositi Diretti
Tutti i depositi USDT effettuati dagli utenti verranno inviati direttamente a questo indirizzo tramite transazioni on-chain sulla rete BNB Smart Chain.

### Token Ricevuti
- **Token:** USDT (Tether USD)
- **Contract:** 0x55d398326f99059fF775485246999027B3197955
- **Standard:** BEP-20 (BSC)
- **Decimals:** 18

## ⚙️ Configurazione nei File

### Backend (.env)
```env
DESTINATION_WALLET=0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372
```

### Frontend (.env)
```env
VITE_DESTINATION_WALLET=0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372
```

## 🔍 Monitoraggio Transazioni

### Come Verificare i Depositi Ricevuti

1. **Via Block Explorer (BscScan):**
   - Vai su https://bscscan.com/address/0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372
   - Clicca su "Token Transfers"
   - Filtra per USDT

2. **Via API Backend:**
   ```
   GET http://localhost:3001/api/deposits
   ```
   Mostra tutti i depositi registrati nel database

3. **Via Database:**
   ```sql
   SELECT * FROM deposits WHERE status = 'confirmed';
   ```

## 💰 Gestione Fondi

### Accesso ai Fondi
Per accedere ai fondi depositati su questo wallet, avrai bisogno di:
- **Private Key** del wallet
- **MetaMask** o altro wallet compatibile
- **BNB** per le fee di transazione (per prelievi futuri)

### ⚠️ Sicurezza
- **MAI condividere** la private key
- Conserva la private key in un luogo sicuro
- Usa un hardware wallet per grandi somme
- Abilita 2FA ovunque possibile

## 📈 Statistiche in Tempo Reale

### Dashboard Globale
L'applicazione mostra in tempo reale:
- **Totale depositato** su questo wallet
- **Numero di transazioni** ricevute
- **Numero di wallet** che hanno depositato
- **Progresso verso gli obiettivi**

### Database Tracking
Ogni deposito viene tracciato in PostgreSQL con:
- Indirizzo mittente
- Importo
- Transaction Hash
- Block Number
- Timestamp
- Status (pending/confirmed/failed)

## 🎯 Obiettivi della Piattaforma

### Goal 1: Depositi Totali
- **Target:** 10,000 USDT
- Tutti i depositi vengono sommati verso questo obiettivo

### Goal 2: Wallet Unici
- **Target:** 10,000 wallet paganti
- Ogni nuovo wallet che deposita conta verso questo obiettivo

### Sblocco Funzionalità
Al raggiungimento di **entrambi** gli obiettivi:
- ✅ Prelievi sbloccati
- ✅ Rendimenti giornalieri attivati (0.1% al giorno)
- ✅ Sistema di distribuzione rendimenti operativo

## 📞 Supporto

### Verificare lo Stato del Wallet
```bash
# Via API
curl http://localhost:3001/api/stats/global

# Via Database
psql -U postgres -d walletpay -c "SELECT * FROM global_stats;"
```

### Problemi Comuni

**Q: Come verifico se un deposito è arrivato?**
A: Controlla su BscScan o nel database nella tabella `deposits`

**Q: Posso cambiare il wallet di ricezione?**
A: Sì, modifica `DESTINATION_WALLET` nei file `.env` e riavvia

**Q: I depositi vanno persi?**
A: No, sono transazioni blockchain permanenti visibili su BscScan

## 🔐 Backup e Sicurezza

### Cosa Fare Backup
1. **Private Key** del wallet (priorità massima!)
2. Database PostgreSQL (contiene lo storico)
3. File `.env` (contiene configurazione)

### Raccomandazioni
- Usa un password manager per la private key
- Fai backup regolari del database
- Testa i prelievi su testnet prima
- Non condividere mai le credenziali

## 📝 Note Importali

### Questo è un Progetto Educativo
- Progettato per **scopi di apprendimento e test**
- Non usare con grandi quantità di fondi reali
- Non è stato auditato per uso in produzione
- Comprendi i rischi prima di usare criptovalute reali

### Responsabilità
- Tu sei l'unico responsabile della sicurezza del wallet
- Gli sviluppatori non hanno accesso al tuo wallet
- Nessuno può recuperare fondi se perdi la private key

---

**Wallet Address:** `0x496Ad99a1Bba08bd2777c50c5A13b3D0cC03F372`

*Conserva questo documento in un luogo sicuro insieme alla private key del wallet*
