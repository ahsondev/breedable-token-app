const db = require('../models')
const {encrypt, getUTCSeconds} = require('../services/helper')
const {encryptNumberRsa, decryptNumberRsa} = require('../services/rsa')

async function authenticate(req, res, next) {
  const addressToken = (req.header('X-GOLDEN-TOKEN1') || "") + (req.header('X-GOLDEN-TOKEN2') || "")
  const address = req.body.address || req.query.address || req.params.address
  if (addressToken === encrypt(address)) {
    next()
    return
  }

  res.status(401).json({'msg': 'Authentication Error'})
}

async function buyTicket(req, res) {
  try {
    await db.Ticket.create({
      address: req.body.address
    })
    const token = encrypt(encryptNumberRsa(getUTCSeconds()))
    res.json({token})
  } catch (e) {
    console.log(e)
    res.status(500).json({ msg: 'Server Error' })
  }
}

module.exports = {
  authenticate,
  buyTicket,
}
