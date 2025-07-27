import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import sharp from "sharp";
import { Leaf } from "lucide-react";
import { mkdir, writeFile } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

// Define icon sizes
const ICON_SIZES = [16, 48, 128];

// Function to render Leaf icon to SVG string
function renderLeafIconToSVG(size) {
  const svgString = renderToStaticMarkup(
    React.createElement(Leaf, {
      width: size,
      height: size,
      color: "#4ade80", // Green color to match the app's theme
    })
  );

  // Add SVG namespace if not present
  if (!svgString.includes("xmlns")) {
    return svgString.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return svgString;
}

// Function to convert SVG to PNG
async function convertSvgToPng(svgString, size) {
  const buffer = Buffer.from(svgString);
  return await sharp(buffer).resize(size, size).png().toBuffer();
}

// Function to save PNG to file
async function savePngToFile(buffer, filename) {
  const distIconsPath = join("dist", "icons");

  // Create dist/icons directory if it doesn't exist
  if (!existsSync(distIconsPath)) {
    await mkdir(distIconsPath, { recursive: true });
  }

  const filePath = join(distIconsPath, filename);
  await writeFile(filePath, buffer);
  console.log(`Generated ${filename}`);
}

// Main function to generate all icons
async function generateIcons() {
  console.log("Generating Lucide leaf icons...");

  try {
    for (const size of ICON_SIZES) {
      // Render icon to SVG
      const svgString = renderLeafIconToSVG(size);

      // Convert SVG to PNG
      const pngBuffer = await convertSvgToPng(svgString, size);

      // Save PNG to file
      const filename = `icon${size}.png`;
      await savePngToFile(pngBuffer, filename);
    }

    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
    process.exit(1);
  }
}

// Run the script
generateIcons();
