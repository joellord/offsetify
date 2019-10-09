# Offsetify
A collection of tools to calculate the CO2 footprint of various activites. Used for Offsetify.com

## Flights

### Airport lat/long
Uses the openflights data (https://github.com/jpatokal/openflights) for the airport lat/long

### Great Circle Distance calculation
```
theta = lon2 - lon1
dist = acos(sin(lat1) × sin(lat2) + cos(lat1) × cos(lat2) × cos(theta))
if (dist < 0) dist = dist + pi
dist = dist × 6371.2 
```
Based on http://www.gcmap.com/faq/gccalc#gchow

### Distance Correction
We add 95km as distance correction

### CO2 Emissions per Jet fuel kg

Using 3.15 grams per gram of fuel according to https://www.carbonindependent.org/22.html

### Calculation

CO2 = Distance * Consumption/Seat Average * (1/Occupancy) * Cabin Class Factor

Fuel consumption based on averages from :https://en.wikipedia.org/wiki/Fuel_economy_in_aircraft

Occupancy is estimated at 80%

Cabin class factor is *3 for long haul and *1.5 for short haul (Y vs J)