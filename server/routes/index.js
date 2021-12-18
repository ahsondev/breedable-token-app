const Router = require('express').Router
const Controllers = require('../controllers')

const router = new Router()

router.post('/*', Controllers.Main.authenticate)
router.put('/*', Controllers.Main.authenticate)
router.delete('/*', Controllers.Main.authenticate)

router.post('/buy-ticket', Controllers.Main.buyTicket)

module.exports = router;
