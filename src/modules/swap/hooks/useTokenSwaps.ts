import { useContractWrite, usePrepareContractWrite } from 'wagmi'
import OakVaultABI from '../../../abi/OakVaultABI.json'

type TokenSwapsReturnType = {
  isSwapUSDCForOAKPrepareError: boolean
  swapUSDCForOakWrite: any
  isSwapUSDCForOAKLoading: boolean
  isSwapOAKForUSDCPrepareError: boolean
  swapOakForUSDCWrite: any
  isSwapOAKForUSDCLoading: boolean
  isSwapUSDCForOAKError: boolean
  isSwapOAKForUSDCError: boolean
  isSwapOakForUSDCSuccess: boolean
  isSwapUSDCForOAKSuccess: boolean
  swapOakForUSDCHash: `0x${string}` | undefined
  swapUSDCForOakHash: `0x${string}` | undefined
  error: Error | null
}

export function useTokenSwaps(
  OakVaultProxyAddress: `0x${string}`,
  amountUSDC: bigint,
  amountOAK: bigint,
): TokenSwapsReturnType {
  //@ts-ignore
  const {
    config: usdcToOakConfig,
    isError: isSwapUSDCForOAKPrepareError,
    error: SwapUSDCPrepareError,
  } = usePrepareContractWrite({
    address: OakVaultProxyAddress,
    abi: OakVaultABI,
    functionName: 'swapUSDCForOak',
    args: [amountUSDC],
  })

  //@ts-ignore
  const {
    write: swapUSDCForOakWrite,
    isLoading: isSwapUSDCForOAKLoading,
    isError: isSwapUSDCForOAKError,
    isSuccess: isSwapUSDCForOAKSuccess,
    data: swapUSDCForOakData,
  } = useContractWrite(usdcToOakConfig)

  //@ts-ignore
  const {
    config: oakToUsdcConfig,
    isError: isSwapOAKForUSDCPrepareError,
    error: swapOakPrepareError,
  } = usePrepareContractWrite({
    address: OakVaultProxyAddress,
    abi: OakVaultABI,
    functionName: 'swapOakForUSDC',
    args: [amountOAK],
  })

  //@ts-ignore
  const {
    write: swapOakForUSDCWrite,
    isLoading: isSwapOAKForUSDCLoading,
    isError: isSwapOAKForUSDCError,
    isSuccess: isSwapOakForUSDCSuccess,
    data: swapOakForUSDCData,
  } = useContractWrite(oakToUsdcConfig)

  return {
    isSwapUSDCForOAKPrepareError,
    swapUSDCForOakWrite,
    isSwapUSDCForOAKLoading,
    isSwapOAKForUSDCPrepareError,
    swapOakForUSDCWrite,
    isSwapOAKForUSDCLoading,
    isSwapUSDCForOAKError,
    isSwapOAKForUSDCError,
    isSwapOakForUSDCSuccess,
    isSwapUSDCForOAKSuccess,
    swapOakForUSDCHash: swapOakForUSDCData?.hash,
    swapUSDCForOakHash: swapUSDCForOakData?.hash,
    error: SwapUSDCPrepareError || swapOakPrepareError,
  }
}
