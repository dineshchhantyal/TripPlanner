// import axios from "axios";
const axios = require("axios");
const places = [
  "59 Central Park W, New York",
  "20 W 34th St, New York",
  "1109 5th Ave, New York",
  "4 Pennsylvania Plz, New York",
  "285 Fulton St, New York",
];

const places_info = [];

// const distancesMatrix = new Array(places.length);
// for (let i = 0; i < places.length; i++) {
//   distancesMatrix[i] = new Array(places.length + 1).fill(0);
// }

const distancesMatrix = [
  [0, 3579, 3705, 3848, 13279, 7948],
  [3927, 0, 5937, 1202, 9856, 5626],
  [3144, 4839, 0, 5761, 14711, 15688],
  [2868, 994, 6573, 0, 6327, 5726],
  [7948, 5626, 15688, 5726, 0, 0],
];

const totalDistance = new Array(places.length).fill(0);

async function initData() {
  for (let place in places) {
    const r = await axios("http://localhost:3000/api/places?query=" + place);
    places_info.push(r.data.predictions[0]);
  }
}

// initData();

async function getDistanceMatrix() {
  for (let i = 0; i < places.length; i++) {
    let j;

    for (j = 0; j < places.length; j++) {
      if (i == j) {
        distancesMatrix[i][j] = 0;
        continue;
      }
      const r = await axios(
        `http://localhost:3000/api/direction?origin=${places[i]}&destination=${places[j]}&mode=driving&units=imperial&transit_mode=bus&departure_time=now`
      );
      distancesMatrix[i][j] = r.data.routes[0].legs[0].distance.value;
    }

    const rn = await axios(
      `http://localhost:3000/api/direction?origin=${places[j - 1]
      }&destination=${places[i]
      }&mode=driving&units=imperial&transit_mode=bus&departure_time=now`
    );
    distancesMatrix[i][places.length] =
      rn.data.routes[0].legs[0].distance.value;
  }
}

getDistanceMatrix();
function calculateDistance() {
  for (let i = 0; i < places.length; i++) {
    for (let j = 0; j < places.length; j++) {
      totalDistance[i] += distancesMatrix[i][j];
    }
  }
}

async function main() {
  // await initData();
  // await getDistanceMatrix();
  calculateDistance();
  console.log(totalDistance);
}

main();
