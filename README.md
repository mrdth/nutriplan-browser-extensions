# NutriPlan Browser Extensions

This repository contains browser extensions for Chrome and Firefox as well as a bookmarklet alternative that allow users to easily import recipes from any webpage to their [NutriPlan](https://github.com/mrdth/nutriplan) application.

## Features

- Adds a toolbar button to your browser (extensions) or a bookmark (bookmarklet)
- Easy one-click recipe import
- Securely stores your API token and application URL
- Works with any NutriPlan instance

## Options

This repository provides two ways to import recipes:

1. **Browser Extensions** - More robust solution for Chrome and Firefox
2. **Bookmarklet** - Simple alternative that works in any modern browser

## Browser Extensions

### Prerequisites

- A NutriPlan instance with the Recipe Import API enabled
- An API token from your NutriPlan account

### Building the Extensions

#### Requirements

- Bash shell
- Inkscape (optional, for icon generation)
- zip command

#### Build Process

1. Clone this repository
2. Run the build script:

```bash
./build.sh
```

This will create two packages in the `build` directory:
- `nutriplan-importer-chrome.zip` - Chrome extension
- `nutriplan-importer-firefox.xpi` - Firefox extension

### Installation

#### Chrome

1. Open Chrome and navigate to `chrome://extensions/`
2. Enable "Developer Mode" using the toggle in the top-right corner
3. Click "Load unpacked" and select the `build/chrome` directory

#### Firefox

1. Open Firefox and navigate to `about:addons`
2. Click the gear icon and select "Install Add-on From File..."
3. Select the `build/nutriplan-importer-firefox.xpi` file

### Configuration

After installing the extension, you'll need to configure it with your API token and application URL:

1. Click on the extension icon in your browser toolbar
2. If not redirected automatically, right-click the extension icon and select "Options" or "Preferences"
3. Enter your API token (from your NutriPlan account)
4. Enter your NutriPlan application URL (e.g., `https://nutriplan.example.com`)
5. Click "Save Settings"

## Bookmarklet Alternative

For browsers that don't support extensions or for users who prefer a lighter solution, a bookmarklet is available.

### Installation

1. Visit the bookmarklet page in your browser: [bookmarklet/index.html](bookmarklet/index.html)
2. Drag the "Import to NutriPlan" button to your bookmarks bar
3. Alternatively, create a new bookmark and paste the code from [bookmarklet/nutriplan-import.min.js](bookmarklet/nutriplan-import.min.js) as the URL

### Configuration

The first time you use the bookmarklet, you'll be prompted to enter:
- Your API token
- Your NutriPlan application URL

These settings are saved in your browser's localStorage.

## Usage

### Using the Extensions

1. Navigate to any recipe webpage
2. Click the NutriPlan icon in your browser toolbar
3. The recipe will be sent to your NutriPlan application for processing
4. You'll see a notification when the import process has started
5. Check your NutriPlan application for the imported recipe

### Using the Bookmarklet

1. Navigate to any recipe webpage
2. Click the "Import to NutriPlan" bookmark in your bookmarks bar
3. If not yet configured, enter your API token and application URL
4. The recipe will be sent to your NutriPlan application
5. You'll see a notification when the import process has started

## Troubleshooting

- **Error: "Configuration Required"** - You need to configure your API token and application URL in the settings
- **Error: "Authentication Error"** - Your API token is invalid or has expired
- **Error: "Connection Error"** - The application URL is incorrect or your NutriPlan instance is not accessible
- **Error: "Validation Error"** - The current page doesn't appear to be a recipe page that NutriPlan can process

## Development

The project is built using standard web technologies:

- JavaScript (ES6+)
- HTML5
- CSS3

The project structure is organized as follows:

```
src/
├── common/         # Shared files between Chrome and Firefox
│   ├── icons/      # Extension icons
│   ├── options.html
│   ├── options.js
│   └── background.js
├── chrome/         # Chrome-specific files
│   └── manifest.json
└── firefox/        # Firefox-specific files
    └── manifest.json
    
bookmarklet/
├── index.html      # Bookmarklet installation page
├── nutriplan-import.js    # Full bookmarklet source
└── nutriplan-import.min.js # Minified bookmarklet for use
``` 