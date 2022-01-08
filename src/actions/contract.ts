import { actionTypes } from 'utils/config'
import { connectToWallet } from 'utils/web3_api'

const wnd: any = window as any

export const connectToMetamask = () => (dispatch: any) => new Promise((resolve, reject) => {
  connectToWallet().then((res: any) => {
    dispatch({
      type: actionTypes.CONNECT_WALLET,
      payload: res
    })
    resolve(res)
  }, (err: any) => {
    reject(err)
  })
})

export const getContractStatus = (contract: any) => (dispatch: any) => new Promise(async (resolve, reject) => {
  if (!contract) {
    return
  }

  try {
    const price = Number(await contract.methods.ticketPrice().call())
    const statusFlag = Number(await contract.methods.statusFlag().call())
    const presaleReservedTokenCount = Number(await contract.methods.presaleReservedTokenCount().call())
    const presaleTokenCount = Number(await contract.methods.presaleTokenCount().call())
    const presaleTokenLimit = Number(await contract.methods.presaleTokenLimit().call())
    const MAXIMUM_TOKEN = Number(await contract.methods.MAXIMUM_TOKEN().call())

    const payload = {
      price,
      statusFlag,
      presaleReservedTokenCount,
      presaleTokenCount,
      presaleTokenLimit,
      MAXIMUM_TOKEN,
    }

    dispatch({
      type: actionTypes.READ_STATUS,
      payload
    })

    resolve(payload)
  } catch (e) {
    reject(e)
  }
})

export const getAccountStatus = (contract: any, account: string) => (dispatch: any) => new Promise(async (resolve, reject) => {
  if (!contract) {
    return
  }

  try {
    const ticketCount = Number(await contract.methods.tickets(account).call())

    const payload = {
      ticketCount,
    }

    dispatch({
      type: actionTypes.ACCOUNT_STATUS,
      payload
    })

    resolve(payload)
  } catch (e) {
    console.log(e)
    reject(e)
  }
})
