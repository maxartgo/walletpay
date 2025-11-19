# 🔐 Admin Panel - WalletPay

## Panoramica

L'Admin Panel permette agli amministratori di gestire tutte le richieste di ritiro (withdrawals) della piattaforma. Gli amministratori possono:
- ✅ Approvare ritiri
- ❌ Rifiutare ritiri (con rimborso automatico)
- 📊 Visualizzare statistiche in tempo reale
- 🔍 Filtrare ritiri per stato (pending, completed, rejected)

## 🚀 Setup Iniziale

### 1. Applicare la Migrazione del Database

Prima di utilizzare l'admin panel, devi creare le tabelle necessarie nel database:

```bash
cd database
setup-admin.bat
```

Questo script:
- Crea la tabella `admins`
- Aggiunge campi alla tabella `withdrawals` per la gestione admin
- Crea l'utente admin predefinito

### 2. Credenziali Predefinite

```
Username: admin
Password: admin123
```

⚠️ **IMPORTANTE**: Cambia queste credenziali in produzione!

## 📍 Accesso all'Admin Panel

### URL

```
http://localhost:5173/admin/login
```

### Flusso di Login

1. Apri il browser e vai su http://localhost:5173/admin/login
2. Inserisci username e password
3. Click su "Sign In"
4. Verrai reindirizzato alla dashboard admin

## 🎯 Funzionalità

### Dashboard Principale

La dashboard mostra:

#### 📊 Statistiche Globali
- **Pending Withdrawals**: Numero e importo totale dei ritiri in attesa
- **Completed Withdrawals**: Numero e importo totale dei ritiri approvati
- **Rejected Withdrawals**: Numero e importo totale dei ritiri rifiutati

#### 🔍 Filtri
- **Pending**: Mostra solo ritiri in attesa di approvazione
- **Completed**: Mostra ritiri approvati
- **Rejected**: Mostra ritiri rifiutati
- **All**: Mostra tutti i ritiri

#### 📋 Tabella Ritiri

Per ogni ritiro viene mostrato:
- **ID**: Identificativo univoco del ritiro
- **Wallet**: Indirizzo wallet dell'utente (abbreviato)
- **Amount**: Importo netto (dopo la tassa del 10%)
- **Type**: Tipo di ritiro (regular/referral)
- **Status**: Stato attuale (pending/completed/rejected)
- **Date**: Data e ora della richiesta
- **Actions**: Pulsanti per approvare o rifiutare (solo per pending)

### ✅ Approvare un Ritiro

1. Nella tabella, trova il ritiro da approvare (status: pending)
2. Click sul pulsante verde "Approve"
3. Conferma l'azione
4. Il ritiro verrà marcato come "completed"

**Cosa succede:**
- Lo stato viene cambiato a "completed"
- Viene registrato l'admin che ha approvato
- Viene registrata la data di approvazione
- L'utente può procedere con il ritiro

### ❌ Rifiutare un Ritiro

1. Nella tabella, trova il ritiro da rifiutare (status: pending)
2. Click sul pulsante rosso "Reject"
3. Inserisci un motivo del rifiuto (obbligatorio)
4. Conferma l'azione
5. Il ritiro verrà marcato come "rejected"

**Cosa succede:**
- Lo stato viene cambiato a "rejected"
- Viene registrato il motivo del rifiuto
- **L'importo lordo viene rimborsato** al `withdrawable_balance` dell'utente
- L'utente può richiedere un nuovo ritiro

### 🔄 Rimborso Automatico

Quando un ritiro viene rifiutato:
```
Importo Netto Richiesto: 90 USDT (quello che l'utente avrebbe ricevuto)
Importo Lordo Originale: 100 USDT (90 / 0.9)
Rimborso: 100 USDT → withdrawable_balance dell'utente
```

## 🔒 Sicurezza

### Autenticazione JWT

L'admin panel utilizza JSON Web Tokens (JWT) per l'autenticazione:
- Token valido per 24 ore (configurabile in `.env`)
- Token salvato in localStorage del browser
- Tutte le richieste API richiedono il token nell'header `Authorization`

### Protezione delle Route

Le route admin sono protette:
- `/admin/login` - Accessibile a tutti
- `/admin/dashboard` - Solo con token valido

