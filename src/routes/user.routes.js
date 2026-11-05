const router = require('express').Router();
const validateObjectId = require('../middlewares/validateObjectId');
const user = require('../controllers/user.controller');

router.post('/', user.createUser);
router.get('/', user.listUsers);
router.get('/:id', validateObjectId, user.getUser);
router.patch('/:id/status', validateObjectId, user.updateStatus);

module.exports = router;
