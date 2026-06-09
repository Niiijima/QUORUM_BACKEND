const express = require('express');
const router = express.Router();
const { castVote, getCandidates, getResults } = require('../controllers/voteController');


const { authMiddleware } = require('../middleware/authMiddleware'); 

router.get('/candidates', getCandidates);
router.get('/results', getResults);


router.post('/', authMiddleware, castVote);

module.exports = router;