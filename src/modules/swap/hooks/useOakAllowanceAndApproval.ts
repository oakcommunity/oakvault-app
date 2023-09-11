import {
  erc20ABI,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import { MAX_SWAP_LIMIT } from '../../../constants'

type OAKAllowanceAndApprovalReturnType = {
  oakAllowance: any
  isApproveOAKPrepareError: boolean
  approveOAKWrite: any
  isApproveOakSuccess: boolean
  isApproveOAKError: boolean
  isApproveOAKLoading: boolean
  approveOakHash: `0x${string}` | undefined
}

export function useOAKAllowanceAndApproval(
  address: `0x${string}` | undefined,
  OakVaultProxyAddress: `0x${string}`,
  amountOAK: bigint,
  oakToken: `0x${string}`,
  userOakBalance: bigint | undefined,
): OAKAllowanceAndApprovalReturnType {
  //@ts-ignore
  const { data: oakAllowance } = useContractRead({
    address: oakToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, OakVaultProxyAddress],
    enabled: !!address,
    watch: true
  })

  //@ts-ignore
  const { config: approveOakConfig, isError: isApproveOAKPrepareError } =
    usePrepareContractWrite({
      address: oakToken,
      abi: erc20ABI,
      functionName: 'approve',
      args: [OakVaultProxyAddress, BigInt(userOakBalance || 0)],
    })

  //@ts-ignore
  const {
    write: approveOAKWrite,
    isSuccess: isApproveOakSuccess,
    isError: isApproveOAKError,
    isLoading: isApproveOAKLoading,
    data: approveOakData,
  } = useContractWrite(approveOakConfig)

  return {
    oakAllowance,
    isApproveOAKPrepareError,
    approveOAKWrite,
    isApproveOakSuccess,
    isApproveOAKError,
    isApproveOAKLoading,
    approveOakHash: approveOakData?.hash,
  }
}
