import {
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import { Address } from 'viem'
import { erc20ABI } from 'wagmi'

export function ApproveButton({
  userAddress,
  onClick,
  tokenAddress,
}: {
  userAddress: Address
  onClick: () => void
  tokenAddress: Address
}) {
  const MAX_ALLOWANCE =
    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
  // 1. Read from erc20, does spender (0x Exchange Proxy) have allowance?
  const { data: allowance, refetch } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [userAddress, process.env.NEXT_PUBLIC_OAK_VAULT_PROXY],
  })

  // 2. (only if no allowance): write to erc20, approve 0x Exchange Proxy to spend max integer
  const { config } = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [process.env.NEXT_PUBLIC_OAK_VAULT_PROXY, MAX_ALLOWANCE],
  })

  console.log('A', allowance)

  const {
    data: writeContractResult,
    writeAsync: approveAsync,
    error,
  } = useContractWrite(config)

  const { isLoading: isApproving } = useWaitForTransaction({
    hash: writeContractResult ? writeContractResult.hash : undefined,
    onSuccess(data) {
      refetch()
    },
  })

  if (error) {
    return <div>Something went wrong: {error.message}</div>
  }

  if (allowance === 0n && approveAsync) {
    return (
      <>
        <button
          type="button"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
          onClick={async () => {
            if (approveAsync) {
              const writtenValue = await approveAsync()
            }
          }}
        >
          {isApproving ? 'Approving...' : 'Approve'}
        </button>
      </>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full"
    >
      Approve
    </button>
  )
}
