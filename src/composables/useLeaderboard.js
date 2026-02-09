import { ref } from 'vue'

const RPC_ENDPOINT = 'https://api.devnet.solana.com'
const MEMO_PROGRAM = 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
const GAME_ID = 'stock-card-master'
const SIGNATURE_LIMIT = 25
const MAX_ENTRIES = 20
const TIMEOUT_MS = 15000

async function solanaRpc(method, params, signal) {
  const body = { jsonrpc: '2.0', id: 1, method, params }
  const res = await fetch(RPC_ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
    signal,
  })
  if (!res.ok) throw new Error(`RPC HTTP ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(json.error.message || 'RPC error')
  return json.result
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text)
  } catch (e) {
    return null
  }
}

function formatPlayerFromAccountKeys(accountKeys) {
  const payer = accountKeys?.[0]?.pubkey || accountKeys?.[0] || ''
  if (typeof payer === 'string') return payer
  if (payer?.toString) return payer.toString()
  return String(payer)
}

export function useLeaderboard() {
  const leaderboard = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchLeaderboard() {
    loading.value = true
    error.value = null

    try {
      const abort = new AbortController()
      const timeout = setTimeout(() => abort.abort(), TIMEOUT_MS)

      const sigInfos = await solanaRpc('getSignaturesForAddress', [MEMO_PROGRAM, { limit: SIGNATURE_LIMIT }], abort.signal)
      const signatures = (sigInfos || []).map((s) => s.signature).filter(Boolean)
      if (signatures.length === 0) {
        leaderboard.value = []
        clearTimeout(timeout)
        return
      }

      // Some RPCs don't implement getParsedTransactions; fallback to getTransaction.
      let txs = null
      try {
        txs = await solanaRpc(
          'getParsedTransactions',
          [signatures, { maxSupportedTransactionVersion: 0, commitment: 'confirmed' }],
          abort.signal
        )
      } catch (e) {
        txs = null
      }

      if (!Array.isArray(txs)) {
        const fetched = []
        for (const sig of signatures) {
          try {
            const tx = await solanaRpc(
              'getTransaction',
              [sig, { maxSupportedTransactionVersion: 0, commitment: 'confirmed' }],
              abort.signal
            )
            fetched.push(tx)
          } catch (e) {
            fetched.push(null)
          }
        }
        txs = fetched
      }

      const entries = []
      for (let i = 0; i < (txs || []).length; i += 1) {
        const tx = txs[i]
        if (!tx?.transaction?.message) continue

        const player = formatPlayerFromAccountKeys(tx.transaction.message.accountKeys)
        const instructions = tx.transaction.message.instructions || []

        let matched = false
        for (const ix of instructions) {
          if (ix?.program === 'spl-memo' && typeof ix.parsed === 'string') {
            if (!ix.parsed.includes(GAME_ID)) continue
            const data = safeJsonParse(ix.parsed)
            if (!data || data.game !== GAME_ID) continue
            matched = true
            entries.push({
              player,
              score: Number(data.score || 0),
              week: Number(data.week || 0),
              timestamp: Number(data.timestamp || 0),
              signature: signatures[i] || '',
            })
          }
        }

        if (!matched && Array.isArray(tx.meta?.logMessages)) {
          for (const log of tx.meta.logMessages) {
            if (typeof log !== 'string' || !log.includes(GAME_ID)) continue
            const m = log.match(/Program log: Memo \\(len \\d+\\): \\\"(.*)\\\"/)
            if (!m) continue
            const data = safeJsonParse(m[1])
            if (!data || data.game !== GAME_ID) continue
            entries.push({
              player,
              score: Number(data.score || 0),
              week: Number(data.week || 0),
              timestamp: Number(data.timestamp || 0),
              signature: signatures[i] || '',
            })
            break
          }
        }
      }

      leaderboard.value = entries.sort((a, b) => b.score - a.score).slice(0, MAX_ENTRIES)
      clearTimeout(timeout)
    } catch (err) {
      error.value = err.message
    } finally {
      loading.value = false
    }
  }

  function formatAddress(address) {
    if (!address) return ''
    return `${address.slice(0, 4)}...${address.slice(-4)}`
  }

  return {
    leaderboard,
    loading,
    error,
    fetchLeaderboard,
    formatAddress
  }
}
