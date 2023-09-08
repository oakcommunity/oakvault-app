'use client'

import { ConnectKitButton } from 'connectkit'
import React from 'react'

export function Header() {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex items-center gap-4">
        <div className={'h-16 w-16 rounded-full overflow-hidden flex-shrink-0'}>
          <img src={'/icons/OakIcon.png'} className={'w-full h-full'} />
        </div>
        <h1 className="text-2xl text-[#ffffe2] hidden sm:flex">
          Oak Vault Swap
        </h1>
      </div>
      <div className="flex items-center gap-8">
        <ConnectKitButton
          customTheme={{ backgroundColor: '#16372b' }}
          theme={'auto'}
        />
      </div>
    </div>
  )
}
