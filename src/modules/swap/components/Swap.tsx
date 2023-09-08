'use client'

import React from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  useAccount,
  useBalance,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import { erc20ABI } from 'wagmi'
import useOakVault from '../../../hooks/useOakVault'
import OakVaultABI from '../../../abi/OakVaultABI.json'

export function Swap() {
  const { address } = useAccount()
  const { usdcToken, oakToken } = useOakVault(address)

  const [amountUSDC, setAmountUSDC] = React.useState<number>(0)
  const [amountOAK, setAmountOAK] = React.useState<number>(0)
  const [swappingOutUSDC, setSwappingOutUSDC] = React.useState<boolean>(true)

  const { data: usdcBalance } = useBalance({
    address: address,
    token: usdcToken,
    chainId: 84531,
  })

  const { data: oakBalance } = useBalance({
    address: address,
    token: oakToken,
    chainId: 84531,
  })

  //@ts-ignore
  const { data: usdcAllowance } = useContractRead({
    address: usdcToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, OakVaultProxyAddress!],
    enabled: !!address
  })

  //@ts-ignore
  const {config: approveUsdcConfig, isError: isApproveUSDCPrepareError} = usePrepareContractWrite({
    address: usdcToken,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      OakVaultProxyAddress!,
      BigInt(amountUSDC),
    ],
  })

  const { write: approveUSDCWrite, isSuccess: isApproveUSDCSuccess, isError: isApproveUSDCError, isLoading: isApproveUSDCLoading } = useContractWrite(approveUsdcConfig)

  //@ts-ignore
  const { data: oakAllowance } = useContractRead({
    address: oakToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, OakVaultProxyAddress!],
    enabled: !!address
  })

  //@ts-ignore
  const {config: approveOakConfig, isError: isApproveOAKPrepareError} = usePrepareContractWrite({
    address: oakToken,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      OakVaultProxyAddress!,
      BigInt(amountOAK),
    ],
  })

  const { write: approveOAKWrite, isSuccess: isApproveOakSuccess,  isError: isApproveOAKError, isLoading: isApproveOAKLoading } = useContractWrite(approveOakConfig)

  //@ts-ignore
  const {config: usdcToOakConfig, isError: isSwapUSDCForOAKPrepareError} = usePrepareContractWrite({
    address: OakVaultProxyAddress!,
    abi: OakVaultABI,
    functionName: 'swapUSDCForOak',
    args: [amountUSDC],
  })

  //@ts-ignore
  const { write: swapUSDCForOakWrite, isLoading: isSwapUSDCForOAKLoading } = useContractWrite(
    usdcToOakConfig,
  )

  //@ts-ignore
  const {config: oakToUsdcConfig, isError: isSwapOAKForUSDCPrepareError} = usePrepareContractWrite({
    address: OakVaultProxyAddress!,
    abi: OakVaultABI,
    functionName: 'swapOakForUSDC',
    args: [amountOAK],
  })

  //@ts-ignore
  const { write: swapOakForUSDCWrite, isLoading: isSwapOAKForUSDCLoading } = useContractWrite(
    oakToUsdcConfig,
  )

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
      <form
        onSubmit={formik.handleSubmit}
        className={
          'flex flex-col items-center w-full sm:w-[600px] bg-[#16372b] p-4 sm:p-12 sm:pt-16 rounded-xl border border-black shadow-sm'
        }
      >
        <div
          className={
            'font-bold text-2xl -mt-12 pb-12 self-start text-[#ffffe2]'
          }
        >
          Swap
        </div>
        <div className="relative w-full mb-4">
          <label className={'absolute -top-[30px] text-[#ffffe2]'}>
            You pay:
          </label>
          <input
            type="number"
            name="amount"
            className="w-full border py-8 px-8 rounded no-spinner text-3xl bg-[#ffffe2]"
            placeholder={swappingOutUSDC ? 'USDC' : 'OAK'}
            onChange={handleAmountChange}
            value={formik.values.amount}
            max="100"
          />
          <div className={'absolute text-[#163a2e] right-2 bottom-2 text-xs'}>
            Balance:{' '}
            {swappingOutUSDC ? usdcBalance?.formatted : oakBalance?.formatted}
          </div>
          <div
            className={
              'flex items-center justify-center gap-2 absolute right-2 top-1/2 transform -translate-y-3/4'
            }
          >
            <div className={'w-8 h-8 rounded-full overflow-hidden'}>
              <img
                src={
                  swappingOutUSDC ? '/icons/USDCIcon.svg' : '/icons/OakIcon.png'
                }
                className={'w-full h-full'}
              />
            </div>
            <div className={'font-bold'}>
              {swappingOutUSDC ? 'USDC' : 'OAK'}
            </div>
          </div>

          {formik.touched.amount && formik.errors.amount && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.amount}</p>
          )}
        </div>
        <button
          type="button"
          className="text-black py-3 px-2 rounded mb-4 transition duration-300 rotate-90"
          onClick={handleSwapOrder}
        >
          <svg
            className="svg-icon"
            width="48"
            height="48"
            id="swap"
            viewBox="0 0 1024 1024"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            fill='#faf5b7'
          >
            <path d="M193.9 414.6c-0.3 0-0.6 0-0.9-0.1-0.4 0-0.7-0.1-1.1-0.1-0.2 0-0.5-0.1-0.7-0.1-0.4-0.1-0.8-0.1-1.1-0.2-0.2 0-0.4-0.1-0.6-0.1-0.4-0.1-0.8-0.2-1.1-0.3-0.2 0-0.4-0.1-0.6-0.1-0.4-0.1-0.7-0.2-1.1-0.3-0.2-0.1-0.4-0.1-0.6-0.2-0.3-0.1-0.7-0.2-1-0.3-0.2-0.1-0.5-0.2-0.7-0.2l-0.9-0.3c-0.3-0.1-0.5-0.2-0.8-0.3-0.3-0.1-0.5-0.2-0.8-0.3-0.3-0.1-0.6-0.3-0.9-0.4-0.2-0.1-0.4-0.2-0.7-0.3-0.3-0.2-0.6-0.3-0.9-0.5l-0.6-0.3c-0.3-0.2-0.7-0.4-1-0.6-0.2-0.1-0.3-0.2-0.5-0.3-0.3-0.2-0.7-0.4-1-0.6-0.2-0.1-0.3-0.2-0.5-0.3-0.3-0.2-0.6-0.4-0.9-0.7-0.2-0.1-0.4-0.3-0.5-0.4-0.3-0.2-0.6-0.4-0.8-0.7-0.2-0.2-0.5-0.4-0.7-0.6-0.2-0.2-0.4-0.4-0.6-0.5-0.9-0.8-1.7-1.6-2.5-2.5-0.2-0.2-0.4-0.4-0.5-0.6-0.2-0.2-0.4-0.5-0.6-0.7-0.2-0.3-0.4-0.6-0.7-0.8-0.1-0.2-0.3-0.4-0.4-0.5-0.2-0.3-0.4-0.6-0.7-0.9-0.1-0.2-0.2-0.3-0.3-0.5-0.2-0.3-0.4-0.7-0.6-1-0.1-0.2-0.2-0.3-0.3-0.5-0.2-0.3-0.4-0.7-0.6-1l-0.3-0.6c-0.2-0.3-0.3-0.6-0.5-0.9l-0.3-0.6c-0.1-0.3-0.3-0.6-0.4-0.9-0.1-0.3-0.2-0.5-0.3-0.8-0.1-0.3-0.2-0.5-0.3-0.8l-0.3-0.9c-0.1-0.2-0.2-0.5-0.2-0.7-0.1-0.3-0.2-0.7-0.3-1-0.1-0.2-0.1-0.4-0.2-0.6-0.1-0.4-0.2-0.7-0.3-1.1 0-0.2-0.1-0.4-0.1-0.6-0.1-0.4-0.2-0.8-0.2-1.1 0-0.2-0.1-0.4-0.1-0.6-0.1-0.4-0.1-0.8-0.2-1.1 0-0.2-0.1-0.5-0.1-0.7 0-0.4-0.1-0.7-0.1-1.1 0-0.3 0-0.6-0.1-0.9 0-0.3 0-0.6-0.1-0.8-0.1-1.2-0.1-2.4 0-3.6 0-0.3 0-0.6 0.1-0.8 0-0.3 0-0.6 0.1-0.9 0-0.4 0.1-0.7 0.1-1.1 0-0.2 0.1-0.5 0.1-0.7 0.1-0.4 0.1-0.8 0.2-1.1 0-0.2 0.1-0.4 0.1-0.6 0.1-0.4 0.2-0.8 0.2-1.1 0-0.2 0.1-0.4 0.1-0.6 0.1-0.4 0.2-0.7 0.3-1.1 0.1-0.2 0.1-0.4 0.2-0.6 0.1-0.3 0.2-0.7 0.3-1 0.1-0.2 0.2-0.5 0.2-0.7l0.3-0.9c0.1-0.3 0.2-0.5 0.3-0.8 0.1-0.3 0.2-0.5 0.3-0.8 0.1-0.3 0.3-0.6 0.4-0.9l0.3-0.6c0.2-0.3 0.3-0.6 0.5-0.9l0.3-0.6c0.2-0.3 0.4-0.7 0.6-1 0.1-0.2 0.2-0.3 0.3-0.5 0.2-0.3 0.4-0.7 0.6-1 0.1-0.2 0.2-0.3 0.3-0.5 0.2-0.3 0.4-0.6 0.7-0.9 0.1-0.2 0.3-0.4 0.4-0.5 0.2-0.3 0.4-0.6 0.7-0.8 0.2-0.2 0.4-0.5 0.6-0.7l0.6-0.6c0.4-0.4 0.8-0.9 1.2-1.3L348.6 176c14.1-14.1 36.9-14.1 50.9 0 14.1 14.1 14.1 36.9 0 50.9l-116 116h544.1c19.9 0 36 16.1 36 36s-16.1 36-36 36H194.8c-0.4-0.2-0.7-0.2-0.9-0.3z m636.2 194.8c0.3 0 0.6 0 0.9 0.1 0.4 0 0.7 0.1 1.1 0.1 0.2 0 0.5 0.1 0.7 0.1 0.4 0.1 0.8 0.1 1.1 0.2 0.2 0 0.4 0.1 0.6 0.1 0.4 0.1 0.8 0.2 1.1 0.3 0.2 0 0.4 0.1 0.6 0.1 0.4 0.1 0.7 0.2 1.1 0.3 0.2 0.1 0.4 0.1 0.6 0.2 0.3 0.1 0.7 0.2 1 0.3 0.2 0.1 0.5 0.2 0.7 0.2l0.9 0.3c0.3 0.1 0.5 0.2 0.8 0.3 0.3 0.1 0.5 0.2 0.8 0.3 0.3 0.1 0.6 0.3 0.9 0.4 0.2 0.1 0.4 0.2 0.7 0.3 0.3 0.2 0.6 0.3 0.9 0.5l0.6 0.3c0.3 0.2 0.7 0.4 1 0.6 0.2 0.1 0.3 0.2 0.5 0.3 0.3 0.2 0.7 0.4 1 0.6 0.2 0.1 0.3 0.2 0.5 0.3 0.3 0.2 0.6 0.4 0.9 0.7 0.2 0.1 0.4 0.3 0.5 0.4 0.3 0.2 0.6 0.4 0.8 0.7 0.2 0.2 0.5 0.4 0.7 0.6 0.2 0.2 0.4 0.4 0.6 0.5 0.9 0.8 1.7 1.6 2.5 2.5 0.2 0.2 0.4 0.4 0.5 0.6 0.2 0.2 0.4 0.5 0.6 0.7 0.2 0.3 0.4 0.6 0.7 0.8 0.1 0.2 0.3 0.4 0.4 0.5 0.2 0.3 0.4 0.6 0.7 0.9 0.1 0.2 0.2 0.3 0.3 0.5 0.2 0.3 0.4 0.7 0.6 1 0.1 0.2 0.2 0.3 0.3 0.5 0.2 0.3 0.4 0.7 0.6 1l0.3 0.6c0.2 0.3 0.3 0.6 0.5 0.9l0.3 0.6c0.1 0.3 0.3 0.6 0.4 0.9 0.1 0.3 0.2 0.5 0.3 0.8 0.1 0.3 0.2 0.5 0.3 0.8l0.3 0.9c0.1 0.2 0.2 0.5 0.2 0.7 0.1 0.3 0.2 0.7 0.3 1 0.1 0.2 0.1 0.4 0.2 0.6 0.1 0.4 0.2 0.7 0.3 1.1 0 0.2 0.1 0.4 0.1 0.6 0.1 0.4 0.2 0.8 0.2 1.1 0 0.2 0.1 0.4 0.1 0.6 0.1 0.4 0.1 0.8 0.2 1.1 0 0.2 0.1 0.5 0.1 0.7 0 0.4 0.1 0.7 0.1 1.1 0 0.3 0 0.6 0.1 0.9 0 0.3 0 0.6 0.1 0.8 0.1 1.2 0.1 2.4 0 3.6 0 0.3 0 0.6-0.1 0.8 0 0.3 0 0.6-0.1 0.9 0 0.4-0.1 0.7-0.1 1.1 0 0.2-0.1 0.5-0.1 0.7-0.1 0.4-0.1 0.8-0.2 1.1 0 0.2-0.1 0.4-0.1 0.6-0.1 0.4-0.2 0.8-0.2 1.1 0 0.2-0.1 0.4-0.1 0.6-0.1 0.4-0.2 0.7-0.3 1.1-0.1 0.2-0.1 0.4-0.2 0.6-0.1 0.3-0.2 0.7-0.3 1-0.1 0.2-0.2 0.5-0.2 0.7l-0.3 0.9c-0.1 0.3-0.2 0.5-0.3 0.8-0.1 0.3-0.2 0.5-0.3 0.8-0.1 0.3-0.3 0.6-0.4 0.9l-0.3 0.6c-0.2 0.3-0.3 0.6-0.5 0.9l-0.3 0.6c-0.2 0.3-0.4 0.7-0.6 1-0.1 0.2-0.2 0.3-0.3 0.5-0.2 0.3-0.4 0.7-0.6 1-0.1 0.2-0.2 0.3-0.3 0.5-0.2 0.3-0.4 0.6-0.7 0.9-0.1 0.2-0.3 0.4-0.4 0.5-0.2 0.3-0.4 0.6-0.7 0.8-0.2 0.2-0.4 0.5-0.6 0.7l-0.6 0.6c-0.4 0.4-0.8 0.9-1.2 1.3L675.5 848.2c-14.1 14.1-36.9 14.1-50.9 0-14.1-14.1-14.1-36.9 0-50.9l116-116H196.5c-19.9 0-36-16.1-36-36s16.1-36 36-36h632.8c0.3 0 0.6 0 0.8 0.1z" />
          </svg>
        </button>
        <div className="relative w-full mb-4">
          <label className={'absolute -top-[30px] text-[#ffffe2]'}>
            You receive:
          </label>
          <input
            type="number"
            name="receiveAmount"
            className="w-full border py-8 px-8 rounded text-3xl bg-[#ffffe2] no-spinner"
            placeholder={swappingOutUSDC ? 'OAK' : 'USDC'}
            value={
              getReceivedAmount().toString() === '0'
                ? ''
                : getReceivedAmount().toString()
            }
            readOnly
          />
          <div className={'absolute text-[#163a2e] right-2 bottom-2 text-xs'}>
            Balance:{' '}
            {!swappingOutUSDC ? usdcBalance?.formatted : oakBalance?.formatted}
          </div>
          <div
            className={
              'flex items-center justify-center gap-2 absolute right-2 top-1/2 transform -translate-y-3/4'
            }
          >
            <div className={'w-8 h-8 rounded-full overflow-hidden'}>
              <img
                src={
                  !swappingOutUSDC
                    ? '/icons/USDCIcon.svg'
                    : '/icons/OakIcon.png'
                }
                className={'w-full h-full'}
              />
            </div>
            <div className={'font-bold'}>
              {!swappingOutUSDC ? 'USDC' : 'OAK'}
            </div>
          </div>
        </div>
        <button
          type="submit"
          className="w-full bg-[#faf5b7] text-[#163a2e] text-xl font-bold py-5 px-4 rounded-2xl hover:bg-[#faf5b7]"
        >
          {swappingOutUSDC && usdcAllowance ===BigInt(0n) && !isApproveUSDCSuccess && (isApproveUSDCLoading ? 'Approving...' : 'Approve USDC')}
          {!swappingOutUSDC && oakAllowance ===BigInt(0n) && !isApproveOakSuccess && (isApproveOAKLoading ? 'Approving...' : 'Approve Oak')}
          {(swappingOutUSDC && usdcAllowance !==BigInt(0n)) || isApproveUSDCSuccess && (isSwapUSDCForOAKLoading ? 'Swapping...': 'Swap')}
          {(!swappingOutUSDC && oakAllowance !==BigInt(0n)) || isApproveOakSuccess && (isSwapOAKForUSDCLoading ? 'Swapping..' : 'Swap')}
        </button>
      </form>
    </div>
  )
}
