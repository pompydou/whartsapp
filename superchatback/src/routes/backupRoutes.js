const express = require('express');
const router  = express.Router();
const { exportBackup, importBackup, downloadBackup } = require('../controllers/backupController');

router.post('/export',   exportBackup);
router.post('/import',   importBackup);
router.get('/download',  downloadBackup);

module.exports = router;
