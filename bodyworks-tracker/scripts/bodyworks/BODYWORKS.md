# Bodyworks Tracker (v1)

A free workout tracker for Bodyworks Gym members. It is a modified fork of **openGym**
(https://github.com/DuarteSantos8/openGym) by Duarte Santos, licensed under the GNU AGPL v3
(see LICENSE). This modified source must stay public and keep LICENSE and NOTICE.md.

## What this fork changes
- Bodyworks name, app id (`com.bodyworksgym.tracker`) and in-app wording.
- A no-backend web build (`VITE_BODYWORKS=1`): empty personal log, no demo wording, data stays on the device.
- The in-app APK updater checks THIS repo's releases (`frontend/src/lib/update.js`), not openGym's.
- Donation links to the upstream author removed; credit to openGym kept in Settings.

## Start here
Follow **STEPS.md** (setup, build, deploy and release, one command at a time).

## Exercise media (not in this zip)
The animations and stills belong to Gym visual (gymvisual.com) and are NOT covered by the AGPL.
Copy them yourself, unmodified, from an openGym clone, and keep the notice in NOTICE.md:
    node scripts/bodyworks/copy-media.mjs ..\openGym
