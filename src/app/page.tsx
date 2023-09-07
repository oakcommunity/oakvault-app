import { Header } from '../components'
import { Swap } from '../components/client/Swap'

import DepositOakForm from '../components/client/DespositOakForm'
import DepositUsdcForm from '../components/client/DepositUsdcForm'

export default function Home() {
  return (
    <>
      <Header />
      <Swap />
      <DepositOakForm />
      <DepositUsdcForm />
    </>
  )
}
