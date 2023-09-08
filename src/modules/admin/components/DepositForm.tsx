'use client'

import React from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
} from 'wagmi'
import useOakVault from '../../../hooks/useOakVault'
import OakVaultABI from '../../../abi/OakVaultABI.json'
import { erc20ABI } from 'wagmi'
import { OakVaultProxyAddress } from '../../../constants'

const DepositForm: React.FC = () => {
  const { address } = useAccount()
  const { isOwner, usdcToken, oakToken } = useOakVault(address)

  const [depositType, setDepositType] = React.useState<'USDC' | 'OAK'>('USDC')
  const [amountToDeposit, setAmountToDeposit] = React.useState<number>(0)

  const tokenAddress = depositType === 'USDC' ? usdcToken : oakToken

  //@ts-ignore
  const { data: allowance } = useContractRead({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address!, OakVaultProxyAddress!],
    enabled: !!address,
  })

  //@ts-ignore
  const approveConfig = usePrepareContractWrite({
    address: tokenAddress,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      OakVaultProxyAddress!,
      BigInt(
        '115792089237316195423570985008687907853269984665640564039457584007913129639935',
      ),
    ],
  })

  const { write: approveWrite } = useContractWrite(approveConfig.config)

  //@ts-ignore
  const depositConfig = usePrepareContractWrite({
    address: OakVaultProxyAddress!,
    abi: OakVaultABI,
    functionName: depositType === 'USDC' ? 'depositUSDC' : 'depositOak',
    args: [tokenAddress, amountToDeposit],
    enabled: amountToDeposit > 0,
  })

  //@ts-ignore
  const { write: depositWrite } = useContractWrite(depositConfig.config)

  const validationSchema = Yup.object({
    amount: Yup.number()
      .positive('Amount must be positive')
      .test(
        'decimal-places',
        'Amount cannot have more than 6 decimal places',
        (value) => {
          if (!value) return true
          const decimalPlaces = value.toString().split('.')[1]?.length || 0
          return decimalPlaces <= 6
        },
      )
      .required('Amount is required'),
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(event)
    const inputValue = parseFloat(event.target.value)
    setAmountToDeposit(inputValue * 10 ** 6)
  }

  const handleButtonClick = async () => {
    if (allowance === BigInt(0n) && approveWrite) {
      await approveWrite()
    } else {
      depositWrite?.()
    }
  }

  const formik = useFormik({
    initialValues: {
      amount: '',
    },
    validationSchema,
    onSubmit: handleButtonClick,
  })

  if (!isOwner) return null

  return (
    <form onSubmit={formik.handleSubmit} className="max-w-sm mx-auto mt-4">
      <div>
        <select
          value={depositType}
          onChange={(e) => setDepositType(e.target.value as 'USDC' | 'OAK')}
        >
          <option value="USDC">USDC</option>
          <option value="OAK">$OAK</option>
        </select>
      </div>
      <div className="mb-4">
        <label htmlFor="amount" className="block text-gray-700 font-semibold">
          Amount ({depositType === 'USDC' ? 'USDC' : '$OAK'})
        </label>
        <input
          type="number"
          id="amount"
          name="amount"
          className={`mt-2 p-2 w-full border ${
            formik.touched.amount && formik.errors.amount
              ? 'border-red-500'
              : 'border-gray-300'
          } rounded`}
          onChange={handleInputChange}
          onBlur={formik.handleBlur}
          value={formik.values.amount}
        />
        {formik.touched.amount && formik.errors.amount && (
          <p className="text-red-500 text-sm mt-1">{formik.errors.amount}</p>
        )}
      </div>
      <button
        type="submit"
        className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
      >
        Deposit
      </button>
    </form>
  )
}

export default DepositForm
