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
import useOakVault from '../../hooks/useOakVault'
import OakVaultABI from '../../abi/OakVaultABI.json'
import { erc20ABI } from 'wagmi'

const DepositUsdcForm: React.FC = () => {
  const { address } = useAccount()
  const { isOwner, usdcToken } = useOakVault(address)
  const [amountToDeposit, setAmountToDeposit] = React.useState<number>(0)

  //@ts-ignore
  const { data: allowance } = useContractRead({
    address: usdcToken,
    abi: erc20ABI,
    functionName: 'allowance',
    args: [address, process.env.NEXT_PUBLIC_OAK_VAULT_PROXY],
  })

  //@ts-ignore
  const approveConfig = usePrepareContractWrite({
    address: usdcToken,
    abi: erc20ABI,
    functionName: 'approve',
    args: [
      process.env.NEXT_PUBLIC_OAK_VAULT_PROXY,
      '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    ],
  })

  const { write: approveWrite } = useContractWrite(approveConfig.config)

  // TODO: fix
  //@ts-ignore
  const depositConfig = usePrepareContractWrite({
    address: process.env.NEXT_PUBLIC_OAK_VAULT_PROXY,
    abi: OakVaultABI,
    functionName: 'depositUSDC' as const,
    args: [usdcToken, amountToDeposit],
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
    if (allowance === 0n && approveWrite) {
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
      <div className="mb-4">
        <label htmlFor="amount" className="block text-gray-700 font-semibold">
          Amount (USDC)
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

export default DepositUsdcForm