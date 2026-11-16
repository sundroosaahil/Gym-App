# Bodyworks Tracker v1 - step by step

Run every command yourself (PowerShell, Windows). Each step says WHY, so you can fix things
when something differs on your machine. Nothing here was built or tested on Windows, and the
Android build was not run at all: if a step fails, copy the error and ask.

## 0. You need
- Node.js 22 LTS (the web build was tested on 22), Git, a GitHub account, a Vercel account.
- Android Studio (for the APK; it bundles the Java and Android SDK the build needs).

## 1. Where the source lives (already public)
The tracker is the `bodyworks-tracker/` folder inside github.com/sundroosaahil/gym-app. Why it
matters: the AGPL says anyone who gets your app may get its source, and the in-app "Source code"
link and the updater both point at that repo. Run every command below from inside
`bodyworks-tracker/` (clone gym-app first if you have not: `git clone https://github.com/sundroosaahil/gym-app`).
Commit your changes the normal way:

    git add bodyworks-tracker
    git commit -m "Bodyworks Tracker: <what changed>"
    git push

(Renamed the repo? Search the project for `sundroosaahil/gym-app` and change it in
frontend/src/lib/update.js, frontend/src/lib/demo.js and frontend/src/views/Settings.jsx.)

## 2. Add the exercise media (never committed)
Why: the animations belong to Gym visual; you have their and the developer's permission, but the
files stay unmodified, 180 px only, and are not covered by the AGPL. .gitignore keeps them out of git.

    git clone https://github.com/DuarteSantos8/openGym ..\openGym
    node scripts/bodyworks/copy-media.mjs ..\openGym

Then add a line to NOTICE.md under "Bodyworks Tracker fork": that Gym visual and the openGym
developer gave permission, and the month. Keep both emails somewhere safe (not in the repo).

## 3. Install and run the tests
Why: `npm ci` installs the exact locked versions. The test suite is openGym's own (about
3 minutes to many minutes): it tells you whether the rebrand broke anything. Send me failures.

    cd frontend
    npm ci
    npx vitest run

## 4. Build and try the web app
Why: VITE_BODYWORKS=1 selects the no-backend build (empty log, data stays in the browser).
Then stage-media copies the media next to the built app. Preview serves it like a real host.

    $env:VITE_BODYWORKS="1"
    npm run build
    cd ..
    node scripts/catalogue/stage-media.mjs frontend/dist
    cd frontend
    npx vite preview

Open the address it prints. Check: you can build a routine, log a workout, exercise pictures
show, Settings -> Data & backup exports a file, and importing that file restores it.

## 5. Deploy the web app (Vercel)
Why: it is a static site; the app uses hash routes, so no rewrite rules are needed. Deploy the
built folder from your machine, because the media is not in git.

    cd dist
    npx vercel --prod

First run asks you to log in and name the project (use bodyworks-tracker; if you deploy from git instead, set the Vercel root directory to bodyworks-tracker/frontend). If Vercel refuses
the upload (many files, ~220 MB), host the media elsewhere (e.g. a second static project or
GitHub Pages), rebuild with `$env:VITE_IMG_BASE` and `$env:VITE_GIF_BASE` set to its still/ and
clip/ URLs, and skip stage-media.

## 6. Build the Android APK
Why: the same app wrapped by Capacitor. The `build:mobile` script in package.json uses
Linux-style `VAR=1 command`, which PowerShell cannot run, so we run its steps by hand.
Clear the web flag first or the APK would be built in the wrong mode.

    cd frontend
    Remove-Item Env:VITE_BODYWORKS -ErrorAction SilentlyContinue
    $env:VITE_MOBILE="1"
    npx vite build
    cd ..
    node scripts/catalogue/stage-media.mjs frontend/dist
    cd frontend
    npx cap sync android
    node scripts/check-mobile-bundle.mjs
    npx cap open android

In Android Studio: Build -> Generate Signed App Bundle / APK -> APK -> create a NEW keystore.
Back the keystore file and its passwords up (cloud + USB). Every future update must be signed with
the same key, or phones will refuse it. Pick "release". Output: frontend\android\app\release\.

## 7. Publish the APK so the in-app updater works
Why: the app checks this repo's latest GitHub release and verifies the download's SHA-256.
The APK file name must not contain "plus" or "hd" as a separate word.

    cd frontend\android\app\release
    ren app-release.apk bodyworks-tracker-1.0.0.apk
    (Get-FileHash .\bodyworks-tracker-1.0.0.apk -Algorithm SHA256).Hash.ToLower() | Out-File -Encoding ascii bodyworks-tracker-1.0.0.apk.sha256

On GitHub (gym-app repo): Releases -> new release, tag v1.0.0, attach BOTH the .apk and the .apk.sha256.
The updater reads the repo's LATEST release, so do not publish a gym-app release without the tracker APK
after this one, or phones will only be sent to the releases page.
For v1.0.1 later: raise `version` in frontend/package.json and versionName/versionCode in
frontend/android/app/build.gradle, rebuild, tag v1.0.1.

## 8. What to tell members (for the home page download section)
- Android: tap Download, open the file, allow "install from this source" when asked.
- iPhone: open the site in Safari -> Share -> Add to Home Screen.
- Data stays on the phone. Before uninstalling or changing phones: Settings -> Data & backup ->
  export, and import it in the new install.

## 9. Not done yet
- The home page download section (above the map) and the navbar button.
- Known leftovers: some opengym.ch links (routine sharing, NFC tags, print footer, the
  Android privacy link). The Coach, watch and Garmin features are still inside the APK.
