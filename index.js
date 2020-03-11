const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();


  let _airports = [];

  try {
    throw "";
    _airports = (await GetURLData(browser, 'https://www.flightsfrom.com/map', 1))[0];
    console.log(`amt airports fetched :  ${_airports.length}`);
  } catch (e) {
    let rawdata = fs.readFileSync('airports.json');
    _airports = JSON.parse(rawdata);
    console.log(`amt airports fetched :  ${_airports.length}`);
  }

  await GenerateAllRoutes(fs, _airports);

  try {
    _airports = _airports.filter(f => !(fs.existsSync(`./routes/${f.IATA}.json`)));
  } catch (e) {
    console.log(e);
  }

  done = 0;
  bufferSize = 300;
  amtAirports = _airports.length;
  for (let i = 0; i < amtAirports; i = i + bufferSize) {
    asyncForEach(_airports.splice(i, i + bufferSize), async el => {
      try {
        let d = await GetURLData(browser, `https://www.flightsfrom.com/${el.IATA}/destinations`, 2);
        writeRouteToFile(d, fs);
      } catch (e) {
        console.log(e);
      }
      done++;
      console.log(`${done} of ${amtAirports}`);
    });
  }

  //await browser.close();
})();


async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    try {
      await callback(array[index], index, array);
    } catch (e) {

    }
  }
}

function writeRouteToFile(route, fs) {
  try {
    let fileData = JSON.stringify(route);
    fs.writeFileSync(`./routes/${route[0].iata_from}.json`, fileData);
  } catch (e) {
    console.log(`error witing route : ${route[0].iata_from} to file`)
  }
}


async function GetURLData(browser, URL, type) {
  // const delay = time => new Promise(res => setTimeout(() => res(), time));
  // await delay(Math.random() * 1000);
  const page = await browser.newPage();

  try {
    await page.goto(URL, {
      waitUntil: 'networkidle2'
    });
  } catch (e) {}

  let _data = [];

  try {
    if (type === 1) {
      _data = (await page.evaluate(() => {
        airports.forEach(el => {
          delete el.marker
          delete el.polyline
          delete el.ib;
          delete el.click;
          delete el.airport;
        });
        return [airports];
      }));
    } else if (type === 2) {
      _data = (await page.evaluate(() => {
        routes.forEach(el => {
          delete el.marker
          delete el.polyline
          delete el.ib;
          delete el.click;
          delete el.airport;
        });

        if (routes.length > 0) {
          let r = {
            "iata_from": routes[0].iata_from,
            "routes": routes
          }
          return [r];
        } else {
          return [routes];
        }


      }));
    }

  } catch (e) {

  }
  // let data = JSON.stringify(_airports);
  // fs.writeFileSync('airports.json', data);
  // //console.log(_airports);
  await page.close();

  return _data;
  // let rawdata = fs.readFileSync('airports.json');
  // let _airports = JSON.parse(rawdata);
}


async function GenerateAllRoutes(fs, airports) {
  let _allAirports = [];
  await asyncForEach(airports, async airport => {
    let rawdata = fs.readFileSync(`./routes/${airport.IATA}.json`);
    _allAirports = [..._allAirports, ...JSON.parse(rawdata)];
  });

  let fileData = JSON.stringify(_allAirports);
  fs.writeFileSync(`routes.json`, fileData);
}