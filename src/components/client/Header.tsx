'use client'

import { ConnectKitButton } from 'connectkit'
import { Caisson, Deploy } from '../server'

export function Header() {
  return (
    <div className="flex justify-between items-center p-4">
      <Caisson />
      <div className="flex items-center gap-8">
        <ConnectKitButton customTheme={{ backgroundColor: '#16372b'}} theme={'auto'} />
      </div>
    </div>
  )
}
