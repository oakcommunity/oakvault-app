'use client'

import React, {useState} from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {useAccount, useWaitForTransaction} from 'wagmi'
import useOakVault from '../../../hooks/useOakVault'
import { OAK_VAULT_PROXY_ADDRESS } from '../../../constants'
import { useTokenAllowanceAndApproval } from '../../swap/hooks/useTokenAllowanceAndApproval'
import Notification from "../../../components/client/Notification";

const DepositForm: React.FC = () => {
  const { address } = useAccount()
  const { isOwner, usdcToken, oakToken } = useOakVault(address)

  const [depositType, setDepositType] = React.useState<'USDC' | 'OAK'>('USDC')
  const [amountToDeposit, setAmountToDeposit] = React.useState<number>(0)

  const tokenAddress = depositType === 'USDC' ? usdcToken : oakToken

  const {
    allowance,
    approveWrite,
    approveHash,
    isApproveError,
    isPrepareError,
    isApproveLoading,
    isDepositError,
    isDepositLoading,
    depositHash,
    depositWrite,
  } = useTokenAllowanceAndApproval(
    address,
    tokenAddress,
    OAK_VAULT_PROXY_ADDRESS!,
    depositType,
    amountToDeposit,
  )

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
    if (event.target.value === '' || isNaN(parseFloat(event.target.value))) {
      setAmountToDeposit(0)
    } else {
      setAmountToDeposit(inputValue * 10 ** 6)
    }
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

  const [notificationMessage, setNotificationMessage] = useState<
      string | undefined
      >(undefined)
  useWaitForTransaction({
    hash: depositHash,
    onSuccess(data) {
      setNotificationMessage(`${amountToDeposit / 10 ** 6} ${depositType} Deposited`)
    },
  })

  if (!isOwner) return null

  return (
    <div
      className={
        'flex items-center justify-center mt-12 w-11/12 sm:w-3/4 mx-auto mb-20'
      }
    >
      <form
        onSubmit={formik.handleSubmit}
        className={
          'flex flex-col items-center w-full sm:w-[600px] bg-[#16372b] p-4 sm:p-12 sm:pt-8 rounded-xl border border-black shadow-sm'
        }
      >
        <div className={'font-bold text-2xl self-start text-[#ffffe2] mb-14'}>
          Deposit
        </div>
        <div>
          <select
            value={depositType}
            onChange={(e) => setDepositType(e.target.value as 'USDC' | 'OAK')}
            className="w-full border py-4 px-4 rounded no-spinner text-3xl bg-[#ffffe2]"
          >
            <option value="USDC">USDC</option>
            <option value="OAK">$OAK</option>
          </select>
        </div>
        <div className="w-full mb-4 mt-4">
          <label htmlFor="amount" className="text-[#ffffe2] mb-2">
            Deposit Amount - ({depositType === 'USDC' ? 'USDC' : '$OAK'})
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            placeholder={depositType}
            className="w-full border py-8 px-8 rounded no-spinner text-3xl bg-[#ffffe2]"
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
          className="w-full bg-[#faf5b7] text-[#163a2e] text-xl font-bold py-5 px-4 rounded-2xl hover:bg-[#faf5b7] disabled:bg-gray-500"
          disabled={isPrepareError || amountToDeposit === 0}
        >
          Deposit
        </button>
      </form>
      {!!notificationMessage && (
          <Notification
              message={notificationMessage}
              onClose={setNotificationMessage}
          />
      )}
    </div>
  )
}

export default DepositForm
