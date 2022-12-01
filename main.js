const API_KEY = "9ded7be35af09496a8508071c3028121";
const DAYS_OF_THE_WEEKS=["sun", "mon","tue","wed","thu","fri","sat"];

const getCurrentWeatherData = async () => {
  let city = "Chandigarh";
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric  `
  );
  return response.json();
};

const getHourlyForecast = async ({ name: city }) => {
  const response = await fetch(
    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
  );
  const data = await response.json();
  return data.list.map((forcast) => {
    const {
      dt,
      dt_txt,
      main: { temp, temp_max, temp_min },
      weather: [{ description, icon }],
    } = forcast;

    return { dt, dt_txt, temp, temp_max, temp_min, description, icon };
  });
};

let formatTemperature = (temp) => `${temp?.toFixed(1)}°`;
let iconUrl = ((icon)=>` http://openweathermap.org/img/wn/${icon}@2x.png`);

let loadCurrentForecast = ({
  name,
  main: { temp, temp_max, temp_min },
  weather: [{ description }],
}) => {
  const currentForecastElement = document.querySelector("#current-forcast");
  currentForecastElement.querySelector(".city").textContent = name;
  currentForecastElement.querySelector(".temp").textContent =
    formatTemperature(temp);
  currentForecastElement.querySelector(".desc").textContent = description;
  currentForecastElement.querySelector(
    ".min-max-temp"
  ).textContent = `H:${formatTemperature(temp_max)} L:${formatTemperature(
    temp_min
  )}`;
};



const loadHourlyForecast = ({main:{temp:tempNow},weather:[{icon:iconNow}]}, hourlyForecast) => {

  const timeFormatter = Intl.DateTimeFormat("en",{
    hour12:true,
    hour:"numeric"
  })
   console.log(hourlyForecast);
 let dataFor12Hours=hourlyForecast.slice(2,14);
  let hourlyContainer = document.querySelector(".hourly-container");
  let innerHTML = `
  <article>
      <h3 class="time">Now</h3>
     <img class="icon" src=${iconUrl(iconNow)} alt=""/>
      <p class="hourly-temp">${formatTemperature(tempNow)}</p>
  </article>`;
  for (let { dt_txt,icon, temp } of dataFor12Hours) {
    innerHTML +=`<article>
      <h3 class="time">${timeFormatter.format(new Date(dt_txt))}</h3>
     <img class="icon" src=${iconUrl(icon)} alt=""/>
      <p class="hourly-temp">${formatTemperature(temp)}</p>
  </article>`;
  }
  hourlyContainer.innerHTML = innerHTML;
};

const calculateDayWiseForecast=(hourlyForecast)=>{

  let dayWiseForecast=new Map();
  for(let forecast of hourlyForecast){
   
    const [date]=forecast.dt_txt.split(" ");
  
    const dayOfTheWeek=DAYS_OF_THE_WEEKS[new Date(date).getDay()]
    console.log(dayOfTheWeek);

    if(dayWiseForecast.has(dayOfTheWeek)){
      let forecastForTheDay=dayWiseForecast.get(dayOfTheWeek);
    forecastForTheDay.push(forecast);

      dayWiseForecast.set(dayOfTheWeek,forecastForTheDay);
  
    }
    else{
      dayWiseForecast.set(dayOfTheWeek,[forecast]);
      
      
    }
  }
  console.log(dayWiseForecast); 

  for(let [key,value] of dayWiseForecast){

    let temp_min=Math.min(...Array.from(value,val=>val.temp_min));

    let temp_max=Math.max(...Array.from(value,val=>val.temp_max));
  
    dayWiseForecast.set(key,{temp_min,temp_max,icon:value.find(v=>v.icon).icon})
   
  }
  return dayWiseForecast ;
  
   
}

const loadFiveDayForecast=(hourlyForecast)=>{
  console.log(hourlyForecast);
  
  const dayWiseForcast=calculateDayWiseForecast(hourlyForecast);
   
  const container=document.querySelector(".five-days-container");
  let dayWiseInfo=""; 
  Array.from(dayWiseForcast).map(([day,{temp_max,temp_min,icon}],index)=>{ 
    if(index<5){
      dayWiseInfo += `<article class="day-wise-container">
      <h3 class="day">${index===0?"Today":day}</h3>
      <img class="icon" src=${iconUrl(icon)} alt="">
      <p class="min-temp">${formatTemperature(temp_min)}</p>
      <p class="max-temp">${formatTemperature(temp_max)} </p>
  </article>`
    }
   
  }) 
  container.innerHTML=dayWiseInfo;

}

const loadFeelsLike=({main:{temp}})=>{
 let feelLikeContainer= document.querySelector("#feels-like");
 feelLikeContainer.querySelector(".feels-like-temp").textContent=`${formatTemperature(temp)}`


}
const loadHumdity=({main:{humidity}})=>{
  let humidityContainer=document.querySelector("#Humidity");
  humidityContainer.querySelector(".humidity").textContent=`${humidity}%`

}



document.addEventListener("DOMContentLoaded", async () => {
  let currentWeather = await getCurrentWeatherData();
  loadCurrentForecast(currentWeather);
  let hourlyForecast = await getHourlyForecast(currentWeather);
  loadHourlyForecast(currentWeather,hourlyForecast);
  loadFiveDayForecast(hourlyForecast);
  loadFeelsLike(currentWeather);
  loadHumdity(currentWeather);
});
