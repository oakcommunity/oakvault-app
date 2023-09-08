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
    address: OakVaultProxyAddress!,
    abi: [
      { "inputs": [], "name": "ExceedsSwapLimit", "type": "error" },
      { "inputs": [], "name": "InsufficientTokenBalance", "type": "error" },
      { "inputs": [], "name": "InsufficientUSDCBalance", "type": "error" },
      { "inputs": [], "name": "InvalidOakAddress", "type": "error" },
      { "inputs": [], "name": "InvalidUSDCAddress", "type": "error" },
      { "inputs": [], "name": "SwapCooldown", "type": "error" },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "uint8",
            "name": "version",
            "type": "uint8"
          }
        ],
        "name": "Initialized",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "OakDeposited",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "previousOwner",
            "type": "address"
          },
          {
            "indexed": true,
            "internalType": "address",
            "name": "newOwner",
            "type": "address"
          }
        ],
        "name": "OwnershipTransferred",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Paused",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "surcharge",
            "type": "uint256"
          }
        ],
        "name": "SwappedOakForUSDC",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "user",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "SwappedUSDCForOak",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "USDCDeposited",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": true,
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "indexed": false,
            "internalType": "uint256",
            "name": "amount",
            "type": "uint256"
          }
        ],
        "name": "USDCWithdrawn",
        "type": "event"
      },
      {
        "anonymous": false,
        "inputs": [
          {
            "indexed": false,
            "internalType": "address",
            "name": "account",
            "type": "address"
          }
        ],
        "name": "Unpaused",
        "type": "event"
      },
      {
        "inputs": [],
        "name": "SWAP_LIMIT",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "TIME_LIMIT",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "tokenAddress", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "depositOak",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "tokenAddress", "type": "address" },
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "depositUSDC",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "_oakToken", "type": "address" },
          { "internalType": "address", "name": "_usdcToken", "type": "address" }
        ],
        "name": "initialize",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "name": "lastSwapTime",
        "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "oakToken",
        "outputs": [
          {
            "internalType": "contract IERC20Upgradeable",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "owner",
        "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "paused",
        "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "renounceOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "swapOakForUSDC",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "swapUSDCForOak",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "address", "name": "newOwner", "type": "address" }
        ],
        "name": "transferOwnership",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "usdcToken",
        "outputs": [
          {
            "internalType": "contract IERC20Upgradeable",
            "name": "",
            "type": "address"
          }
        ],
        "stateMutability": "view",
        "type": "function"
      },
      {
        "inputs": [
          { "internalType": "uint256", "name": "amount", "type": "uint256" }
        ],
        "name": "withdrawUSDC",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
      }
    ] as const
    ,
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
        args: [address!],
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

  const contractInfo = data?.map((item) => item.result)

  return {
    isOwner: contractInfo?.[0] === address,
    paused: contractInfo?.[1],
    lastTimeSwap: contractInfo?.[2],
    swapLimit: contractInfo?.[3],
    timeLimit: contractInfo?.[4],
    usdcToken: contractInfo?.[5],
    oakToken: contractInfo?.[6],
  }  as unknown as UseOakVaultResponse
}

export default useOakVault
