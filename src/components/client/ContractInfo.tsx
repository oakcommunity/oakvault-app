'use client'

import { useBalance } from 'wagmi'
import useOakVault from '../../hooks/useOakVault'
import { OAK_VAULT_PROXY_ADDRESS } from '../../constants'
import Notification from './Notification'
import React from 'react'

export function ContractInfo({
  notification,
  setIsNotificationMessage,
}: {
  notification: string | undefined
  setIsNotificationMessage: (
    value:
      | ((prevState: string | undefined) => string | undefined)
      | string
      | undefined,
  ) => void
}) {
  const { usdcToken, oakToken } = useOakVault()
  const { data: usdcBalance } = useBalance({
    address: OAK_VAULT_PROXY_ADDRESS!,
    token: usdcToken,
    chainId: 84531,
  })

  const { data: oakBalance } = useBalance({
    address: OAK_VAULT_PROXY_ADDRESS!,
    token: oakToken,
    chainId: 84531,
  })

  return (
    <div className='flex items-center justify-center mt-12 w-11/12 sm:w-3/4 mx-auto overflow-hidden'>
      <div className="flex flex-col py-4 p-4 w-full sm:w-[600px] bg-[#16372b] text-[#ffffe2] rounded-xl border border-black shadow-sm">
        <div className="ml-auto mb-6">
          <span className={'text-[#faf5b7'}>Oak Vault</span> Contract
          Information
        </div>
        <div className='flex flex-col mb-2'>
          <div className={'text-sm text-[#faf5b7]'}>contract address</div>
          <div className={'break-words'}><a href={`https://goerli.basescan.org/address/${OAK_VAULT_PROXY_ADDRESS}`}>{OAK_VAULT_PROXY_ADDRESS!}</a></div>
        </div>
        <div className='flex flex-col mb-2'>
          <div className={'text-sm text-[#faf5b7]'}>usdc balance</div>
          <div>{usdcBalance?.formatted} USDC</div>
        </div>
        <div className='flex flex-col mb-2'>
          <div className={'text-sm text-[#faf5b7]'}>oak balance</div>
          <div>{oakBalance?.formatted} OAK</div>
        </div>
        <div className='flex flex-col mb-2'>
          <div className={'text-sm text-[#faf5b7]'}>vault rules</div>
          <div>- 1 swap USDC {'->'} OAK per 24 hours</div>
          <div>- Maximum 100 USDC Swap</div>
          <div>- 5% Vault Tax on OAK {'->'} USDC swaps </div>
        </div>
      </div>
      {!!notification && (
        <Notification
          message={notification}
          onClose={setIsNotificationMessage}
        />
      )}
    </div>
  )
}
