let wordFamilies = {};
let wordFamilyKeys = [];
let currentFamilyIndex = 0;
let currentWordFamily = "";
let currentIndex = 0;

const onsetText = document.getElementById("onset-text");
const wordImage = document.getElementById("word-image");
const onsetBox = document.getElementById("onset-flip-box");

// Load word families from JSON
fetch("word-families.json")
  .then(res => res.json())
  .then(data => {
    wordFamilies = data;
    wordFamilyKeys = Object.keys(data);
    currentWordFamily = wordFamilyKeys[currentFamilyIndex];
    currentIndex = 0;
    loadInitialWord();
    setupDropdown(); // optional: for UI family switching
  });

function loadInitialWord() {
  const word = wordFamilies[currentWordFamily][currentIndex];
  onsetText.textContent = word.onset;
  wordImage.src = `images/${word.imageFile}`;
  playAudio(word.audioFile);
}

function flipWord() {
  onsetBox.onclick = null;
  onsetBox.classList.add("flipping");

  const currentWords = wordFamilies[currentWordFamily];
  currentIndex++;

  if (currentIndex >= currentWords.length) {
    currentFamilyIndex++;
    if (currentFamilyIndex < wordFamilyKeys.length) {
      currentWordFamily = wordFamilyKeys[currentFamilyIndex];
      currentIndex = 0;
    } else {
      currentFamilyIndex = 0;
      currentWordFamily = wordFamilyKeys[currentFamilyIndex];
      currentIndex = 0;
    }
  }

  const nextWord = wordFamilies[currentWordFamily][currentIndex];

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

function playAudio(file) {
  const audio = new Audio(`audio/${file}`);
  audio.play();
}

// Optional: Create dropdown to manually switch families
function setupDropdown() {
  const selector = document.getElementById("family-selector");
  if (!selector) return;

  wordFamilyKeys.forEach(key => {
    const option = document.createElement("option");
    option.value = key;
    option.textContent = key;
    selector.appendChild(option);
  });

  selector.addEventListener("change", () => {
    currentWordFamily = selector.value;
    currentIndex = 0;
    currentFamilyIndex = wordFamilyKeys.indexOf(currentWordFamily);
    loadInitialWord();
  });
}
