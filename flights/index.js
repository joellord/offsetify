const fs = require("fs");
const readline = require("readline");

// Start by loading the airports data
let airports = [];

async function processLineByLine() {
  const rl = readline.createInterface({
    input: fs.createReadStream("data/airports.dat")
  });

  for await (const line of rl) {
    data = line.split(",").map(d => {
      d = d.replace(/\"/g, "");
      d = (d == "\\N") ? null : d;
      return d;
    });
    let airport = {
      id: data[0],
      name: data[1],
      city: data[2],
      country: data[3],
      iata: data[4],
      icao: data[5],
      latitude: data[6],
      longitude: data[7],
      altitude: data[8],
      timezone: data[9],
      dst: data[10],
      tzdbtime: data[11],
      type: data[12],
      source: data[13]
    }
    airports.push(airport);
  }
}

//Grand Circle Distance (in km)
/**
theta = lon2 - lon1
dist = acos(sin(lat1) × sin(lat2) + cos(lat1) × cos(lat2) × cos(theta))
if (dist < 0) dist = dist + pi
dist = dist × 6371.2 
 */
const calculateGreatCircleDistance = (position1, position2) => {
  const lat1 = position1.latitude * Math.PI / 180;
  const lat2 = position2.latitude * Math.PI / 180;
  const lon1 = position1.longitude * Math.PI / 180;
  const lon2 = position2.longitude * Math.PI / 180;
  const theta = lon2 - lon1;
  let dist = Math.acos(Math.sin(lat1) * Math.sin(lat2) + Math.cos(lat1)* Math.cos(lat2) * Math.cos(theta));
  if (dist < 0) dist = dist + Math.PI;
  dist = dist * 6371.2;
  return dist;
};

const getConsumptionByDistance = (distance) => {
  let consumption = 0;  // L per 100 km
  if (distance <= 926) consumption = 4.68;
  if (distance > 926 && distance <= 1267) consumption = 3.35;
  if (distance > 1267 && distance <= 3240) consumption = 2.68;
  if (distance > 3240 && distance <= 8610) consumption = 2.74;
  if (distance > 8610) consumption = 2.95;
  //Lets assume 4.68 for all flights
  consumption = 4.68;
  // 1 liter == 0.45 kg
  return consumption * 0.45;
}

//distance * (((4.68 * 0.45 / 100) * 1000 * 3.15) / 907185) / 0.8

const calculateFlightCO2PerPassenger = (airport1, airport2, isFirstClass) => {
  // CO2 = Distance * Consumption/Seat Average * (1/Occupancy) * Cabin Class Factor
  let distance = calculateGreatCircleDistance(airport1, airport2) + 95;
  let fuelEconomy = getConsumptionByDistance(distance);
  let burnedFuel = distance * fuelEconomy / 100;
  let co2Emissions = burnedFuel * 1000 * 3.15;
  let co2Tons = co2Emissions / 907185;
  let compensateOccupancy = co2Tons * 1 / 0.8;
  let firstModifier = 1;
  if (isFirstClass && distance < 3500) firstModifier = 1.5;
  if (isFirstClass && distance >=3500) firstModifier = 2;
  return compensateOccupancy * firstModifier;
}


processLineByLine().then(() => {
  let dest1 = process.argv[2];
  let dest2 = process.argv[3];
  let first = process.argv[4];
  let airport1 = airports.find(a => a.iata === dest1);
  let airport2 = airports.find(a => a.iata === dest2);
  console.log(`Calculations for a flight ${dest1}-${dest2}`);
  console.log(`Total distance is ${calculateGreatCircleDistance(airport1, airport2)}`);
  console.log(`Tons of CO2/pax produced in ${first ? "J" : "Y"} class: ${calculateFlightCO2PerPassenger(airport1, airport2, first)}`);
});
