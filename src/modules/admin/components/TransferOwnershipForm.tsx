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
import { Address, isAddress } from 'viem'
import Notification from '../../../components/client/Notification'
import OakVaultABI from '../../../abi/OakVaultABI.json'
import useOakVault from '../../../hooks/useOakVault'
import {OAK_VAULT_PROXY_ADDRESS} from "../../../constants";

const TransferOwnershipForm: React.FC = () => {
  const { address } = useAccount()
  const { isOwner } = useOakVault(address)
  const [newOwnerAddress, setNewOwnerAddress] = useState<Address | null>(null)

  //@ts-ignore
  const {
    config,
    isError: isPrepareError,
  } = usePrepareContractWrite({
    address: OAK_VAULT_PROXY_ADDRESS,
    abi: OakVaultABI,
    functionName: 'transferOwnership',
    args: [newOwnerAddress],
    enabled: isAddress(newOwnerAddress)
  })

  //@ts-ignore
  const {
    write: transferOwnership,
    data: transferData,
  } = useContractWrite(config)

  const validationSchema = Yup.object({
    address: Yup.string()
      .test('is-ethereum-address', 'Invalid Ethereum address', (value) => {
        return isAddress(value as Address)
      })
      .required('Address is required'),
  })

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    formik.handleChange(event)
    setNewOwnerAddress(event.target.value as Address)
  }

  const handleTransferOwnership = async () => {
    transferOwnership?.()
  }

  const formik = useFormik({
    initialValues: {
      address: '',
    },
    validationSchema,
    onSubmit: handleTransferOwnership,
  })

  const [notificationMessage, setNotificationMessage] = useState<
    string | undefined
  >(undefined)

  useWaitForTransaction({
    hash: transferData?.hash,
    onSuccess(data) {
      setNotificationMessage(`Ownership transferred to ${newOwnerAddress}`)
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
          Transfer Ownership
        </div>
        <div className="w-full mb-4 mt-4">
          <label htmlFor="address" className="text-[#ffffe2] mb-2">
            New Owner Address
          </label>
          <input
            type="text"
            id="address"
            name="address"
            placeholder="0x..."
            className="w-full border py-8 px-8 rounded no-spinner text-3xl bg-[#ffffe2]"
            onChange={handleInputChange}
            onBlur={formik.handleBlur}
            value={formik.values.address}
          />
          {formik.touched.address && formik.errors.address && (
            <p className="text-red-500 text-sm mt-1">{formik.errors.address}</p>
          )}
        </div>
        <button
          type="submit"
          className="w-full bg-[#faf5b7] text-[#163a2e] text-xl font-bold py-5 px-4 rounded-2xl hover:bg-[#faf5b7] disabled:bg-gray-500"
          disabled={!isAddress(newOwnerAddress as `0x${string}`) || isPrepareError}
        >
          Transfer Ownership
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

export default TransferOwnershipForm
