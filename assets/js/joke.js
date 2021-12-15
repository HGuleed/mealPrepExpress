let api =
"https://v2.jokeapi.dev/joke/Any?blacklistFlags=nsfw,religious,political,racist,sexist,explicit&type=single";
var searchButton = document.getElementById('searchbutton');
var jokeBox = document.getElementById('joke-box');

function getJoke() {
   fetch(api)
      .then(function (response) {
         if (response.ok) {
            response.json().then(function (jokeData) {
          //   return jokeData;
          console.log(jokeData);
          displayJoke(jokeData);
         //var joke = document.getElementById("joke");
         //joke.textContent = jokeData.joke;
      });
      } else {
      alert("Error: No response from API!");
      }
   })
   .catch(function (error) {
      alert("Unable to connect to API");
      console.log(error);
   });
}

var displayJoke = function (jokeData) {
  var jokeEl = document.getElementById('joke')
  jokeEl.textContent = jokeData.joke
}

searchButton.addEventListener("click", getJoke)
jokeBox.addEventListener("click", getJoke)
getJoke();