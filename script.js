/**
 * WordFamilyApp
 * Game Mode (Option B): flipWord now randomly selects a family and a word
 * from the entire available set on every click.
 */
class WordFamilyApp {
    constructor() {
        // --- State Variables (Encapsulated) ---
        this.wordFamilies = {};
        this.wordFamilyKeys = [];
        this.currentFamilyIndex = 0; // Still needed for tracking which family is active
        this.currentIndex = 0;       // Still needed for tracking which word is active
        
        // --- DOM Elements (Get references once) ---
        this.onsetText = document.getElementById("onset-text");
        this.wordImage = document.getElementById("word-image");
        this.onsetBox = document.getElementById("onset-flip-box");
        this.selector = document.getElementById("family-selector");

        // --- Initialization ---
        this.init();
    }

    async init() {
        if (!this.onsetText || !this.wordImage || !this.onsetBox) {
            console.error("ERROR: Required DOM elements not found. Check HTML.");
            return;
        }

        try {
            const response = await fetch("word-families.json");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            this.processData(data); 

            if (this.wordFamilyKeys.length === 0) {
                 this.onsetText.textContent = "Error: No words loaded.";
                 return;
            }

            // 🔥 Start with a random word instead of the first one ("C" + "-AT")
            this.setRandomWord(); 

            this.preloadNextImages(5);
            this.setupDropdown();

            // Set up the main click handler
            this.onsetBox.onclick = this.flipWord.bind(this);

        } catch (error) {
            console.error("Failed to load or process word families data:", error);
            this.onsetText.textContent = "Error Loading Data";
        }
    }
    
    // 🔥 NEW HELPER: Sets a random family and word index
    setRandomWord() {
        if (this.wordFamilyKeys.length === 0) return;
        
        const randomFamilyIndex = Math.floor(Math.random() * this.wordFamilyKeys.length);
        const randomFamilyKey = this.wordFamilyKeys[randomFamilyIndex];
        const wordsInFamily = this.wordFamilies[randomFamilyKey].length;
        
        const randomWordIndex = Math.floor(Math.random() * wordsInFamily);

        this.currentFamilyIndex = randomFamilyIndex;
        this.currentIndex = randomWordIndex;
    }

    // --- Core UI and Logic Functions ---
    
    processData(data) {
        this.wordFamilies = data;
        this.wordFamilyKeys = Object.keys(data);
        
        for (const key in this.wordFamilies) {
            if (Array.isArray(this.wordFamilies[key])) {
                this.wordFamilies[key].rime = key.replace(/-/g, "");
            }
        }
    }

    getCurrentWordData() {
        const familyKey = this.wordFamilyKeys[this.currentFamilyIndex];
        const wordFamily = this.wordFamilies[familyKey];
        
        if (!wordFamily || !wordFamily[this.currentIndex]) {
             console.error(`Invalid index ${this.currentIndex} for family ${familyKey}.`);
             return { onset: "", word: "Error" };
        }
        
        const onset = wordFamily[this.currentIndex].onset;
        const rime = wordFamily.rime; 
        
        return {
            onset,
            word: onset + rime
        };
    }
    
    loadInitialWord() {
        const { onset, word } = this.getCurrentWordData();
        
        this.onsetText.textContent = onset;
        this.wordImage.src = `https://source.unsplash.com/300x200/?${word}`;
        this.speakWord(word);
    }

    // 🔥 MODIFIED: flipWord now uses Game Mode (random selection)
    flipWord() {
        this.onsetBox.onclick = null;
        this.onsetBox.classList.add("flipping");

        // 1. Select the next word randomly
        this.setRandomWord();

        // 2. Preload the next words immediately 
        this.preloadNextImages(5); 

        // 3. Update content after 250ms (mid-flip)
        setTimeout(() => {
            this.loadInitialWord(); // Loads new word based on updated random indices
        }, 250);

        // 4. Remove animation class and re-enable click after 500ms
        setTimeout(() => {
            this.onsetBox.classList.remove("flipping");
            this.onsetBox.onclick = this.flipWord.bind(this);
        }, 500);
    }

    speakWord(word) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
    }
    
    // --- Optimization: Image Preloading (Stays sequential for efficiency) ---
    // Note: The preloading logic here is still sequential starting from the *current*
    // word. For a truly random mode, this preloading is less effective, but still
    // helps mask latency if the user repeatedly clicks. For a perfect "Game Mode"
    // preloading, you'd randomly select N words to preload.
    preloadNextImages(count = 5) {
        let familyIndex = this.currentFamilyIndex;
        let wordIndex = this.currentIndex;
        
        for (let i = 0; i < count; i++) {
            const familyKey = this.wordFamilyKeys[familyIndex];
            const familyWords = this.wordFamilies[familyKey];
            
            if (wordIndex < familyWords.length) {
                const onset = familyWords[wordIndex].onset;
                const rime = this.wordFamilies[familyKey].rime; 
                const word = onset + rime;
                
                const img = new Image();
                img.src = `https://source.unsplash.com/300x200/?${word}`;
                
                wordIndex++;
                
            } else {
                familyIndex = (familyIndex + 1) % this.wordFamilyKeys.length;
                wordIndex = 0;
                
                if (familyIndex === this.currentFamilyIndex && wordIndex === this.currentIndex) break;
            }
        }
    }

    // --- Optional Dropdown ---
    // Note: In Game Mode, the dropdown still allows starting a specific family, 
    // but subsequent flips will be random across all families.
    setupDropdown() {
        if (!this.selector) return;

        this.wordFamilyKeys.forEach(key => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key;
            this.selector.appendChild(option);
        });

        this.selector.addEventListener("change", () => {
            // Update state based on dropdown selection
            this.currentFamilyIndex = this.wordFamilyKeys.indexOf(this.selector.value);
            this.currentIndex = 0; 
            
            this.loadInitialWord();
            this.preloadNextImages(5);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new WordFamilyApp();
});
