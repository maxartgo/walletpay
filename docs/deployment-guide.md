# 🚀 Guida Deploy e Aggiornamenti WalletStake

## Metodi di Deploy per Modifiche Future

### **Metodo 1: Git + Script di Deploy Automatico (CONSIGLIATO)**

Questo è il metodo più professionale e semplice.

#### Setup Iniziale (da fare una volta sola):

1. **Crea repository GitHub privato:**
   ```bash
   # Sul tuo computer Windows
   cd C:\Users\uffic\Desktop\walletpay

   # Se non hai ancora inizializzato git remote
   git remote add origin https://github.com/TUO_USERNAME/walletpay.git
   git branch -M main
   git push -u origin main
   ```

2. **Sul server Hetzner, clona il repository:**
   ```bash
   ssh root@IP_SERVER
   cd /var/www
   git clone https://github.com/TUO_USERNAME/walletpay.git
   cd walletpay
   ```

#### Per ogni modifica futura:

**Sul tuo computer Windows:**
```bash
# 1. Fai le modifiche al codice
# 2. Testa in locale
npm run dev  # backend
npm run dev  # frontend

# 3. Commit e push
git add .
git commit -m "Descrizione modifica"
git push origin main
```

**Sul server Hetzner:**
```bash
ssh root@IP_SERVER
cd /var/www/walletpay
./scripts/deploy.sh
```

Lo script `deploy.sh` farà automaticamente:
- ✅ Pull dal repository GitHub
- ✅ Installa dipendenze (npm install)
- ✅ Build del frontend
- ✅ Riavvio del backend
- ✅ Reload Nginx

---

### **Metodo 2: SCP/SFTP (Per piccole modifiche veloci)**

Utile per modifiche rapide di 1-2 file.

#### Usando PowerShell (Windows):

```powershell
# Upload singolo file
scp C:\Users\uffic\Desktop\walletpay\src\App.tsx root@IP_SERVER:/var/www/walletpay/src/

# Upload intera cartella
scp -r C:\Users\uffic\Desktop\walletpay\src\* root@IP_SERVER:/var/www/walletpay/src/

# Poi riavvia i servizi
ssh root@IP_SERVER "cd /var/www/walletpay && npm run build && pm2 restart walletpay-backend"
```

#### Usando FileZilla (GUI):

1. **Scarica FileZilla**: https://filezilla-project.org/
2. **Connetti al server:**
   - Host: `sftp://IP_SERVER`
   - Username: `root`
   - Password: (lascia vuoto, usa chiave SSH)
   - Port: `22`
3. **Trascina e rilascia i file** modificati
4. **Riavvia i servizi via SSH**

---

### **Metodo 3: VS Code Remote SSH (MIGLIORE per sviluppo)**

Modifica i file direttamente sul server come se fossero in locale.

#### Setup:

1. **Installa estensione VS Code:**
   - Nome: "Remote - SSH"
   - Publisher: Microsoft

2. **Connetti al server:**
   - Premi `F1` → "Remote-SSH: Connect to Host"
   - Inserisci: `root@IP_SERVER`
   - VS Code si riavvierà connesso al server

3. **Apri la cartella del progetto:**
   - File → Open Folder → `/var/www/walletpay`

4. **Modifica i file direttamente sul server**
   - Ogni modifica è istantanea sul server!

5. **Riavvia i servizi quando necessario:**
   - Apri terminale in VS Code
   - `pm2 restart walletpay-backend`
   - `npm run build` (per frontend)

---

### **Metodo 4: CI/CD con GitHub Actions (AVANZATO)**

Deploy automatico ad ogni push su GitHub.

#### File `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Hetzner

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_IP }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/walletpay
            git pull origin main
            npm install --prefix backend
            npm install
            npm run build
            pm2 restart walletpay-backend
            systemctl reload nginx
```

**Vantaggi:**
- ✅ Deploy automatico ad ogni push
- ✅ Zero operazioni manuali
- ✅ Log di deploy su GitHub

---

## 📁 Struttura File sul Server

```
/var/www/walletpay/
├── backend/              # Backend Node.js
│   ├── src/
│   ├── .env             # Configurazione produzione
│   ├── package.json
│   └── dist/            # Build compilato
├── src/                 # Frontend React
├── dist/                # Frontend compilato (servito da Nginx)
├── scripts/
│   └── deploy.sh        # Script deploy automatico
└── .git/                # Repository Git
```

---

## 🔧 Comandi Utili sul Server

### **Backend (PM2):**
```bash
# Visualizza log in tempo reale
pm2 logs walletpay-backend

