const express = require('express');
const router = express.Router();
const storeController = require('../controllers/storeController');

// { x } = es 6 object destructuring:
// allows to import a method from an entire object with same name as variable.
const { catchErrors } = require('../handlers/errorHandlers');

// Do work here
router.get('/', storeController.homePage);
router.get('/add', storeController.addStore);

// Using catchErrors() here fas Function Composition:
// Combining more than one function to produce a new function.
router.post('/add', catchErrors(storeController.createStore));

module.exports = router;
