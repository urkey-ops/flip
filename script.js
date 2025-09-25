let wordFamilies = {};
let wordFamilyKeys = [];
let currentFamilyIndex = 0;
let currentIndex = 0;
let currentWordFamily = "";

const onsetText = document.getElementById("onset-text");
const wordImage = document.getElementById("word-image");
const onsetBox = document.getElementById("onset-flip-box");

fetch("word-families.json")
  .then(res => res.json())
  .then(data => {
    wordFamilies = data;
    wordFamilyKeys = Object.keys(data);
    currentWordFamily = wordFamilyKeys[currentFamilyIndex];
    currentIndex = 0;
    loadInitialWord();
    setupDropdown(); // optional
  });

function getCurrentWord() {
  const onset = wordFamilies[currentWordFamily][currentIndex].onset;
  return onset + currentWordFamily.replace("-", "");
}

function loadInitialWord() {
  const word = getCurrentWord();
  onsetText.textContent = wordFamilies[currentWordFamily][currentIndex].onset;
  wordImage.src = `https://source.unsplash.com/300x200/?${word}`;
  speakWord(word);
}

function flipWord() {
  onsetBox.onclick = null;
  onsetBox.classList.add("flipping");

  currentIndex++;
  if (currentIndex >= wordFamilies[currentWordFamily].length) {
    currentFamilyIndex++;
    if (currentFamilyIndex >= wordFamilyKeys.length) {
      currentFamilyIndex = 0;
    }
    currentWordFamily = wordFamilyKeys[currentFamilyIndex];
    currentIndex = 0;
  }

  setTimeout(() => {
    const word = getCurrentWord();
    onsetText.textContent = wordFamilies[currentWordFamily][currentIndex].onset;
    wordImage.src = `https://source.unsplash.com/300x200/?${word}`;
    speakWord(word);
  }, 250);

  setTimeout(() => {
    onsetBox.classList.remove("flipping");
    onsetBox.onclick = flipWord;
  }, 500);
}

function speakWord(word) {
  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = "en-US";
  speechSynthesis.speak(utterance);
}

// Optional dropdown to select family
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
    currentFamilyIndex = wordFamilyKeys.indexOf(currentWordFamily);
    currentIndex = 0;
    loadInitialWord();
  });
}
