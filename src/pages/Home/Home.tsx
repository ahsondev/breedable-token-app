import { useEffect, useState, useCallback } from 'react'
import { BrainDance, connectToWallet } from 'utils/web3_api'
import { NotificationManager } from 'components/Notification'
import Loader from 'components/Loader'
import api from 'utils/api'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import MintButton from 'components/MintButton'
import './Home.scoped.scss'
import { decrypt, headerToken } from 'utils/helper'
import {connectToMetamask, getAccountStatus, getContractStatus} from 'actions/contract'
import { useDispatch, useSelector } from 'react-redux'

const wnd = window as any

interface Props {}

const Home = (props: Props) => {
  const [loading, setLoading] = useState(false)
  const web3 = useSelector((state: any) => state.contract.web3)
  const contract = useSelector((state: any) => state.contract.contract)
  const price = useSelector((state: any) => state.contract.price)
  const statusFlag = useSelector((state: any) => state.contract.statusFlag)
  const presaleReservedTokenCount = useSelector((state: any) => state.contract.presaleReservedTokenCount)
  const presaleReservedAddressCount = useSelector((state: any) => state.contract.presaleReservedAddressCount)
  const presaleTokenCount = useSelector((state: any) => state.contract.presaleTokenCount)
  const presaleAddressLimit = useSelector((state: any) => state.contract.presaleAddressLimit)
  const ticketCount = useSelector((state: any) => state.contract.ticketCount)
  const dispatch = useDispatch() as any

  const onTimer = useCallback(async () => {
    dispatch(getContractStatus(contract))
    dispatch(getAccountStatus(contract, wnd.ethereum.selectedAddress))
  }, [contract])

  useEffect(() => {
    dispatch(connectToMetamask()).then((res: any) => {
      dispatch(getContractStatus(res.contract))
      dispatch(getAccountStatus(res.contract, wnd.ethereum.selectedAddress))
    }, (err: any) => {})
  }, [])

  useEffect(() => {
    const counter = setInterval(onTimer, 4000)
    return (() => {
      clearInterval(counter)
    })
  }, [onTimer])

  const handleBuyTicket = async () => {
    const account = wnd.ethereum.selectedAddress

    if (!account) {
      NotificationManager.warning('You are not connected to wallet', 'Not connected')
      return
    }

    if (Number(window.ethereum.networkVersion) !== 4) {
      NotificationManager.warning('Please connect to the mainnet', 'Network error')
      return
    }

    if (statusFlag === 0) {
      NotificationManager.warning('Ticket sale is not started', 'Not started')
      return
    }

    if (statusFlag > 1) {
      NotificationManager.warning('Ticket sale has ended', 'Ticket sale ended')
      return
    }

    setLoading(true)
    try {
      await api.post('/buy-ticket',
        { address: account },
        { headers: headerToken(account) })
      const contractBD = new BrainDance(contract)
      await contractBD.buyTicket(account, price)
      NotificationManager.info('Successfully bought a ticket', 'Success')
    } catch (e) {
      console.log(e)
      NotificationManager.error('You failed buying a ticket', 'Failed')
    }
    setLoading(false)
  }

  return (
    <div className='home-page'>
      <div className='container'>
        <div className='characters'>
          <div className='animation-wrapper'>
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
          </div>
        </div>
        <div className='button-wrapper'>
          {statusFlag === 0 && (
            <div className='title'>Not started</div>
          )}
          {statusFlag > 1 && (
            <>
              <div className='title'>Sale ended</div>
              <div className='info'>
                You have bought <span>{ticketCount}</span> tickets
              </div>
            </>
          )}
          {statusFlag === 1 && (
            <>
              <div className='title'>{presaleAddressLimit - presaleReservedAddressCount === 0 && ticketCount === 0? "Sold out" : "Buy Tickets"}</div>
              <div className='info'>
                You have bought <span>{ticketCount}</span> tickets
              </div>
            </>
          )}
          
          <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}>
            <MintButton onMint={() => handleBuyTicket()} disabled={ticketCount >= 3 || statusFlag !== 1 || (presaleAddressLimit - presaleReservedAddressCount > 0 && ticketCount === 0)} />
          </GoogleReCaptchaProvider>
        </div>
      </div>
      
      {loading && <Loader />}
    </div>
  )
}

export default Home
