const router = require('express').Router();
const validateObjectId = require('../middlewares/validateObjectId');
const msg = require('../controllers/message.controller');

router.put('/:id', validateObjectId, msg.updateMessage);
router.delete('/:id', validateObjectId, msg.deleteMessage);

module.exports = router;
