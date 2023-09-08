'use client'

import React, { useState } from 'react'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import {
  useAccount,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from 'wagmi'
import useOakVault from '../../../hooks/useOakVault'
import OakVaultABI from '../../../abi/OakVaultABI.json'
import { CHAIN_ID, OAK_VAULT_PROXY_ADDRESS } from '../../../constants'
import Notification from '../../../components/client/Notification'

const WithdrawForm: React.FC = () => {
  const { address } = useAccount()
  const { isOwner, usdcToken, oakToken } = useOakVault(address)

  const [withdrawType, setWithdrawType] = React.useState<'USDC' | 'OAK'>('USDC')
  const [amountToWithdraw, setAmountToWithdraw] = React.useState<number>(0)
  const tokenAddress = withdrawType === 'USDC' ? usdcToken : oakToken

  //@ts-ignore
  const {
    config: withdrawConfig,
    isError: isWithdrawPrepareError,
    error: withdrawPrepareError,
  } = usePrepareContractWrite({
    address: OAK_VAULT_PROXY_ADDRESS,
    abi: OakVaultABI,
    functionName: withdrawType === 'USDC' ? 'withdrawUSDC' : 'withdrawOak',
    args: [BigInt(amountToWithdraw * 10 ** 6)],
  })

  //@ts-ignore
  const {
    write: withdrawFromVault,
    isSuccess: isWithdrawSuccess,
    isError: isWithdrawError,
    isLoading: isWithdrawLoading,
    data: withdrawData,
    error: withdrawError,
  } = useContractWrite(withdrawConfig)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = parseFloat(event.target.value)
    if (event.target.value === '' || isNaN(inputValue)) {
      setAmountToWithdraw(0)
      formik.setFieldValue('amount', '')
    } else {
      setAmountToWithdraw(inputValue)
      formik.setFieldValue('amount', event.target.value)
    }
  }

  const handleWithdrawClick = async () => {
    withdrawFromVault?.()
  }

  const validationSchema = Yup.object({
    amount: Yup.number()
      .positive('Amount must be positive')
      .required('Amount is required'),
  })

  const formik = useFormik({
    initialValues: {
      amount: '',
    },
    validationSchema,
    onSubmit: handleWithdrawClick,
  })

  const [notificationMessage, setNotificationMessage] = useState<
    string | undefined
  >(undefined)
  useWaitForTransaction({
    hash: withdrawData?.hash,
    onSuccess(data) {
      setNotificationMessage(`${amountToWithdraw} ${withdrawType} Withdrawn`)
    },
  })

  if (!isOwner) return null

  return (
    <div
      className={
        'flex items-center justify-center mt-12 w-11/12 sm:w-3/4 mx-auto mb-20'
      }
    >
      <div
        className={
          'flex flex-col items-center w-full sm:w-[600px] bg-[#16372b] p-4 sm:p-12 sm:pt-8 rounded-xl border border-black shadow-sm'
        }
      >
        <div className={'font-bold text-2xl self-start text-[#ffffe2] mb-14'}>
          Withdraw
        </div>
        <div>
          <select
            value={withdrawType}
            onChange={(e) => setWithdrawType(e.target.value as 'USDC' | 'OAK')}
            className="w-full border py-4 px-4 rounded no-spinner text-3xl bg-[#ffffe2]"
          >
            <option value="USDC">USDC</option>
            <option value="OAK">$OAK</option>
          </select>
        </div>
        <div className="w-full mb-4 mt-4">
          <label htmlFor="amount" className="text-[#ffffe2] mb-2">
            Withdraw Amount - ({withdrawType === 'USDC' ? 'USDC' : '$OAK'})
          </label>
          <input
            type="number"
            id="amount"
            name="amount"
            placeholder={withdrawType}
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
          onClick={handleWithdrawClick}
          className="w-full bg-[#faf5b7] text-[#163a2e] text-xl font-bold py-5 px-4 rounded-2xl hover:bg-[#faf5b7] mt-4"
        >
          Withdraw
        </button>
        <div
          className={
            'mt-6 text-red-500 max-h-20 overflow-y-scroll w-full text-center'
          }
        >
          {isWithdrawError && withdrawError && (
            <div>{withdrawError.toString()}</div>
          )}
          {isWithdrawPrepareError && withdrawPrepareError && (
            <div>{withdrawPrepareError.toString()}</div>
          )}
        </div>
      </div>
      {!!notificationMessage && (
        <Notification
          message={notificationMessage}
          onClose={setNotificationMessage}
        />
      )}
    </div>
  )
}

export default WithdrawForm
