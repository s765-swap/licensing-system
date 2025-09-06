const express = require('express');
const { 
  createPlugin, 
  getPlugins, 
  getPlugin, 
  updatePlugin, 
  deletePlugin 
} = require('../controllers/pluginController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// All routes are protected
router.use(protect);

router.route('/')
  .get(getPlugins)
  .post(createPlugin);

router.route('/:id')
  .get(getPlugin)
  .put(updatePlugin)
  .delete(deletePlugin);

module.exports = router;
