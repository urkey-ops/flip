// ---------------------
// Word Families Data
// ---------------------

const wordFamilies = {
  "-AT": [
    { onset: "C", imageFile: "cat.png", audioFile: "cat.mp3" },
    { onset: "B", imageFile: "bat.png", audioFile: "bat.mp3" },
    { onset: "M", imageFile: "mat.png", audioFile: "mat.mp3" },
    { onset: "H", imageFile: "hat.png", audioFile: "hat.mp3" },
    { onset: "R", imageFile: "rat.png", audioFile: "rat.mp3" },
    { onset: "S", imageFile: "sat.png", audioFile: "sat.mp3" }
  ],
  "-ASH": [
    { onset: "C", imageFile: "cash.png", audioFile: "cash.mp3" },
    { onset: "D", imageFile: "dash.png", audioFile: "dash.mp3" },
    { onset: "M", imageFile: "mash.png", audioFile: "mash.mp3" },
    { onset: "L", imageFile: "lash.png", audioFile: "lash.mp3" },
    { onset: "CR", imageFile: "crash.png", audioFile: "crash.mp3" },
    { onset: "FL", imageFile: "flash.png", audioFile: "flash.mp3" }
  ],
  "-AKE": [
    { onset: "C", imageFile: "cake.png", audioFile: "cake.mp3" },
    { onset: "B", imageFile: "bake.png", audioFile: "bake.mp3" },
    { onset: "M", imageFile: "make.png", audioFile: "make.mp3" },
    { onset: "T", imageFile: "take.png", audioFile: "take.mp3" },
    { onset: "L", imageFile: "lake.png", audioFile: "lake.mp3" },
    { onset: "R", imageFile: "rake.png", audioFile: "rake.mp3" }
  ]
};

// ---------------------
// State Management
// ---------------------

let currentWordFamily = "-AT";
let currentIndex = 0;

// ---------------------
// DOM Elements
// ---------------------

const onsetBox = document.getElementById("onset-flip-box");
const onsetText = document.getElementById("onset-text");
const wordImage = document.getElementById("word-image");

// ---------------------
// Flip Function
// ---------------------

function flipWord() {
  // Prevent spam clicks
  onsetBox.onclick = null;
  onsetBox.classList.add("flipping");

  const words = wordFamilies[currentWordFamily];
  currentIndex = (currentIndex + 1) % words.length;

  const nextWord = words[currentIndex];

  // Midpoint Update: after 250ms
  setTimeout(() => {
    onsetText.textContent = nextWord.onset;
    wordImage.src = `images/${nextWord.imageFile}`;
    playAudio(nextWord.audioFile);
  }, 250);

  // End of Flip: after 500ms
  setTimeout(() => {
    onsetBox.classList.remove("flipping");
    onsetBox.onclick = flipWord;
  }, 500);
}

// ---------------------
// Audio Playback
// ---------------------

function playAudio(filename) {
  const audio = new Audio(`audio/${filename}`);
  audio.play();
}
