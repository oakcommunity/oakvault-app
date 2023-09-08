import React from "react";

export function Caisson() {
  return (
    <div className="flex items-center gap-4">
        <div className={'h-16 w-16 rounded-full overflow-hidden flex-shrink-0'}>
            <img src={'/icons/OakIcon.png'} className={'w-full h-full'} />
        </div>
      <h1 className="text-2xl text-[#ffffe2] hidden sm:flex">Oak Vault Swap</h1>
    </div>
  )
}
