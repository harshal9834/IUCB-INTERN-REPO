import { Country, State, City } from 'country-state-city';

/**
 * Returns all countries with name, ISO code, phone code, flag, currency, timezones.
 */
export const getCountries = () =>
  Country.getAllCountries().map((c: any) => ({
    name: c.name,
    isoCode: c.isoCode,
    phonecode: c.phonecode.startsWith('+') ? c.phonecode : `+${c.phonecode}`,
    flag: c.flag,
    currency: c.currency,
    timezones: c.timezones,
  }));

/**
 * Returns all states/provinces for a given country ISO code.
 */
export const getStates = (countryCode: string) =>
  State.getStatesOfCountry(countryCode).map((s: any) => ({
    name: s.name,
    isoCode: s.isoCode,
    countryCode: s.countryCode,
  }));

/**
 * Returns all cities for a given country ISO code and state ISO code.
 */
export const getCities = (countryCode: string, stateCode: string) =>
  City.getCitiesOfState(countryCode, stateCode).map((c: any) => ({
    name: c.name,
    stateCode: c.stateCode,
    countryCode: c.countryCode,
  }));

/**
 * Returns the phone dial code for a country ISO code (e.g. "IN" → "+91").
 */
export const getPhoneCode = (countryCode: string): string => {
  const country = Country.getCountryByCode(countryCode);
  if (!country) return '';
  return country.phonecode.startsWith('+') ? country.phonecode : `+${country.phonecode}`;
};

/**
 * Returns ISO code for a country by name (case-insensitive, partial match).
 */
export const getCountryISO = (name: string): string => {
  const all = Country.getAllCountries();
  const match = all.find((c: any) => c.name.toLowerCase() === name.toLowerCase());
  return match?.isoCode ?? '';
};
