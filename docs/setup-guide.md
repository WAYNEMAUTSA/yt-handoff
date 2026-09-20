# Setup Guide

This walks through getting YT Handoff running end to end: the desktop extension, your own free Firebase backend, and the Android phone app.

> Video walkthrough: (coming soon - a full setup video will be linked here)

Total time: about 15 minutes, most of it just clicking through Firebase's website.

---

## What you'll need

- A computer running Chrome, Edge, or Brave (Windows, macOS, or Linux - all identical from here on)
- An Android phone
- A free Google account (for Firebase)

---

## Part 1: Create your Firebase backend

Each user runs their own free Firebase project - this is what quietly connects your phone and computer, and nobody but you has access to it.

1. Go to Firebase Console (console.firebase.google.com) -> Add project -> give it any name -> skip Google Analytics when asked.
2. In the left sidebar: Build -> Realtime Database -> Create Database.
3. Pick any location -> choose Start in locked mode.
4. Go to the Rules tab of your new database and replace the contents with:

```json
   {
     "rules": {
       "nowplaying": {
         "$secret": {
           ".read": true,
           ".write": true
         }
       }
     }
   }
```

   This only opens up the one nowplaying/<your-secret> path - not your whole database. Your "secret" is a long random string the extension generates for you in Part 2, so this stays private as long as you don't share that string.

5. Click Publish.
6. Back on the Data tab, copy the URL shown at the top - it looks like:
   https://your-project-default-rtdb.firebaseio.com
   You'll need this in the next step.

> Good moment to show on video: the Rules tab and pasting in the JSON above - this step trips people up the most.

---

## Part 2: Install the browser extension

1. Download this repository (Code -> Download ZIP, or git clone if you're comfortable with Git) and unzip it somewhere on your computer.
2. Open chrome://extensions in your browser.
3. Turn on Developer mode (top-right toggle).
4. Click Load unpacked -> select the extension folder from the repo.
5. Click the extension's icon in your toolbar -> Settings (or right-click the icon -> Options).
6. Paste in your Firebase Database URL from Part 1.
7. Click Generate random to create your secret code.
8. Leave Expire entries after at 6 hours (or change it - this is how long a shared video stays "waiting" before it's ignored).
9. Click Save, then Test connection - it should show a green checkmark.

A QR code will appear once you've saved - that's what you'll scan from your phone next, so keep this page open or come back to it in Part 3.

> Good moment to show on video: clicking Load unpacked, and the Settings page with the QR code visible.

---

## Part 3: Install the phone app (Android)

1. On your phone, open Chrome and go to:
   https://YOUR-USERNAME.github.io/yt-handoff/
2. Tap the menu (three dots) -> Add to Home screen (or Install app, if offered) -> confirm.
3. Open the app from your home screen.
4. Tap "Scan QR code from desktop", allow camera access, and point it at the QR code from Part 2.
   - If the picture looks warped/fisheye, tap "Switch camera" until it looks normal - it'll remember your choice after that.
5. Once scanned, settings save automatically - no typing needed.

> Good moment to show on video: tapping Add to Home screen, then the QR scan actually connecting.

---

## Part 4: Try it

1. Open the YouTube app on your phone and start playing any video.
2. Tap Share.
3. Make sure the "Start at [time]" option is checked, if you want to resume from where you are rather than the beginning.
4. Tap "Send to Desktop" in the share sheet (you may need to scroll or tap "More").
5. Within a couple of seconds, your computer should show a notification: "Continue watching on this device?"
6. Click it - YouTube opens on your computer at the same spot, with the same playlist queued up if you were in one.

> Good moment to show on video: the whole loop - tapping Share on the phone, then the notification popping up and being clicked on desktop.

---

## Troubleshooting

| Problem | Try this |
|---|---|
| Extension won't load / "Could not load manifest" | Usually a hidden encoding issue if you edited the files yourself. Re-save affected files as UTF-8 without BOM. |
| No notification arrives | Click "Check now" in the extension popup to force an immediate check. Also check Windows Focus Assist isn't blocking notifications. |
| "Test connection" fails | Double check the Database URL ends in firebaseio.com (not firestore.googleapis.com - that's a different Firebase product) and that your Rules were published. |
| QR scan opens the wrong/fisheye camera | Tap "Switch camera" in the scan screen - it remembers your pick after that. |
| Video resumes from 0 instead of your timestamp | Make sure "Start at [time]" was checked in YouTube's share screen before sending. |

---

Still stuck? Open an issue in this repository and describe what happened.