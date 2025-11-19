-- ============================================
-- AGGIUNGI IL TUO WALLET COME AMMINISTRATORE
-- ============================================
--
-- ISTRUZIONI:
-- 1. Sostituisci '0xTUO_WALLET_QUI' con il tuo indirizzo wallet
-- 2. Esegui questo script nel database walletpay2
--
-- METODO 1 - Via pgAdmin:
--   - Apri pgAdmin
--   - Connettiti al database walletpay2
--   - Clicca su "Query Tool"
--   - Incolla questo script (dopo aver modificato l'indirizzo)
--   - Clicca "Execute" (F5)
--
-- METODO 2 - Via comando Node.js:
--   Apri il terminale nella cartella backend ed esegui:
--   node -e "const{Pool}=require('pg');const p=new Pool({user:'postgres',host:'localhost',database:'walletpay2',password:'admin123',port:5432});p.query(\"INSERT INTO admin_wallets(wallet_address,name)VALUES('0xTUO_WALLET','Admin')ON CONFLICT(wallet_address)DO UPDATE SET is_active=true\").then(()=>{console.log('✅ Admin wallet aggiunto!');p.end();}).catch(e=>{console.error('❌ Errore:',e.message);p.end();});"
--
-- ============================================

-- Sostituisci 0xTUO_WALLET_QUI con il tuo wallet address
INSERT INTO admin_wallets (wallet_address, name)
VALUES ('0xTUO_WALLET_QUI', 'Admin Principale')
ON CONFLICT (wallet_address)
DO UPDATE SET is_active = true;

-- Verifica che sia stato aggiunto
SELECT * FROM admin_wallets WHERE is_active = true;

-- ============================================
-- FATTO! Ora puoi accedere a:
-- http://localhost:5173/admin
-- ============================================
