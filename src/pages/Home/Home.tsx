import { useEffect, useState } from 'react'
import { BrainDance, connectToWallet } from 'utils/web3_api'
import { NotificationManager } from 'components/Notification'
import Loader from 'components/Loader'
import api from 'utils/api'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import MintButton from 'components/MintButton'
import './Home.scoped.scss'
import { decrypt, headerToken } from 'utils/helper'

const wnd = window as any

interface Props {}

const Home = (props: Props) => {
  const [loading, setLoading] = useState(false)
  const [remainTokenCount, setRemainTokenCount] = useState(0)
  const [contract, setContract] = useState<any>(null)

  useEffect(() => {
    const counter = setInterval(onTimer, 4000)
    return (() => {
      clearInterval(counter)
    })
  }, [])

  const onTimer = async () => {
    if (contract) {
      const preslaeAddressLimit = await contract.methods.preslaeAddressLimit().call()
      const presaleReservedAddressCount = await contract.methods.presaleReservedAddressCount().call()
      setRemainTokenCount(preslaeAddressLimit - presaleReservedAddressCount)
    }
  }

  const connectMetamask = async () => {
    const connectRes = await connectToWallet()
    const obj = {
      contract: null as any,
      web3: null as any,
      price: 0,
      paused: true,
      remainTokenCount: 0,
      metamaskAccount: ''
    }

    // if (connectRes) {
    //   obj.contract = connectRes.contract
    //   obj.web3 = connectRes.web3
    //   obj.metamaskAccount = wnd.ethereum.selectedAddress
    //   obj.price = await connectRes.contract.methods.ticketPrice().call()
    //   obj.paused = await connectRes.contract.methods.ticketPaused().call()
    //   const preslaeAddressLimit = await connectRes.contract.methods.preslaeAddressLimit().call()
    //   const presaleReservedAddressCount = await connectRes.contract.methods.presaleReservedAddressCount().call()
    //   obj.remainTokenCount = preslaeAddressLimit - presaleReservedAddressCount
    //   setRemainTokenCount(obj.remainTokenCount)
    //   setContract(connectRes.contract)
    // }
    return obj
  }

  const handleBuyTicket = async () => {
    const obj = await connectMetamask()
    console.log(obj)
    if (!obj.metamaskAccount) {
      NotificationManager.warning('You are not connected to wallet', 'Not connected')
      return
    }
    if (obj.paused) {
      NotificationManager.warning('Minting was paused by owner', 'Paused')
      return
    }

    setLoading(true)
    try {
      const {data} = await api.post('/buy-ticket',
        { address: obj.metamaskAccount },
        { headers: headerToken(obj.metamaskAccount) })
      const sign = Number(decrypt(data.token))
      const contract = new BrainDance(obj.contract)
      await contract.buyTicket(obj.metamaskAccount, obj.price, sign)
      NotificationManager.info('Successfully bought a ticket', 'Success')
    } catch (e) {
      console.log(e)
      NotificationManager.error('Please check if you are online', 'Server Error')
      setLoading(false)
    }
    setLoading(false)
  }

  return (
    <div className='home-page'>
      <div className='container'>
        <div className='characters'>
          {/* <div className='animation-wrapper'>
            <iframe src="/Boy LifeTank.33/Boy Life Tank.33.html"
              allowFullScreen={true}
              frameBorder="0"
              scrolling="no"
              title="BodyLife"
            />
          </div>
          <div className='animation-wrapper'>
            <iframe src="Girl Life Tank.34/Boy Life Tank.34.html"
              allowFullScreen={true}
              frameBorder="0"
              scrolling="no"
              title="GirlLife"
            />
          </div> */}
        </div>
        <div className='button-wrapper'>
   
          <div className="publicsale-container">
            <div className='title'>{remainTokenCount === 0 ? "Sold out" : "Buy Tickets"}</div>
          </div>
          
          <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}>
            <MintButton onMint={() => handleBuyTicket()} />
          </GoogleReCaptchaProvider>
        </div>
      </div>
      
      {loading && <Loader />}
    </div>
  )
}

export default Home
