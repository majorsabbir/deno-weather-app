import { parse } from  "https://deno.land/std@0.61.0/flags/mod.ts";
import { fromUnixTime, format } from  "https://deno.land/x/date_fns@v2.15.0/index.js";
import  AsciiTable  from  'https://deno.land/x/ascii_table/mod.ts';
import { config } from "https://deno.land/x/dotenv/mod.ts";

const { OWM_API_KEY } = config({ safe: true });

const args = parse(Deno.args)

if (args.city === undefined) {
    console.error("No city supplied");
    Deno.exit();
}

const apiKey = OWM_API_KEY;

const res = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${args.city}&units=metric&appid=${apiKey}`);

if (res.status === 404) {
    console.log(`${args.city} City ${res.statusText}`);
    Deno.exit();
}

const data = await res.json();

interface forecastItem {
    dt: string;
    main: { temp: number; feels_like: number, temp_min: number, temp_max: number, humidity: number };
    weather: { description: string; }[];
    clouds: { all: number };
    wind: { speed: number, deg: number };
}

const forecast = data.list.slice(0,8).map((item: forecastItem) => [
    format(fromUnixTime(item.dt), "do LLL, k:mm", {}),
    `${item.main.temp.toFixed(1)}C`,
    `${item.main.feels_like.toFixed(1)}C`,
    `${item.main.temp_min.toFixed(1)}C`,
    `${item.main.temp_max.toFixed(1)}C`,
    `${item.main.humidity}%`,
    `${item.clouds.all}%`,
    `${item.wind.speed.toFixed(2)}km`,
    `${item.wind.deg}deg`,
    item.weather[0].description,
])

const table = AsciiTable.fromJSON({
    title: `${data.city.name} Forecast`,
    heading: [ 
        'Time', 
        'Temp', 
        'Feels Like', 
        'Min Temp', 
        'Max Temp', 
        'Humidity',
        'Clouds',
        'Wind Speed',
        'Wind Deg',
        'Weather'],
    rows: forecast
  })
  
console.log(table.toString())