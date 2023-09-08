import {
  erc20ABI,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'

type USDCAllowanceAndApprovalReturnType = {
  usdcAllowance: any
  isApproveUSDCPrepareError: boolean
  approveUSDCWrite: any
  isApproveUSDCSuccess: boolean
  isApproveUSDCError: boolean
  isApproveUSDCLoading: boolean
  approveUSDCHash: `0x${string}` | undefined
}

export function useUSDCAllowanceAndApproval(
  address: `0x${string}` | undefined,
  OakVaultProxyAddress: `0x${string}`,
  amountUSDC: bigint,
  usdcToken: `0x${string}`,
): USDCAllowanceAndApprovalReturnType {
  //@ts-ignore
  const { data: usdcAllowance } = useContractRead({
    address: usdcToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, OakVaultProxyAddress],
    enabled: !!address,
  })

  //@ts-ignore
  const { config: approveUsdcConfig, isError: isApproveUSDCPrepareError } =
    usePrepareContractWrite({
      address: usdcToken,
      abi: erc20ABI,
      functionName: 'approve',
      args: [OakVaultProxyAddress, BigInt(amountUSDC)],
    })

  //@ts-ignore
  const {
    write: approveUSDCWrite,
    isSuccess: isApproveUSDCSuccess,
    isError: isApproveUSDCError,
    isLoading: isApproveUSDCLoading,
    data: approveUSDCData,
  } = useContractWrite(approveUsdcConfig)

  return {
    usdcAllowance,
    isApproveUSDCPrepareError,
    approveUSDCWrite,
    isApproveUSDCSuccess,
    isApproveUSDCError,
    isApproveUSDCLoading,
    approveUSDCHash: approveUSDCData?.hash,
  }
}
