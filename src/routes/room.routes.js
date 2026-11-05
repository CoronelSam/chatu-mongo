const router = require('express').Router();
const validateObjectId = require('../middlewares/validateObjectId');
const room = require('../controllers/room.controller');
const msg = require('../controllers/message.controller');

router.post('/', room.createRoom);
router.get('/', room.listRooms);
router.get('/:id', validateObjectId, room.getRoom);
router.post('/:id/join', validateObjectId, room.joinRoom);
router.post('/:id/leave', validateObjectId, room.leaveRoom);
router.delete('/:id', validateObjectId, room.deleteRoom);

router.post('/:id/messages', validateObjectId, msg.sendMessage);
router.get('/:id/messages', validateObjectId, msg.listMessages);

module.exports = router;
