import { Country, State, City } from 'country-state-city';

export const getCountries = () =>
  Country.getAllCountries().map((c) => ({
    name: c.name,
    isoCode: c.isoCode,
    phonecode: c.phonecode.startsWith('+') ? c.phonecode : `+${c.phonecode}`,
  }));

export const getStates = (countryCode: string) =>
  State.getStatesOfCountry(countryCode).map((s) => ({
    name: s.name,
    isoCode: s.isoCode,
    countryCode: s.countryCode,
  }));

export const getCities = (countryCode: string, stateCode: string) =>
  City.getCitiesOfState(countryCode, stateCode).map((c) => ({
    name: c.name,
    stateCode: c.stateCode,
    countryCode: c.countryCode,
  }));
