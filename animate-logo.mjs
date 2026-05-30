import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const svgRaw = readFileSync(join(__dirname, 'WhatsApp-Image-2026-05-28-at-13.16.35.svg'), 'utf-8')

// Extract all <path d="..."/> elements with their d attribute
const pathRegex = /<path d="([^"]+)"\/>/g
const paths = []
let m
while ((m = pathRegex.exec(svgRaw)) !== null) {
  paths.push(m[1])
}

// Get starting Y coordinate from path (SVG internal coords, y-flipped)
function getStartY(d) {
  const match = d.match(/M\s*([\d.]+)\s+([\d.]+)/)
  return match ? parseFloat(match[2]) : 0
}

// Group paths by y range:
// y_svg > 4300  → symbol (teal)
// y_svg 3500-4300 → "AL FURQAN" text (dark navy)
// y_svg < 2600  → subtitle text (dark navy, lighter)
const symbolPaths = []
const titlePaths = []
const subtitlePaths = []

for (const d of paths) {
  const y = getStartY(d)
  if (y > 4300) symbolPaths.push(d)
  else if (y >= 3500) titlePaths.push(d)
  else if (y < 2600) subtitlePaths.push(d)
}

const toPathEls = (arr, cls) =>
  arr.map(d => `<path d="${d}" class="${cls}"/>`).join('\n    ')

const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<title>Al Furqan — Logo Animation</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    background: #f8f9fa;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    font-family: sans-serif;
  }
  .wrapper {
    background: white;
    border-radius: 24px;
    padding: 48px;
    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  }
  svg {
    width: 360px;
    height: 360px;
    display: block;
    overflow: visible;
  }

  /* Always visible — animation is enhancement only */
  .symbol-group   { fill: #1ABC9C; opacity: 1; transform-origin: 540px 385px; }
  .title-group    { fill: #1a1a4e; opacity: 1; }
  .subtitle-group { fill: #555577; opacity: 1; }

  @media (prefers-reduced-motion: no-preference) {
    .symbol-group {
      animation: symbolIn 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards,
                 pulse 3s ease-in-out 2.5s infinite;
      opacity: 0;
    }
    .title-group {
      animation: fadeUp 0.7s ease-out 0.75s forwards;
      opacity: 0;
    }
    .subtitle-group {
      animation: fadeUp 0.7s ease-out 1.05s forwards;
      opacity: 0;
    }
  }

  @keyframes symbolIn {
    0%   { opacity: 0; transform: rotate(-15deg) scale(0.5); }
    100% { opacity: 1; transform: rotate(0deg)   scale(1);   }
  }
  @keyframes fadeUp {
    0%   { opacity: 0; transform: translateY(16px); }
    100% { opacity: 1; transform: translateY(0);    }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.025); }
  }
</style>
</head>
<body>
<div class="wrapper">
  <svg viewBox="0 0 1080 1080" xmlns="http://www.w3.org/2000/svg">
    <g transform="translate(0,1080) scale(0.1,-0.1)">

      <g class="symbol-group">
        ${symbolPaths.map(d => `<path d="${d}"/>`).join('\n        ')}
      </g>

      <g class="title-group">
        ${titlePaths.map(d => `<path d="${d}"/>`).join('\n        ')}
      </g>

      <g class="subtitle-group">
        ${subtitlePaths.map(d => `<path d="${d}"/>`).join('\n        ')}
      </g>

    </g>
  </svg>
</div>
</body>
</html>`

const outPath = join(__dirname, 'alfurqan-animated.html')
writeFileSync(outPath, html)
console.log('Done! Saved to:', outPath)
console.log(`Symbol paths: ${symbolPaths.length}, Title paths: ${titlePaths.length}, Subtitle paths: ${subtitlePaths.length}`)