# Riavvia backend
pm2 restart walletpay-backend

# Stop backend
pm2 stop walletpay-backend

# Informazioni sui processi
pm2 status
pm2 info walletpay-backend
```

### **Frontend (Nginx):**
```bash
# Rebuild frontend dopo modifiche
cd /var/www/walletpay
npm run build

# Reload Nginx (senza downtime)
systemctl reload nginx

# Restart Nginx
systemctl restart nginx

# Controlla errori configurazione
nginx -t
```

### **Database:**
```bash
# Accedi a PostgreSQL
psql -U walletpay_user -d walletpay_prod

# Backup database
pg_dump -U walletpay_user walletpay_prod > backup_$(date +%Y%m%d).sql

# Restore database
psql -U walletpay_user walletpay_prod < backup_20250120.sql
```

### **Git sul server:**
```bash
# Pull ultime modifiche
cd /var/www/walletpay
git pull origin main

# Controlla stato
git status

# Vedi commit recenti
git log --oneline -5
```

---

## 🚀 Script Deploy Automatico

Creerò uno script `deploy.sh` che automatizzerà tutto:

```bash
#!/bin/bash
# /var/www/walletpay/scripts/deploy.sh

echo "🚀 Starting deployment..."

# Pull dal repository
echo "📥 Pulling from GitHub..."
git pull origin main

# Backend
echo "🔧 Installing backend dependencies..."
cd backend
npm install --production

# Frontend
echo "🎨 Building frontend..."
cd ..
npm install
npm run build

# Restart services
echo "♻️  Restarting services..."
pm2 restart walletpay-backend
systemctl reload nginx

echo "✅ Deployment completed!"
pm2 logs walletpay-backend --lines 50
```

---

## 📋 Workflow Consigliato (Giorno per giorno)

### **Per modifiche piccole (1-2 file):**
1. Usa VS Code Remote SSH
2. Modifica direttamente sul server
3. Riavvia servizi se necessario

### **Per modifiche medie (feature nuove):**
1. Sviluppa in locale su Windows
2. Testa con `npm run dev`
3. `git commit` + `git push`
4. Sul server: `./scripts/deploy.sh`

### **Per modifiche grandi (major update):**
1. Sviluppa in locale
2. Testa completamente
3. Fai backup database: `pg_dump ...`
4. Deploy con script automatico
5. Verifica che tutto funzioni

---

## ⚠️ Best Practices

### **Sempre prima di un deploy:**
✅ Testa in locale
✅ Fai commit con messaggio chiaro
✅ Fai backup del database
✅ Controlla che non ci siano utenti attivi (se possibile)

### **Dopo ogni deploy:**
✅ Controlla i log: `pm2 logs walletpay-backend`
✅ Testa il sito nel browser
✅ Verifica che il backend risponda: `curl http://localhost:3001/api/health`

### **Per sicurezza:**
✅ Fai backup del database ogni giorno (cron job automatico)
✅ Tieni una copia locale del progetto
✅ Usa branch Git per feature grandi (main, develop, feature/xyz)

---

## 🆘 Troubleshooting Deploy

### **"Il sito non si aggiorna"**
```bash
# Pulisci cache browser
# Oppure forza rebuild frontend
cd /var/www/walletpay
rm -rf dist
npm run build
```

### **"Backend non parte dopo deploy"**
```bash
# Controlla errori
pm2 logs walletpay-backend --err

# Controlla .env
cat backend/.env

# Riavvia manualmente
cd /var/www/walletpay/backend
npm run build
pm2 restart walletpay-backend
```

### **"Errore database dopo deploy"**
```bash
# Controlla connessione
psql -U walletpay_user -d walletpay_prod -c "SELECT NOW();"

# Controlla credenziali in .env
cat backend/.env | grep DB_
```

---

## 📞 Riepilogo Veloce

**Deploy veloce (ogni volta):**
```bash
# Sul tuo PC Windows
git add .
git commit -m "Descrizione"
git push

# Sul server
ssh root@IP_SERVER
cd /var/www/walletpay
./scripts/deploy.sh
```

**Deploy manuale (senza Git):**
```bash
# Upload file con SCP
scp -r src/* root@IP_SERVER:/var/www/walletpay/src/

# Rebuild sul server
ssh root@IP_SERVER
cd /var/www/walletpay
npm run build
pm2 restart walletpay-backend
```

**Metodo più comodo:**
- VS Code Remote SSH per modifiche rapide
- Git + deploy.sh per modifiche strutturate

---

Vuoi che ti prepari uno di questi metodi in particolare?
