export const OAK_VAULT_PROXY_ADDRESS = process.env
  .NEXT_PUBLIC_OAK_VAULT_PROXY as `0x${string}`

export const CHAIN_ID = process.env.NEXT_PUBLIC_CHAIN_ID as unknown as number

export const MAX_SWAP_LIMIT = 100 * 10 ** 6 //TODO: should derive from contract
