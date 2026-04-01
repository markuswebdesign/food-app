# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: PROJ-3-kalorie-defizit-dashboard.spec.ts >> PROJ-3: Kalorie-Defizit Dashboard >> AC: Wochensumme zeigt Defizit oder Überschuss Text
- Location: tests/PROJ-3-kalorie-defizit-dashboard.spec.ts:49:7

# Error details

```
Error: browserType.launch: Target page, context or browser has been closed
Browser logs:

<launching> /Users/markuswestenhuber/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-x64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/var/folders/jc/tpn1mzxj3mz_s6yqqmdszdqh0000gn/T/playwright_chromiumdev_profile-qrQGit --remote-debugging-pipe --no-startup-window
<launched> pid=46324
[pid=46324][err] dyld: Symbol not found: _OBJC_CLASS_$_CATapDescription
[pid=46324][err]   Referenced from: /Users/markuswestenhuber/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-x64/chrome-headless-shell (which was built for Mac OS X 12.0)
[pid=46324][err]   Expected in: /System/Library/Frameworks/CoreAudio.framework/Versions/A/CoreAudio
[pid=46324][err] 
Call log:
  - <launching> /Users/markuswestenhuber/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-x64/chrome-headless-shell --disable-field-trial-config --disable-background-networking --disable-background-timer-throttling --disable-backgrounding-occluded-windows --disable-back-forward-cache --disable-breakpad --disable-client-side-phishing-detection --disable-component-extensions-with-background-pages --disable-component-update --no-default-browser-check --disable-default-apps --disable-dev-shm-usage --disable-extensions --disable-features=AvoidUnnecessaryBeforeUnloadCheckSync,BoundaryEventDispatchTracksNodeRemoval,DestroyProfileOnBrowserClose,DialMediaRouteProvider,GlobalMediaControls,HttpsUpgrades,LensOverlay,MediaRouter,PaintHolding,ThirdPartyStoragePartitioning,Translate,AutoDeElevate,RenderDocument,OptimizationHints --enable-features=CDPScreenshotNewSurface --allow-pre-commit-input --disable-hang-monitor --disable-ipc-flooding-protection --disable-popup-blocking --disable-prompt-on-repost --disable-renderer-backgrounding --force-color-profile=srgb --metrics-recording-only --no-first-run --password-store=basic --use-mock-keychain --no-service-autorun --export-tagged-pdf --disable-search-engine-choice-screen --unsafely-disable-devtools-self-xss-warnings --edge-skip-compat-layer-relaunch --enable-automation --disable-infobars --disable-search-engine-choice-screen --disable-sync --enable-unsafe-swiftshader --headless --hide-scrollbars --mute-audio --blink-settings=primaryHoverType=2,availableHoverTypes=2,primaryPointerType=4,availablePointerTypes=4 --no-sandbox --user-data-dir=/var/folders/jc/tpn1mzxj3mz_s6yqqmdszdqh0000gn/T/playwright_chromiumdev_profile-qrQGit --remote-debugging-pipe --no-startup-window
  - <launched> pid=46324
  - [pid=46324][err] dyld: Symbol not found: _OBJC_CLASS_$_CATapDescription
  - [pid=46324][err]   Referenced from: /Users/markuswestenhuber/Library/Caches/ms-playwright/chromium_headless_shell-1217/chrome-headless-shell-mac-x64/chrome-headless-shell (which was built for Mac OS X 12.0)
  - [pid=46324][err]   Expected in: /System/Library/Frameworks/CoreAudio.framework/Versions/A/CoreAudio
  - [pid=46324][err]
  - [pid=46324] <gracefully close start>
  - [pid=46324] <kill>
  - [pid=46324] <will force kill>
  - [pid=46324] exception while trying to kill process: Error: kill EPERM
  - [pid=46324] <process did exit: exitCode=null, signal=SIGABRT>
  - [pid=46324] starting temporary directories cleanup
  - [pid=46324] finished temporary directories cleanup
  - [pid=46324] <gracefully close end>

```