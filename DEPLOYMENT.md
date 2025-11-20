# 🚀 WalletStake - Guida Deploy Hetzner VPS

## 📋 Informazioni Server

- **IP Server**: 128.140.6.81
- **Dominio**: walletstake.net
- **Server**: Hetzner Cloud CX22 (4GB RAM, 2 vCPU)
- **OS**: Ubuntu 22.04

---

## 🎯 Setup Iniziale (Da fare UNA VOLTA sola)

### Passo 1: Configurare DNS su Cloudflare

Prima di iniziare, configura il DNS per il dominio `walletstake.net`:

1. Vai su **Cloudflare Dashboard** → DNS
2. Aggiungi questi record:

```
Type    Name    Content           Proxy Status    TTL
A       @       128.140.6.81      DNS only        Auto
A       www     128.140.6.81      DNS only        Auto
```

⚠️ **IMPORTANTE**: Imposta "Proxy status" su **"DNS only"** (nuvola grigia, non arancione) per il setup iniziale.

**Tempo di propagazione**: 5-10 minuti

---

### Passo 2: Connetti al Server

Da PowerShell su Windows:

```powershell
ssh root@128.140.6.81
```

Se è la prima volta, ti chiederà di confermare la connessione. Digita `yes`.

---

### Passo 3: Esegui lo Script di Setup

Una volta connesso al server:

```bash
# Scarica lo script di setup
wget https://raw.githubusercontent.com/TUO_USERNAME/walletpay/main/scripts/server-setup.sh

# Oppure crea il file manualmente
nano server-setup.sh
# Incolla il contenuto dello script, salva (CTRL+X, Y, ENTER)

# Rendi eseguibile lo script
chmod +x server-setup.sh

# Esegui lo script
./server-setup.sh
```

Lo script installerà automaticamente:
- ✅ Node.js 20.x
- ✅ PostgreSQL 15
- ✅ Nginx
- ✅ PM2
- ✅ Certbot (SSL)
- ✅ Firewall (UFW)
- ✅ Fail2ban (protezione SSH)

**Tempo richiesto**: 5-10 minuti

⚠️ **SALVA LE CREDENZIALI** che lo script stamperà alla fine!

---

### Passo 4: Prepara il Repository GitHub

Sul tuo **PC Windows**:

```bash
cd C:\Users\uffic\Desktop\walletpay

# Inizializza Git (se non l'hai già fatto)
git init
git add .
git commit -m "Initial commit"

# Crea repository su GitHub (privato consigliato)
# Poi collega il repository locale
git remote add origin https://github.com/TUO_USERNAME/walletpay.git
git branch -M main
git push -u origin main
```

---

### Passo 5: Deploy del Codice sul Server

Sul **server Hetzner**:

```bash
# Vai nella directory del progetto
cd /var/www/walletpay

# Clona il repository
git clone https://github.com/TUO_USERNAME/walletpay.git .

# Se il repository è privato, usa token di accesso:
git clone https://TUO_USERNAME:TOKEN@github.com/TUO_USERNAME/walletpay.git .

# Copia il file .env per il backend
cp .env.production backend/.env

# Installa dipendenze backend
cd backend
npm install

# Installa dipendenze frontend e build
cd ..
npm install
npm run build

# Inizializza database (crea tabelle)
cd backend
npm run migrate  # O qualsiasi comando usi per le migrazioni

# Avvia backend con PM2
cd ..
pm2 start backend/dist/index.js --name walletpay-backend
pm2 save

# Verifica che sia in esecuzione
pm2 status
pm2 logs walletpay-backend
```

---

### Passo 6: Configura SSL (HTTPS)

Assicurati che siano passati almeno 10 minuti dalla configurazione DNS.

```bash
# Testa che il DNS sia propagato
dig walletstake.net

# Se mostra 128.140.6.81, procedi con SSL
chmod +x scripts/setup-ssl.sh
./scripts/setup-ssl.sh
```

Oppure manualmente:

```bash
certbot --nginx -d walletstake.net -d www.walletstake.net
```

Certbot configurerà automaticamente:
- ✅ Certificato SSL Let's Encrypt
- ✅ Redirect HTTP → HTTPS
- ✅ Auto-renewal del certificato

---

### Passo 7: Verifica il Funzionamento

Apri il browser e vai su:
- https://walletstake.net

Controlla che:
- ✅ Sito carica correttamente
- ✅ HTTPS attivo (lucchetto verde)
- ✅ Backend risponde: https://walletstake.net/api/health

---

## 🔄 Deploy Aggiornamenti Futuri

Ogni volta che fai modifiche al codice:

### Sul tuo PC Windows:

```bash
cd C:\Users\uffic\Desktop\walletpay

# Fai le modifiche
# Testa in locale con npm run dev

# Commit e push
git add .
git commit -m "Descrizione delle modifiche"
git push origin main
```

