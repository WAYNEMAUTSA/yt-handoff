# YT Handoff

Spotify lets you start a song on your phone and switch to your desktop mid-track without losing your place. YouTube doesn't. YT Handoff brings that same "continue on this device" experience to YouTube.

Share a video from your phone the normal way - it shows up as a notification on your computer. Click it, and it opens right where you left off, playlist and all.

## How it works

1. A small browser extension on your computer watches for updates.
2. A web app on your phone (installed like a normal app, shows up in the Share menu) sends the video, timestamp, and playlist info when you share.
3. The two are connected through a small Firebase Realtime Database project that you own - nothing goes through a third-party server, and entries auto-expire after a few hours so nothing lingers.

## What gets stored

Only: video ID, title, playlist ID/position, timestamp, and when it was shared. Nothing about your identity, and it lives in a database only you control.

## Setup

See docs/setup-guide.md for full step-by-step instructions (Firebase setup, installing the extension, installing the phone app, QR pairing).

Currently supports:
- Desktop: Windows, macOS, Linux (any OS running Chrome, Edge, or Brave)
- Phone: Android (native Share sheet integration). iOS support is planned.

## Project structure

- extension/ - the browser extension
- sender/ - the installable phone web app

## Contributing

Issues and PRs welcome. Please use the issue templates for bug reports and feature requests.

## License

MIT - see LICENSE.