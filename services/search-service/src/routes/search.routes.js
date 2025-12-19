const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search.controller');

router.get('/', searchController.search);
router.get('/suggest', searchController.suggest);
router.get('/filters', searchController.getFilters);
router.get('/popular', searchController.getPopularSearches);
router.post('/reindex', searchController.reindex);

module.exports = router;

