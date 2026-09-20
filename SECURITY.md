# Security & Privacy

YT Handoff is designed so that **you own your own data path end to end** — there is no shared backend run by this project.

- Each user creates their own free Firebase Realtime Database project.
- Data written per share: video ID, title, playlist ID/index, timestamp, and time sent. No account info, no browsing history beyond the single shared video.
- Entries auto-expire (default 6 hours) and are deleted after being opened.
- The database path is protected by a random secret string generated locally — never transmitted anywhere except between your own devices.

## Reporting a vulnerability

If you find a security issue, please open a private report via GitHub's "Report a vulnerability" button under this repo's Security tab, rather than a public issue.