console.log("This is demo");
let currentSong = new Audio();
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  // Calculate minutes and seconds
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  // Format as MM:SS with leading zeros
  const formattedMinutes = String(minutes).padStart(2, "0");
  const formattedSeconds = String(remainingSeconds).padStart(2, "0");

  return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:5500/${folder}`);
  let response = await a.text();
  console.log(response);
  let div = document.createElement("div");
  div.innerHTML = response;
  let as = div.getElementsByTagName("a");
  songs = [];
  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1]);
    }
  }

  // Play the first song

  // show all songs in the playlist
  let songUL = document
    .querySelector(".songList")
    .getElementsByTagName("ul")[0];
  songUL.innerHTML = "";
  for (const song of songs) {
    songUL.innerHTML =
      songUL.innerHTML +
      `<li> 
                <img class="invert" src="" alt="">
                <div class="info">
                  <div>${song.replaceAll("%20", " ")}  </div>
                  <div>Song Artist</div>
                </div>
                <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
              </div><li/>`;
  }

  // Attech an event listner to each song
  Array.from(
    document.querySelector(".songList").getElementsByTagName("li")
  ).forEach((e) => {
    e.addEventListener("click", (element) => {
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    });
  });

  return songs;
}

const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "img/pause.svg";
  }
  document.querySelector(".songinfo").innerHTML = decodeURI(track);
  document.querySelector(".songtime").innerHTML = "00:00 / 00:00";
};
async function displayAlbums() {
  try {
    let a = await fetch(`http://127.0.0.1:5500/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);

    for (let index = 0; index < array.length; index++) {
      const e = array[index];
      if (e.href.includes("/songs/")) {
        let url = new URL(e.href); // Convert href to a URL object
        let segments = url.pathname.split("/").filter(Boolean); // Split and clean the path
        let folder = segments[segments.length - 1]; // Extract the folder name
        console.log("Processing folder:", folder);

        try {
          let a = await fetch(
            `http://127.0.0.1:5500/songs/${folder}/info.json`
          );
          if (!a.ok)
            throw new Error(`Metadata not found for folder: ${folder}`);
          let response = await a.json();

          cardContainer.insertAdjacentHTML(
            "beforeend",
            `<div data-folder="${folder}" class="card">
              <div class="play">
                <svg width="16" height="16" viewbox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" stroke-width="1.5" stroke-linejoin="round" fill="#000" />
                </svg>
              </div>
              <img src="/songs/${folder}/cover.jpg" alt="${response.title}">
              <h2>${response.title}</h2>
              <p>${response.description}</p>
            </div>`
          );
        } catch (error) {
          console.error(
            `Error fetching metadata for folder "${folder}":`,
            error
          );
        }
      }
    }

    // Event delegation for dynamic cards
    cardContainer.addEventListener("click", async (event) => {
      let card = event.target.closest(".card");
      if (card) {
        let folder = card.dataset.folder;
        try {
          let songs = await getSongs(`songs/${folder}`);
          playMusic(songs[0]);
        } catch (error) {
          console.error("Error loading songs:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error fetching album directory:", error);
  }
}

async function main() {
  // get the list of songs
  await getSongs("songs/ncs");
  playMusic(songs[0], true);

  // Display all the albums  on the page
  displayAlbums();

  // Attech an event to play, next and previous
  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "img/pause.svg";
    } else {
      currentSong.pause();
      play.src = "img/play.svg";
    }
  });

  // Listen for time update   event
  currentSong.addEventListener("timeupdate", () => {
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} /
     ${secondsToMinutesSeconds(currentSong.duration)}`;
    document.querySelector(".circle").style.left =
      (currentSong.currentTime / currentSong.duration) * 100 + "%";
  });

  // Add an event listner to seekbar
  document.querySelector(".seekbar").addEventListener("click", (e) => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = (currentSong.duration * percent) / 100;
  });

  // Add an event listner for hamburger
  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0";
  });

  // Add an event listner for close button
  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-120%";
  });

  // Add an event listner for previous
  previous.addEventListener("click", () => {
    currentSong.pause();
    console.log("Previous clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 >= 0) {
      playMusic(songs[index - 1]);
    }
  });

  // Add an event listner for next
  next.addEventListener("click", () => {
    currentSong.pause();
    console.log("next clicked");

    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0]);
    if (index + 1 < songs.length) {
      playMusic(songs[index + 1]);
    }
  });

  // Add an event to volume
  document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to", e.target.value, "out of 100");
      currentSong.volume = parseInt(e.target.value) / 100;
    });

  // Add event listener to mute track
  document.querySelector(".volume>img").addEventListener("click", (e) => {
    if (e.target.src.includes("img/volume.svg")) {
      e.target.src = e.target.src.replace("img/volume.svg", "img/mute.svg");
      currentSong.volume = 0;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 0;
    } else {
      e.target.src = e.target.src.replace("mute.svg", "volume.svg");
      currentSong.volume = 0.1;
      document
        .querySelector(".range")
        .getElementsByTagName("input")[0].value = 10;
    }
  });
}
main();
