# Ritiro Balance Referral - Esempio

## Endpoint

```
POST /api/withdrawals/referral
```

## Descrizione

Questo endpoint permette agli utenti di prelevare il loro balance referral accumulato. Il sistema:

1. Verifica che i prelievi siano sbloccati
2. Controlla che l'utente abbia un balance referral disponibile
3. Verifica che il balance prelevabile sia sufficiente
4. **Applica una tassa del 10%** sull'importo lordo
5. Trasferisce l'importo netto (dopo tassa) dal `total_referral_earned` al wallet dell'utente
6. Azzera il `total_referral_earned`
7. Registra il prelievo nella tabella `withdrawals` con type='referral'

### 💰 Calcolo della Tassa

- **Importo Lordo**: Il totale del balance referral
- **Tassa**: 10% dell'importo lordo
- **Importo Netto**: Importo lordo - Tassa

Esempio:
- Balance Referral: 100 USDT
- Tassa (10%): 10 USDT
- Riceverai: 90 USDT

## Request Body

```json
{
  "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
}
```

## Success Response

```json
{
  "success": true,
  "message": "Referral balance withdrawn successfully",
  "grossAmount": 125.50,
  "taxAmount": 12.55,
  "netAmount": 112.95,
  "taxRate": "10%",
  "newReferralBalance": 0,
  "newWithdrawableBalance": 250.75
}
```

**Campi della risposta:**
- `grossAmount`: Importo lordo (balance referral totale)
- `taxAmount`: Tassa applicata (10% del lordo)
- `netAmount`: Importo netto inviato al wallet (lordo - tassa)
- `taxRate`: Percentuale della tassa applicata
- `newReferralBalance`: Nuovo balance referral (sempre 0 dopo il ritiro)
- `newWithdrawableBalance`: Nuovo balance prelevabile

## Error Responses

### Prelievi bloccati
```json
{
  "error": "Withdrawals are currently locked. Platform goals must be reached first."
}
```
Status: 403 Forbidden

### Nessun balance referral
```json
{
  "error": "No referral balance available to withdraw"
}
```
Status: 400 Bad Request

### Balance insufficiente
```json
{
  "error": "Insufficient withdrawable balance. Available: 50.00 USDT"
}
```
Status: 400 Bad Request

### Utente non trovato
```json
{
  "error": "User not found"
}
```
Status: 404 Not Found

## Esempio cURL

```bash
curl -X POST http://localhost:3000/api/withdrawals/referral \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
  }'
```

## Esempio con fetch (JavaScript)

```javascript
const withdrawReferralBalance = async (walletAddress) => {
  try {
    const response = await fetch('http://localhost:3000/api/withdrawals/referral', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ walletAddress })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to withdraw referral balance');
    }

    console.log('Withdrawal successful:', data);
    console.log(`Withdrawn: ${data.amount} USDT`);
    console.log(`New withdrawable balance: ${data.newWithdrawableBalance} USDT`);

    return data;
  } catch (error) {
    console.error('Error withdrawing referral balance:', error);
    throw error;
  }
};

// Utilizzo
withdrawReferralBalance('0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb');
```

## Note Importanti

1. **Tassa del 10%**: Viene applicata automaticamente una tassa del 10% su tutti i ritiri referral
2. **Tutto il balance viene prelevato**: Il sistema preleva automaticamente tutto il `total_referral_earned` disponibile
3. **Balance prelevabile**: L'importo lordo viene dedotto dal `withdrawable_balance` dell'utente
4. **Importo netto**: L'importo registrato nella tabella `withdrawals` è quello netto (dopo la tassa)
5. **Reset automatico**: Dopo il prelievo, il `total_referral_earned` viene azzerato
6. **Tracciamento**: Ogni prelievo viene registrato nella tabella `withdrawals` con `type='referral'`
7. **Condizioni**: I prelievi devono essere sbloccati a livello globale (`withdrawals_unlocked = true`)

## Differenza con il prelievo normale

- **Prelievo normale** (`POST /api/withdrawals`): Permette di specificare un importo qualsiasi dal balance prelevabile, senza tasse
- **Prelievo referral** (`POST /api/withdrawals/referral`): Preleva automaticamente tutto il balance referral accumulato con una tassa del 10%
