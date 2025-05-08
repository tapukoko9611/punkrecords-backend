const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
    exists,
    search,
    join,
    get,
    update,
    leave
} = require('../controllers/callController');

router.get('/exists/:callName', protect, exists);
router.get('/search/:callName', protect, search);
router.post('/join/:callName', protect, join);
router.get('/:callName', protect, get);
router.put('/update', protect, update);
router.delete('/leave/:callName', protect, leave);

module.exports = router;