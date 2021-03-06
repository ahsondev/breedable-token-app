const config = require('../config')
const CryptoJS = require('crypto-js')

const encrypt = (data) =>
  CryptoJS.AES.encrypt(JSON.stringify(data), config.CRYPTO_KEY).toString()

const decrypt = (ciphertext) => {
  const bytes = CryptoJS.AES.decrypt(ciphertext, config.CRYPTO_KEY)
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8))
}

const round = (v, digits) => {
  let factorial = 1;
  for (let i = 0; i < digits; i += 1) {
    factorial *= 10
  }
  return Math.round(v * factorial) / factorial
}

const getUTCSeconds = () => Math.round(new Date().getTime() / 1000)

module.exports = {
  encrypt,
  decrypt,
  getUTCSeconds,
  round
}
