'use client'

import React from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  useAccount, useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import { erc20ABI } from 'wagmi'
import useOakVault from '../../hooks/useOakVault'
import OakVaultABI from '../../abi/OakVaultABI.json'

export function Swap() {
  const { address } = useAccount()
  const { isOwner, usdcToken, oakToken } = useOakVault(address)

  const [amountUSDC, setAmountUSDC] = React.useState<number>(0)
  const [amountOAK, setAmountOAK] = React.useState<number>(0)
  const [swappingOutUSDC, setSwappingOutUSDC] = React.useState<boolean>(true)

  const {data: usdcBalance} = useBalance({
    address: address,
    token: usdcToken,
    chainId: 84531,
  })

  const {data: oakBalance} = useBalance({
    address: address,
    token: oakToken,
    chainId: 84531,
  })

  //@ts-ignore
  const { data: usdcAllowance } = useContractRead({
    address: usdcToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, process.env.NEXT_PUBLIC_OAK_VAULT_PROXY],
  })

  //@ts-ignore
  const approveUsdcConfig = usePrepareContractWrite({
    address: usdcToken,
    abi: erc20ABI,
    functionName: 'approve',
    args: [process.env.NEXT_PUBLIC_OAK_VAULT_PROXY, amountUSDC],
  })

  const { write: approveUSDCWrite } = useContractWrite(approveUsdcConfig.config)

  //@ts-ignore
  const { data: oakAllowance } = useContractRead({
    address: oakToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, process.env.NEXT_PUBLIC_OAK_VAULT_PROXY],
  })

  //@ts-ignore
  const approveOakConfig = usePrepareContractWrite({
    address: oakToken,
    abi: erc20ABI,
    functionName: 'approve',
    args: [process.env.NEXT_PUBLIC_OAK_VAULT_PROXY, amountOAK],
  })

  const { write: approveOAKWrite } = useContractWrite(approveOakConfig.config)

  //@ts-ignore
  const usdcToOakConfig = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_OAK_VAULT_PROXY,
    abi: OakVaultABI,
    functionName: 'swapUSDCForOak',
    args: [amountUSDC],
  })

  //@ts-ignore
  const { write: swapUSDCForOakWrite } = useContractWrite(usdcToOakConfig.config)

  //@ts-ignore
  const oakToUsdcConfig = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_OAK_VAULT_PROXY,
    abi: OakVaultABI,
    functionName: 'swapOakForUSDC',
    args: [amountOAK],
  })

  //@ts-ignore
  const { write: swapOakForUSDCWrite } = useContractWrite(oakToUsdcConfig.config)

  const validationSchema = Yup.object({
    amount: Yup.number()
        .max(100, 'Amount cannot be more than 100')
        .positive('Amount must be positive')
        .test(
            'decimal-places',
            'Amount cannot have more than 6 decimal places',
            (value) => {
              if (!value) return true
              const decimalPlaces = value.toString().split('.')[1]?.length || 0
              return decimalPlaces <= 6
            },
        ),
  })

  const handleAmountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(event)
    const inputValue = parseFloat(event.target.value)
    if (swappingOutUSDC) {
      setAmountUSDC(inputValue * 10 ** 6)
    } else {
      setAmountOAK(inputValue * 10 ** 6)
    }
  }

  const handleSwapOrder = () => {
    setSwappingOutUSDC(!swappingOutUSDC)
  }

  const getReceivedAmount = (): number => {
    const inputValue = parseFloat(formik.values.amount)
    if (!inputValue) return 0

    if (swappingOutUSDC) {
      return inputValue // 1:1 rate for USDC to OAK
    } else {
      return inputValue * 0.95 // 1:0.95 rate for OAK to USDC
    }
  }

  const formik = useFormik({
    initialValues: {
      amount: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      if (swappingOutUSDC) {
        if (usdcAllowance === 0n) {
          await approveUSDCWrite?.()
        }
        await swapUSDCForOakWrite?.()
      } else {
        if (oakAllowance === 0n) {
          await approveOAKWrite?.()
        }
        await swapOakForUSDCWrite?.()
      }
    },
  })

  return (
      <div className="flex items-center justify-center mt-12 w-11/12 sm:w-3/4 mx-auto">
        <form onSubmit={formik.handleSubmit} className={'flex flex-col items-center w-full sm:w-[600px] bg-[#16372b] p-12 pt-20 rounded-xl border border-black shadow-sm'}>
          <div className={'font-bold text-2xl -mt-12 pb-12 self-start text-[#ffffe2]'}>Swap</div>
          <div className="relative w-full mb-4">
            <label className={'absolute -top-[30px] text-[#ffffe2]'}>You pay:</label>
            <input
                type="number"
                name="amount"
                className="w-full border py-8 px-8 rounded no-spinner text-3xl"
                placeholder={swappingOutUSDC ? 'USDC' : 'OAK'}
                onChange={handleAmountChange}
                value={formik.values.amount}
                max="100"
            />
            <div className={'absolute text-[#163a2e] right-2 bottom-2 text-xs'}>Balance: {swappingOutUSDC ? usdcBalance?.formatted : oakBalance?.formatted}</div>
            <div className={'flex items-center justify-center gap-2 absolute right-2 top-1/2 transform -translate-y-3/4'}>
              <div className={'w-8 h-8 rounded-full overflow-hidden'}>
                <img src={swappingOutUSDC ? '/icons/USDCIcon.svg' : '/icons/OakIcon.png'} className={'w-full h-full'} />
              </div>
              <div className={'font-bold'}>{swappingOutUSDC ? 'USDC' : 'OAK'}</div>
            </div>



            {formik.touched.amount && formik.errors.amount && (
                <p className="text-red-500 text-sm mt-1">{formik.errors.amount}</p>
            )}
          </div>
          <button
              type="button"
              className="text-black py-1 px-2 rounded mb-4 transition duration-300"
              onClick={handleSwapOrder}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" id="swap"><path fill="none" d="M0 0h48v48H0z"></path><path d="M24 4C12.95 4 4 12.95 4 24s8.95 20 20 20 20-8.95 20-20S35.05 4 24 4zM13 18l7-7 7 7h-5v8h-4v-8h-5zm22 12-7 7-7-7h5v-8h4v8h5z"></path></svg>
          </button>
          <div className="relative w-full mb-4">
            <label className={'absolute -top-[30px] text-[#ffffe2]'}>You receive:</label>
            <input
                type="number"
                name="receiveAmount"
                className="w-full border py-8 px-8 rounded text-3xl no-spinner"
                placeholder={swappingOutUSDC ? 'OAK' : 'USDC'}
                value={getReceivedAmount().toString() === '0' ? '' : getReceivedAmount().toString() }
                readOnly
            />
            <div className={'absolute text-[#163a2e] right-2 bottom-2 text-xs'}>Balance: {!swappingOutUSDC ? usdcBalance?.formatted : oakBalance?.formatted}</div>
            <div className={'flex items-center justify-center gap-2 absolute right-2 top-1/2 transform -translate-y-3/4'}>
              <div className={'w-8 h-8 rounded-full overflow-hidden'}>
                <img src={!swappingOutUSDC ? '/icons/USDCIcon.svg' : '/icons/OakIcon.png'} className={'w-full h-full'} />
              </div>
              <div className={'font-bold'}>{!swappingOutUSDC ? 'USDC' : 'OAK'}</div>
            </div>
          </div>
          <button
              type="submit"
              className="w-full bg-[#ffffe2] text-[#163a2e] text-xl font-bold py-5 px-4 rounded-2xl hover:bg-[#faf5b7]"
          >
            Swap
          </button>
        </form>
      </div>
  )
}
