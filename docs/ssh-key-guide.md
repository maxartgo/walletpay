# 🔑 Guida Generazione Chiave SSH per Hetzner VPS

## Cos'è una Chiave SSH?

Una chiave SSH è un sistema di autenticazione sicuro che ti permette di accedere al server senza usare password. È composta da:
- **Chiave Privata**: Rimane sul tuo computer (NON condividerla mai!)
- **Chiave Pubblica**: Si carica sul server Hetzner (sicura da condividere)

---

## Metodo 1: PowerShell (Windows 10/11)

### Passo 1: Apri PowerShell
1. Premi `Win + X`
2. Seleziona "Windows PowerShell" o "Terminal"

### Passo 2: Controlla se hai già una chiave SSH
```powershell
ls ~/.ssh
```

**Se vedi file come `id_rsa.pub` o `id_ed25519.pub`**: Hai già una chiave! Passa al Passo 4.

**Se vedi "Impossibile trovare il percorso"**: Non hai chiavi, procedi al Passo 3.

### Passo 3: Genera una nuova chiave SSH
```powershell
ssh-keygen -t ed25519 -C "tuoemail@example.com"
```

**Cosa ti chiederà:**

1. **"Enter file in which to save the key"**
   - Premi semplicemente INVIO (usa il percorso di default)

2. **"Enter passphrase"**
   - Opzione A: Premi INVIO due volte (nessuna password - più comodo ma meno sicuro)
   - Opzione B: Inserisci una password forte (più sicuro - dovrai ricordarla!)

**Output atteso:**
```
Generating public/private ed25519 key pair.
Your identification has been saved in C:\Users\uffic\.ssh\id_ed25519
Your public key has been saved in C:\Users\uffic\.ssh\id_ed25519.pub
The key fingerprint is:
SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx tuoemail@example.com
```

### Passo 4: Visualizza la chiave pubblica
```powershell
cat ~/.ssh/id_ed25519.pub
```

**Output sarà simile a:**
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIJqfXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX tuoemail@example.com
```

### Passo 5: Copia la chiave pubblica
```powershell
# Questo comando copia automaticamente negli appunti
cat ~/.ssh/id_ed25519.pub | Set-Clipboard
```

✅ **La chiave è ora copiata negli appunti!** Vai su Hetzner e incollala nel campo "SSH Keys".

---

## Metodo 2: Git Bash (Se hai Git installato)

### Passo 1: Apri Git Bash
1. Clicca destro sul Desktop
2. Seleziona "Git Bash Here"

### Passo 2: Genera la chiave
```bash
ssh-keygen -t ed25519 -C "tuoemail@example.com"
```

Segui gli stessi passaggi del Metodo 1.

### Passo 3: Visualizza e copia
```bash
cat ~/.ssh/id_ed25519.pub
```

Copia manualmente tutto l'output (da `ssh-ed25519` fino alla fine).

---

## Metodo 3: PuTTYgen (Alternativa GUI)

### Passo 1: Scarica PuTTY
- Vai su: https://www.putty.org/
- Scarica "PuTTY installer" (include PuTTYgen)

### Passo 2: Avvia PuTTYgen
1. Cerca "PuTTYgen" nel menu Start
2. Clicca "Generate"
3. Muovi il mouse casualmente nell'area vuota per generare casualità

### Passo 3: Salva le chiavi
1. **Chiave Pubblica**: Copia tutto il testo nella finestra "Public key for pasting"
2. **Chiave Privata**: Clicca "Save private key" → Salva come `walletpay-hetzner.ppk`

### Passo 4: Converti per OpenSSH (opzionale)
Se usi PowerShell/Git Bash invece di PuTTY:
1. Conversions → Export OpenSSH key
2. Salva come `id_ed25519` (senza estensione)

---

## 🚀 Usa la Chiave su Hetzner

### Durante la creazione del server:
1. Vai alla sezione **"SSH Keys"**
2. Clicca **"Add SSH Key"**
3. **Name**: `walletpay-windows` (o un nome a tua scelta)
4. **Public Key**: Incolla la chiave pubblica copiata
5. Clicca **"Add SSH Key"**

### Dopo aver creato il server:
Il server avrà l'IP (es. `123.45.67.89`). Per connetterti:

**Con PowerShell:**
```powershell
ssh root@123.45.67.89
```

**Con PuTTY:**
1. Apri PuTTY
2. Host Name: `root@123.45.67.89`
3. Connection → SSH → Auth → Credentials
4. Private key file: Seleziona il file `.ppk` salvato
5. Clicca "Open"

---

## ⚠️ Problemi Comuni

### "WARNING: UNPROTECTED PRIVATE KEY FILE!"
**Soluzione PowerShell:**
```powershell
icacls $env:USERPROFILE\.ssh\id_ed25519 /inheritance:r
icacls $env:USERPROFILE\.ssh\id_ed25519 /grant:r "$($env:USERNAME):(R)"
```

### "Permission denied (publickey)"
**Cause possibili:**
1. Chiave pubblica non caricata su Hetzner correttamente
2. Hai copiato solo parte della chiave
3. Stai usando la chiave privata invece della pubblica

**Soluzione:**
Ricopia l'intera chiave pubblica (incluso `ssh-ed25519` all'inizio e email alla fine).

### "Host key verification failed"
**Soluzione:**
```powershell
ssh-keygen -R 123.45.67.89
```
(Sostituisci `123.45.67.89` con l'IP del tuo server)

---

## 🔒 Best Practices Sicurezza

✅ **FAI:**
- Usa sempre una passphrase per la chiave privata in produzione
- Fai backup della chiave privata in un luogo sicuro
- Usa chiavi diverse per server diversi (opzionale ma consigliato)

❌ **NON FARE:**
- Non condividere mai la chiave privata (`id_ed25519` senza `.pub`)
- Non caricare la chiave privata su GitHub o servizi cloud
- Non usare chiavi RSA a 1024 bit (obsolete)

---

## 📋 Riepilogo Veloce

```powershell
# 1. Genera chiave
ssh-keygen -t ed25519 -C "tuoemail@example.com"

# 2. Copia chiave pubblica negli appunti
cat ~/.ssh/id_ed25519.pub | Set-Clipboard

# 3. Incolla su Hetzner nella sezione SSH Keys

# 4. Connettiti al server
ssh root@IP_DEL_SERVER
```

---

## 🆘 Hai bisogno di aiuto?

Se hai problemi, mostrami l'output degli errori e ti aiuto a risolverli!