Se il token non è valido o è scaduto, l'utente viene reindirizzato al login.

## 🛠️ API Endpoints Admin

### Login
```http
POST /api/admin/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}
```

### Get Pending Withdrawals
```http
GET /api/admin/withdrawals/pending
Authorization: Bearer <token>
```

### Get All Withdrawals (with filters)
```http
GET /api/admin/withdrawals?status=pending&limit=100&offset=0
Authorization: Bearer <token>
```

### Approve Withdrawal
```http
POST /api/admin/withdrawals/:id/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "Approved by admin"
}
```

### Reject Withdrawal
```http
POST /api/admin/withdrawals/:id/reject
Authorization: Bearer <token>
Content-Type: application/json

{
  "note": "Rejection reason here"
}
```

### Get Stats
```http
GET /api/admin/stats
Authorization: Bearer <token>
```

## 📊 Schema Database

### Tabella `admins`

```sql
CREATE TABLE admins (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP
);
```

### Tabella `withdrawals` (aggiornata)

```sql
ALTER TABLE withdrawals
ADD COLUMN status VARCHAR(20) DEFAULT 'pending',
ADD COLUMN admin_note TEXT,
ADD COLUMN processed_by INTEGER REFERENCES admins(id),
ADD COLUMN processed_at TIMESTAMP;
```

## 🔧 Configurazione

### Variabili d'Ambiente (.env)

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024
JWT_EXPIRES_IN=24h
```

### Creare Nuovi Admin

Per creare un nuovo admin manualmente:

```sql
INSERT INTO admins (username, password_hash, email)
VALUES ('newadmin', '$2b$10$...', 'newadmin@walletpay.com');
```

Per generare l'hash della password:

```bash
cd backend
node scripts/generate-admin-hash.js
```

## 🎨 Interfaccia Utente

### Pagina Login
- Design moderno con gradiente
- Form centrato
- Credenziali predefinite mostrate
- Feedback errori

### Dashboard
- Header con nome admin e pulsante logout
- Card statistiche colorate per tipo
- Filtri tab-based intuitivi
- Tabella responsive con tutte le info
- Pulsanti azione colorati (verde/rosso)
- Aggiornamento automatico dopo azioni

## 📱 Responsive Design

L'admin panel è completamente responsive:
- Desktop: Layout a 3 colonne per le stats
- Tablet: Layout adattivo
- Mobile: Layout singola colonna

## 🔍 Troubleshooting

### Non riesco a fare login
- Verifica che il backend sia in esecuzione sulla porta 3001
- Controlla le credenziali: `admin` / `admin123`
- Verifica che la migrazione database sia stata applicata

### Token scaduto
- Fai logout e login di nuovo
- Il token ha validità 24 ore

### Ritiri non vengono mostrati
- Verifica che ci siano ritiri nel database
- Controlla i filtri applicati
- Verifica la connessione al backend

### Errore "Failed to fetch"
- Verifica che il backend sia attivo
- Controlla la configurazione CORS
- Verifica che l'URL API sia corretto

## 📝 Best Practices

1. **Cambia le Credenziali**: In produzione, usa credenziali forti
2. **Backup Database**: Prima di approvare/rifiutare molti ritiri
3. **Note Chiare**: Quando rifiuti un ritiro, specifica sempre il motivo
4. **Monitora le Statistiche**: Controlla regolarmente i totali
5. **Logout Sempre**: Quando hai finito, esci sempre dall'admin panel

## 🚀 Deployment in Produzione

### Checklist

- [ ] Cambia `JWT_SECRET` con una chiave sicura casuale
- [ ] Cambia le credenziali admin predefinite
- [ ] Configura HTTPS per il backend
- [ ] Abilita rate limiting sugli endpoint admin
- [ ] Configura backup automatici del database
- [ ] Abilita logging delle azioni admin
- [ ] Configura alert per azioni critiche

## 📞 Supporto

Per problemi o domande sull'admin panel:
1. Controlla questa documentazione
2. Verifica i log del backend
3. Controlla la console del browser per errori

## 🎉 Tutto Pronto!

Ora puoi accedere all'admin panel e gestire i ritiri della piattaforma in modo sicuro ed efficiente!

**URL Admin**: http://localhost:5173/admin/login
**Credenziali**: admin / admin123
