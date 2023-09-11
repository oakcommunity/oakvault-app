import {
  erc20ABI,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import OakVaultABI from '../../../abi/OakVaultABI.json'

type TokenOperationsReturnType = {
  allowance: any
  approveWrite: any
  depositWrite: any
  isApproveLoading: boolean
  isApproveError: boolean
  approveHash: `0x${string}` | undefined
  isDepositLoading: boolean
  isDepositError: boolean
  depositHash: `0x${string}` | undefined
  isPrepareError: boolean
}

export function useTokenAllowanceAndApproval(
  address: `0x${string}` | undefined,
  tokenAddress: `0x${string}`,
  OAK_VAULT_PROXY_ADDRESS: `0x${string}`,
  depositType: 'USDC' | 'OAK',
  amountToDeposit: number,
  amountToAllow: bigint
): TokenOperationsReturnType {

  //@ts-ignore
  const { data: allowance } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, OAK_VAULT_PROXY_ADDRESS!],
    enabled: !!address,
    watch: true
  })

  //@ts-ignore
  const approveConfig = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      OAK_VAULT_PROXY_ADDRESS!,
      amountToAllow,
    ],
  })

  const {
    write: approveWrite,
    isLoading: isApproveLoading,
    isError: isApproveError,
    data: approveData,
  } = useContractWrite(approveConfig.config)

  // Preparing the deposit
  //@ts-ignore
  const { config: depositConfig, isError: isPrepareError } =
    usePrepareContractWrite({
      address: OAK_VAULT_PROXY_ADDRESS!,
      abi: OakVaultABI,
      functionName: depositType === 'USDC' ? 'depositUSDC' : 'depositOak',
      args: [tokenAddress, amountToDeposit],
      enabled: amountToDeposit > 0,
    })

  //@ts-ignore
  const {
    write: depositWrite,
    isLoading: isDepositLoading,
    isError: isDepositError,
    data: depositData,
  } = useContractWrite(depositConfig)

  return {
    allowance,
    approveWrite,
    depositWrite,
    isApproveLoading,
    isApproveError,
    approveHash: approveData?.hash,
    isDepositLoading,
    isDepositError,
    depositHash: depositData?.hash,
    isPrepareError,
  }
}
