import { Header } from '../components'
import { Swap } from '../modules/swap/components/Swap'
import DepositForm from '../modules/admin/components/DepositForm'
import { ContractInfo } from '../components/client/ContractInfo'
import WithdrawForm from '../modules/admin/components/WithdrawForm'
import TransferOwnershipForm from '../modules/admin/components/TransferOwnershipForm'

export default function Home() {
  return (
    <>
      <Header />
      <Swap />
      <DepositForm />
      <WithdrawForm />
      <TransferOwnershipForm />
    </>
  )
}
