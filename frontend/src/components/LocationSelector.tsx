import React, { useEffect, useState, useMemo } from 'react';
import { Control, UseFormRegister, FieldErrors, UseFormWatch, UseFormSetValue, Controller, FieldValues, Path } from 'react-hook-form';
import { getCountries, getStates, getCities } from '../services/location.service';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';

interface LocationSelectorProps<T extends FieldValues> {
  control: Control<T>;
  register: UseFormRegister<T>;
  errors: FieldErrors<T>;
  watch: UseFormWatch<T>;
  setValue: UseFormSetValue<T>;
  requireState?: boolean;
  requireCity?: boolean;
  requireAddress?: boolean;
}

export function LocationSelector<T extends FieldValues>({
  control,
  register,
  errors,
  watch,
  setValue,
  requireState = true,
  requireCity = true,
  requireAddress = true,
}: LocationSelectorProps<T>) {
  const [countries, setCountries] = useState<{ name: string; isoCode: string; phonecode: string }[]>([]);
  const [states, setStates] = useState<{ name: string; isoCode: string; countryCode: string }[]>([]);
  const [cities, setCities] = useState<{ name: string; stateCode: string; countryCode: string }[]>([]);
  
  const [countrySearch, setCountrySearch] = useState("");
  const [stateSearch, setStateSearch] = useState("");
  const [citySearch, setCitySearch] = useState("");

  const selectedCountryCode = watch('countryCode' as Path<T>);
  const selectedStateCode = watch('state' as Path<T>);

  useEffect(() => {
    setCountries(getCountries());
  }, []);

  useEffect(() => {
    if (selectedCountryCode) {
      setStates(getStates(selectedCountryCode));
      const country = countries.find(c => c.isoCode === selectedCountryCode);
      if (country) {
        setValue('country' as Path<T>, country.name as any, { shouldValidate: true });
        setValue('phoneCode' as Path<T>, country.phonecode as any, { shouldValidate: true });
      }
    } else {
      setStates([]);
      setValue('country' as Path<T>, '' as any);
      setValue('phoneCode' as Path<T>, '' as any);
    }
  }, [selectedCountryCode, countries, setValue]);

  useEffect(() => {
    if (selectedCountryCode && selectedStateCode) {
      setCities(getCities(selectedCountryCode, selectedStateCode));
    } else {
      setCities([]);
    }
  }, [selectedCountryCode, selectedStateCode]);

  const filteredCountries = useMemo(() => 
    countries.filter(c => c.name.toLowerCase().includes(countrySearch.toLowerCase())),
  [countries, countrySearch]);

  const filteredStates = useMemo(() => 
    states.filter(s => s.name.toLowerCase().includes(stateSearch.toLowerCase())),
  [states, stateSearch]);

  const filteredCities = cities;

  return (
    <div className="space-y-4">
      {/* Hidden inputs to store country name and phone code */}
      <input type="hidden" {...register('country' as Path<T>)} />
      <input type="hidden" {...register('phoneCode' as Path<T>)} />
      
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Country <span className="text-red-500">*</span>
          </label>
          <Controller
            control={control}
            name={'countryCode' as Path<T>}
            render={({ field }) => (
              <Select onValueChange={(val) => { field.onChange(val); setValue('state' as Path<T>, '' as any); setValue('city' as Path<T>, '' as any); }} value={field.value}>
                <SelectTrigger className={`w-full ${errors.countryCode ? 'border-red-500 ring-red-500' : ''}`}>
                  <SelectValue placeholder="Select a country..." />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 pb-1 sticky top-0 bg-white z-10">
                    <Input 
                      placeholder="Search country..." 
                      value={countrySearch} 
                      onChange={(e) => setCountrySearch(e.target.value)} 
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredCountries.map(c => (
                    <SelectItem key={c.isoCode} value={c.isoCode}>{c.name}</SelectItem>
                  ))}
                  {filteredCountries.length === 0 && <div className="p-2 text-sm text-gray-500">No country found</div>}
                </SelectContent>
              </Select>
            )}
          />
          {errors.countryCode && <p className="mt-1.5 text-xs text-red-500">{errors.countryCode.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            State / Province {requireState && <span className="text-red-500">*</span>}
          </label>
          <Controller
            control={control}
            name={'state' as Path<T>}
            render={({ field }) => (
              <Select onValueChange={(val) => { field.onChange(val); setValue('city' as Path<T>, '' as any); }} value={field.value} disabled={!selectedCountryCode || states.length === 0}>
                <SelectTrigger className={`w-full ${errors.state ? 'border-red-500 ring-red-500' : ''}`}>
                  <SelectValue placeholder={!selectedCountryCode ? "Select country first" : states.length === 0 ? "No states available" : "Select a state..."} />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 pb-1 sticky top-0 bg-white z-10">
                    <Input 
                      placeholder="Search state..." 
                      value={stateSearch} 
                      onChange={(e) => setStateSearch(e.target.value)} 
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredStates.map(s => (
                    <SelectItem key={s.isoCode} value={s.isoCode}>{s.name}</SelectItem>
                  ))}
                  {filteredStates.length === 0 && <div className="p-2 text-sm text-gray-500">No state found</div>}
                </SelectContent>
              </Select>
            )}
          />
          {errors.state && <p className="mt-1.5 text-xs text-red-500">{errors.state.message as string}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            City {requireCity && <span className="text-red-500">*</span>}
          </label>
          <Controller
            control={control}
            name={'city' as Path<T>}
            render={({ field }) => (
              <Select onValueChange={field.onChange} value={field.value} disabled={!selectedStateCode || cities.length === 0}>
                <SelectTrigger className={`w-full ${errors.city ? 'border-red-500 ring-red-500' : ''}`}>
                  <SelectValue placeholder={!selectedStateCode ? "Select state first" : cities.length === 0 ? "No cities available" : "Select a city..."} />
                </SelectTrigger>
                <SelectContent>
                  <div className="p-2 pb-1 sticky top-0 bg-white z-10">
                    <Input 
                      placeholder="Search city..." 
                      value={citySearch} 
                      onChange={(e) => setCitySearch(e.target.value)} 
                      onKeyDown={(e) => e.stopPropagation()}
                    />
                  </div>
                  {filteredCities.map(c => (
                    <SelectItem key={c.name} value={c.name}>{c.name}</SelectItem>
                  ))}
                  {filteredCities.length === 0 && <div className="p-2 text-sm text-gray-500">No city found</div>}
                </SelectContent>
              </Select>
            )}
          />
          {errors.city && <p className="mt-1.5 text-xs text-red-500">{errors.city.message as string}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Postal Code
          </label>
          <input
            {...register('postalCode' as Path<T>)}
            placeholder="e.g. 10001"
            className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
          />
        </div>

        {requireAddress && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <input
              {...register('addressLine1' as Path<T>)}
              placeholder="Street address, P.O. box, company name, c/o"
              className={`w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition ${errors.addressLine1 ? 'border-red-500' : 'border-border'}`}
            />
            {errors.addressLine1 && <p className="mt-1.5 text-xs text-red-500">{errors.addressLine1.message as string}</p>}
          </div>
        )}

        {requireAddress && (
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Address Line 2
            </label>
            <input
              {...register('addressLine2' as Path<T>)}
              placeholder="Apartment, suite, unit, building, floor, etc."
              className="w-full rounded-lg border border-border bg-white px-3.5 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        )}
        
        {/* Hidden field mapping for the combined address string, since our schema uses `address` and requires it in some places */}
        <input type="hidden" {...register('address' as Path<T>)} />
      </div>
    </div>
  );
}
