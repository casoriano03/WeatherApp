import express from 'express';
import bodyParser from 'body-parser';
import axios from 'axios';


const port = 4000;
const app = express();

app.set('view engine', 'ejs');
app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json())

    

app.get("/", async (req,res)=>{
    const result = await axios.get('https://steder-api.no/api');
    const place = result.data.place;
    const lat = result.data.position.lat;
    const lon = result.data.position.lon;

    const options = {
      method: 'GET',
      url:'https://api.met.no/weatherapi/nowcast/2.0/complete',
      params:{lat:lat,lon:lon},
      headers:{'user-Agent':'https://github.com/casoriano03'}
 };
    axios.request(options).then(function(response){
        const weatherNow = response.data.properties.timeseries[0];
        const temp = weatherNow.data.instant.details.air_temperature;
        const windSpeed = weatherNow.data.instant.details.wind_speed;
        const precipitationRate = weatherNow.data.instant.details.precipitation_rate;
        const relativeHumidity = weatherNow.data.instant.details.relative_humidity;
        const icon = weatherNow.data.next_1_hours.summary.symbol_code;
        res.render("home.ejs",{temp: temp, wind:windSpeed, prepRate:precipitationRate, relHUm:relativeHumidity,icon:icon,place:place,lat:lat,lon:lon});

    }).catch(function(error){
        console.error(error);
    });
})

app.post("/hourly", async(req,res)=>{
    const result = await axios.get('https://steder-api.no/api');
    const lat = result.data.position.lat;
    const lon = result.data.position.lon;
    const cityName = result.data.place;
    const options = {
        method: 'GET',
        url:'https://api.met.no/weatherapi/locationforecast/2.0/compact',
        params:{lat:lat,lon:lon},
        headers:{'user-Agent':'https://github.com/casoriano03'}
   };
      axios.request(options).then(function(response){
          const weatherNow = response.data.properties.timeseries;
          res.render("page.ejs",{weatherNow:weatherNow, city:cityName});
  
      }).catch(function(error){
          console.error(error);
      });
})

app.post("/city", async(req,res)=>{
   const city = req.body.input
   const result = await axios.get('https://steder-api.no/api?q='+city);
   const lat = result.data.position.lat;
    const lon = result.data.position.lon;
    const cityName = result.data.place;
    const options = {
        method: 'GET',
        url:'https://api.met.no/weatherapi/locationforecast/2.0/compact',
        params:{lat:lat,lon:lon},
        headers:{'user-Agent':'https://github.com/casoriano03'}
   };
   axios.request(options).then(function(response){
    const weatherNow = response.data.properties.timeseries;
    res.render("page.ejs",{weatherNow:weatherNow, city:cityName});

}).catch(function(error){
    console.error(error);
});

})

app.listen(port, ()=>{
    console.log(`Server is running on port ${port}` )
});