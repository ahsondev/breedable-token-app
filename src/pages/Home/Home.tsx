import { useEffect, useState, useCallback } from 'react'
import { BrainDance } from 'utils/web3_api'
import { NotificationManager } from 'components/Notification'
import Loader from 'components/Loader'
import api from 'utils/api'
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import MintButton from 'components/MintButton'
import './Home.scoped.scss'
import { headerToken, min } from 'utils/helper'
import {connectToMetamask, getAccountStatus, getContractStatus} from 'actions/contract'
import { useDispatch, useSelector } from 'react-redux'

const wnd = window as any

interface Props {}

const Home = (props: Props) => {
  const [loading, setLoading] = useState(false)
  const contract = useSelector((state: any) => state.contract.contract)
  const price = useSelector((state: any) => state.contract.price)
  const statusFlag = useSelector((state: any) => state.contract.statusFlag)
  const presaleTokenLimit = useSelector((state: any) => state.contract.presaleTokenLimit)
  const presaleReservedTokenCount = useSelector((state: any) => state.contract.presaleReservedTokenCount)
  const ticketCount = useSelector((state: any) => state.contract.ticketCount)
  const dispatch = useDispatch() as any
  const [mintAmount, setMintAmount] = useState(0)

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
      NotificationManager.warning('Ticket sale has beend ended', 'Ticket sale ended')
      return
    }

    if (mintAmount === 0) {
      NotificationManager.warning('Please select ticket count', 'Select amount')
      return
    }

    if (!((ticketCount + mintAmount) <= 3 && (presaleTokenLimit - presaleReservedTokenCount - mintAmount >= 0))) {
      NotificationManager.warning('Please select correct ticket count', 'Amount error')
      return
    }

    if (!ticketEnable()) {
      NotificationManager.warning('Ticket sale has been disabled', 'Disabled')
      return
    }

    setLoading(true)
    try {
      await api.post('/buy-ticket',
        { address: account },
        { headers: headerToken(account) })
      const contractBD = new BrainDance(contract)
      await contractBD.buyTicket(account, price, mintAmount)
      NotificationManager.info('Successfully bought a ticket', 'Success')
    } catch (e) {
      console.log(e)
      NotificationManager.error('You failed buying a ticket', 'Failed')
    }
    setLoading(false)
  }

  const ticketEnable = () => {
    return (ticketCount + 1) <= 3 && statusFlag === 1 && (presaleTokenLimit - presaleReservedTokenCount - 1 >= 0)
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
              <div className='title'>{presaleTokenLimit - presaleReservedTokenCount === 0 && ticketCount === 0? "Sold out" : "Buy Tickets"}</div>
            </>
          )}
          <div className='contract-info'>
            <div className='item'>
              <label>Your ticket:</label>
              <span>{ticketCount}</span>
            </div>

            <div className='item'>
              <label>Remaining:</label>
              <span>{presaleTokenLimit - presaleReservedTokenCount}</span>
            </div>
          </div>
          {ticketEnable() && (
            <div className='amount-selector'>
              {[1, 2, 3].map(v => (
                <button
                  key={v}
                  type='button'
                  onClick={() => setMintAmount(v)}
                  className={v === mintAmount ? "selected" : ""}
                  disabled={v + ticketCount > min(3, presaleTokenLimit - presaleReservedTokenCount)}
                >
                  {v}
                </button>
              ))}
            </div>
          )}
          <GoogleReCaptchaProvider reCaptchaKey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}>
            <MintButton onMint={() => handleBuyTicket()} disabled={!(ticketEnable() && mintAmount > 0)} />
          </GoogleReCaptchaProvider>
        </div>
      </div>
      
      {loading && <Loader />}
    </div>
  )
}

export default Home
