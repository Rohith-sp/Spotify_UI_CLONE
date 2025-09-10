# Spotify UI Clone

A responsive web-based clone of the Spotify user interface with basic music playback functionality. This project is built using vanilla JavaScript, HTML, and CSS.

![Spotify Clone Screenshot](images/music.svg)

## Features

### Working Features

- **Responsive UI**: Adapts to different screen sizes with a mobile-friendly sidebar
- **Music Playback**: Play, pause, and control music from the library
- **Playlist Display**: View and select from available playlists
- **Seekbar Functionality**: Skip to different parts of a song using the seekbar
- **Album Art Support**: Displays album artwork from various image formats (PNG, JPEG, SVG)
- **Previous/Next Controls**: Navigate between songs in a playlist

### Limitations

- **Local Files Only**: This is a frontend-only application that works with local music files
- **No Authentication**: Login/signup buttons are for UI demonstration only
- **No Search Functionality**: Search bar is non-functional (UI only)
- **No Streaming**: Cannot stream music from actual Spotify servers

## Deployment

This project is ready to be deployed on Vercel. Follow these steps to deploy:

1. Fork or clone this repository
2. Sign up for a [Vercel account](https://vercel.com/signup) if you don't have one
3. Import your repository in the Vercel dashboard
4. Deploy with default settings (no environment variables needed)

## Local Development

To run this project locally:

1. Clone the repository
2. Serve the files using a local server. For example:
   - Using Python: `python -m http.server`
   - Using Node.js: Install `http-server` with `npm install -g http-server` and run `http-server`
3. Open your browser and navigate to `http://localhost:8000` (or whatever port your server uses)

## Project Structure

```
├── Songs/                # Music files and album information
│   ├── 1/                # Playlist folder
│   │   ├── *.mp3         # Music files
│   │   ├── *.png/jpg     # Album artwork
│   │   └── info.json     # Playlist metadata
│   └── .../              # Other playlist folders
├── images/               # UI icons and images
├── style/                # CSS files
│   ├── style.css         # Main styles
│   └── utility.css       # Utility classes
├── index.html            # Main HTML file
├── script.js             # JavaScript functionality
├── vercel.json           # Vercel deployment configuration
└── README.md             # Project documentation
```

## Adding Your Own Music

To add your own music to the clone:

1. Create a new folder in the `Songs` directory (e.g., `Songs/my-playlist`)
2. Add your MP3 files to this folder
3. Create an `info.json` file with the following structure:
   ```json
   {
     "title": "My Playlist",
     "description": "A collection of my favorite songs",
     "image": "cover.jpg"
   }
   ```
4. Add a cover image (JPG, PNG, or SVG) to the folder

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- SVG for icons and some album art

## Credits

This project is for educational purposes only and is not affiliated with Spotify. All trademarks and copyrights belong to their respective owners.

## License

MIT License