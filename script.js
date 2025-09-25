let wordFamilies = {};
let currentWordFamily = "-AT";
let currentIndex = 0;

const onsetBox = document.getElementById("onset-flip-box");
const onsetText = document.getElementById("onset-text");
const wordImage = document.getElementById("word-image");

// Load JSON file
fetch("word-families.json")
  .then(response => response.json())
  .then(data => {
    wordFamilies = data;
    loadInitialWord();
  })
  .catch(error => {
    console.error("Failed to load word families:", error);
  });

function loadInitialWord() {
  const initialWord = wordFamilies[currentWordFamily][currentIndex];
  onsetText.textContent = initialWord.onset;
  wordImage.src = `images/${initialWord.imageFile}`;
  playAudio(initialWord.audioFile);
}

function flipWord() {
  onsetBox.onclick = null;
  onsetBox.classList.add("flipping");

  const words = wordFamilies[currentWordFamily];
  currentIndex = (currentIndex + 1) % words.length;
  const nextWord = words[currentIndex];

  setTimeout(() => {
    onsetText.textContent = nextWord.onset;
    wordImage.src = `images/${nextWord.imageFile}`;
    playAudio(nextWord.audioFile);
  }, 250);

  setTimeout(() => {
    onsetBox.classList.remove("flipping");
    onsetBox.onclick = flipWord;
  }, 500);
}

function playAudio(filename) {
  const audio = new Audio(`audio/${filename}`);
  audio.play();
}
