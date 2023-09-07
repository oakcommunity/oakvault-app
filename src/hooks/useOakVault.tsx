import OakVaultABI from '../abi/OakVaultABI.json'
import { useContractReads } from 'wagmi'

type UseOakVaultResponse = {
  isOwner: boolean
  paused: boolean
  lastTimeSwap: number
  swapLimit: number
  timeLimit: number
  usdcToken: `0x${string}`
  oakToken: `0x${string}`
}

const useOakVault = (address?: `0x${string}`): UseOakVaultResponse => {
  const vaultContract = {
    address: process.env.NEXT_PUBLIC_OAK_VAULT_PROXY,
    abi: OakVaultABI,
    chainId: 84531,
  }

  const { data } = useContractReads({
    contracts: [
      {
        ...vaultContract,
        functionName: 'owner',
      },
      {
        ...vaultContract,
        functionName: 'paused',
      },
      {
        ...vaultContract,
        functionName: 'lastSwapTime',
        args: [address],
      },
      {
        ...vaultContract,
        functionName: 'SWAP_LIMIT',
      },
      {
        ...vaultContract,
        functionName: 'TIME_LIMIT',
      },
      {
        ...vaultContract,
        functionName: 'usdcToken',
      },
      {
        ...vaultContract,
        functionName: 'oakToken',
      },
    ],
  })

  const contractInfo = data?.map((item) => item.result) as UseOakVaultResponse

  return {
    isOwner: contractInfo?.[0] === address,
    paused: contractInfo?.[1],
    lastTimeSwap: contractInfo?.[2],
    swapLimit: contractInfo?.[3],
    timeLimit: contractInfo?.[4],
    usdcToken: contractInfo?.[5],
    oakToken: contractInfo?.[6],
  }
}

export default useOakVault
