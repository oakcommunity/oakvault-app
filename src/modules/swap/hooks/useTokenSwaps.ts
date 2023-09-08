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
  swapOakForUSDCHash: `0x${string}` | undefined
  swapUSDCForOakHash: `0x${string}` | undefined
}

export function useTokenSwaps(
  OakVaultProxyAddress: `0x${string}`,
  amountUSDC: bigint,
  amountOAK: bigint,
): TokenSwapsReturnType {
  //@ts-ignore
  const { config: usdcToOakConfig, isError: isSwapUSDCForOAKPrepareError } =
    usePrepareContractWrite({
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
    data: swapUSDCForOakData,
  } = useContractWrite(usdcToOakConfig)

  //@ts-ignore
  const { config: oakToUsdcConfig, isError: isSwapOAKForUSDCPrepareError } =
    usePrepareContractWrite({
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
    swapOakForUSDCHash: swapOakForUSDCData?.hash,
    swapUSDCForOakHash: swapUSDCForOakData?.hash,
  }
}
