# Player FAQ

## Where do I download it?

Ask the maintainer for the private Windows x64 tester ZIP. There is no public
download or hosted release. GitHub's source ZIP is not the portable tester and
does not include its ready-to-run EXE.

## Do I need development tools or administrator access?

Not for the Windows tester. Extract everything and double-click the launcher.
Developers need Node.js to build source. Windows may flag the unsigned launcher
as unfamiliar; do not disable protections to run a file you cannot verify with
the maintainer. See [Windows setup](../WINDOWS_TESTING.md).

## Why won't index.html or an EXE inside the ZIP work?

Browser modules need the local HTTP server. Extract all files and use the EXE
beside game and runtime, or follow [source setup](DEVELOPMENT.md).

## Why is the port busy or another build reported?

Exit the old tester through its tray icon. The fixed port preserves save origins;
the launcher will not choose another port silently or terminate another app.
Launching the same package twice reuses its server.

## Can I keep my existing mission?

Yes, supported saves remain compatible. Use the same browser/address or import
an exported .sfsave. Existing explicit portrait identities remain stable.
Rescan worlds for fresh readings/coverage. Back up before updating.

## Where did my save go?

Browser profile and site address, including port, determine storage. Developer
5173, preview 4173 and tester 4188 use separate saves. Private browsing or clearing
site data can remove them. Import a backup into the browser/address you intend to use.

## My import was rejected. Should I delete my old save?

No. Preserve the backup and existing slot. Invalid/oversized imports are rejected
rather than truncated; decoded save JSON is limited to 4 MiB. Game-exported
backups are the intended format. Report the error and file size; share the backup
only deliberately if the maintainer needs it.

## Why is there no audio or voice?

Click inside the game. Check pause-menu volumes/banter, browser tab mute and
Windows output. Music/effects are local; recordings need internet. Text remains
when audio cannot load. Not every dynamic system message is voiced.

## Why is launch denied?

Read the bay warning: name the ship, fill six living assigned posts, install an
engine, carry fuel and acknowledge Operations evaluations. Fresh missions already
include Class 1 engines and starter fuel.

## Why is a button greyed out?

A target may be out of range, equipment absent/inoperative, resources insufficient
or a task already running. Read the nearby explanation rather than repeatedly clicking.

## Why are scans uncertain or maps empty?

Scan, wait, then analyze. Science skill and sensor condition affect information.
Rescan before another analysis. Unknown/unexplored is not necessarily empty or
safe, and special discoveries are not all revealed from orbit.

## What are map counts and dashed circles?

Counts summarize grouped contacts, not ore grades/prices. Dashed halos mean
approximate search areas. Wildlife moves; global contacts may be outside the
current landing region. Use local maps for rover waypoints.

## How do I record a moving lifeform?

Start Record lifeform on an eligible target in range. Tracking assist follows it;
manual steering overrides assistance. Attacks may delay the task. Recording data
is separate from capturing a specimen for sale.

## Why won't mining start or offload everything?

Select a nonempty deposit, reach 6 km range, check rover energy and hold space,
then start extraction. The rover holds 50 m³. Return and board to offload; the
ship also needs capacity, including space occupied by Endurium.

## Is the campaign playable? Is every device certified?

Earned victories and fresh voyages were recorded in development. The latest
accepted game also has targeted save regressions and an identical clean rebuild.
Those are distinct scopes, not guarantees for every mission or device. See
[build status](../SOURCE_SYNC.md) and [readiness](RELEASE_READINESS.md).

## Does it work offline, on phones, on macOS or in multiplayer?

The supplied executable targets Windows x64. The game is single-player.
Local art/music/effects do not require an asset service; recordings need internet.
Smaller layouts offer touch controls, but physical phones, macOS and other OS
packages are not certified. Browser-source development is a separate option.

## The game is slow. What can I try?

Use current Edge/Chrome, close unnecessary tabs, lower graphics quality and try
disabling CRT/shake. Software rendering can be slower than GPU rendering in the
bay. Back up before changing browser. No minimum frame rate is guaranteed.

## How do I report a problem?

Send this template through your agreed private channel:

~~~text
Build ID from BUILD-INFO.json:
Windows and browser/version:
Resolution / browser zoom:
Steps to reproduce:
Expected result:
Actual result / exact error:
Reproduces after tester restart:
Screenshot attached:
Save attached (optional; share deliberately):
~~~

No automatic logs, screenshots or saves are uploaded. Avoid unrelated personal
desktop information in captures.
