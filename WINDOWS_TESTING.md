# Windows tester instructions

Starflight: Junior Crew runs in a browser. The portable Windows tester package
includes the local server runtime, so players do not install Python, Node or
development tools and do not type terminal commands.

New player? Start with the [spoiler-free Player Guide](PLAYER_GUIDE.md),
[controls reference](docs/CONTROLS.md) and [FAQ](docs/FAQ.md). The [README](README.md)
explains the game and shows current screenshots.

## Get and launch the game

1. Get the private Windows x64 tester ZIP from the project owner. There is no
   public download or website deployment associated with these instructions.
2. Right-click the ZIP and choose **Extract All**. Wait for extraction to finish.
3. Open the extracted **Starflight Junior Crew** folder.
4. Double-click **Launch Starflight Junior Crew.exe**.
5. In the browser, choose **Start New Mission**, **Continue Mission**, or
   **Import Save** for a `.sfsave` backup you already have.

Keep the `game` and `runtime` folders beside the launcher. Do not run the EXE
directly inside the ZIP or double-click the game's `index.html`.

The package targets Windows 10/11 on 64-bit Intel/AMD PCs with Edge or Chrome.
No administrator access or game account is needed. The launcher is locally
built and unsigned; Windows may show an unfamiliar-app notice. It does not
change Windows security settings, browser settings or firewall rules.

Allow about 4 GB free to retain both the ZIP and extracted files. CPU/GPU/RAM
minimums and independent clean-machine acceptance have not been certified;
see [release readiness](docs/RELEASE_READINESS.md).

## Local address and stopping

The fixed tester address is
**http://127.0.0.1:4188/starflight-junior-crew/**. It works on the computer
running the launcher; it is not a link to the developer's computer or a LAN
server. The server listens only on IPv4 loopback and serves only packaged game
files.

A Starflight tester icon stays in the Windows notification area near the clock
(possibly under hidden icons). Double-click it to reopen the game, or
right-click and choose **Exit tester server**. Closing a browser tab alone does
not stop the server. Starting the same package again reuses its running server.

## Saves and updates

- Saves belong to the browser and address. Use the same browser and tester
  address each time. Private browsing or clearing site data can remove saves.
- Use **Export Save** for regular `.sfsave` backups. Use **Import Save** when
  moving from a different browser, device, development server or hosted site.
- Invalid or oversized backups are rejected without replacing a saved slot.
  The current local tester build accepts at most 4 MiB of decoded save JSON.
- Before updating, save and export a backup, then exit the old tray server.
  Extract the new ZIP into a separate folder and launch its EXE. Browser saves
  remain at the fixed address; they are not stored in the extracted game folder.
- Keep only one tester build running. A busy port or different active package
  produces a message; the launcher does not silently change ports or overwrite
  another server's files.

## Audio and quick checks

Click inside the game to enable browser audio. Artwork, fonts, music and sound
effects are local. Recorded crew and alien voices require internet access;
dialogue remains available as text if a recording cannot load.

Useful playtest paths include commissioning and assigning crew, planetary
Sensors/Analysis and maps, Leave Orbit, rover mining, returning to the ship,
docking/undocking and saving/reloading. The concourse astronaut starts dancing
after eight unpaused idle seconds; movement stops the dance.

## Report a problem

Send the project owner:

- The build name from `BUILD-INFO.json` in the extracted folder.
- Your Windows and browser version.
- The steps you took, what you expected, and what happened.
- A screenshot and, when helpful, an exported `.sfsave` backup.

No automatic bug-report or save upload is performed. Share files deliberately
with the project owner.

## Package status

Tester ZIPs are built and validated locally and provided privately. The current
October 29 save-editor rebuild fixes stalls with large save codes and includes
distinct Analysis and Ship status graphics, readable scrolling cards on short
screens, the presentation improvements, labeled
Expedition clock, optimized lossless ship images and hardened server.
The previous-to-current upgrade preserved an existing test browser save at the
same address without re-import. Use the same browser/profile and exit the old
tray server before launching the updated package.

Source synchronization does not upload the ZIP, create a GitHub Release or
deploy a website. Check `BUILD-INFO.json` for the package's exact compiled-build
identity; see the [Windows verification summary](docs/VERIFICATION_2026-10-29-REGRESSION.md) for the
current package hash and actual tests. Keep all bundled third-party notices.

See the [personal-use license](LICENSE.md) and [credits](CREDITS.md).
Public source permits personal play/study and private modifications;
redistribution and commercial reuse require permission. The source repository
does not supply a public tester ZIP download.
