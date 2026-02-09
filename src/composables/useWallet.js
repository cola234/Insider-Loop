import { ref, computed } from 'vue'
import { Connection, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'

const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')
const RPC_ENDPOINT = 'https://api.devnet.solana.com'

export function useWallet() {
  const wallet = ref(null)
  const publicKey = ref(null)
  const connected = computed(() => !!publicKey.value)
  const connecting = ref(false)
  const error = ref(null)

  async function connect() {
    connecting.value = true
    error.value = null

    try {
      const provider = window.solana
      if (!provider?.isPhantom) {
        throw new Error('请安装 Phantom 钱包')
      }

      const response = await provider.connect()
      wallet.value = provider
      publicKey.value = response.publicKey.toString()
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      connecting.value = false
    }
  }

  async function disconnect() {
    if (wallet.value) {
      await wallet.value.disconnect()
      wallet.value = null
      publicKey.value = null
    }
  }

  async function submitScore(score, week) {
    if (!wallet.value || !publicKey.value) {
      throw new Error('请先连接钱包')
    }

    const connection = new Connection(RPC_ENDPOINT, 'confirmed')
    const memo = JSON.stringify({
      game: 'stock-card-master',
      score: score,
      week: week,
      timestamp: Date.now()
    })

    const instruction = new TransactionInstruction({
      keys: [{ pubkey: new PublicKey(publicKey.value), isSigner: true, isWritable: true }],
      programId: MEMO_PROGRAM_ID,
      data: Buffer.from(memo, 'utf-8')
    })

    const transaction = new Transaction().add(instruction)
    const { blockhash } = await connection.getLatestBlockhash()
    transaction.recentBlockhash = blockhash
    transaction.feePayer = new PublicKey(publicKey.value)

    const signed = await wallet.value.signTransaction(transaction)
    const signature = await connection.sendRawTransaction(signed.serialize())
    await connection.confirmTransaction(signature, 'confirmed')

    return signature
  }

  return {
    wallet,
    publicKey,
    connected,
    connecting,
    error,
    connect,
    disconnect,
    submitScore
  }
}
