const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");


const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

//initally needed 
let currentTab = userTab;
const API_KEY = "a833115bf5d873dd4a3304c38cf2d332";
currentTab.classList.add("current-tab");
getfromSessionStorage(); 

function switchTab(clickedTab){
   if(clickedTab!=currentTab){ 
      currentTab.classList.remove("current-tab");
      currentTab = clickedTab;
      currentTab.classList.add("current-tab");

      if(!searchForm.classList.contains("active")){
        //kya search form conatiner is visible 
        userInfoContainer.classList.remove("active");
        grantAccessContainer.classList.remove("active");
        searchForm.classList.add("active");
      }
      else{
        //maine pahle search wale tab me tha ab mai your wather tab me jaunga
        searchForm.classList.remove("active");
        userInfoContainer.classList.remove("active");
        
        //ab main your weather tab me hu toh usko chcek karenge ki us 
        //session me humara location stored hai toh location ka temp 
        //dikhao nahi toh phir grant access wala dikhao 
        getfromSessionStorage();
      }
   }
};

userTab.addEventListener("click",()=>{
    //pass clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click",()=>{
    //pass clicked tab as input parameter
    switchTab(searchTab);
});

//chcek if coordinates are already stored
function getfromSessionStorage(){
   const localCoordinates = sessionStorage.getItem("user-coordinates");
   if(!localCoordinates){
      //agr local location present nahi hai toh 
      //grant access wala page ko dikhayenge 
      grantAccessContainer.classList.add("active");
   }
   else{
       //agr present hai toh
       const coordinates =  JSON.parse(localCoordinates);
       fetchUserWeatherInfo(coordinates);
   }
}

async function fetchUserWeatherInfo(coordinates){
    const {lat,lon} = coordinates;
    //make grantcontainer invisible 
    grantAccessContainer.classList.remove("active");
    //use loading page until that 
    loadingScreen.classList.add("active");

    // API call 
    try{
       const response = await fetch(
                   `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}`  
                   );
       const data = await response.json();
       loadingScreen.classList.remove("active");
       userInfoContainer.classList.add("active");
       renderWeatherInfo(data);
    }
    catch(err){
        loadingScreen.classList.remove("active");
    }
};
// async function fetchUserWeatherInfo(coordinates) {
//     const {lat, lon} = coordinates;
//     // make grantcontainer invisible
//     grantAccessContainer.classList.remove("active");
//     //make loader visible
//     loadingScreen.classList.add("active");

//     //API CALL
//     try {
//         const response = await fetch(
//             `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
//           );
//         const  data = await response.json();

//         loadingScreen.classList.remove("active");
//         userInfoContainer.classList.add("active");
//         renderWeatherInfo(data);
//     }
//     catch(err) {
//         loadingScreen.classList.remove("active");
//         //HW
//     }
// };


function renderWeatherInfo(weatherInfo){
    //firstly, we have to fetch the element
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-cloudiness]");

    //fetch values from weatherInfo object and put it UI elements
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temp.innerText = `${(weatherInfo?.main?.temp-273.15).toFixed(2)}°C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;
}

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else{
        alert("Your browser doesn't support geolocation support.");
    }
};

function showPosition(position){
    const userCoordinates = {
        lat:position.coords.latitude,
        lon:position.coords.longitude,
    }
    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates)

}


const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);

let searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit",(e)=>{
    e.preventDefault();
    let cityName = searchInput.value;
    if(cityName==="")
        return;
    else
        fetchSearchWeatherInfo(cityName);
});

async   function fetchSearchWeatherInfo(city){
     loadingScreen.classList.add("active");
     userInfoContainer.classList.remove("active");
     grantAccessContainer.classList.remove("active");

     try{
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}`
                         );

            if(response.status === 404){
                //hide loading screen
                loadingScreen.classList.remove("active");
                alert("City not found. Please enter a valid city name.");
                return;
            }
            const data = await response.json();
            loadingScreen.classList.remove("active");
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
     catch(err){
           //hide loading screen
           loadingScreen.classList.remove("active");
           alert("An error occured while fetching the data. please try again.");
     }
};


