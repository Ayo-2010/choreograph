# Choreograph

A keyframe animation studio with a draggable timeline, easing curves, a live preview and copyable CSS. Built with plain HTML, CSS and JavaScript.

**Live demo:** https://ayo-2010.github.io/choreograph/

## Features

- Five pose tracks: X, Y, scale, rotate and opacity
- Add, select, drag and delete keyframes on the timeline
- Pose inspector with sliders for every track and per-keyframe easing
- Seven easing presets with a live cubic-bezier curve preview
- Play, pause, restart and scrub the sequence
- Adjust shape, size, colour and loop behaviour
- Seven animation presets, including fade, slide, rotate and orbit
- Generated CSS is updated live and can be copied or downloaded
- Responsive layout down to 390px, reduced motion support and a global `[hidden]` rule

## Running it

Open `index.html` in a browser. There is no build step and no dependencies to install.

## Files

```
index.html
styles.css
app.js
```

## Tech

Plain HTML, CSS and JavaScript with SVG for the easing curve.
