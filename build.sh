#!/bin/bash

# Create build directory if it doesn't exist
mkdir -p build/chrome
mkdir -p build/firefox
mkdir -p build/temp/icons

# Generate PNG icons from SVG (requires Inkscape)
echo "Generating icons..."
for size in 16 32 48 128; do
  if command -v inkscape &> /dev/null; then
    inkscape -w $size -h $size src/common/icons/icon.svg -o build/temp/icons/icon-$size.png
  else
    echo "Warning: Inkscape not found. Cannot generate icons."
    echo "Please install Inkscape or manually create PNG icons."
    mkdir -p src/common/icons
    touch src/common/icons/icon-16.png
    touch src/common/icons/icon-32.png
    touch src/common/icons/icon-48.png
    touch src/common/icons/icon-128.png
    break
  fi
done

# Build Chrome extension
echo "Building Chrome extension..."
mkdir -p build/chrome/icons
cp src/chrome/manifest.json build/chrome/
cp src/common/options.html build/chrome/
cp src/common/options.js build/chrome/
cp src/common/background.js build/chrome/
cp build/temp/icons/* build/chrome/icons/ 2>/dev/null || cp src/common/icons/icon-*.png build/chrome/icons/ 2>/dev/null

# Build Firefox extension
echo "Building Firefox extension..."
mkdir -p build/firefox/icons
cp src/firefox/manifest.json build/firefox/
cp src/common/options.html build/firefox/
cp src/common/options.js build/firefox/
cp src/common/background.js build/firefox/
cp build/temp/icons/* build/firefox/icons/ 2>/dev/null || cp src/common/icons/icon-*.png build/firefox/icons/ 2>/dev/null

# Create Firefox XPI package (ZIP file with .xpi extension)
echo "Creating Firefox XPI package..."
cd build/firefox
zip -r ../nutriplan-importer-firefox.xpi *
cd ../..

# Create Chrome ZIP package
echo "Creating Chrome ZIP package..."
cd build/chrome
zip -r ../nutriplan-importer-chrome.zip *
cd ../..

# Clean up temp directory
rm -rf build/temp

echo "Build completed!"
echo "Chrome extension: build/nutriplan-importer-chrome.zip"
echo "Firefox extension: build/nutriplan-importer-firefox.xpi" 