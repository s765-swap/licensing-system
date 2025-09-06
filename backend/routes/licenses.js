const express = require('express');
const { 
  createLicense, 
  validateLicense, 
  getLicense, 
  getLicenses, 
  revokeLicense, 
  updateLicense,
  getLicenseStats 
} = require('../controllers/licenseController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/validate', validateLicense);

// Protected routes
router.use(protect); // All routes below are protected

router.post('/create', createLicense);
router.get('/stats', getLicenseStats);
router.get('/', getLicenses);
router.get('/:key', getLicense);
router.post('/revoke', revokeLicense);
router.put('/:key', updateLicense);

module.exports = router;
