let currentAudio = null;
let currentSong = null;
let currentPlayButton = null;
let currentFolder = "Songs"; // default folder
let currentVolume = 0.8; // Initial volume set to 80%

// Get the main playbar button once
const playBarBtn = document.getElementById("play");
const seekbar = document.querySelector(".seekbar");
const circle = document.querySelector(".circle");

// Helper function to format time
const formatTime = (seconds) => {
    if (isNaN(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const updateSeekbar = () => {
    if (!currentAudio) return;
    const progressPercent = (currentAudio.currentTime / currentAudio.duration) * 100 || 0;
    circle.style.left = progressPercent + "%";

    seekbar.style.background = `linear-gradient(to right,
        limegreen 0%, 
        limegreen ${progressPercent}%, 
        #3a3a3a ${progressPercent}%, 
        #3a3a3a 100%)`;
};

// Reset all play buttons in the sidebar to play.svg
const resetAllSidebarIcons = () => {
    document.querySelectorAll(".songList ul li .playnow img").forEach(img => {
        img.src = "images/play.svg";
    });
};

const playmusic = (track, buttonImg, pause = false) => {
    if (currentSong === track && currentAudio) {
        if (currentAudio.paused) {
            currentAudio.play();
        } else {
            currentAudio.pause();
        }
        return;
    }

    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
    }
    resetAllSidebarIcons();

    // Extract folder number from the path
    const folderNum = currentFolder.split('/').pop();
    // Construct the correct audio path
    currentAudio = new Audio(`./Songs/${folderNum}/${track}.mp3`);
    // Set initial volume when creating new audio element
    currentAudio.volume = currentVolume;
    currentAudio.muted = false;
    currentSong = track;
    currentPlayButton = buttonImg;

    if (pause) {
        buttonImg.src = "images/play.svg";
        playBarBtn.src = "images/play.svg";
    } else {
        buttonImg.src = "images/pause.svg";
        playBarBtn.src = "images/pause.svg";
    }

    currentAudio.addEventListener("play", () => {
        resetAllSidebarIcons();
        if (currentPlayButton) currentPlayButton.src = "images/pause.svg";
        playBarBtn.src = "images/pause.svg";
    });

    currentAudio.addEventListener("pause", () => {
        if (currentPlayButton) currentPlayButton.src = "images/play.svg";
        playBarBtn.src = "images/play.svg";
    });

    if (!pause) {
        currentAudio.play();
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track);
    document.querySelector(".songtime").innerHTML = "0:00/0:00";

    currentAudio.addEventListener("timeupdate", () => {
        updateSeekbar();
        const current = formatTime(currentAudio.currentTime);
        const duration = formatTime(currentAudio.duration || 0);
        document.querySelector(".songtime").innerHTML = `${current}/${duration}`;
    });

    currentAudio.addEventListener("loadedmetadata", () => {
        const duration = formatTime(currentAudio.duration || 0);
        document.querySelector(".songtime").innerHTML = `0:00/${duration}`;
    });

    currentAudio.addEventListener("ended", () => {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        if (currentPlayButton) currentPlayButton.src = "images/play.svg";
        playBarBtn.src = "images/play.svg";
        document.querySelector(".songtime").innerHTML = "0:00/0:00";
        seekbar.style.background = "#3a3a3a";
        circle.style.left = "0%";
        currentAudio = null;
    });
};

async function getSongs(folder = "Songs/1") {
    try {
        currentFolder = folder;
        
        // Extract folder number from the path
        const folderNum = folder.split('/').pop();
        
        // Try to fetch from info.json first
        try {
            const response = await fetch(`./Songs/${folderNum}/info.json`);
            const data = await response.json();
            if (data && data.songs && Array.isArray(data.songs)) {
                console.log(`Loaded songs from info.json for folder ${folderNum}:`, data.songs);
                return data.songs;
            }
        } catch (e) {
            console.warn(`Could not load songs from info.json for folder ${folderNum}, falling back to hardcoded list`, e);
        }
        
        // Fallback to hardcoded song lists
        const songMap = {
            '1': ['Aavan Javan', 'Janaab e Aali'],
            '2': ['Manwa Laage', 'Tere Liye'],
            '3': ['Maiyya Mainu']
        };
        
        const songs = songMap[folderNum] || [];
        console.log(`Using hardcoded songs for folder ${folderNum}:`, songs);
        return songs;
    } catch (error) {
        console.error("Error fetching songs:", error);
        return [];
    }
}

// Renders song list in sidebar
function renderSongList(songs) {
    let songUL = document.querySelector(".songList ul");
    songUL.innerHTML = "";

    for (const song of songs) {
        let li = document.createElement("li");
        li.innerHTML = `
            <img class="invert" src="images/music.svg" alt="Music">
            <div class="info">
                <div>${song}</div>
                <div>Rohith</div>
            </div>
            <div class="playnow">
                <span>Play Now</span>
                <img src="images/play.svg" alt="Play">
            </div>
        `;
        let playBtn = li.querySelector(".playnow img");
        li.querySelector(".playnow").addEventListener("click", () => {
            playmusic(song, playBtn);
        });
        songUL.appendChild(li);
    }
}

function setupMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const sidebar = document.querySelector('.left');
    const closeBtn = document.querySelector('.close img');

    hamburger.addEventListener('click', () => {
        sidebar.style.left = '0';
    });

    closeBtn.addEventListener('click', () => {
        sidebar.style.left = '-100%';
    });

    document.addEventListener('click', (e) => {
        if (!sidebar.contains(e.target) && e.target !== hamburger) {
            sidebar.style.left = '-100%';
        }
    });
}

async function displayAlbums() {
    const cardContainer = document.querySelector(".cardcontainer");
    
    // Hardcoded list of folders since directory listing isn't supported in production
    const folders = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
    
    for (let folder of folders) {
        try {
            let metaRes = await fetch(`./Songs/${folder}/info.json`);
            let meta = await metaRes.json();
            
            // Handle image path - support both direct paths and local image files (PNG or JPEG)
            let imagePath = meta.image;
            if (imagePath && !imagePath.startsWith('http') && !imagePath.startsWith('/')) {
                // If it's a local file without a full path, assume it's in the album folder
                imagePath = `./Songs/${folder}/${imagePath}`;
            } else if (!imagePath) {
                // If no image is specified, check for common image formats in the folder
                const possibleImages = ['cover.jpg', 'cover.png', 'album.jpg', 'album.png', '1.jpg', '1.png'];
                
                // Try to find the first available image
                for (const img of possibleImages) {
                    try {
                        const testImg = `./Songs/${folder}/${img}`;
                        // We'll set this as the default and let the img tag's error handler deal with it if it doesn't exist
                        imagePath = testImg;
                        break;
                    } catch (err) {
                        console.warn(`Could not find image: ${img} in folder ${folder}`);
                    }
                }
                
                // If no image was found, use a placeholder
                if (!imagePath) {
                    imagePath = 'images/music.svg'; // Default placeholder
                }
            }

            cardContainer.innerHTML += `
                <div data-folder="${folder}" class="card border">
                    <div class="play">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 60 60" fill="none">
                            <circle cx="30" cy="30" r="30" fill="#1DB954" />
                            <path d="M24 20L42 30L24 40V20Z" fill="black" />
                        </svg>
                    </div>
                    <img src="${imagePath}" alt="Album cover" onerror="this.src='images/music.svg'; this.onerror=null;">
                    <h2>${meta.title}</h2>
                    <p>${meta.description}</p>
                </div>
            `;
        } catch (err) {
            console.warn(`No info.json for folder ${folder}`);
        }
    }

    // attach listeners AFTER rendering
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            const folderPath = `Songs/${card.dataset.folder}`;
            console.log(`Card clicked, loading songs from: ${folderPath}`);
            // Update the global playlist songs
            currentPlaylistSongs = await getSongs(folderPath);
            renderSongList(currentPlaylistSongs);
            if (currentPlaylistSongs.length > 0) {
                // Get the first song's play button
                const firstSongPlayBtn = document.querySelector(".songList ul li:first-child .playnow img");
                playmusic(currentPlaylistSongs[0], firstSongPlayBtn || playBarBtn);
            }
        });
    });
}

