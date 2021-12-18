const Router = require('express').Router
const Controllers = require('../controllers')

const router = new Router()

router.all('/*', Controllers.Main.authenticate)

router.post('/buy-ticket', Controllers.Main.buyTicket)

module.exports = router;
