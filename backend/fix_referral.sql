-- Script per assegnare il referral a un deposito già fatto
-- Referrer: 0x116853cbc68a04ed96510f73a61ce0d9b6e293a4

-- 1. Prima verifichiamo quale utente ha fatto il deposito recente
SELECT id, wallet_address, referrer_address, total_deposited, created_at
FROM users
ORDER BY created_at DESC
LIMIT 5;

-- 2. Verifichiamo che il referrer esista
SELECT id, wallet_address FROM users
WHERE LOWER(wallet_address) = LOWER('0x116853cbc68a04ed96510f73a61ce0d9b6e293a4');

-- 3. Assegna il referrer all'utente che ha fatto il deposito (MODIFICA L'ID DOPO AVER VERIFICATO)
-- IMPORTANTE: Sostituisci <USER_ID> con l'ID dell'utente che ha fatto il deposito
-- UPDATE users
-- SET referrer_address = '0x116853cbc68a04ed96510f73a61ce0d9b6e293a4'
-- WHERE id = <USER_ID>;

-- 4. Trova il deposito da processare per i referral
SELECT d.id, d.user_id, d.amount, d.tx_hash, d.referrer_id, d.created_at,
       u.wallet_address as depositor
FROM deposits d
JOIN users u ON d.user_id = u.id
ORDER BY d.created_at DESC
LIMIT 5;

-- 5. Aggiorna il deposito con il referrer_id (MODIFICA DOPO AVER VERIFICATO)
-- IMPORTANTE: Sostituisci <DEPOSIT_ID> con l'ID del deposito e <REFERRER_USER_ID> con l'ID del referrer
-- UPDATE deposits
-- SET referrer_id = <REFERRER_USER_ID>
-- WHERE id = <DEPOSIT_ID>;

-- 6. Verifica finale
-- SELECT * FROM users WHERE id IN (<USER_ID>, <REFERRER_USER_ID>);
