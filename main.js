const API_KEY = "9ded7be35af09496a8508071c3028121";

const getCurrentWeatherData = async () => {
  let city = "Shimla";
  let response = await fetch(
    `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric  `
  );
  return response.json();
};

const getHourlyForcast = async ({ name: city }) => {
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

let loadCurrentForcast = ({
  name,
  main: { temp, temp_max, temp_min },
  weather: [{ description }],
}) => {
  const currentForcastElement = document.querySelector("#current-forcast");
  currentForcastElement.querySelector(".city").textContent = name;
  currentForcastElement.querySelector(".temp").textContent =
    formatTemperature(temp);
  currentForcastElement.querySelector(".desc").textContent = description;
  currentForcastElement.querySelector(
    ".min-max-temp"
  ).textContent = `H:${formatTemperature(temp_max)} L:${formatTemperature(
    temp_min
  )}`;
};

const loadHourlyForcast = (hourlyForcast) => {
   console.log(hourlyForcast);
 let dataFor12Hours=hourlyForcast.slice(1,13);
  let hourlyContainer = document.querySelector(".hourly-container");
  let innerHTML = ``;
  for (let { dt_txt,icon, temp } of dataFor12Hours) {
    innerHTML += `<article>
      <h3 class="time">${dt_txt.split(" ")[1]}</h3>
     <img class="icon" src=${iconUrl(icon)} alt=""/>
      <p class="hourly-temp">${formatTemperature(temp)}</p>
  </article>`;
  }
  hourlyContainer.innerHTML = innerHTML;
};

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
  loadCurrentForcast(currentWeather);
  let hourlyForcast = await getHourlyForcast(currentWeather);
  loadHourlyForcast(hourlyForcast);
  loadFeelsLike(currentWeather);
  loadHumdity(currentWeather);
});
