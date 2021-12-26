const db = require('../models')
const {encrypt, decrypt, getUTCSeconds} = require('../services/helper')
const {encryptNumberRsa} = require('../services/rsa')

async function authenticate(req, res, next) {
  const addressToken = (req.header('X-GOLDEN-TOKEN1') || "") + (req.header('X-GOLDEN-TOKEN2') || "")
  const address = req.body.address || req.query.address || req.params.address
  if (address === decrypt(addressToken)) {
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
    res.json({ msg: 'status' })
  } catch (e) {
    console.log(e)
    res.status(500).json({ msg: 'Server Error' })
  }
}

module.exports = {
  authenticate,
  buyTicket,
}
