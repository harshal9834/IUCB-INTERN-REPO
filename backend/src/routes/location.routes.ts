import { Router } from 'express';
import { getCountries, getStates, getCities } from '../services/location.service.js';

const router = Router();

/**
 * GET /api/location/countries
 * Returns all countries with ISO code, phone code, flag, currency.
 */
router.get('/countries', (_req, res) => {
  try {
    const countries = getCountries();
    res.json({ success: true, data: countries });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load countries' });
  }
});

/**
 * GET /api/location/states/:countryCode
 * Returns all states/provinces for the given country ISO code.
 */
router.get('/states/:countryCode', (req, res) => {
  try {
    const { countryCode } = req.params;
    const states = getStates(countryCode);
    res.json({ success: true, data: states });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load states' });
  }
});

/**
 * GET /api/location/cities/:countryCode/:stateCode
 * Returns all cities for the given country and state ISO codes.
 */
router.get('/cities/:countryCode/:stateCode', (req, res) => {
  try {
    const { countryCode, stateCode } = req.params;
    const cities = getCities(countryCode, stateCode);
    res.json({ success: true, data: cities });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to load cities' });
  }
});

export default router;
