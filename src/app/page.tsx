import { Header } from '../components'
import { Swap } from '../modules/swap/components/Swap'
import DepositForm from '../modules/admin/components/DepositForm'
import { ContractInfo } from '../components/client/ContractInfo'

export default function Home() {
  return (
    <>
      <Header />
      <Swap />
      <DepositForm />
    </>
  )
}