// Store current playlist songs globally
let currentPlaylistSongs = [];

async function main() {
    setupMobileMenu();

    // Display all albums
    await displayAlbums();

    // Load initial songs
    currentPlaylistSongs = await getSongs("Songs/1");
    playBarBtn.src = "images/play.svg";
    if (currentPlaylistSongs.length > 0) playmusic(currentPlaylistSongs[0], playBarBtn, true);
    renderSongList(currentPlaylistSongs);

    // Playbar toggle
    playBarBtn.addEventListener("click", () => {
        if (!currentAudio && currentSong) {
            playmusic(currentSong, currentPlayButton || playBarBtn, false);
            return;
        }
        if (currentAudio) {
            if (currentAudio.paused) {
                currentAudio.play();
            } else {
                currentAudio.pause();
            }
        }
    });

    // Seekbar
    seekbar.addEventListener("click", (e) => {
        if (!currentAudio) return;
        const rect = seekbar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const width = rect.width;
        const clickPercent = clickX / width;
        currentAudio.currentTime = clickPercent * currentAudio.duration;
        updateSeekbar();
    });

    // Previous & next
    document.getElementById("previous").addEventListener("click", () => {
        if (!currentSong || currentPlaylistSongs.length === 0) return;
        let currentIndex = currentPlaylistSongs.indexOf(currentSong);
        if (currentIndex === -1) currentIndex = 0;
        let previousIndex = (currentIndex - 1 + currentPlaylistSongs.length) % currentPlaylistSongs.length;
        let previousSong = currentPlaylistSongs[previousIndex];
        let playBtn = document.querySelector(`.songList ul li:nth-child(${previousIndex + 1}) .playnow img`);
        playmusic(previousSong, playBtn || playBarBtn);
    });

    document.getElementById("next").addEventListener("click", () => {
        if (!currentSong || currentPlaylistSongs.length === 0) return;
        let currentIndex = currentPlaylistSongs.indexOf(currentSong);
        if (currentIndex === -1) currentIndex = 0;
        let nextIndex = (currentIndex + 1) % currentPlaylistSongs.length;
        let nextSong = currentPlaylistSongs[nextIndex];
        let playBtn = document.querySelector(`.songList ul li:nth-child(${nextIndex + 1}) .playnow img`);
        playmusic(nextSong, playBtn || playBarBtn);
    });

    // Volume control functionality
    const volumeBtn = document.querySelector('.volume img');
    const volumeControl = document.querySelector('.verticalvolumecontrol');
    const volumeContainer = document.querySelector('.volume');
    
    // Update volume display
    const updateVolumeDisplay = () => {
        if (!currentAudio) return;
        
        // Update volume button icon based on mute state
        if (currentAudio.muted) {
            volumeBtn.src = 'images/mute.svg';
        } else {
            volumeBtn.src = 'images/volume.svg';
        }
        
        // Update volume control appearance
        volumeControl.style.background = `linear-gradient(to bottom,
            limegreen 0%, 
            limegreen ${currentVolume * 100}%, 
            #3a3a3a ${currentVolume * 100}%, 
            #3a3a3a 100%)`;
        
        // Update the circle position
        volumeControl.style.setProperty('--circle-position', `${currentVolume * 100}%`);
    };
    
    // Toggle volume control visibility
    const toggleVolumeControl = () => {
        volumeControl.style.display = volumeControl.style.display === 'block' ? 'none' : 'block';
    };
    
    // Volume button click handler (show/hide volume control)
    volumeBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from reaching the container
        toggleVolumeControl();
    });
    
    // Volume container click handler (toggle visibility)
    volumeContainer.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent document click from hiding immediately
        toggleVolumeControl();
    });
    
    // Hide volume control when clicking elsewhere on the document
    document.addEventListener('click', () => {
        volumeControl.style.display = 'none';
    });
    
    // Volume control click handler
    volumeControl.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent hiding when clicking on the control itself
        if (!currentAudio) return;
        
        const rect = volumeControl.getBoundingClientRect();
        const clickY = e.clientY - rect.top;
        const height = rect.height;
        
        // Calculate volume percentage (0 to 100)
        // Fixed: Clicking at the bottom decreases volume, clicking at the top increases volume
        const volumePercent = 1 - (clickY / height);
        
        // Clamp between 0 and 1
        currentVolume = Math.max(0, Math.min(1, volumePercent));
        
        // Set the volume
        currentAudio.volume = currentVolume;
        currentAudio.muted = false; // Unmute if muted
        
        // Update the display
        updateVolumeDisplay();
    });
    
    // Initialize volume control appearance
    updateVolumeDisplay();
}

main();
