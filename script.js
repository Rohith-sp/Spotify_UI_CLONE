let currentAudio = null;
let currentSong = null;
let currentPlayButton = null;
let currentFolder = "Songs"; // default folder

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

    // Use the correct path case for audio files
    const folderPath = currentFolder.replace('songs', 'Songs');
    currentAudio = new Audio(`./${folderPath}/${track}.mp3`);
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

async function getSongs(folder = "Songs") {
    try {
        currentFolder = folder;
        
        // Try to fetch from info.json first
        try {
            const folderNum = folder.split('/').pop();
            const response = await fetch(`./Songs/${folderNum}/info.json`);
            const data = await response.json();
            if (data && data.songs && Array.isArray(data.songs)) {
                return data.songs;
            }
        } catch (e) {
            console.warn("Could not load songs from info.json, falling back to hardcoded list");
        }
        
        // Fallback to hardcoded song lists
        const songMap = {
            '1': ['Aavan Javan', 'Janaab e Aali'],
            '2': ['Manwa Laage', 'Tere Liye'],
            '3': ['Maiyya Mainu']
        };
        
        return songMap[folder.split('/').pop()] || [];
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
    }

    // attach listeners AFTER rendering
    Array.from(document.getElementsByClassName("card")).forEach(card => {
        card.addEventListener("click", async () => {
            let songs = await getSongs(`Songs/${card.dataset.folder}`);
            renderSongList(songs);
            if (songs.length > 0) {
                playmusic(songs[0], playBarBtn);
            }
        });
    });

async function main() {
    setupMobileMenu();

    // Display all albums
    await displayAlbums();

    let songs = await getSongs("songs/ncs");
    playBarBtn.src = "images/play.svg";
    if (songs.length > 0) playmusic(songs[0], playBarBtn, true);
    renderSongList(songs);

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
        if (!currentSong) return;
        let currentIndex = songs.indexOf(currentSong);
        let previousIndex = (currentIndex - 1 + songs.length) % songs.length;
        let previousSong = songs[previousIndex];
        let playBtn = document.querySelector(`.songList ul li:nth-child(${previousIndex + 1}) .playnow img`);
        playmusic(previousSong, playBtn);
    });

    document.getElementById("next").addEventListener("click", () => {
        if (!currentSong) return;
        let currentIndex = songs.indexOf(currentSong);
        let nextIndex = (currentIndex + 1) % songs.length;
        let nextSong = songs[nextIndex];
        let playBtn = document.querySelector(`.songList ul li:nth-child(${nextIndex + 1}) .playnow img`);
        playmusic(nextSong, playBtn);
    });
}

main();
