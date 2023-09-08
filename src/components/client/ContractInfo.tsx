'use client'

import { useAccount, useBalance } from 'wagmi'
import useOakVault from '../../hooks/useOakVault'

export function ContractInfo() {
  const { address } = useAccount()
  const { usdcToken, oakToken } = useOakVault()
  const { data: usdcBalance } = useBalance({
    address: OakVaultProxyAddress!,
    token: usdcToken,
    chainId: 84531,
  })

  const { data: oakBalance } = useBalance({
    address: OakVaultProxyAddress!,
    token: oakToken,
    chainId: 84531,
  })

  return (
      <div className='flex items-center justify-center mt-12 w-11/12 sm:w-3/4 mx-auto mb-20'>
        <div className="flex flex-col py-4 p-4 w-full sm:w-[600px] bg-[#16372b] text-[#ffffe2] rounded-xl border border-black shadow-sm">
          <div className="ml-auto mb-6"><span className={'text-[#faf5b7'}>Oak Vault</span> Contract Information</div>
          <div className='flex flex-col mb-2'>
            <div className={'text-sm text-[#faf5b7]'}>contract address</div>
            <div>{OakVaultProxyAddress!}</div>
          </div>
          <div className='flex flex-col mb-2'>
            <div className={'text-sm text-[#faf5b7]'}>usdc balance</div>
            <div>{usdcBalance?.formatted} USDC</div>
          </div>
          <div className='flex flex-col mb-2'>
            <div className={'text-sm text-[#faf5b7]'}>oak balance</div>
            <div>{oakBalance?.formatted } OAK</div>
          </div>

        </div>
      </div>
  )
}