### Sul server Hetzner:

```bash
ssh root@128.140.6.81
cd /var/www/walletpay
./scripts/deploy.sh
```

Lo script `deploy.sh` farà automaticamente:
- ✅ Pull dal repository
- ✅ Installa dipendenze
- ✅ Build frontend
- ✅ Build backend
- ✅ Restart backend
- ✅ Reload Nginx

**Tempo di deploy**: ~30 secondi

---

## 🔧 Comandi Utili

### Backend (PM2)

```bash
# Visualizza log in tempo reale
pm2 logs walletpay-backend

# Visualizza ultimi 100 log
pm2 logs walletpay-backend --lines 100

# Riavvia backend
pm2 restart walletpay-backend

# Stop backend
pm2 stop walletpay-backend

# Info dettagliate
pm2 info walletpay-backend

# Monitor risorse
pm2 monit
```

### Database

```bash
# Connetti a PostgreSQL
psql -U walletpay_user -d walletpay_prod

# Backup database
pg_dump -U walletpay_user walletpay_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Restore database
psql -U walletpay_user walletpay_prod < backup_20250120_143000.sql

# Lista tabelle
psql -U walletpay_user -d walletpay_prod -c "\dt"
```

### Nginx

```bash
# Testa configurazione
nginx -t

# Reload (senza downtime)
systemctl reload nginx

# Restart
systemctl restart nginx

# Visualizza log errori
tail -f /var/log/nginx/error.log

# Visualizza log accessi
tail -f /var/log/nginx/access.log
```

### Sistema

```bash
# Spazio disco
df -h

# Memoria RAM
free -h

# Processi in esecuzione
htop

# Riavvia server (ultimo resort)
reboot
```

---

## 📊 Monitoraggio

### Health Check Automatico

Il backend espone un endpoint health:

```bash
curl http://localhost:3001/api/health
```

Response:
```json
{"status":"ok","timestamp":"2025-01-20T10:30:00.000Z"}
```

### Setup Cron per Backup Automatico

```bash
# Apri crontab
crontab -e

# Aggiungi backup giornaliero alle 3 AM
0 3 * * * pg_dump -U walletpay_user walletpay_prod > /root/backups/db_$(date +\%Y\%m\%d).sql

# Crea directory backup
mkdir -p /root/backups
```

---

## ⚠️ Troubleshooting

### Problema: Backend non si avvia

```bash
# Controlla log errori
pm2 logs walletpay-backend --err

# Verifica .env
cat backend/.env

# Testa connessione database
psql -U walletpay_user -d walletpay_prod -c "SELECT NOW();"

# Riavvia manualmente
cd /var/www/walletpay/backend
npm run build
pm2 restart walletpay-backend
```

### Problema: 502 Bad Gateway

Il backend non è in esecuzione:

```bash
pm2 status
pm2 restart walletpay-backend
```

### Problema: Modifiche non visibili

Cache del browser o build non aggiornato:

```bash
# Rebuild frontend
cd /var/www/walletpay
npm run build
systemctl reload nginx

# Oppure pulisci cache browser (CTRL+SHIFT+R)
```

### Problema: Certificato SSL scaduto

```bash
# Rinnova manualmente
certbot renew

# Testa auto-renewal
certbot renew --dry-run
```

---

## 🔒 Sicurezza

### Cambia Password Root

```bash
passwd root
```

### Abilita Autenticazione 2FA per SSH (Opzionale)

```bash
apt install libpam-google-authenticator
google-authenticator
```

### Controlla Tentativi SSH Falliti

```bash
# Fail2ban status
fail2ban-client status sshd

# Log tentativi login
grep "Failed password" /var/log/auth.log
```

### Aggiorna Sistema Regolarmente

```bash
apt update && apt upgrade -y
```

---

## 📞 Riepilogo Rapido

### Setup Iniziale (una volta):
```bash
ssh root@128.140.6.81
./server-setup.sh
git clone REPO_URL .
cp .env.production backend/.env
cd backend && npm install
cd .. && npm install && npm run build
pm2 start backend/dist/index.js --name walletpay-backend
pm2 save
./scripts/setup-ssl.sh
```

### Deploy Modifiche (ogni volta):
```bash
# PC
git push

# Server
ssh root@128.140.6.81
cd /var/www/walletpay
./scripts/deploy.sh
```

---

## 📚 Risorse Utili

- **Hetzner Docs**: https://docs.hetzner.com/cloud/
- **PM2 Docs**: https://pm2.keymetrics.io/docs/
- **Nginx Docs**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/docs/

---

## 🆘 Supporto

Se hai problemi:
1. Controlla i log: `pm2 logs walletpay-backend`
2. Verifica database: `psql -U walletpay_user -d walletpay_prod`
3. Controlla Nginx: `nginx -t`
4. Controlla firewall: `ufw status`

Per assistenza: info@madeinperugia.eu
