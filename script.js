class WordFamilyApp {
    constructor() {
        // --- State Variables (Encapsulated) ---
        this.wordFamilies = {};
        this.wordFamilyKeys = [];
        this.currentFamilyIndex = 0;
        this.currentIndex = 0;
        
        // --- DOM Elements ---
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
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            this.processData(data);
            
            this.loadInitialWord();
            this.preloadNextImages(5);
            this.setupDropdown();

            // Set up the main click handler once
            this.onsetBox.onclick = this.flipWord.bind(this);

        } catch (error) {
            console.error("Failed to load or process word families data:", error);
            // Display error to user (e.g., this.onsetText.textContent = "Error Loading Data")
        }
    }

    // --- Data Processing and State Setup ---

    processData(data) {
        this.wordFamilies = data;
        this.wordFamilyKeys = Object.keys(data);
        
        if (this.wordFamilyKeys.length === 0) {
            console.error("Data loaded but no word families found.");
            return;
        }

        // 🔥 OPTIMIZATION: Pre-calculate and store the RIME (suffix) for efficiency
        for (const key in this.wordFamilies) {
            this.wordFamilies[key].rime = key.replace(/-/g, "");
        }
    }

    getCurrentWordData() {
        const familyKey = this.wordFamilyKeys[this.currentFamilyIndex];
        const wordFamily = this.wordFamilies[familyKey];
        
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
        this.wordImage.src = `https://source.unsplash.com/300x200/?${word}`;
        this.speakWord(word);
    }

    flipWord() {
        // Prevent rapid double-clicks while animating
        this.onsetBox.onclick = null;
        this.onsetBox.classList.add("flipping");

        // 1. Advance the index
        this.currentIndex++;
        const currentFamilyKey = this.wordFamilyKeys[this.currentFamilyIndex];

        // 2. Check if we need to switch family
        if (this.currentIndex >= this.wordFamilies[currentFamilyKey].length) {
            this.currentFamilyIndex = (this.currentFamilyIndex + 1) % this.wordFamilyKeys.length;
            this.currentIndex = 0;
        }

        // 3. Preload the next words immediately
        this.preloadNextImages(5); 

        // 4. Update content after half the animation time (250ms)
        setTimeout(() => {
            this.loadInitialWord(); // Loads new word based on updated indices
        }, 250);

        // 5. Remove animation class and re-enable click after animation is complete (500ms)
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
    
    // --- Optimization: Preloading ---

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
                
                // Trigger image load (cached by the browser)
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

    // --- Optional Dropdown ---
    
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

// Instantiate the application when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new WordFamilyApp();
});
