/**
 * WordFamilyApp
 * Encapsulates all application logic, state, and DOM manipulation.
 * Addresses issues with global state, data processing efficiency,
 * error handling, and implements image preloading.
 */
class WordFamilyApp {
    constructor() {
        // --- State Variables (Encapsulated) ---
        this.wordFamilies = {};
        this.wordFamilyKeys = [];
        this.currentFamilyIndex = 0;
        this.currentIndex = 0;

        // --- DOM Elements (Get references once) ---
        this.onsetText = document.getElementById("onset-text");
        this.wordImage = document.getElementById("word-image");
        this.onsetBox = document.getElementById("onset-flip-box");
        this.selector = document.getElementById("family-selector");

        // --- Initialization ---
        this.init();
    }

    // --- Initialization and Data Loading ---

    async init() {
        // 🛑 CRITICAL CHECK: Ensure all required DOM elements exist
        if (!this.onsetText || !this.wordImage || !this.onsetBox) {
            console.error("ERROR: Required DOM elements (onset-text, word-image, onset-flip-box) not found. Check HTML.");
            return;
        }

        try {
            const response = await fetch("word-families.json");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();

            this.processData(data); // Process data and set initial state

            // 🛑 CRITICAL CHECK: Ensure we actually have data to work with
            if (this.wordFamilyKeys.length === 0) {
                 this.onsetText.textContent = "Error: No words loaded.";
                 return;
            }

            this.loadInitialWord();
            this.preloadNextImages(5); // Start preloading the next 5 words

            this.setupDropdown();

            // Set up the main click handler once and use 'bind' to preserve 'this'
            this.onsetBox.onclick = this.flipWord.bind(this);

        } catch (error) {
            console.error("Failed to load or process word families data:", error);
            this.onsetText.textContent = "Error Loading Data";
        }
    }

    // --- Data Processing and State Helpers ---

    processData(data) {
        this.wordFamilies = data;
        this.wordFamilyKeys = Object.keys(data);
        
        // 🔥 OPTIMIZATION: Pre-calculate and store the RIME (suffix) for efficiency.
        // This avoids repeated string replacement during runtime.
        for (const key in this.wordFamilies) {
            // Check if the family array exists before adding the rime property
            if (Array.isArray(this.wordFamilies[key])) {
                this.wordFamilies[key].rime = key.replace(/-/g, "");
            }
        }
    }

    getCurrentWordData() {
        const familyKey = this.wordFamilyKeys[this.currentFamilyIndex];
        const wordFamily = this.wordFamilies[familyKey];
        
        // 🛑 CRITICAL CHECK: Ensure word exists at the current index
        if (!wordFamily || !wordFamily[this.currentIndex]) {
             console.error(`Invalid index ${this.currentIndex} for family ${familyKey}.`);
             return { onset: "", word: "Error" };
        }
        
        // Use the pre-calculated rime
        const onset = wordFamily[this.currentIndex].onset;
        const rime = wordFamily.rime; 
        
        return {
            onset,
            word: onset + rime
        };
    }

    // --- Core UI and Logic Functions ---
    
    loadInitialWord() {
        const { onset, word } = this.getCurrentWordData();
        
        this.onsetText.textContent = onset;
        
        // The unstable Unsplash URL is kept, but noted as the potential image failure point.
        this.wordImage.src = `https://source.unsplash.com/300x200/?${word}`;
        
        this.speakWord(word);
    }

    flipWord() {
        // Disable click while animating
        this.onsetBox.onclick = null;
        this.onsetBox.classList.add("flipping");

        // 1. Advance the word index
        this.currentIndex++;
        const currentFamilyKey = this.wordFamilyKeys[this.currentFamilyIndex];

        // 2. Check if we reached the end of the current family
        if (this.currentIndex >= this.wordFamilies[currentFamilyKey].length) {
            // 🔥 FIX/CHECK: Correctly move to the next family with wrap-around
            this.currentFamilyIndex = (this.currentFamilyIndex + 1) % this.wordFamilyKeys.length;
            this.currentIndex = 0; // Reset word index for the new family
        }
        
        // 3. Preload the next set of words immediately after state change
        this.preloadNextImages(5); 

        // 4. Update content after 250ms (mid-flip)
        setTimeout(() => {
            this.loadInitialWord(); // Loads new word based on updated indices
        }, 250);

        // 5. Remove animation class and re-enable click after 500ms
        setTimeout(() => {
            this.onsetBox.classList.remove("flipping");
            this.onsetBox.onclick = this.flipWord.bind(this);
        }, 500);
    }

    speakWord(word) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.lang = "en-US"; // Language constant
        speechSynthesis.speak(utterance);
    }
    
    // --- Optimization: Image Preloading ---

    preloadNextImages(count = 5) {
        let familyIndex = this.currentFamilyIndex;
        let wordIndex = this.currentIndex;
        
        for (let i = 0; i < count; i++) {
            const familyKey = this.wordFamilyKeys[familyIndex];
            const familyWords = this.wordFamilies[familyKey];
            
            if (wordIndex < familyWords.length) {
                // Construct the word for preloading
                const onset = familyWords[wordIndex].onset;
                const rime = this.wordFamilies[familyKey].rime; 
                const word = onset + rime;
                
                // Trigger image load (browser caches this image)
                const img = new Image();
                img.src = `https://source.unsplash.com/300x200/?${word}`;
                
                // Move to the next word
                wordIndex++;
                
            } else {
                // Move to the next family (with wrap-around)
                familyIndex = (familyIndex + 1) % this.wordFamilyKeys.length;
                wordIndex = 0;
                
                // Stop preloading if we loop back and are at the current word
                if (familyIndex === this.currentFamilyIndex && wordIndex === this.currentIndex) break;
            }
        }
    }

    // --- Optional Dropdown for Navigation ---
    
    setupDropdown() {
        if (!this.selector) return;

        this.wordFamilyKeys.forEach(key => {
            const option = document.createElement("option");
            option.value = key;
            option.textContent = key;
            this.selector.appendChild(option);
        });

        // Use arrow function to maintain 'this' context
        this.selector.addEventListener("change", () => {
            this.currentFamilyIndex = this.wordFamilyKeys.indexOf(this.selector.value);
            this.currentIndex = 0; // Always reset to the first word
            
            this.loadInitialWord();
            this.preloadNextImages(5);
        });
    }
}

// 🚀 Start the application once the entire DOM structure is loaded
document.addEventListener('DOMContentLoaded', () => {
    new WordFamilyApp();
});
