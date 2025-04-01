// music.js - Background Music Player
// This script will play audio files from a folder in sequence

// Configuration
const config = {
    audioFolder: 'audio/', // Path to your audio folder
    tracks: [
        'hehe.mp3',
        'ilu.mp3',
        'nirju.mp3'
        // Add more tracks as needed
    ],
    autoplay: true,     // Start playing automatically
    loop: true,         // Loop through playlist when finished
    shuffle: false,     // Play tracks in random order
    volume: 0.5,        // Default volume (0.0 to 1.0)
    fadeTime: 0      // Fade in/out time in milliseconds
};

// Create audio player
class MusicPlayer {
    constructor(config) {
        this.config = config;
        this.currentTrackIndex = 0;
        this.isPlaying = false;
        this.audio = new Audio();
        this.audio.volume = this.config.volume;
        
        // Set up event listeners
        this.audio.addEventListener('ended', () => this.playNext());
        this.audio.addEventListener('error', (e) => this.handleError(e));
        
        // Initialize
        if (this.config.shuffle) {
            this.shufflePlaylist();
        }
        
        if (this.config.autoplay) {
            // Use timeout to give page time to load
            setTimeout(() => this.play(), 1000);
        }
        
        // Add keyboard controls (hidden feature)
        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }
    
    play() {
        if (!this.config.tracks.length) {
            console.error('No tracks available in playlist');
            return;
        }
        
        const track = this.config.tracks[this.currentTrackIndex];
        this.audio.src = this.config.audioFolder + track;
        
        // Fade in
        this.audio.volume = 0;
        this.audio.play()
            .then(() => {
                this.fadeIn();
                this.isPlaying = true;
                console.log(`Now playing: ${track}`);
            })
            .catch(error => {
                console.error('Playback failed:', error);
            });
    }
    
    stop() {
        this.fadeOut().then(() => {
            this.audio.pause();
            this.isPlaying = false;
        });
    }
    
    playNext() {
        this.fadeOut().then(() => {
            this.currentTrackIndex++;
            
            // Loop back to beginning if needed
            if (this.currentTrackIndex >= this.config.tracks.length) {
                if (this.config.loop) {
                    this.currentTrackIndex = 0;
                } else {
                    this.isPlaying = false;
                    return;
                }
            }
            
            this.play();
        });
    }
    
    playPrevious() {
        this.fadeOut().then(() => {
            this.currentTrackIndex--;
            
            // Loop to end if needed
            if (this.currentTrackIndex < 0) {
                this.currentTrackIndex = this.config.tracks.length - 1;
            }
            
            this.play();
        });
    }
    
    fadeIn() {
        const fadeInterval = 50;
        const steps = this.config.fadeTime / fadeInterval;
        const volumeIncrement = this.config.volume / steps;
        let currentStep = 0;
        
        const fade = setInterval(() => {
            currentStep++;
            const newVolume = Math.min(volumeIncrement * currentStep, this.config.volume);
            this.audio.volume = newVolume;
            
            if (currentStep >= steps) {
                clearInterval(fade);
            }
        }, fadeInterval);
    }
    
    fadeOut() {
        return new Promise(resolve => {
            const fadeInterval = 50;
            const steps = this.config.fadeTime / fadeInterval;
            const volumeDecrement = this.config.volume / steps;
            let currentStep = 0;
            const startVolume = this.audio.volume;
            
            const fade = setInterval(() => {
                currentStep++;
                const newVolume = Math.max(startVolume - (volumeDecrement * currentStep), 0);
                this.audio.volume = newVolume;
                
                if (currentStep >= steps) {
                    clearInterval(fade);
                    resolve();
                }
            }, fadeInterval);
        });
    }
    
    togglePlayPause() {
        if (this.isPlaying) {
            this.stop();
        } else {
            this.play();
        }
    }
    
    setVolume(volume) {
        this.config.volume = Math.max(0, Math.min(1, volume));
        this.audio.volume = this.config.volume;
    }
    
    shufflePlaylist() {
        for (let i = this.config.tracks.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.config.tracks[i], this.config.tracks[j]] = [this.config.tracks[j], this.config.tracks[i]];
        }
        this.currentTrackIndex = 0;
    }
    
    handleError(error) {
        console.error('Audio playback error:', error);
        this.playNext(); // Skip to next track on error
    }
    
    handleKeyPress(event) {
        // Hidden keyboard controls
        if (event.ctrlKey && event.altKey) {
            switch(event.key) {
                case 'p':
                    this.togglePlayPause();
                    break;
                case 'n':
                    this.playNext();
                    break;
                case 'b':
                    this.playPrevious();
                    break;
                case 'u':
                    this.setVolume(this.config.volume + 0.1);
                    break;
                case 'd':
                    this.setVolume(this.config.volume - 0.1);
                    break;
                case 's':
                    this.shufflePlaylist();
                    this.play();
                    break;
            }
        }
    }
}

// Initialize the player
const musicPlayer = new MusicPlayer(config);

// Export for potential access from other scripts
window.musicPlayer = musicPlayer;