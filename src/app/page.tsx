import { Header } from '../components'
import { Swap } from '../modules/swap/components/Swap'
import DepositForm from '../components/client/DepositForm'
import { ContractInfo } from '../components/client/ContractInfo'

export default function Home() {
  return (
    <>
      <Header />
      <Swap />
      <ContractInfo />
      <DepositForm />
    </>
  )
}
