'use client'

import { ConnectKitButton } from 'connectkit'
import React from 'react'

export function Header() {
  return (
    <div className="flex justify-between items-center p-4">
      <div className="flex flex-col sm:flex-row items-center gap-2">
        <div className={'h-12 w-auto overflow-hidden flex-shrink-0'}>
          <img src={'/icons/oak-logo.png'} className={'w-full h-full'} />
        </div>
        <h1 className="text-2xl text-[#ffffe2]">Vault</h1>
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
