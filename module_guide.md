# Making KamiOS modules

<!-- lead -->
A module changes how KamiOS looks, moves and sounds **without a build, an install or a signature**. It is one JSON file, or a zip that holds that file together with the pictures, fonts, sounds and wallpapers it names. You import it on the phone, switch it on, and switch it off again to get everything back as it was.

<!-- group: Start -->

## Start here

This guide is the whole manual for people who want to write their own. The modules that ship with the ROM are made the same way, from the same parts. KamiOS is not public yet, so some of the examples cannot be tried until the first builds are out. Everything below was written from the working system. Where something has not been looked at on a real phone, the text says so.

### What a module can change

A module is a set of values and files. Nearly everything you can see, hear or feel on the phone has a place in it:

- **Look.** Colours, corner radii and shapes of the quick settings, the shade, notifications, the volume panel, the lock screen shortcuts, the gesture pill, Settings and the launcher. Pictures and animations (GIF, animated WebP) in tiles, sliders, switches, the battery and the status bar. [Quick settings](#quick-settings-and-shade), [volume panel](#volume-panel-and-bottom-sheets), [Settings itself](#settings-layout-and-glass), [switches and sliders](#switches-and-sliders).
- **Motion.** The speed and easing of every animation, how the back swipe looks, how a screen opens and closes, the window an app opens in from a cold start (its colour, a GIF, how long it stays), how the phone unlocks, wakes and turns its screen off, the stack of recent apps. [Animation](#animation-speed-and-curves), [back swipe](#back-swipe-and-transitions), [opening an app](#opening-an-app), [lock screen](#lock-screen-unlock-and-screen-off).
- **Sound.** The ringtone, the notification and the alarm sound, tap and keyboard clicks, locking and unlocking, charging, the low battery warning, docking, the screenshot. A module can be nothing but a sound pack. [Sounds](#sounds).
- **Identity.** The system font and the emoji, the boot and shutdown animation, the wallpaper and lock screen, the Material You accent, the icons of apps in the launcher, the home app. [Fonts and emoji](#fonts-and-emoji), [boot animation](#boot-and-shutdown-animation), [wallpaper, accent, icons](#wallpaper-accent-and-icons).
- **Behaviour.** Options of the phone that the module writes while it is on (quick settings layout, blur, gradients, animation scale, freeform windows), and a Lua script for a different home screen, even a tiling window manager. [Phone settings](#phone-settings), [Kami Shell](#kami-shell-a-home-screen-in-lua).
- **Choices.** A module can ask the user to pick a mood, a speed, a look for the back swipe, without being split into several modules. [Options](#options-choices-inside-a-module).

<!-- demo: phone -->

### How it works

A module works in two ways, and one module can use both:

1. **Resources.** Colours, sizes, corner radii, shapes and pictures that the quick settings, the shade, the volume panel, notifications, the launcher, Settings and the system read (`targets`). With `overlays` the same works for any other app, for the resource types that are safe.
2. **Settings.** Options that already exist on the phone (quick settings layout, blur, animation speed, the screen off effect, the Kami Shell script, freeform windows, ...) that the module writes while it is on (`settings`). The old values come back when it is switched off.

On top of that a module can carry fonts, system sounds, a boot animation, wallpapers, an accent colour, launcher icons, a different home app, and a script for the Kami Shell home screen.

A module cannot run code of its own. The only code it can bring is a Lua script for Kami Shell, which runs in a sandbox with no files and no network.

### Where each part goes

| What | Part of the module |
|---|---|
| Colours, sizes, shapes of tiles, shade, notifications, volume panel, sliders, back arrow, gesture pill, Settings | `targets` |
| Pictures and animations (GIF, animated WebP) on tiles, shade, volume panel, notification cards, sliders, Settings, status bar icons, battery, pill | `targets` with a picture path |
| Resources of any other app | `overlays` |
| System font, also variable fonts | `fonts` |
| The emoji of the whole system | `emoji` |
| System sounds: ringtone, notification, alarm, touch and keyboard clicks, lock screen, charging, low battery, dock, screenshot | `sounds` |
| The animation while the phone starts, and while it shuts down | `bootanimation`, `shutdownanimation` |
| The look of Settings itself: tiles of the main screen, tabs or a bar for the sub pages, backgrounds | `settings_layout` |
| The whole quick settings panel: its blocks, tiles, sliders and media | `qs_style` |
| Wallpaper and lock screen | `wallpaper` |
| Material You accent colour and style | `accent`, `accent_style` |
| Home app | `home_app` |
| Icons of apps in the launcher | `launcher_icons` |
| Quick settings layout, blur, gradients, animation speed | `settings` |
| A different home screen, even a tiling window manager | `settings` with the Kami Shell script |
| Choices for the user | `options` |
| Toggles and sliders of Settings: colours, a picture strip, how long a switch takes | `targets` of `com.android.settings` |
| Unlocking, waking and screen off effects | `targets` and `settings` |
| Back swipe, opening and leaving a screen | `targets` of `com.android.systemui` |
| Glass docks, bars and sheets | `settings_layout`, `targets` |

### Try it in five minutes

No text editor? **Module Studio** (Settings > KamiOS > Darkmoon Theme Engine > Module Studio) makes a module on the phone, knob by knob, with a
picture of what each knob changes and a preview on the real screen; see [Module Studio](#module-studio-and-overrides). The steps below
are the same thing by hand.

1. Open **Settings > KamiOS > Darkmoon Theme Engine > Modules** and choose **Export a template and the knobs**. You get one
   file: a small module to start from, and under `_knobs` the complete list of what a module may set on your build.
2. Change `id`, `name`, `description` and the values under `targets`. Delete `_knobs`.
3. Copy the file to the phone and choose **Import a module**. The phone checks it and, if something is wrong, names the
   resource or the key that it refuses.
4. Switch it on. A few things are read only when the system UI starts (the blur, the shape of a slider). Use **Restart
   system UI** at the end of the page, or put `"restart": true` into the module so it happens by itself.
5. Switch it off to see the stock look again. That is the whole test cycle.

A small module:

```json
{
  "format": "kamios-module", "version": 1,
  "id": "my-module", "name": "My module", "author": "me", "description": "What it does",
  "targets": {
    "com.android.systemui": {
      "dimen/qs_corner_radius": "12dp",
      "color/shade_panel_fallback_bg": { "day": "#FFEFEFEF", "night": "#FF101010" }
    }
  },
  "settings": { "global/window_animation_scale": 0.6 }
}
```

### Where to go next

- Want to see what the knobs do? Several pages have a live example you can play with next to the knobs it uses.
- Want the complete list? [Knob reference](#knob-reference) is searchable and is generated from the list that ships with the ROM.
- Want to start from something that works? [Examples](#examples-and-a-complete-module).
- Want to make one without a file? [Module Studio](#module-studio-and-overrides), and [Overrides](#overrides) to see which module wins.
- Want to share a module? [The module store](#the-module-store).

## The module file

A module is one file, `module.json`, or a zip that has it at the top. The file says who the module is, what it changes and which choices it offers.

### Fields

| Field | |
|---|---|
| `format` | always `"kamios-module"` |
| `version` | always `1` |
| `id` | `a-z`, `0-9`, `-` and `_`. Importing a file with the id of a module you already have replaces it. The ids of the modules that ship with the ROM cannot be used. |
| `name`, `author`, `description` | shown in the list |
| `module_version` | optional, like `1.2` or `2.0-beta`. Shown in the lists, and compared with the version in the module store to offer an update. `version` above is the version of the file format, not of your module. |
| `category` | optional: `theme`, `launcher`, `tweak`, `sounds`, `bootanimation`, `emoji`, `fonts`, `wallpaper`, `icons`, `apps`, `quicksettings`, `pill`, `volume` or `lockscreen`. Where the module is listed, and the filter of the module store. A value that is not in this list (a typo, or a category of a newer ROM) is ignored, not an error: the module is listed under **Other** in the store, and `validate.py` warns. Name the one that fits best: a module that only changes the pill is `pill`, one that only changes the volume panel is `volume`, a whole look is `theme`. Without it the phone works it out from what the module sets: only sounds (or only a boot animation, emoji, fonts, a wallpaper, launcher icons) gets its own heading; a home app without fonts or a wallpaper is a launcher; a module that mixes a style part (font, wallpaper, accent, icons, sounds, boot animation) with anything else, or reaches into three or more apps, is a theme; the rest are tweaks. |
| `group` | optional. Modules of the same group switch each other off. Use it for separate modules that exclude each other; for the choices inside one module use `options`. |
| `restart` | optional, `true`. System UI is started again when the module is switched, for resources that are only read at start. |
| `targets` | knob resources, per package, see below |
| `options` | choices for the user |
| `overlays` | resources of any app |
| `bootanimation`, `shutdownanimation`, `fonts`, `wallpaper`, `home_app`, `accent`, `accent_style`, `launcher_icons` | see the sections below |
| `apps` | apps (APKs in the zip) that are installed while the module is on, see [Apps that come with a module](#apps-that-come-with-a-module) |
| `qs_style` | the look and the layout of the whole quick settings panel, see [Quick settings style](#quick-settings-style) |
| `settings` | options of the phone to write while the module is on |

### Values

Values are written by kind:

| Kind | Written as |
|---|---|
| dimension | `"12dp"`, `"14sp"`, `"3px"`. A plain number is dp. |
| int, float | a number |
| bool | `true` or `false` |
| color | `"#RRGGBB"`, `"#AARRGGBB"`, or a system colour like `"@android:color/system_accent1_900"`. The colour is taken when the module is switched on; it does not follow a new wallpaper until you switch the module off and on. |
| string | text |
| drawable | the path of a picture inside the zip |

Any value can be `{ "day": ..., "night": ... }` to differ between light and dark mode.

When several modules set the same thing, the one switched on last wins.

### Targets: the knobs

`targets` maps a package to the resources you want to set:

```json
"targets": {
  "com.android.systemui":      { "dimen/notification_corner_radius": "8dp" },
  "com.android.settings":      { "color/kami_page_bg": "#FF101018" },
  "com.android.launcher3":     { "dimen/kami_launch_duration_scale": 0.6 }
}
```

A module can only set resources that are in the list of knobs (the export gives you the list, the [knob
reference](#knob-reference) below explains the groups). Anything else is refused on import, with the name of the resource.
This is on purpose: it keeps a module from changing things nobody expects. For other apps use `overlays`.

### Options: choices inside a module

A module can ask the user to choose something instead of being split into several modules. Each option is a row under the
module's switch. The chosen value adds its own `targets` and `settings` to the module's.

```json
"options": {
  "background": {
    "title": "Shade background",
    "default": "bw",
    "choices": {
      "bw":    { "title": "Black and white", "targets": { "com.android.systemui": { "color/shade_panel_fallback": "#FF000000" } } },
      "monet": { "title": "Material You",     "targets": { "com.android.systemui": { "color/shade_panel_fallback": "@android:color/system_accent1_900" } } },
      "stock": { "title": "Stock shade" }
    }
  }
}
```

Option ids use `a-z 0-9 _`, choice ids `a-z 0-9 - _`. At most 8 options of at most 16 choices. Every choice is checked on
import, not only the default. The choice is kept when the module is switched off.

A choice can also write `settings`, which is how one choice can switch a whole colour palette of a Kami Shell script.

## Module Studio and Overrides

You do not need a text editor to make a module. **Module Studio** builds one on the phone, knob by knob, and **Overrides** shows what
happens when two modules that are on set the same thing. Both are under **Settings > KamiOS > Darkmoon Theme Engine**.

### Module Studio

Open **Module Studio** and choose **New module** (nothing set) or **Start from a module of KamiOS** (a copy of one that comes with the
system, under a name of its own). A module of your own, under **Your modules**, has an **Edit in Studio** row.

- **Knobs.** The same list as the knob reference, by group. Each knob shows its stock value; a knob you set shows what you set.
  A number is typed with its range (the field says "From 0 to 100" and refuses a value outside it); knobs with a short list of
  choices show the choices; a colour opens a picker with sliders for hue, saturation, brightness and opacity and a field for
  `#AARRGGBB`; a picture opens the picture chooser and checks the size. **Different at night** adds a second value for the dark
  theme. **Reset this group** takes every knob of a group back to stock.
- **Find a knob.** Type a word like `corner`, `clock` or `pill`; every knob with it in its name or description comes up.
- **A picture of what the knob changes.** For many knobs a small picture of the screen (quick settings, volume panel,
  notifications, the clock in the shade, lock screen shortcuts, the gesture pill, switches, the Settings main screen, bottom
  sheets) is redrawn as you change the value. It is a picture, not the real thing: shapes, sizes and colours are close, blur and
  movement are not shown.
- **Show it on the phone while I edit.** Your values are put over the modules that are on until you leave the module, so you see
  the real thing. Nothing is kept until you **Save**; leaving Studio, closing Settings or restarting the phone ends the preview.
- **Save** puts the module under **Your modules**, where you switch it on like any other. **Export as zip** writes the module as
  it is now, to share it or to put in the module store. Parts of a module that Studio does not change (settings, fonts, scripts,
  a layout) are kept as they are, and the page says which; change them in the module file.
- **Restart system UI.** Studio restarts it by itself after a picture or a knob that needs it, and so does switching on any module
  that sets a knob of the system UI. The row is there for the case that a change does not show.

If a knob of your module does not exist on this phone (a module from another version), Studio says so and offers to take it out,
because the module cannot be saved with it.

### Overrides

Two modules that are on can set the same thing: the corner of the tiles, the wallpaper, a sound. The later one in the list wins,
the earlier one is hidden for that thing. **Overrides** lists it: for everything the modules that are on set, the module that wins
and the modules it hides, with the values (and the value at night where it differs). It covers knobs and overlays, settings,
wallpapers, the accent colour, fonts, emoji, sounds, boot and shutdown animations, the Settings layout, the home app and launcher
icons. Modules that are on but cannot be used (a check refused them) are listed apart with the reason. The summary under the row
on the modules page says how many things are shared. Use it before you wonder why a module "does nothing": usually a later one
sets the same knob.

### Fields of a knob in the list

The list of knobs (`knobs.json`, the same file that fills the knob reference below) has, for every knob: `target` (the app),
`resource`, `kind` (`color`, `dimension`, `int`, `float`, `bool`, `string`, `drawable`), `group`, `title`, `description` and
`default`. Numbers also have `min`, `max` and `step`, a knob with a short list of values has `choices`, `keep` is the value that
means "leave the stock one", and `restart` is true when system UI has to restart before the knob shows. The module file does not
need any of it; Studio, the reference and the check of a module use it.

## Zips, pictures and other apps

A module that brings pictures, fonts, sounds or wallpapers is a zip. A module that wants to change an app that is not part of KamiOS uses `overlays`.

### Zip modules and pictures

A module with pictures, fonts or wallpapers is a zip with `module.json` at the top and the files it names next to it:

```
my-icons.zip
 ├─ module.json
 └─ icons/airplane.png, alarm.png, ...
```

```json
{
  "format": "kamios-module", "version": 1,
  "id": "my-icons", "name": "My icons", "author": "me", "description": "Round status bar icons",
  "targets": {
    "com.android.systemui": {
      "drawable/stat_sys_airplane_mode": "icons/airplane.png",
      "drawable/stat_sys_alarm": { "day": "icons/alarm.png", "night": "icons/alarm_night.png" }
    }
  }
}
```

- The value of a `drawable/...` knob is the path of a picture inside the zip.
- PNG, WebP, JPG or GIF, at most 2560 x 2560 px and 3 MB per file; at most 200 files and 32 MB per zip. Anything else in the
  zip, and any path with `..` or an absolute path, is ignored or refused.
- Vector (XML) drawables cannot be used, only pictures.
- Import it like a JSON module. An imported module is kept in Settings' own storage; removing the module deletes its pictures.
- **Status bar icons** are tinted by the system: draw them white on transparent. Any size works, they are scaled to 17 dp
  high. A GIF or animated WebP is not scaled: make it the size you want (about 60 px high).
- Switching a module that has pictures restarts the system UI, because the status bar measures its icons when it starts.

### Moving pictures

Many surfaces take a picture, and nearly all of them take an animated GIF or WebP too. An animation plays while its surface is
on screen and stops when it is not. Some rules for all of them:

- Keep animations small: a few hundred pixels, a few dozen frames. A tile decodes its own copy, and an animation keeps
  drawing, which costs battery. Use them for things you look at, not for a long reading page.
- A picture **covers** its surface (centred, cropped, like a wallpaper). A small wide image does for a tile.
- Give a picture some **alpha** to let the colour behind it, or the blur, show through.
- Android blurs a whole window, not a part of one. Blur inside a single tile or slider is not possible; a translucent colour
  on it lets the blurred shade show through.

### Overlays for any app

`targets` takes the knob list. `overlays` has the same shape but works for **any package** (the system UI, the launcher, a
third-party app, the framework `android`), with resources you name yourself:

```json
"overlays": {
  "org.example.app": {
    "color/dark_background_color": "#FF2A0A3A",
    "color/accent": { "day": "#FFFF6A00", "night": "#FFFF6A00" }
  }
}
```

- Allowed: `color`, `dimen`, `integer`, `bool` and `drawable` (a picture in the zip, used as it is, not scaled).
- Not allowed: text (`string`), and anything that names a package or a component. A module must not be able to relabel a
  button or redirect an app.
- The app must be installed and must have that resource, otherwise the import is refused with its name. To find the names,
  look into the app's resources (for example `aapt2 dump resources base.apk | grep color/`).
- Apps that read a colour from a different resource, or that have colours compiled in (Compose, code shrinking), do not
  change. It replaces resource values, nothing more.
- Settings can be overlaid too. If a module makes the phone unusable, see [Safety and recovery](#safety-recovery-and-limits).
- Nobody reviews modules. Switching one on shows the apps it changes and a warning, every time.

### Apps that come with a module

A module can carry apps: a launcher, a tool, anything that is a normal app. Settings installs them while the module is on and
removes them when it is switched off, so an app can be shipped and updated through the module store without a new ROM.

```json
{
  "format": "kamios-module", "version": 1,
  "id": "metro-launcher", "name": "Metro Launcher",
  "home_app": "com.metro.launcher",
  "apps": [
    { "package": "com.metro.launcher", "apk": "apk/app.apk", "cert": "06da3f36...64 hex digits...eae3" }
  ]
}
```

| Field | |
|---|---|
| `package` | the package name of the app, it has to be the one in the APK |
| `apk` | the path of the APK in the zip |
| `cert` | the SHA-256 of the certificate the APK is signed with (64 hex digits, `apksigner verify --print-certs`). Required: the APK is installed only when it is signed with this certificate, and an update of an app that is there has to have the same one (the system sees to that). |
| `keep_data` | optional, `true` or `false` (the default). With `true` the data of the app stays on the phone when the app is removed (the module is switched off, removed, or replaced by a newer one, which comes in switched off) and is there again when the module installs the app again. Use it for an app that holds something the user made, like the start screen of a launcher. Without it the data goes with the app, and a removed module leaves nothing behind. |

- At most four apps per module, 128 MB for each APK. The APK has to carry its native libraries (`use_embedded_native_libs`).
- The install is silent (Settings is a system app), the module does not ask. An app that was there before (an app of the ROM) is
  left alone and is not removed when the module is switched off; only apps that Settings installed are removed again.
- `home_app` can name one of the apps: it becomes the home app while the module is on, and the old one comes back when it is off.
  The same module can carry a look (`targets`, `settings` ...) for it.
- An app of a module is a normal app: it has no privileged permissions and no hidden API. A launcher that needs more
  (Kami Shell moves the windows of other apps while they open) asks Quickstep, which does it for the app and lets only the apps
  it trusts use this (the certificate of the module, see below).
- `make-app-module.py` (in `examples/`) packs an APK into such a zip and reads the certificate; with `--keystore` it signs the
  APK with your own key first. **Use your own key for anything you publish**: an APK signed with the public test key of AOSP says
  nothing about who made it.
- Trust is in the module: a module names the certificate its app is signed with, and switching it on is the decision to trust
  that. The list is kept for Quickstep in the secure setting `kami_trusted_apps`, which only Settings can write.

The examples `examples/make-kami-shell.py` (Kami Shell, with its looks), `make-metro-launcher.py` (Metro Launcher) and
`make-app-module.py --home-app` build such modules. The ready zips of the ROM post are in `vendor/kami/zips/` (`kami-shell.zip`,
`metro-launcher.zip`, `tiling-larp.zip`); `vendor/kami/zips/build.sh` makes them again, signed with your own key.

**Metro Launcher** has three looks, chosen in its own settings (the Metro settings tile): *Windows Phone 8* (flat tiles on black), *Windows 10 Mobile*
(tiles close together, no title, an app list in two columns with an outlined search box at the top and the icons on dark squares) and
*Windows 11* (the same, with rounded acrylic tiles, a round search field and rounded icon squares). Each look has its own launcher
icon and its own recents screen: Windows Phone 8 has the cards with a coloured title bar (one colour per card when the tile colours are
subtle or colourful), Windows 10 Mobile the names above outlined screenshots, Windows 11 rounded cards on a grey screen.

Each look has its **own start screen**: the layout of Windows Phone 8 is the one it always had, Windows 10 Mobile starts with more small
tiles in blocks of four between the bigger ones, Windows 11 with fewer small tiles and a wide clock tile. Switching the look switches the
layout, and each one is kept. The app list has icons in the style of the look too: Windows Phone 8 and Windows 10 Mobile show the white
glyph of the app on a square (accent coloured in Windows Phone 8, dark grey in Windows 10 Mobile), Windows 11 draws every app as an
adaptive icon in the same rounded square.

In the two newer looks the **wallpaper is on the tiles** (Metro settings, "tiles"): each tile has the part of the wallpaper that lies under
it and turns and moves with the tile; between the tiles the screen is black or white like the other screens. Three choices: the wallpaper a
little darker (the default, like Windows 10 Mobile with a background picture), the wallpaper with the accent colour as a tint over it, or plain
colours without any wallpaper (not see-through at all). The picture is one of your own (Metro settings, "wallpaper") or the wallpaper of the
phone. Android lets an app read the wallpaper of the phone only with "All files access", so the settings have a row that opens that page;
without it, and without a picture, the tiles are plain colours.

The **weather tile** is the tile of the weather app of the system (OmniJaws, the app that the weather on the lock screen comes from):
pin it and, when the app is set up and has data, the tile shows the temperature, the weather as a symbol, the place and today's
high and low; until then it is an ordinary app tile.

The launcher keeps its **start screen** when its module is switched off or replaced by a newer one, because the module names its
app with `"keep_data": true` (see "Apps that come with a module").

The **size of the tiles** is a row of the Metro settings too ("tile size"): large (4 small-tile columns, two medium tiles in a row),
medium (6 columns, three in a row) or small (8 columns, four in a row). A medium tile is two columns wide, a wide tile four.

**The module dresses the whole phone, not only the launcher** (`examples/metro_theme.py`, built into `metro-launcher.zip`): the
quick settings are four columns of flat boxes close together, the symbol top left and the name bottom left, the tile that is on in the
accent colour and the others grey (a choice, see `kami_qs_tile_metro`); notifications, sliders, buttons and the volume panel are flat
and square, with square ringer buttons; Settings is a list like the one of Windows Phone (a big accent coloured symbol, the name and
a live line beside it, `settings_layout.main.style` `list`) under lowercase titles on a pivot, and its pages and the apps turn like a
turnstile; the status bar has a flat horizontal battery (the bolt is cut out of it while it charges) and Wi-Fi and mobile signal like
Windows Phone, as pictures; the switches are a flat box with a bar that slides across (a picture strip made for each accent colour, see "A switch
as a strip of pictures"); the system font is Open Sans in a light weight (SIL Open Font License; the nearest free font to Segoe WP
Light); the easing is short and sharp. The module's choices are the accent colour (16 of the 20 of the launcher, cobalt like
the launcher: pick the same one in the Metro settings), the shade background, how apps open and the back swipe turn (turnstile,
fade or stock), and whether the volume panel has one slider or all of them. The ROM does not ship the font: `build.sh` finds
`OpenSans[wdth,wght].ttf` in `../memories/fonts/OpenSans.ttf` beside the source tree (or in `OPEN_SANS`).

<!-- group: System look -->

## Quick settings and shade

The panel you pull down, the tiles in it, the shade behind it and the notifications on it.

### Colours, corners and shapes

| Resource | Kind | Default | What |
|---|---|---|---|
| `dimen/common_tile_default_active_tile_corner_radius` | dimension | 24dp | Corner radius of a tile that is on |
| `dimen/common_tile_default_inactive_tile_corner_radius` | dimension | 50dp | Corner radius of a tile that is off |
| `dimen/common_tile_default_active_icon_corner_radius` | dimension | 16dp | Corner radius of the icon background of a tile that is on |
| `dimen/common_tile_default_inactive_icon_corner_radius` | dimension | 50dp | Corner radius of the icon background of a tile that is off |
| `dimen/qs_corner_radius` | dimension | 28dp | Rounding of the quick settings panel and the footer |
| `integer/kami_slider_shape` | int | -1 | -1 is the shape chosen in Settings, 1 circle, 2 rounded square, 3 square |
| `integer/kami_footer_button_shape` | int | 0 | Shape of the settings and power buttons: 0 circle, 1 square, 2 rounded |
| `color/kami_qs_tile_active_bg`, `..._active_fg`, `..._inactive_bg`, `..._inactive_fg` | color | theme | Tile colours; `day`/`night` allowed. What is not set keeps the Material You colour |

### Tile sizes and layout

`string/kami_qs_tile_layout` gives tiles a size of their own, as a list like
`internet:2x1,flashlight:1x2,dnd:2x2`: the name of the tile, a colon, the columns it covers, an `x` and the rows it covers (1 to
3). The names are the ones of the tile pictures below (`internet`, `bt`, `flashlight`, `dnd`, ...). A tile of one column shows
only its symbol, wider ones show the label too, and a tile that covers several rows is centred in all of them.

Join tiles with a plus to put several of them in one cell: `dnd+flashlight:2x2` is one big cell with Do Not Disturb above the
flashlight (in a cell of one row they sit side by side). Each keeps its own switch.

The tiles keep their order and each cell goes to the first free place from the top left, so a tall tile leaves a gap beside it
that the small tiles after it fill. A tile that is not in the list keeps its stock size, and an empty list keeps the stock grid.
The `tile-mosaic.json` example is made for four columns. Only the panel itself changes: the edit screen still shows the stock grid.

### Tiles like Windows Phone

`bool/kami_qs_tile_metro` draws every tile as a flat box with the symbol in the top left corner and the name at the bottom left (a
second line under it when the tile has one, like the network name). All tiles get one size and a tap toggles; a long press opens the
settings of the tile. Use it with 4 columns (`system/qs_tiles_columns`), square corners (the four `common_tile_default_*_corner_radius`
knobs), small gaps (`dimen/qs_tile_margin_horizontal` and `dimen/qs_tile_margin_vertical`, 8dp by default) and, if you want, another
height (`dimen/common_tile_default_tile_height`, 72dp). Only the panel itself changes: the edit screen still shows the stock grid.

### Tile symbols

Tile symbols: the `drawable/qs_<name>_icon_on` and `_off` knobs, with the names `airplane`, `flashlight`, `dnd`, `bluetooth`,
`location`, `auto_rotate`, `battery_saver`, `hotspot`, `nightlight`, `invert_colors`, `light_dark_theme`, `data_saver`. White
PNGs, tinted by the tile, scaled to 24 dp high. They do not animate (the originals are animated vectors). Seen changing:
airplane, auto rotate, flashlight and the Bluetooth symbol of a tile that is off. The others are untested.

### Pictures in tiles

Tiles that are on and tiles that are off take a picture each, and a tile can have a picture of its own. The shade and the volume panel take one too. All of them may be animated.

| Resource | Where the picture is |
|---|---|
| `drawable/kami_qs_tile_active_image` | behind the icon and text of every tile that is on, over its colour |
| `drawable/kami_qs_tile_inactive_image` | the same for the tiles that are off |
| `drawable/kami_shade_background` | over the dim layer behind the whole shade; it fades in and out as the shade opens and is as strong as the dim layer |
| `drawable/kami_volume_dialog_image` | over the background of the volume panel, cut to its rounded corners |

For a tile of its own there are eight more slots of each:
`kami_qs_tile_active_image_1` to `_8` (tile on) and `kami_qs_tile_inactive_image_1` to `_8` (tile off). The string
`string/kami_qs_tile_picture_map` says which tile uses which slot: `"internet:1,bt:2,flashlight:3"` (the tile name, a colon,
the slot number). A tile that is not named, or whose slot is empty, keeps the picture for all tiles. The names are the
ones quick settings uses: `internet`, `bt`, `cell`, `airplane`, `flashlight`, `nfc`, `cast`, `hotspot`, `location`,
`rotation`, `dnd`, `battery`, `saver`, `inversion`, `night`, and so on. A tile of an app is `custom(package/Class)`.

### Layout, shape and labels (settings)

| Key | Value |
|---|---|
| `system/qs_tiles_columns`, `system/qs_tiles_columns_landscape` | number of columns |
| `system/qs_tiles_rows`, `system/qs_tiles_rows_landscape` | rows of the open panel |
| `system/qs_tile_shape` | 0 dynamic, 1 smooth rounded square, 2 rounded square, 3 square, 4 circle |
| `system/qs_panel_style` | 0 card, 1 classic |
| `system/qs_tile_label_hide` | `true` hides the labels of the small tiles |

`system/qs_tile_icon_shape` is not available to modules. To round or square the icon background use the
`common_tile_default_*_icon_corner_radius` knobs.

### The shade, blur and tones

| Resource | Kind | Default | What |
|---|---|---|---|
| `bool/kami_blur_enabled` | bool | true | False turns off the blur behind the shade, the lock screen and other system UI windows; the shade becomes opaque |
| `color/shade_panel_fallback_fg` | color | accent | Without blur the shade is a mix of two colours; this is the first |
| `color/shade_panel_fallback_bg` | color | neutral | The second colour of the shade without blur |
| `color/shade_panel_fallback` | color | accent | The colour of the volume panel background and similar surfaces |
| `color/notification_scrim_base` | color | neutral | Base colour behind the notifications |
| `color/shade_scrim_background_dark` | color | black | Colour of the scrim behind the shade |
| `dimen/notification_corner_radius` | dimension | 28dp | Corner radius of a notification |
| `dimen/notification_corner_radius_small` | dimension | 4dp | Corner radius of notifications that touch another one |
| `dimen/notification_scrim_corner_radius` | dimension | 32dp | Corner radius of the area behind the notifications |

| Key | Value |
|---|---|
| `system/kami_blur_strength` | 10 to 150, percent of the normal blur (100 is the default). Scales every window blur of the system UI: shade, lock screen, bouncer. Live. |
| `system/kami_shade_dual_tone` | `true` (default) the stock shade, notifications on their own scrim; `false` one tone and one blur for quick settings and notifications |
| `system/kami_shade_qs_tone` | 0 to 100 (default 0), an extra tone behind the quick settings while the dual tone shade is on |
| `system/kami_qs_dual_tone` | `true` (default) tiles with two targets (Wi-Fi, Bluetooth, mobile data) draw the icon in its own colour; `false` draws them in one colour |

### Notification cards

`color/kami_notification_bg` replaces the card background (day and night values work, give it some
alpha to see the shade through). `drawable/kami_notification_image` is drawn over it, cut to the corners of the card
(`notification_corner_radius` still sets them). Cards that an app colours (a call, a music player) keep the app's colour and
get no picture. The text colour is not a knob: it follows the light or dark theme. Give a light colour and picture for day
and a dark one for night.

### The clock above the quick settings

The clock and the date above the quick settings. A size of 0 and a fully transparent colour keep the look of the theme.

| Resource | Kind | Default | What |
|---|---|---|---|
| `dimen/kami_shade_clock_size` | dimension | 0sp | Size of the big clock above the quick settings when they are open (stock 36sp, 14 to 90). The small clock in the top bar keeps its size |
| `dimen/kami_shade_date_size` | dimension | 0sp | Text size of the date |
| `color/kami_shade_clock_color`, `color/kami_shade_date_color` | color | transparent | Their colours |
| `dimen/kami_shade_clock_offset_x`, `..._offset_y`, `dimen/kami_shade_date_offset_x`, `..._offset_y` | dimension | 0dp | Move them; negative is left or up |
| `string/kami_shade_clock_digits` | string | empty | One entry for every digit from the left (hour tens, hour ones, minute tens, minute ones), separated by commas; an entry is `scale/colour/lift` and any part may be empty: `1.3/#FF5CC8/-4,1/#FFFFFF/0,,` makes the first digit bigger, pink and 4dp lower and the second white |
| `dimen/kami_shade_clock_expanded_scale` | float | 0 | How much bigger the clock gets when the quick settings are open, from the small clock (stock 2.57, 1 to 4). Only used when `kami_shade_clock_size` is 0 |

## Quick settings style

The knobs above change one thing each. `qs_style` describes the whole panel in one document: the background, the header, the row of tiles you see when the shade is only pulled down a little, and the blocks of the open panel from top to bottom (tiles, sliders, media, a connectivity cluster, rows and columns, spacers, labels). The built-in styles of the quick settings page are presets of the same document, so a module can start from one and change what it likes.

```json
{
  "format": "kamios-module", "version": 1,
  "id": "glass-control-centre", "name": "Glass Control Centre",
  "description": "The control centre look: glass, a connectivity cluster, tall sliders",
  "category": "quicksettings",
  "qs_style": {
    "base": "kami",
    "panel": {"background": "glass", "blur": 70, "alpha": 0.3, "radius": 32, "padding": 16, "gap": 14},
    "header": {"style": "ios", "clock": true, "date": false, "settings": false},
    "qqs": {"columns": 4, "rows": 1, "media": false, "brightness": false},
    "tiles": {"columns": 4, "shape": "circle", "size": "icon", "gap": 12, "labels": false, "icon_size": 24},
    "blocks": [
      {"type": "row", "weights": [1, 2], "gap": 14, "children": [
        {"type": "folder", "specs": ["wifi", "bt", "airplane", "cell"], "style": "cluster", "size": 48},
        {"type": "media", "height": 160}
      ]},
      {"type": "row", "weights": [1, 1], "children": [
        {"type": "slider", "kind": "brightness", "orientation": "v", "height": 200, "width": 64, "icon": true},
        {"type": "slider", "kind": "volume", "orientation": "v", "height": 200, "width": 64, "icon": true}
      ]},
      {"type": "spacer", "height": 8},
      {"type": "tiles", "specs": ["flashlight", "dnd", "rotation", "battery"]}
    ]
  }
}
```

`base` is the preset the document starts from: `stock`, `kami`, `oneui`, `myui`, `ios`, `harmony` or `deck` (the scenes preset, see [Scenes](#scenes)). Without it a module document starts from `kami`. Every key is optional and only what is written changes, so a module usually writes a `base` and a few knobs. Unknown keys are ignored and unknown block types are skipped, so a document of a newer ROM still draws on an older phone. Units are dp, except label sizes (sp) and colours. A colour is `#RGB`, `#RRGGBB` or `#AARRGGBB`.

| Key | Value |
|---|---|
| `panel.background` | `scrim`, `blur`, `glass` or `none` |
| `panel.blur` | 0 to 100 |
| `panel.alpha` | 0 to 1 |
| `panel.radius` | 0 to 60 |
| `panel.padding` | 0 to 32 |
| `panel.gap` | 0 to 24 |
| `header.style` | `stock`, `ios`, `oneui`, `compact` or `none` |
| `header.clock`, `header.date`, `header.power`, `header.settings` | `true` or `false` |
| `qqs.columns` | 2 to 6 |
| `qqs.rows` | 1 to 2 |
| `qqs.media`, `qqs.brightness` | `true` or `false` |
| `qqs.hidden` | `true` draws no collapsed row: the shade that opens first is the notification list |
| `shade.split` | `right`, `left` or `off`: a pull down from that side of the status bar opens the whole panel directly (the Control Centre way), a pull from the rest opens the notifications; `off` is the one shade of stock |
| `shade.region` | 15 to 60: how wide that side is, in percent of the screen (default 40) |
| `tiles.columns` | 1 to 6 |
| `tiles.rows` | 0 to 8 per page, 0 is as many as needed |
| `tiles.shape` | `circle`, `squircle`, `rounded`, `pill`, `square` or `stock` |
| `tiles.size` | `icon`, `wide` or `stock` |
| `tiles.radius`, `tiles.gap` | 0 to 60, 0 to 24 |
| `tiles.labels`, `tiles.sublabels`, `tiles.pages`, `tiles.page_indicator` | `true` or `false` |
| `tiles.height` | 40 to 140: the height of an icon tile (a circle is never wider than it is high; a name below a circle comes on top) |
| `tiles.icon_size` | 16 to 48 |
| `tiles.active_bg`, `tiles.inactive_bg`, `tiles.active_fg`, `tiles.inactive_fg` | a colour |
| `blocks` | the list of blocks of the open panel, from top to bottom; without it the blocks of the preset are kept |

| Block | Keys |
|---|---|
| `tiles` | `specs` limits it to these tiles (without it: all of them); any of the `tiles` keys above overrides them for this block |
| `slider` | `kind` `brightness` or `volume`, `orientation` `h` or `v`, `height`, `width`, `radius`, `icon`, `fill` `accent` (the theme colour) or `light` (white, like the Control Centre) |
| `media` | `height` |
| `ringer` | `height`, `radius`: the three-way ringer switch, one pill with a thumb that sits on silent, vibrate or sound |
| `folder` | `specs`: the toggles in the cluster (`wifi`, `bt`, `airplane`, `cell` ...), `style` `cluster` or `list`, `size` |
| `row` | `weights`: how the row divides its width (`[1, 2]`), `gap`, `children`: the blocks in it |
| `column` | `gap`, `children` |
| `spacer` | `height` |
| `label` | `text`, `size` (8 to 32 sp), `color` |
| `scenes` | the scenes of the document (or the user's own list), see [Scenes](#scenes): `style` `chips` or `cards`, `columns` 1 to 4, `height` 36 to 120, `radius` 0 to 60, `add` `true` or `false` |

| `grid` | the whole panel as one grid of cells, see [Grid layout](#grid-layout) |
| `tile` | `spec`: one tile; only used inside a grid |

A tile is drawn once in the panel, so the first block that names a tile keeps it and a later block loses it; a `tiles` block without `specs` takes all the tiles no other block named (it is the one that pages and has the edit button, and only the first of them counts). The tiles of this ROM are `wifi`, `bt`, `cell`, `nfc`, `cast`, `dnd`, `wallet`, `airplane`, `rotation`, `flashlight`, `battery`, `alarm`, `controls` and `screenrecord`; friendly names (`bluetooth`, `mobile`, `torch`, `battery_saver`) are mapped to them. A slider is 0 to 400 dp high or wide. `panel.background` `glass` is a light veil (white over the dark theme, a stronger white over the light one), not a dark one.

A style with `shade.split` and `qqs.hidden` is how the iOS, MyUI and Harmony presets work: the notifications come from the left of the status bar, the panel from the right, and there is no collapsed row. While a slider of the panel is dragged, the other blocks fade and the slider stays; a bar that runs up and down takes a swipe along it, a bar that runs sideways leaves a swipe up or down to the shade. The tile editor (the pencil) draws the tiles the way the style does: the same shape, columns and names.

A list has at most 24 blocks and `row` and `column` nest 3 deep. A tile `specs` name is one of the quick settings tiles (`wifi`, `bt`, `cell`, `airplane`, `flashlight`, `dnd`, `rotation`, `battery` ...). The module style is used while the module is on; when two modules have one, the one switched on last wins. A module with a `qs_style` does not change the user's panel by itself: when it is switched on, the phone asks "Use the quick settings of this theme?" (Yes or No). Yes switches the panel to the style of the theme and keeps the style the user had, with their own changes; when the last theme with a style goes off or is removed, that style comes back. No leaves the panel alone, and "Quick settings style" in Settings can still pick "From module" later. The quick settings page still works on top of it: the style the user picked there is not changed by a module, and the user can change single knobs (the phone merges those over the module's document).

### Grid layout

The panel editor of the phone (the layout button next to the pencil) writes a `grid` block: the whole panel is one grid of cells that the user rearranges by dragging, so a module can ship one too. A grid has `columns` (1 to 6, default 4), `gap`, `cell` (the row height in dp, default the tile height of the style) and a list of `items`. The items are laid out in order, each one in the first free spot from the top left that is `w` cells wide and `h` cells tall, so a later small item fills a hole left by an earlier one.

```json
{"type": "grid", "columns": 4, "items": [
  {"type": "tile", "spec": "wifi", "w": 2},
  {"type": "tile", "spec": "bt", "w": 2},
  {"type": "slider", "kind": "brightness", "w": 4},
  {"type": "ringer", "w": 2},
  {"type": "tile", "spec": "flashlight"},
  {"type": "tile", "spec": "dnd"},
  {"type": "media", "w": 4, "h": 2}
], "hidden": ["nfc"]}
```

| Item | Keys and size |
|---|---|
| `tile` | `spec`; 1 to 4 cells wide, always 1 tall (2 or more wide is the wide tile with the name beside the icon) |
| `slider` | `kind`, `fill`, `icon`, `radius`; a bar that is wider than tall runs sideways (2 to 4 wide, 1 tall), a taller one runs up and down (1 wide, 2 or 3 tall). A sideways bar in one row is 48 dp thick (or `height`), in the middle of the row |
| `media` | the system media card, 4 wide, 2 or 3 tall (it is never drawn shorter than the card itself); only one in a panel. The user can shrink it in the editor: it then becomes a `mediatile` for any app |
| `mediatile` | a small player for one app: `package` (for example `com.spotify.music`, `com.google.android.youtube`), none means whichever app plays; 2 to 4 wide and 1 tall (a pill with the cover, title and play button; a tap opens a popup over a blurred screen with the seek bar, previous and next, volume and a button that opens the app) or 2 wide and 2 tall (a card with the cover as background). It takes no room while its app is not playing. One tile per app. |
| `ringer` | 2 to 4 wide, 1 tall (the switch keeps its own height of 56 dp, or the `height` you give it, in the middle of the row) |
| `scenes` | `style`, `columns`, `add`; 4 wide, 1 or 2 tall |
| `folder` | `specs`, `style`; the round-button cluster, 2 by 2 |
| `spacer` | an empty cell |

`w` and `h` are optional (a tile is 1 by 1, a slider 4 by 1, the media card 4 by 2, the ringer 2 by 1). `hidden` lists tiles the user took out of the panel. A tile of the tile list that no item names and `hidden` does not list is added at the end as a small tile, so tiles added later with the pencil still show up. A grid is a block of the top level of `blocks`; use it alone.

### Scenes

A scene is a named set of phone settings that the user applies with one tap from the panel, for example Focus, Cinema or Night. Only `id` and `name` are needed; every other key is optional, and a key that is missing leaves that setting as it is. A style document may ship up to eight scenes as defaults, and a `scenes` block draws them.

```json
{"id": "focus", "name": "Focus", "icon": "moon",
 "brightness": 35, "volume": 0, "ringer": "silent", "dnd": true, "rotation_lock": false, "flashlight": false}
```

| Key | Value |
|---|---|
| `id` | 1 to 24 characters of `a-z`, `0-9`, `_` and `-`; unique in the list |
| `name` | 1 to 16 characters, the name under the icon |
| `icon` | `moon`, `sun`, `focus`, `movie`, `book`, `game`, `home`, `bell`, `bolt`, `car`, `music` or `sleep`; anything else draws the default icon |
| `brightness` | 0 to 100, the manual brightness in percent of the display range |
| `volume` | 0 to 100, the media volume in percent |
| `ringer` | `silent`, `vibrate` or `normal` |
| `dnd` | `true` turns Do Not Disturb on, `false` turns it off |
| `rotation_lock` | `true` turns auto-rotate off |
| `flashlight` | `true` turns the flashlight on |

The list of scenes of a style document sits at the top level of `qs_style`, beside `base` and `blocks`:

```json
"scenes": [
  {"id": "study", "name": "Study", "icon": "book", "brightness": 55, "ringer": "silent", "dnd": true}
]
```

The user's own list is the system setting `kami_qs_scenes` (a JSON array of the same objects). When that key exists, even as an empty list, it replaces the list of the document; when it is missing the document's list is used. "Reset" deletes the key. A module never writes the key.

The block draws the scenes: `{"type": "scenes", "style": "cards", "columns": 3, "height": 72, "radius": 20, "add": true}`. `style` is `chips` (a pill with the icon and the name) or `cards` (a rounded square with the icon above the name), `columns` is 1 to 4, `height` is 36 to 120 and `radius` is 0 to 60. With `add` true a last "+" chip saves the current phone state as a new scene, named "Scene N". A long press on a scene overwrites it with the current state. A scene is highlighted while the phone matches it.

The built-in style `deck` (base `deck`) is the preset for this: a panel built around a row of scenes with the brightness bar below it.

## Volume panel and bottom sheets

The panel that opens when you press a volume key, its sliders, and the bottom sheets of the system UI.

### The volume panel

| Resource | Kind | Default | What |
|---|---|---|---|
| `dimen/volume_dialog_width` | dimension | 60dp | Width of the panel's background |
| `dimen/volume_dialog_background_corner_radius` | dimension | 30dp | Rounding of the panel |
| `dimen/volume_dialog_slider_height` | dimension | 254dp | The longest the slider gets |
| `dimen/volume_dialog_components_spacing` | dimension | 4dp | Gap between the ringer button, the slider and the buttons below |
| `dimen/volume_dialog_window_margin` | dimension | 12dp | How far the panel sits from the screen edge |
| `dimen/volume_dialog_background_surface_blur_radius` | dimension | 23dp | Blur behind the panel |
| `color/kami_volume_dialog_background` | color | theme | Colour of the panel, the ringer drawer and the floating sliders; the panel is blurred and a little see-through, so it looks lighter over a bright app |
| `color/kami_volume_slider_active`, `color/kami_volume_slider_inactive` | color | theme | Filled and empty part of the volume sliders; a gradient replaces the filled colour while it is on |
| `integer/kami_volume_slider_corner` | int | -1 | Corner radius of the slider in the panel, dp; -1 keeps the stock 12 |
| `integer/kami_volume_slider_thickness` | int | -1 | Thickness of the slider in the panel, dp; -1 keeps the stock 40 |
| `integer/kami_volume_enter_style` | int | 0 | How the panel comes in: 0 slides in from the edge, 1 grows out of the edge, 2 pops up and fades in, 3 only fades |
| `integer/kami_volume_spring_stiffness` | int | 700 | Stiffness of the spring that moves the panel in and out, 50 to 5000; higher is quicker |
| `dimen/kami_volume_spring_damping` | float | 0.9 | Damping of that spring, 0.2 to 1.5; lower wobbles more, 1 does not overshoot |
| `bool/kami_volume_all_sliders` | bool | false | Shows the sliders of ring, notification, alarm, call and system beside the media one, in a row at the side of the panel |

The ringer buttons: `dimen/volume_dialog_background_square_corner_radius` (the buttons in the drawer and the one that shows the mode,
12dp; 0dp is square), `dimen/volume_dialog_ringer_selected_button_background_radius` (the button of the mode that is on, 20dp, which is
round), and the colours `color/kami_volume_ringer_selected_bg` / `..._selected_fg` (the mode that is on) and `..._ringer_bg` /
`..._ringer_fg` (the others); a colour that is not set keeps the theme colour.

The width of the slider cannot be changed: the track is drawn with its own size. Icons of the panel (`drawable`, scaled to 24
dp high, white shapes; the panel may tint them): `ic_volume_media`, `ic_volume_media_low`, `ic_volume_media_mute`,
`ic_volume_ringer`, `ic_volume_ringer_mute`, `ic_volume_ringer_vibrate`, `ic_mobile_vibrate`, `ic_ring_volume`,
`ic_ring_volume_off`, `ic_volume_alarm_mute`, `ic_alarm`, `ic_volume_system`, `ic_volume_system_mute`,
`ic_notifications_active`, `ic_notifications_off`, `ic_tuner`, `ic_volume_odi_captions`, `ic_music_note`. `ic_volume_media`
and `ic_mobile_vibrate` have been seen changing.

### Slider fills in the shade and the panel

`drawable/kami_brightness_slider_image` fills the active part of the brightness bar in quick settings;
`drawable/kami_volume_slider_image` the active part of the volume sliders (panel and quick settings). The picture is clipped
to the filled part and its rounded shape, and the fill colour is dropped while a picture is set. A translucent colour works
too: the colour knobs of the sliders take alpha (`#80ff2020`).

The brightness bar in quick settings: `color/kami_brightness_slider_active` (filled part and thumb), `color/kami_brightness_slider_inactive` (empty part). The shape is `integer/kami_slider_shape` or the setting `system/qs_brightness_slider_shape`.

### Bottom sheets and the expanded volume panel

Tapping the settings icon under the volume bar opens a
sheet with all the sliders; the same knobs dress every bottom sheet of the system UI. The sliders of that sheet take the knobs of the
volume bar (`color/kami_volume_slider_active`, `..._inactive`, `drawable/kami_volume_slider_image`,
`integer/kami_volume_slider_thickness`, `integer/kami_volume_slider_corner`).

| Resource | Kind | Default | What |
|---|---|---|---|
| `color/kami_sheet_tint` | color | transparent | Colour of the sheet; a see-through colour lets the blur behind it show |
| `drawable/kami_sheet_image` | drawable | none | A picture behind the content of the sheet (it may move) |
| `integer/kami_sheet_corner` | int | -1 | Rounding of the top corners in dp; -1 keeps the theme |
| `integer/kami_sheet_blur` | int | -1 | Blur behind the sheet in dp, 0 is none, -1 keeps the theme |
| `integer/kami_sheet_frost`, `..._shine`, `..._gloss`, `..._rim` | int | 0 | Glass, each 0 to 100: a milky veil, light on the top edge, a bright diagonal band like a reflection, a bright edge round the sheet |

## Lock screen, unlock and screen off

What the lock screen shows, how it goes away, how it comes back and how the screen goes dark.

### Shortcuts in the bottom corners

The two buttons at the bottom corners (flashlight, camera, wallet and the
other shortcuts a user picks in Settings).

| Resource | Kind | Default | What |
|---|---|---|---|
| `dimen/keyguard_affordance_fixed_width`, `..._fixed_height` | dimension | 48dp | Size of a button; give a different width and height for a pill or a bar |
| `dimen/keyguard_affordance_fixed_radius` | dimension | 24dp | Rounding: half of the size makes a circle, less a rounded square |
| `dimen/keyguard_affordance_fixed_padding` | dimension | 12dp | Space around the symbol; more makes the symbol smaller |
| `dimen/keyguard_affordance_horizontal_offset`, `..._vertical_offset` | dimension | 16dp, 32dp | Distance from the side and from the bottom of the screen |
| `color/kami_lockscreen_shortcut_active_bg`, `..._active_fg` | color | theme | Button and symbol of a shortcut that is on (the lit flashlight) |
| `color/kami_lockscreen_shortcut_inactive_bg`, `..._inactive_fg` | color | theme | Button and symbol of a shortcut that is off |
| `drawable/ic_camera`, `ic_videocam`, `ic_wallet_lockscreen`, `ic_qr_code_scanner`, `ic_assistant`, `ic_notifications_silence`, `ic_do_not_disturb` | drawable | | Symbols of the shortcuts, white shapes, scaled to 24dp high (untested). The flashlight is changed with `drawable/qs_flashlight_icon_on` and `_off` |

### Unlocking and waking

How the lock screen goes away and comes back.

| Resource | Kind | Default | What |
|---|---|---|---|
| `integer/kami_unlock_duration` | int | 0 | Length of the unlock animation in milliseconds; 0 keeps the stock 300 |
| `dimen/kami_unlock_start_scale` | float | 0.95 | How big the screen behind the lock screen is when unlocking starts, 1 is full size: 1.3 starts big and shrinks into place, 0.5 grows from half |
| `dimen/kami_unlock_translation_y`, `dimen/kami_unlock_translation_x` | float | 0.05, 0 | Where it starts, as a part of the screen height or width (negative is up or left) |
| `dimen/kami_unlock_rotation` | float | 0 | Degrees it is turned at the start; it turns back to 0 |
| `dimen/kami_unlock_pivot_y` | float | 0.66 | The height it grows and turns around, 0 top to 1 bottom |
| `integer/kami_wake_style` | int | 0 | How the lock screen comes in when the screen turns on: 0 stock, 1 starts big and settles, 2 starts small and grows, 3 rises from below, 4 falls in with a bounce, 5 turns in, 6 flips like a card |
| `integer/kami_wake_duration` | int | 350 | Length of it in milliseconds (80 to 2000) |

<!-- demo: wake -->

### Screen off effects

Screen off effects are not a knob but a setting: `system/screen_off_animation` takes 0 (fade), 1 (CRT), 2 (scale) and, with the
KamiOS display service, 10 vortex, 11 dissolve into blocks, 12 ripple, 13 blinds, 14 glitch, 15 warp. The effects with a shader
of their own (10 to 15) need a build that has them; the other builds treat an unknown value as the fade.

## Status bar and battery

The icons at the top of the screen and the battery.

### Status bar icons

Status bar icons (`com.android.systemui`, kind drawable): `stat_sys_airplane_mode`, `stat_sys_alarm`,
`stat_sys_ringer_vibrate`, `stat_sys_ringer_silent`, `stat_sys_data_saver`, `stat_sys_nfc` (all seen changing),
`stat_sys_hotspot`, `stat_sys_data_bluetooth_connected`, `stat_sys_cast`, `stat_sys_headset`, `stat_sys_vpn_ic`,
`stat_sys_rotate_portrait` (same mechanism, not seen yet). Not knobs: the do-not-disturb icon (it comes from the active mode),
Wi-Fi and mobile signal (several states and levels), the Bluetooth icons with a battery level (ten variants). The Wi-Fi and the mobile
signal can still be changed with `overlays` (one picture for each level): Wi-Fi is `drawable/ic_wifi_signal_0` to `_4` in `android` and
`drawable/ic_wifi_0` to `_3` in `com.android.systemui`, the mobile signal `drawable/ic_signal_cellular_N_4_bar` (N from 0 to 4) and
`..._N_5_bar` (0 to 5) in `android` and `drawable/ic_mobile_N_4_bar` / `_5_bar` in `com.android.systemui`. `examples/metro_theme.py`
does it. The states with an exclamation mark or a cut-out keep their own pictures.

Every `stat_sys_*` knob takes an animated GIF or WebP; it plays while the icon is shown.

### The battery

Pictures replace the battery everywhere (status bar, lock screen, shade header) as soon as a frame or a fill
is set. With both empty the stock battery is back.

| Resource | What |
|---|---|
| `drawable/kami_battery_frame` | the outline, always drawn |
| `drawable/kami_battery_fill` | the inside, shown from the empty side up to the charge level |
| `drawable/kami_battery_charging` | a picture over both while the phone charges (a bolt) |
| `integer/kami_battery_fill_direction` | `0` fills from the left, `1` upwards (a standing battery) |

`bool/kami_battery_charging_cutout` makes the charging picture cut its shape out of the frame and the fill instead of being drawn over them,
so a bolt shows even on a full battery (a white bolt over a white fill would not).

Make them **white with transparency**: the status bar tints them (charging green, red when low). They are drawn at the same
size, as large as fits the status bar, so give them the same canvas. The percentage text and the battery saver tile are not
part of this.

## KamiOrbit: the capsule around the camera

KamiOrbit (Settings > KamiOS Extensions) is a small capsule around the front camera of the phone: the song that plays (its cover and an equalizer, or the icon of the app), a screen recording with a timer, a call, casting, a timer of the clock app, and any voice recorder app. A tap on a song opens a player card, a tap on a recording asks to stop it, a swipe to the side goes to the next thing, a swipe up folds it into two brackets around the camera. It finds the camera from the display, so it fits phones with the camera in the middle, and it takes the place of the Dynamic Bar (only one of them is on).

Every knob is a setting of the phone, so a module sets it in `settings` like the quick settings options. The keys are in the `secure` table:

```json
"settings": {
  "secure/kami_bar_enabled": true,
  "secure/kami_bar_roundness": 40,
  "secure/kami_bar_halo": 3,
  "secure/kami_bar_halo_effect": 2,
  "secure/kami_bar_glow_size": 14
}
```

| Key | Value |
|---|---|
| `secure/kami_bar_enabled` | `true` switches KamiOrbit on (and the Dynamic Bar off), `false` off |
| `secure/kami_bar_color_mode` | 0 black, 1 the colour of the thing it shows, 2 the accent of the theme. A recording stays black inside its frame in mode 0 and 2 |
| `secure/kami_bar_opacity` | 20 to 100, the fill of the capsule and the card |
| `secure/kami_bar_roundness` | 0 (square) to 100 (round as a pill); the card follows it |
| `secure/kami_bar_scale` | 50 to 150, the size of what is inside the capsule in percent; the capsule keeps covering the camera |
| `secure/kami_bar_gap_adjust` | -16 to 40 dp: the gap for the camera is the size of the camera, found by the display, this makes it wider or narrower (never narrower than the camera) |
| `secure/kami_bar_x_dp`, `secure/kami_bar_y_dp` | -80 to 80 and -8 to 16 dp, moves the capsule |
| `secure/kami_bar_halo` | the light around the capsule: 0 off, 1 a frame, 2 a glow, 3 both. The colour is the colour of the app of the song, red for a recording, green for a call |
| `secure/kami_bar_halo_source` | 0 the colour of the app or the thing, 1 the own colour of the next key |
| `secure/kami_bar_halo_color` | the own colour of the halo as a signed ARGB number (`0xFFB388FF` is `-5011201`) |
| `secure/kami_bar_halo_effect` | 0 solid, 1 pulse, 2 rainbow (turns round and ignores the colour) |
| `secure/kami_bar_halo_width` | 1 to 8 dp, thickness of the frame |
| `secure/kami_bar_glow_size` | 2 to 30 dp, how far the glow reaches |
| `secure/kami_bar_card_blur` | `true` blurs what is behind the player card (the opacity still counts) |
| `secure/kami_bar_card_halo` | 0 to 3, the same frame and glow around the player card, in the colour of the app of the song |
| `secure/kami_bar_music_icon` | `true` shows the icon of the music app instead of the equalizer |
| `secure/kami_bar_hide_paused` | `true` takes the capsule away while the song is paused |
| `secure/kami_bar_extras` | `false` shows music only, no recording, call, casting, timer or recorder app |
| `secure/kami_bar_haptics` | `false` switches the vibration of taps and swipes off |

## Launcher and gestures

The bar you swipe up from, the stack of recent apps and the arrow that follows your finger at the screen edge.

### The gesture pill

The bar at the bottom that you swipe up from. These are resources of `com.android.launcher3`.

| Resource | What it does |
|---|---|
| `dimen/kami_pill_width_scale` | how long the pill is, times what the navigation settings chose (2 is twice as long) |
| `dimen/kami_pill_height_scale` | how thick it is, times the setting (it stops at the height of its window, about 25 dp) |
| `dimen/kami_pill_follow` | how far it moves with your finger at the bottom edge: 0 stays still, 1 stock, 2 twice as far |
| `dimen/kami_pill_stiffness` | the spring that brings it back: higher snaps back faster (stock 380) |
| `dimen/kami_pill_damping` | how much it wobbles on the way back: 1 none, 0.62 stock, 0.2 a lot |
| `drawable/kami_pill_image` | a picture, also an animated GIF or WebP, in place of the pill; it is stretched to the pill, so draw it wide and flat (480 x 24 is plenty); the pill colour is not drawn behind it |
| `bool/kami_pill_image_clip` | true cuts the picture to the rounded pill (default), false lets it keep its own shape |
| `color/taskbar_stashed_handle_light_color`, `..._dark_color` | the colour of the pill on a dark / on a light background |

### An app closing into its icon

Swiping up from an app, the home button and back to the home screen make the app shrink into its icon. These are resources of
`com.android.launcher3`.

| Resource | What it does |
|---|---|
| `dimen/kami_close_speed` | how fast the app closes: 1 stock, 2 twice as fast, 0.5 half as fast (0.3 to 3) |
| `string/kami_close_effect` | how the app goes into its icon: `stock` (the shrinking card) or `lamp` (the magic lamp, see below) |
| `dimen/swipe_up_rect_x_damping_ratio`, `..._y_damping_ratio` | how much the window bounces into the icon after you let go: 1 none, stock about 0.96, 0.5 a clear wobble |

Speed changes the spring of the swipe and the length of the fade of the home button. The wobble belongs to the swipe; the home button
only fades. These knobs do not depend on the gesture pill. The example `closing-lab.zip` (`examples/make-closing-lab.py`) has two
separate choices, the speed (fast, stock, slow) and the bounce (none, stock, bouncy, jelly), that can be mixed freely.

**Magic lamp.** `string/kami_close_effect` set to `lamp` (the example `examples/magic-lamp.json`, or Settings > KamiOS > Launcher motion)
pinches the window into a funnel and sucks it into the middle of its icon, like the magic lamp of Compiz and GNOME. It plays after you let
go of the swipe up, it does not follow the finger, and it has its own length (it ignores `kami_close_speed` and the bounce). The same
app opens by unrolling out of its icon, but only after it was closed with the lamp once in this session (the launcher keeps a picture
of the last three apps; without one the opening is the stock one). It works for an icon on the home screen or in the hotseat. An icon
in a folder, a widget, an app opened from the app drawer, the home button and the back gesture keep the stock animation.

### Recents

The module **Recents style** (one module, one choice: carousel, fan with the right cards on top, fan with the middle card on top, soft overlap or tight deck) sets the numbers below for you. To make
your own look, set them yourself.

These tune the stack of cards. They only act while "Stacked cards" is on in the
launcher settings.

| Resource | Kind | Default | What |
|---|---|---|---|
| `dimen/kami_recents_stack_reach` | float | 0.70 | Where the cards behind the middle one pile up, in card steps |
| `dimen/kami_recents_stack_flat` | float | 0.45 | A card follows the finger one to one up to here, in card steps |
| `dimen/kami_recents_stack_shrink` | float | 0.075 | Scale a card loses per card step away from the middle |
| `dimen/kami_recents_stack_min_scale` | float | 0.8 | The smallest scale of a card in the stack |
| `dimen/kami_recents_stack_lift` | float | 6 | How far the middle card lifts over the others, in dp |
| `dimen/kami_recents_stack_rotate_y` | float | 0 | Degrees a card turns about the vertical axis per card step (a carousel); capped at 85 |
| `dimen/kami_recents_stack_rotate_z` | float | 0 | Degrees a card tilts per card step away from the middle (a fan) |
| `dimen/kami_recents_stack_drop` | float | 0 | How far a card sinks per card step, in dp |
| `dimen/kami_recents_stack_fade` | float | 0 | Opacity a card loses per card step; 0 keeps all cards opaque |
| `dimen/kami_recents_stack_min_alpha` | float | 0.3 | The least opacity a faded card keeps |
| `integer/kami_recents_stack_order` | int | 0 | 0: the middle card is on top; 1: cards further right are over the ones to their left |

Combine them: `rotate_y` 30 with `fade` 0.12 is a carousel, `rotate_z` 6 with `drop` 36 and `order` 1 is a fan.

### The back gesture arrow

The arrow that follows your finger when you swipe back from the screen edge:
`color/kami_back_arrow` (the arrow), `color/kami_back_arrow_bg` (the round shape behind it), `dimen/navigation_edge_arrow_thickness`
(the line). The shape is `integer/config_backGestureArrowMode` (0 the stock line arrow, 1 a filled arrow, 2 your own) with
`string/config_backGestureArrowPathData` for mode 2: SVG path data in a box where x runs from 0 (the tip) towards the screen
edge and y from -1 to 1. The stock chevron is `M 1,-1 L 0,0 L 1,1`; add a tail with `M 0,0 L 2,0`. The other edge mirrors
it. A path that cannot be read falls back to the chevron. The colours are read when the panel is set up, so restart the
system UI.

## Back swipe and transitions

What the screens do when you swipe back from the edge, when you open a page and when you leave it.

### The back swipe

What the two screens do when you swipe back from the edge, between two apps or two screens of
one app (the system draws the stock one: the screen shrinks and the one below comes up). `string/kami_back_style` of
`com.android.systemui` picks the look:

| Value | Look |
|---|---|
| `stock` | the shrinking card (default) |
| `off` | nothing moves, the screen changes the moment you let go |
| `fade` | the old screen fades out and shrinks a little, the one below comes up |
| `zoom` | the old screen flies at you and fades, the new one grows into place |
| `flip` | the screen turns like a card and the new screen is its back |
| `book` | the screen turns like a page around the edge you swiped from, the new screen is under it |
| `spin` | the screen is thrown to the side and falls away |
| `glitch` | the screen stutters, jumps and flickers into the new one |

Your finger takes the animation part of the way (it follows the swipe and goes back if you cancel), letting go plays the rest.
`integer/kami_back_duration` sets the length of that second part in milliseconds (0 takes the length of the look, 300 to 520).
`drawable/kami_back_overlay` is a picture over both screens while it plays, centred and cropped to the display; an animated
GIF or WebP moves, so a glitch, static or light leak animation makes a new look of its own. Give it some alpha to see the screens
through it. `integer/kami_back_overlay_alpha` is how strong it is in percent, `integer/kami_back_overlay_mode` is 0 to show it the
whole time or 1 to fade it in and out so it is strongest in the middle. The look and the picture are read again for every swipe,
no restart. Not changed by this: the swipe back to the home screen, the animation that an app draws itself (some apps draw their
own preview) and windows that are not full screen (freeform, split screen, letterboxed), which keep the stock look.

<!-- demo: back -->

### Going into a screen and leaving it

`string/kami_open_style` is how a screen of an app comes in when you open it (a sub page of
Settings, the details of something), `string/kami_close_style` how it goes when the app finishes it (the arrow in the top bar, the
back button); `integer/kami_transition_duration` is the length in milliseconds. They take the same names as the back swipe
(`stock`, `off`, `fade`, `zoom`, `flip`, `book`, `spin`, `glitch`). Leaving plays the same poses as the back swipe; going in has
looks of its own, because the new screen is on top of the old one: it zooms in, lands like a page from the right edge, or is
thrown in from the side. Opening an app (a new task), dialogs and screens that bring an animation of their own keep their
animation. The picture over the back swipe is not drawn here.
`examples/make-back-lab.py` builds a module with the looks of the back swipe, of opening a page and of leaving a page as three
separate choices, and a glitch animation over the swipe.

## Opening an app

What an app shows from the moment you tap it until its own screen is there.

### The first window of a cold start

When an app starts from nothing (a cold start), the system shows a window for it before the app has drawn anything: the **splash
screen**, a colour with the icon of the app in the middle. The knobs below change it. They apply to everything that starts an
app: the launcher, a notification, a link. They do **not** apply to an app that is still in memory (a warm start, where the app
and its last picture just animate), and an app that brings its own splash screen is painted over as well. They need system UI.

| Knob (`com.android.systemui`) | What it does |
|---|---|
| `color/kami_splash_background` | The colour of the window, `#AARRGGBB`. With an alpha below full the screen behind shows through. No colour (or alpha 0) keeps the colour each app asks for. |
| `drawable/kami_splash_background_image` | A picture over the whole window, on top of its colour, centred and cropped. A GIF or animated WebP moves while the app starts. |
| `drawable/kami_splash_image` | A picture in the middle in place of the app icon, as big as the icon size below. A GIF or animated WebP moves, so one GIF gives every app the same loading animation. |
| `integer/kami_splash_icon_alpha` | How strong the icon (or the picture in its place) is, 0 to 100. 0 hides it. |
| `integer/kami_splash_min_duration` | The least time the window stays, in milliseconds counted from the start of the app (0 to 5000). |

And in `android`: `dimen/starting_surface_icon_size` (default `160dp`) is how big the icon or picture is.

**The window needs a background.** An app that starts fast is already drawn under the window; with a clear colour the animation
plays over the finished app and looks like a sticker. Give the window a colour, with some alpha if you like, so it hides the app
until it leaves. **A longer animation needs `kami_splash_min_duration`.** Normally the window goes the moment the app has drawn
its first frame, often within half a second, which is too short for a GIF to be seen; the minimum keeps the window for longer and
only the reveal waits (the app is ready underneath). Pictures are decoded at 512 px on the long side and share the limits of the
other picture knobs.

How the window leaves, the four `integer` knobs of `com.android.systemui`:

| Knob | Default |
|---|---|
| `integer/starting_window_exit_animation_type` | `0` the circle opens and the window slides up, `1` it fades |
| `integer/starting_window_app_reveal_anim_duration` | `266` ms, how long the window takes to go |
| `integer/starting_window_app_reveal_anim_delay` | `83` ms, a pause before the reveal |
| `integer/starting_window_app_reveal_icon_fade_out_duration` | `133` ms, the icon fading out |

A module that gives every app a dark red window with a spinner and keeps it for two seconds:

```json
"targets": {
  "com.android.systemui": {
    "color/kami_splash_background": "#D8120508",
    "drawable/kami_splash_image": "img/spinner.webp",
    "integer/kami_splash_min_duration": 2000
  },
  "android": { "dimen/starting_surface_icon_size": "220dp" }
}
```

The `kami_splash_exit_*` knobs only change how this window leaves again once the app has drawn, not how an app closes. A window
without a visible colour (clear) has nothing to show while it leaves, so give it a colour with alpha to see them.

The example `splash-lab.zip` (`examples/make-splash-lab.py`) has the colour, the icon size, how long the window stays and a spinner
or a colour wash as choices. Opening an app from Kami Shell, and the way home from it, can be scripted as well, see
[Kami Shell](#kami-shell-a-home-screen-in-lua).

## Animation speed and curves

How fast everything moves and how it speeds up and slows down.

### Speed

For every animation of the system a module can set the three animation scales of the developer options:
`global/window_animation_scale`, `global/transition_animation_scale`, `global/animator_duration_scale`. 1 is stock, 0.5 twice
as fast, 0 none. The knob `dimen/kami_launch_duration_scale` (launcher) makes only the opening of apps from the launcher
faster or slower (0.6 faster, 1.5 slower).

### Easing curves and times of the system animations

The framework animations (apps opening and closing, dialogs, sheets, fades) get their feel from ten easing curves and a set of
durations. A module can set all of them with the target `android`:

| Resource | Kind | Default | What |
|---|---|---|---|
| `string/kami_curve_fast_out_slow_in` | string | `M 0,0 C 0.4,0 0.2,1 1,1` | The standard curve, used almost everywhere |
| `string/kami_curve_emphasized`, `..._fast_out_extra_slow_in` | string | long calm end | The big movements (app from the launcher, activity changes) |
| `string/kami_curve_emphasized_decelerate`, `..._emphasized_accelerate` | string | | Things that arrive, things that leave |
| `string/kami_curve_standard`, `..._standard_decelerate`, `..._standard_accelerate` | string | | The Material curves for small movements |
| `string/kami_curve_linear_out_slow_in`, `..._fast_out_linear_in` | string | | Fades that enter and leave |
| `integer/kami_activity_dur` | int | 450 | Milliseconds of a screen opening or closing over another one of an app |
| `integer/kami_task_dur` | int | 500 | Milliseconds of the movement between two apps |
| `integer/kami_fragment_open_dur`, `kami_fragment_close_dur` | int | 400, 200 | Milliseconds of split layouts opening and closing |
| `integer/config_shortAnimTime`, `config_mediumAnimTime`, `config_longAnimTime` | int | 200, 400, 500 | Milliseconds of menus, popups, dialogs and the like |
| `integer/config_activityShortDur`, `config_activityDefaultDur` | int | 150, 220 | Milliseconds of popups and dialogs opening and closing |

Opening an app from the launcher is moved by the launcher, not by these: its speed is `dimen/kami_launch_duration_scale` (see the
speed section above).

A curve is SVG path data from `0,0` to `1,1`, where x is the time and y the progress: `M 0,0 C 0.4,0 0.2,1 1,1` is one cubic
curve with two handles, and more `C` segments can follow. The time may not go back, but the progress may go over 1, which
makes a movement overshoot: `M 0,0 C 0.25,1.35 0.5,1 1,1` is a soft bounce. A curve that is not valid is refused on import,
the system never sees it. The `motion.json` example has the choices snappy, smooth, bouncy and mechanical (linear). For the speed of everything at once see the three
animation scales above.

<!-- demo: curve -->

<!-- group: The Settings app -->

## Settings layout and glass

`settings_layout` changes the main screen of Settings and the way its sub pages are reached. It is only data: it arranges and
paints what is already there, it cannot add pages or run anything. Give `main`, `pages`, or both. The module has to be on, and
the last module that has a `settings_layout` wins. Open Settings again to see it. Anything the layout leaves out stays as it is,
and a layout that is wrong is left out as a whole (the import says why).

```json
"settings_layout": {
  "main": {
    "hero": false,
    "columns": 2,
    "tiles": [
      { "page": "network", "color": "#0078D7", "text_color": "#FFFFFF" },
      { "page": "themes", "size": "full" },
      { "page": "storage", "hide": true }
    ]
  },
  "pages": {
    "nav": "bar",
    "transition": "fade",
    "title": { "case": "normal", "size": 14 },
    "colors": { "selected": "#FFFFFF", "unselected": "#9AA0A6", "indicator": "#33FFFFFF", "bar": "#161B22" },
    "background": { "gradient": ["#0F2027", "#2C5364"], "angle": 270, "dim": 0.2 }
  }
}
```

### The first screen: main

| Key | Meaning |
|---|---|
| `hero` | `false` takes the card with the name of the system away |
| `columns` | 1, 2 or 3 tiles in a row (the tiles that have no `size` share the row) |
| `tiles` | a list. The tiles named here come first, in this order; the others follow in the usual order |
| `style` | `tiles` (the default) or `list`: one column of rows like the Settings of Windows Phone, no tile background, a big symbol at the left (40 dp), the name and one line of live text beside it. `columns` and the tile `size` are not used then, `text` is. The symbols take the colour `color/kami_bento_row_icon` (`com.android.settings`) when a module sets one |
| `text` | the texts of the tiles: `title_size` (10 to 28 sp), `title_lines` (1 to 3), `summary_size` (9 to 20 sp), `summary_lines` (0 to 3; 0 shows no summary line). With 3 tiles in a row the titles are 14 sp unless you say otherwise |

A tile has `page` and any of: `size` (`third`, `half` or `full` of the width; a tile with a size starts a row of its own),
`color` and `text_color` (`#RRGGBB` or `#AARRGGBB`; the symbol takes the text colour), `hide` (`true` takes the tile off the screen).

Pages that are tiles: `network`, `connected_devices`, `sound`, `display`, `themes` (the Theme Engine), `notifications`, `modes`,
`wallpaper`, `kamios` (the KamiOS settings), `extensions` (KamiOS Extensions), `battery`, `storage`, `apps`, `system`.

The pages that Android lists under them are tiles of the same grid, so the whole main screen looks uniform: `about_device`,
`safety_center`, `security`, `privacy`, `location`, `accounts` (passwords and passkeys), `accounts_and_backup`, `supervision`,
`emergency`, `accessibility`, `support`. They follow the others in the usual order, and `size`, `color`, `text_color` and `hide`
work on them like on any tile. Which of them exist depends on the phone: where Android has Safety Center, the tile called "Security
and privacy" is `safety_center` and `security` is not on the screen. Colouring both is harmless.

**`themes` and `kamios` cannot be hidden**: they are the way
back to the modules, so a layout can never lock you out. Corner radius, gap and tile height are `targets` as before
(`dimen/kami_bento_radius`, `kami_bento_gap`, `kami_bento_tile_height`).

A choice of an option (see "Options") may carry a `settings_layout` of its own: its `main` and `pages` take the place of the ones of the module while that choice is
selected. The Metro theme uses it to let you pick the list or the tiles for the main screen of Settings.

### The sub pages: pages

Nothing is hidden here; this is only how the pages are reached and how they look.

| Key | Values |
|---|---|
| `nav` | `pivot` (the big titles, the default), `tabs` (a row of titles at the top with a line under the open one), `bar` (the same titles as a bar of glass at the bottom, in reach of the thumb, the open one on a pill; it goes on behind the navigation bar), `dock` (a floating bar of glass with one icon per page, like the dock of macOS or GNOME: the open icon is bigger and lifted, its name is above the dock; it shows 5 big icons at a time and slides to keep the open page in the middle, see `dock` below), `none` (pages of the main screen are opened one by one as in stock Settings; the KamiOS settings need a way between their pages, so they use the pivot) |
| `swipe` | `false` stops swiping between the pages (the titles still work) |
| `transition` | how a page replaces the one before: `fade` (default), `slide`, `none`, `zoom` (the pages fly in and out like a jump through space), `cube` (the pages are the sides of a cube), `depth` (the new page slides over the old one, which sinks back), `flip` (the page turns over like a card) |
| `blur` | for `nav: bar` and `nav: dock`: how much the glass of the bar blurs what is behind it, 0 to 60 dp (default 24, 0 leaves the glass flat). The pages run under the bar and are blurred in it, and so is the page behind Settings, also when it moves |
| `glass` | for `nav: bar` and `nav: dock`: the look of the glass of the bar, an object with `blur` (0 to 60 dp, the same as `blur` above), `shine` (light on the top edge, default 33), `gloss` (a bright diagonal band like a reflection, default 0), `frost` (a milky veil with a fine grain, default 0), `rim` (the bright edge, default 70) and `vibrance` (0 to 100, default 0: what shines through the glass gets stronger colours and a little brighter, so a blue sky behind it stays blue instead of going grey), `shade` (shade at the bottom, default 19); the last six are 0 to 100. Make the bar colour in `colors.bar` see-through (for example `#5A150E3A`) so that the glass shows what is behind it |
| `title` | `case` (`normal`, `lower`, `upper`), `size` (14 to 64 sp), `app` (`false` hides the small line with the name of Settings above the titles), `app_color` (its colour) |
| `colors` | `selected`, `unselected`, `indicator` (the line or the pill), `bar` (the background of the tabs, the bar or the dock) |
| `dock` | for `nav: dock`: `items` (3 to 9, how many icons are in view, default 5) and `size` (32 to 72 dp, default 56). Fewer and bigger, or more and smaller; the icons shrink if the screen is too narrow. `icons` gives a page its own picture: an object from the id of the page (`network`, `display`, `sound`, ... as in `main`) to an image in the zip (png or webp, 192 to 256 px square works best); a picture is drawn as it is, with its own round, and a page without one keeps its stock icon (the dock draws those at 256 px, sharp on every screen) |
| `background` | behind all the pages of Settings: `color`, or `gradient` (2 or 3 colours) with `angle` (0 left to right, 90 bottom to top, 180, 270 top to bottom), or `image` (a path in the zip, a GIF or animated WebP moves), and `dim` (0 to 0.8) to darken it |

`examples/metro-tiles.zip` (flat coloured tiles in two columns, lowercase tabs), `examples/plain-list.zip` (one column of wide rows,
a bar at the bottom, a dark gradient), `examples/dock.zip` (three tiles in a row, a floating dock) and `examples/stock-pages.zip`
(`nav: none`: every page opens on its own, as in stock Settings, with a flat dark background), built by
`examples/make-layout-examples.py`, are the ones to start from.

<!-- demo: glass -->

### The page behind Settings

| Resource | What |
|---|---|
| `color/kami_page_bg` | The page colour. Use an `#AARRGGBB` colour to make it see-through. |
| `drawable/kami_page_background` | A picture instead of the colour: PNG, WebP, JPG or GIF. `day` and `night` allowed. |
| `bool/kami_page_translucent` | The windows are see-through: what is below shows where the colour or picture has alpha. |
| `bool/kami_page_show_wallpaper` | The wallpaper shows behind the window where the page has alpha. |
| `dimen/kami_page_blur` | Blurs what is behind a see-through window (frosted glass). `20dp` to `40dp` looks good, `0dp` is off. |

Frosted glass:

```json
"targets": { "com.android.settings": {
  "bool/kami_page_translucent": true,
  "bool/kami_page_show_wallpaper": true,
  "dimen/kami_page_blur": "30dp",
  "color/kami_page_bg": { "day": "#8CF7EEFF", "night": "#8C140A24" }
} }
```

For an animated page a GIF of about 500 px width is enough (it is stretched to the screen) and a few hundred KB is sensible.

### The look of the main screen

The KamiOS look of the first screen: a card, tiles, a list (`com.android.settings`). With the KamiOS style switch off the stock look returns.

| Resource | Kind | What |
|---|---|---|
| `color/kami_bento_tile` | color | Colour of the tiles. Each tile gets a tint of the palette and a soft light over it |
| `color/kami_bento_hero` | color | Colour of the card at the top |
| `drawable/kami_hero_image` | drawable | A picture over the card at the top, cut to the card; a GIF or animated WebP plays while the screen is shown |
| `dimen/kami_bento_radius` | dimension | Corner radius of the tiles |
| `dimen/kami_hero_radius` | dimension | Corner radius of the card at the top |
| `dimen/kami_bento_icon_radius` | dimension | The round behind the symbol (24dp is a circle, 0dp a square) |
| `dimen/kami_bento_gap` | dimension | Gap between tiles |
| `dimen/kami_bento_tile_height` | dimension | Height of a tile |
| `integer/kami_bento_columns` | int | Tiles per row: 1, 2 or 3 |
| `color/kami_list_row` | color | Colour of the cards of the rows that are not tiles: Google services and preferences, Digital Wellbeing, KamiOS Extensions and any page another app adds. It holds for every look of the screen (the tiles, the list, the stock look) |
| `dimen/kami_list_radius` | dimension | The outer rounding of those cards (the top of the first row, the bottom of the last one); 0dp makes them square |
| `dimen/kami_list_inner_radius` | dimension | The rounding where two of those rows meet (4dp by default) |
| `color/kami_page_bg`, `drawable/kami_page_background` | | The page behind, see "Moving pictures" |

With these a flat, square Settings is a module, not a build.

## Switches and sliders

The switches and sliders are the parts of Settings you touch most, so a module can restyle them completely: colours, pictures that move, a whole switch drawn by you as a strip of pictures, and how long it takes to turn. They apply to the KamiOS look of Settings (the KamiOS style switch on).

### Try it

<!-- demo: switch -->

### Colours and pictures

The track and the knob take a colour each for on and off. A fully transparent colour keeps the theme. The track of a switch that is on can be a picture (it may move), and the knob can show a picture of its own in place of the check mark and the cross, or none at all.

```json
"com.android.settings": {
  "color/kami_switch_track_on": "#FFFF7A1A",
  "color/kami_switch_track_off": "#FF2A1B1B",
  "color/kami_switch_thumb_on": "#FFFFE9C4",
  "color/kami_switch_thumb_off": "#FF8A6E5E"
}
```

### A switch as a strip of pictures

The most you can do with a switch is draw all of it yourself. A **strip** is one picture with frames side by side, from off (left) to on (right), 2 to 60 frames, each as high as the switch. Track and knob are part of the picture, so it can be anything: a moon that turns into a sun, a pumpkin that lights up, a lever.

- The switch is 32 dp high. Draw at 3 times: **96 px high**, and about 156 px wide for one frame. The strip may be up to 2560 px wide.
- Corners and shape are part of the picture. Give the corners some transparency to make a pill.
- **Let the track fill the frame.** The stock switch is a track of 32 dp, the whole height. A track that only uses the middle of the frame (a common mistake is 56 of 96 px) looks small next to the other switches of the phone. Draw it from about y 4 to y 92 and from edge to edge; the knob may be as high as the track or a little higher.
- **See-through colours need a layer.** If you make the strip with a program, do not draw a see-through colour (a highlight, a glow, a shadow) straight onto the picture: in Pillow, `ImageDraw` on an RGBA image *replaces* the pixels with that see-through colour instead of mixing it, so the track under the highlight is gone and the spot shows as a dark or black bar in dark mode. Paint such things on their own empty layer and put the layer over the strip (`Image.alpha_composite(strip, layer)`), or use opaque colours. `examples/glasslib.py` has `over()` for it. A quick test: put the finished strip on a black and on a white background; the switch must look the same on both. `python3 validate.py my-module.zip` does this check for you (it needs Pillow): it warns when the track uses less than 85% of the frame height or when there are see-through pixels inside the switch.
- The switch plays the strip forward when it is turned on and backward when it is turned off, and it cross-fades between two neighbouring frames, so even 8 frames look smooth.
- The animation only plays when you touch the switch. A page that opens, or a list that scrolls, shows the right frame at once.

```json
"com.android.settings": {
  "drawable/kami_switch_sheet": "img/switch_strip.png",
  "integer/kami_switch_sheet_frames": 16,
  "integer/kami_switch_duration": 700
}
```

### How long a switch takes

`integer/kami_switch_duration` is the time in milliseconds. **0 keeps the speed of the stock switch** (about 250 ms), so a module only slows its toggles down when it wants to: 500 to 900 shows every frame of a long strip. The animation keeps running when you lift your finger, and if you tap again half way it turns around from where it is.

### Toggle animations

`integer/kami_switch_toggle_animation` moves the whole switch when you turn it: 1 pop, 2 spin, 3 jelly, 4 drop from above with a bounce. Their times stretch with `kami_switch_duration` as well. A switch that is a strip already moves by itself, so the toggle animation is for the plain switches.

### Sliders

The filled and the empty part of the sliders take a colour each (the round new sliders take only these). A picture for the filled part works on the bar-shaped sliders and on the round ones; it may move. On a round slider the picture is as wide as the whole track and cut off at the knob, so a flowing gradient looks like it runs under the slider.

| Resource | Kind | Default | What |
|---|---|---|---|
| `color/kami_switch_track_on`, `..._track_off`, `..._thumb_on`, `..._thumb_off` | color | transparent | Track and knob of a switch that is on and off |
| `drawable/kami_switch_track_image` | drawable | none | A picture for the track of a switch that is on (it may move) |
| `drawable/kami_switch_icon_on`, `..._icon_off` | drawable | none | A picture in the knob in place of the check mark and the cross (about 16dp, it may move) |
| `bool/kami_switch_icons_hidden` | bool | false | `true` removes the check mark and the cross |
| `integer/kami_switch_toggle_animation` | int | 0 | How a switch moves when you turn it: 0 not, 1 pop, 2 spin, 3 jelly, 4 drop with a bounce |
| `integer/kami_switch_duration` | int | 0 | How long a picture-strip switch and the toggle animation take, in ms. 0 keeps the speed of the stock switch (about 250); a slower value (500 to 900) shows the frames of a long strip |
| `drawable/kami_switch_sheet`, `integer/kami_switch_sheet_frames` | drawable, int | none, 0 | The whole switch, track and knob together, as a strip of frames side by side from off (left) to on (right), 2 to 60 frames, up to 2560 px wide, as high as the switch (96 px for 32dp at 3 times). The switch plays it forward when it is turned on and backward when it is turned off and cross-fades between the frames, so a moon can turn into a sun |
| `color/kami_slider_active`, `..._inactive` | color | transparent | The filled and the empty part of the sliders (the round new sliders take only these) |
| `drawable/kami_slider_image` | drawable | none | A picture for the filled part of the sliders, the bar-shaped ones and the round new ones (it may move; on the round ones it is as wide as the whole track and cut off at the knob) |

<!-- group: Fonts, sounds and more -->

## Fonts and emoji

### Fonts

A zip can change the system font:

```json
"fonts": {
  "regular": "fonts/MyFont-Regular.ttf",
  "medium":  "fonts/MyFont-Medium.ttf",
  "bold":    "fonts/MyFont-Bold.ttf"
}
```

- `regular` is required, `medium` and `bold` are optional (medium text uses the regular font when there is no medium one).
- `.ttf` or `.otf`, one font per file (no `.ttc`), at most 10 MB each.
- **Variable fonts:** a slot can be an object with the file and the axes to set. One file may serve every slot.

  ```json
  "fonts": {
    "regular": { "file": "fonts/Ubuntu.ttf", "axes": { "wght": 400 } },
    "medium":  { "file": "fonts/Ubuntu.ttf", "axes": { "wght": 500 } },
    "bold":    { "file": "fonts/Ubuntu.ttf", "axes": { "wght": 700 } }
  }
  ```

  Up to 4 axes per slot, tags of 4 characters (`wght`, `wdth`, `opsz`, ...), values from -1000 to 10000. Without axes a
  variable font shows its default weight in every slot.
- The system, Settings and every app that uses the device's default font change. Apps with a font of their own do not.
- Apps pick the font when they start: the system UI restarts when you switch the module, other apps change when you open
  them again (or after a reboot).
- Fonts do not need the signature that Google's font updates carry. Only Settings can install them.
- After the module is switched off nothing uses the files any more. `adb shell cmd font clear` removes all of them.
- A font whose PostScript name equals the one of an installed font with a newer version is refused.

### Emoji

A zip can replace the emoji of the whole system with another set (iOS style, WhatsApp style, Blobmoji, ...):

```json
"emoji": "emoji.ttf"
```

- One `.ttf` in the zip with colour glyphs (bitmaps `CBDT`/`CBLC`, `COLR`, `sbix` or `SVG`) and a `cmap`, like `NotoColorEmoji.ttf`.
  The file name has to contain `emoji`. It may be up to 64 MB (emoji fonts
  made of bitmaps are 30 MB and more), the rest of the zip up to 32 MB.
- The font goes in front of the emoji of the ROM, which stay behind it for what it does not have (new emoji, flags).
  Switching the module off takes it out again; the stock emoji are back.
- The system UI restarts when you switch the module; other apps change when they are opened again. Apps that draw their own
  emoji (some messengers, keyboards with their own set) keep them.
- A font that has the PostScript name of the stock emoji font is fine: the phone gives it a name of its own when it installs
  it.
- If two modules set an emoji font, the one that was switched on last wins.
- Only Settings can install it (no signature is needed), like the fonts above.

Emoji fonts are not part of the repository: they come with the licence of the people who made them.

## Sounds

A module can replace the sounds of the system, among them the ringtone, the notification and the alarm. It works as a **sound pack**
(a module with only `sounds`) or as a part of a theme: `sounds` sits in the same file as colours, fonts and wallpapers.

```json
"sounds": {
  "ringtone": { "file": "sounds/ring.ogg", "title": "Glass ringtone" },
  "notification": "sounds/notify.ogg",
  "touch": "sounds/tick.wav",
  "charging": "sounds/charge.ogg"
}
```

<!-- demo: sound -->

The value is the path of an audio file in the zip, or an object with `file` and a `title` (the name in the list of sounds;
the module's name when there is none). The files are `.ogg`, `.oga` (Vorbis or Opus), `.wav`, `.mp3`, `.flac` or `.m4a`.

| Slot | What it is | Longest | Biggest |
|---|---|---|---|
| `ringtone` | the ringtone (also the SIM 2 ringtone, unless the module has a `ringtone2`) | 120 s | 15 MB |
| `ringtone2` | the ringtone of SIM 2 | 120 s | 15 MB |
| `notification` | the default notification sound | 30 s | 5 MB |
| `alarm` | the default alarm sound | 120 s | 15 MB |
| `touch` | tap and click sounds (Settings > Sound > Tap and click sounds), also the focus and back sounds | 3 s | 1 MB |
| `keypress_standard`, `keypress_spacebar`, `keypress_delete`, `keypress_return`, `keypress_invalid` | the keyboard clicks of keyboards that use the system sounds | 3 s | 1 MB |
| `lock`, `unlock`, `trusted` | locking and unlocking the screen, and a trusted device unlocking it | 5 s | 2 MB |
| `charging`, `wireless_charging` | a charger is plugged in, the phone is put on a wireless charger | 10 s | 5 MB |
| `low_battery` | the warning at low battery | 10 s | 5 MB |
| `dock`, `undock` | the phone is put in a desk or car dock, and taken out | 10 s | 5 MB |
| `screenshot` | taking a screenshot | 10 s | 5 MB |

How it behaves:

- The ringtone, notification and alarm are added to the sounds of the phone (they show in the list when you pick a sound, under
  the module's `title`) and set as the default ones. They go away with the module.
- The other sounds replace the sound of the system for as long as the module is on. The switches of Settings > Sound
  (charging sounds, dock sounds, tap and click sounds, screen locking sound) still decide *whether* a sound plays.
- Before a module sets a sound the old value is kept. It is given back when no module sets that sound any more, unless you
  picked another one yourself in the meantime.
- If two modules set the same sound, the one that was switched on last wins.
- The lock screen and the low battery warning load their sounds when the system UI starts, so the system UI restarts when you
  switch a module with those sounds. The others change at once.
- The sounds are plain files: nothing runs. Keep UI sounds short; the system keeps them in memory.

What a module cannot change: the camera shutter and focus sounds (the camera app plays them itself), the dial pad tones, the
volume beep and sounds that an app brings along. Apps keep their own notification sounds unless they use the system default.

`examples/sounds-example.zip`
("Glass sounds", built by `examples/make-sounds-example.py` from synthesised bells) sets every slot and is a good starting point.

## Boot and shutdown animation

A module can replace the animation that plays while the phone starts, and the one that plays when it shuts down. Both are
the **Android boot animation format** that custom ROMs have always used, so existing `bootanimation.zip` files work as they are.

```json
"bootanimation": "bootanimation.zip",
"shutdownanimation": "shutdownanimation.zip"
```

- Each one is the path of a zip inside the module's zip. Give both, either, or only one (the other stays as the ROM has it).
  The file name has to contain `anim`. Each zip may be up to 64 MB.
- **A plain `bootanimation.zip` needs no module at all.** Import it in Settings > KamiOS > Darkmoon Theme Engine like a module:
  the phone makes a module of it, named after the file. Switch it on, and the next start shows it.
- The animation zip has a `desc.txt` and folders of pictures, as always:

  ```
  720 720 30          width height fps
  p 1 0 part0         play part0 once, no pause
  p 0 0 part1         play part1 in a loop until the phone has started
  ```

  The pictures (`part0/00000.png` ...) have to be **stored, not compressed** (the system maps them, it does not unpack them):
  `zip -0 -r bootanimation.zip desc.txt part0 part1`. The phone refuses a zip that is compressed and says so.
- The animation is drawn at its own size in the middle of the screen, on black (or the colour of the part line). Make it as big
  as the screen to fill it, or smaller to leave black around it.
- Switching the module on only copies the zip; nothing restarts. Switching it off, or removing the module, puts the animation
  of the ROM back. If a zip cannot be played when the phone starts, the ROM's animation plays instead of a black screen.
- If two modules set a boot animation, the one that was switched on last wins; the same goes for the shutdown animation.

`examples/bootanimation-example.zip` ("Orbit", three dots on a ring, built by `examples/make-bootanimation-example.py`) sets
both and is a good starting point.

**Preview.** Open the module in the Theme Engine: a module with a boot or shutdown animation has a page with a "Preview" row for each.
It plays the animation full screen on black at its real size, the way the boot animation draws it, until you tap or press back.
Pictures are decoded while it plays, so a very big animation can look slower there than on the real start.

## Wallpaper, accent and icons

### Wallpaper and lock screen

```json
"wallpaper": "wallpaper.jpg"
"wallpaper": { "home": "wallpaper.jpg", "lock": "lock.jpg" }
```

A string sets both screens, an object sets the home screen and the lock screen on their own (one of them or both). The pictures
are in the zip (PNG, WebP, JPG, up to 2560 px and 3 MB; an animated one shows its first frame). Before a module sets a
screen, Settings keeps what is there (a copy of the picture, the live wallpaper that was running, or "the lock screen shows
the home wallpaper"). When no module sets that screen any more it is given back, unless you picked another wallpaper in the
meantime. If two modules set the same screen, the last one switched on wins.

### Home app

`"home_app": "com.example.launcher"` makes that launcher the home app while the module is on (nothing happens when it is not
installed). The app that was home before comes back when the module is switched off, unless you picked another in the
meantime. KamiOS ships two extra home screens you can name here: `com.kami.shell` (the scripted one, see below) and
`com.metro.launcher` (a Windows Phone start screen with live tiles).

### Accent colour (Material You)

The header card of Settings, the switches, the titles, the tiles that are on and every other colour that follows Material You
come from one seed colour, normally taken from the wallpaper. A module can set it:

```json
"accent": "#B56CFF",
"accent_style": "VIBRANT"
```

`accent` is the seed (`#RRGGBB`). `accent_style` is optional: `TONAL_SPOT` (the default), `VIBRANT`, `EXPRESSIVE`, `SPRITZ`,
`RAINBOW`, `FRUIT_SALAD` or `CONTENT`. It is the same setting as Wallpaper & style, so the whole system re-colours at once,
day and night. The last module that has an accent wins. When none has one any more, the old value comes back, unless you chose
another colour in the meantime.

### Launcher icons

A zip can give apps an icon in the launcher, like an icon pack:

```json
"launcher_icons": {
  "com.android.deskclock": "icons/clock.png",
  "com.android.settings/com.android.settings.Settings": "icons/settings.png"
}
```

The key is a package, or `package/Class` for one activity (the activity wins over the package). Icons are used as they are
(full colour, already shaped, no mask is put around them), up to 512 px. Switching the module on or off changes them
straight away. Icon pack apps keep working; a module icon wins over them. This needs the KamiOS launcher.

<!-- group: Behaviour and scripts -->

## Phone settings

A module can set the options of the KamiOS pages, the same ones that **Your changes** lists:

```json
"settings": {
  "system/qs_tiles_columns": 5,
  "system/qs_tile_shape": 4,
  "system/qs_tile_label_hide": true,
  "system/qs_panel_style": 1
}
```

- The key is `store/key`: `system`, `secure`, `global`, or the Lineage tables `lineage_system`, `lineage_secure`,
  `lineage_global`, then the key the page uses. The value is a number, `true`/`false` or text, like the option itself. The
  export of the knobs lists them all.
- Options of the **Misc** page (game spoofing, integrity, sensor blocking, Tricky Store) cannot be set by a module.
- When the module is switched on, Settings keeps the value an option had and writes the module's. When no module sets it any
  more the old value comes back (an option that was unset becomes unset again), unless you changed it yourself in the
  meantime. Where two modules set the same option, the one switched on last wins.
- Settings take effect at once, no restart.
- The value of a setting can be any text, which is how a module hands a whole script to Kami Shell.

### Gradients

The filled part of the volume slider, the brightness bar and the active quick settings tiles can have a gradient:

```json
"settings": {
  "system/volume_slider_gradient": true,
  "system/qs_brightness_slider_gradient": true,
  "system/qs_tile_gradient": true,
  "system/custom_gradient_color_mode": 1,
  "system/custom_gradient_start_color": -65536,
  "system/custom_gradient_end_color": -16776961
}
```

`custom_gradient_color_mode` 0 takes the accent colours of the theme (primary to secondary), 1 the two colours you give. The
colours are signed ARGB numbers: `0xFFFF0000` (red) is `-65536`, `0xFF0000FF` (blue) is `-16776961`. In a shell,
`printf '%d' $((0xFFFF0000 - 0x100000000))` converts one. The gradient replaces the plain fill colour while it is on.

### Freeform windows

`global/enable_freeform_support` and `global/force_resizable_activities`, both set to `1`, let apps open as real windows. The
Tiling WM module uses this, see below.

### Settings that have their own page

- Quick settings layout and shape: [Quick settings and shade](#layout-shape-and-labels-settings).
- Blur and tones of the shade: [The shade, blur and tones](#the-shade-blur-and-tones).
- Animation scales: [Speed](#speed).
- The screen off effect: [Screen off effects](#screen-off-effects).

## Kami Shell: a home screen in Lua

Kami Shell is an optional home screen for KamiOS. It is drawn by a small renderer and the look, the arrangement of the icons
and every animation are a Lua script that a module can replace. It is not part of the ROM: it comes as an app module (see
[Apps that come with a module](#apps-that-come-with-a-module)), which installs it, makes it the home app and offers its looks.
It keeps the gestures and the recents screen of the system launcher. It is a normal app; the opening and closing of other apps
in its animation is played by Quickstep with the curve the script gives.

The built-in script is a normal home screen: pages you arrange by long press and drag, folders that open into a large panel,
widgets (clock, analog clock, date, battery, battery ring, search bar, note, stopwatch, counter, year progress, picture),
an app drawer with a letter rail and search, app shortcuts in the long press menu, a swipe down for notifications, a pinch
for the home menu. Everything that moves is a spring or a curve the script gives, and it follows the system's animation
speed.

### Folders and landscape

A folder opens into a large glass panel in the look of the folder: it grows out of the folder icon and takes nearly the width
of the screen, at least four rows tall, with the apps on the grid of the home screen. Tap an app to start it, long press one to
drag it out, tap the title to rename, tap outside to close it. A folder can also be made bigger on the page: **long press it >
Resize**, then drag the round handle on the faint outline. The card follows the finger and springs into the cells it will take
when you let go, a bigger folder shows its apps as small icons on the card and opens the same panel. The size is saved with the
folder (`w` and `h` in cells; a folder of one cell has none).

Turned to landscape the page has twice the columns and as many rows as fit. **Each orientation keeps a layout of its own**
(`home.mode`, the other one is in `home.alt`): the first time landscape is shown it is made from the portrait one, and turning
back brings every icon back where it was. The doubling is done by the built-in script, `cfg.cols` stays the portrait number, and
`kami.size()` tells a script the shape of the screen if it wants to lay out something itself.

### Which script runs

A module sets it with the setting `secure/kami_shell_script`:

- `preset:<name>`: a script that ships with the app. `preset:a+b` loads several one after the other. Lines after the first
  line are Lua that runs after the presets, so a module can change a number without a script of its own:

  ```
  preset:tiling+pal-nord
  wm.gap = 10
  ```

- Or the whole Lua script as the text of the setting.

Presets: `cube`, `wave`, `fan`, `grid-big`, `minimal`, `widgets-demo` (change the pages and icons only), `launch-gif` (an animation when an app opens), `bouncy`, `snappy`,
`depth` (change how everything moves), `you` (the system colours) and `stats` (frame time and memory in a corner, for
tuning), and `tiling` with the palettes `pal-gruvbox`, `pal-catppuccin`, `pal-nord`, `pal-tokyo`, `pal-frost` and the look `glass` (a whole
home screen, see the next chapter). Presets that change different things join: `preset:depth+you`.

A script that starts with `--@extend` runs on top of the built-in one and only has to change `cfg`, `fx` and add widgets. Any
other script replaces the built-in one entirely. If a script does not load, or `frame` fails twice in a row, the built-in
script takes over and a message is shown. A call that runs longer than 120 ms is stopped.

### Changing the built-in look

```lua
--@extend
cfg.cols = 5
function fx.page(o)            -- o: how far this page is from the one in front (-1 left, +1 right)
  return 1 - 0.3 * math.abs(o), 1 - math.abs(o), o * 20, 0, 0   -- scale, alpha, rotation, extra x, extra y (dp)
end
function fx.icon(o, col, row, cols, rows)
  return 0, 0, 1, 1, o * 30    -- extra x, extra y (dp), scale, alpha, rotation
end
```

`cfg` holds the columns, icon size, label size, whether there are labels, spring, how dark the wallpaper is dimmed, accent,
glass colour (`cfg.system_colors = true` takes both from the system), whether the first page starts with clock and search,
the dock, the most pages, the columns of the drawer, what pinching in does (`cfg.pinch`), whether app menus show
shortcuts, and `cfg.debug`.

**How things move.** The numbers are in `cfg.motion`, the curves in `fx`:

```lua
--@extend
cfg.motion.speed = 1.3                 -- all of it faster; 0 switches the animations off
cfg.motion.drawer = { 260, 0.95 }      -- springs: { stiffness, damping }; damping 1 stops without overshoot,
cfg.motion.folder = { 330, 0.80 }      -- less than 1 bounces
cfg.motion.move = { 380, 0.82 }        -- icons and widgets sliding to a new place
cfg.motion.press = { 700, 0.62 }       -- an icon under the finger
cfg.motion.stagger = 0.035             -- the rows of the drawer come one after the other

function fx.drawer(p, h)               -- p 0 closed .. 1 open, h the screen height (px): push down (px), alpha,
  return (1 - p) * h * 0.9, p, 1 - 0.06 * p, 1 - p, 1   -- scale and alpha of the home behind, scale of the drawer
end
function fx.drawer_row(p, row) return (1 - p) * 28, p, 1 end   -- one row of the drawer: extra y (dp), alpha, scale
function fx.folder(p, a)               -- a.x a.y a.s: the folder icon; a.cx a.cy a.w a.h: the open panel (px)
  return a.x + (a.cx - a.x) * p, a.y + (a.cy - a.y) * p, a.s / a.w + (1 - a.s / a.w) * p, p, 0.5 * p
end                                    -- centre x, y, scale, alpha, how dark the screen behind gets
function fx.press(p) return 1 - 0.12 * p end              -- a pressed icon (p 0..1): its scale
function fx.lift(p) return 1 + 0.14 * p, 0.35 * p end     -- a picked up icon: scale, shadow
function fx.launch(p) return 1 + 0.05 * p, 1 - 0.5 * p end -- the home screen while an app opens: scale, alpha
```

Springs of your own: `anim.spring(state, target, dt, { stiffness, damping })` moves `state.x` and returns `true` while it
moves; `anim.ease` has curves (`out_cubic`, `out_back`, `out_elastic`, ...).

**Opening and closing apps.** The window of an app grows out of its icon and falls back into it along a curve your script
gives:

```lua
--@extend
-- t runs 0..1 over fx.app_duration(closing) seconds. a.x a.y a.w a.h a.radius: the icon (px); a.sw a.sh: the screen;
-- a.corner: corner radius of the screen; a.closing; a.key: the app. Return the window box (x, y, w, h), its
-- corner radius and its alpha.
function fx.app_duration(closing) return closing and 0.30 or 0.55 end
function fx.app(t, a)
  local p = a.closing and (1 - t) or t          -- 0 = at the icon, 1 = filling the screen
  p = p * p * (3 - 2 * p)
  return a.x * (1 - p), a.y * (1 - p), a.w + (a.sw - a.w) * p, a.h + (a.sh - a.h) * p,
    a.radius + (a.corner - a.radius) * p, math.min(1, p * 4)
end
```

**Carrying the icon, and your own opening animation.** While an app opens or closes, its icon is not drawn in its place on the home
screen, the dock, the drawer or a folder; a copy swells and fades into the window instead (`cfg.carry_icon = false` for no copy).
`fx.app` may return a seventh value, a table of **layers** drawn over the window, and the script decides where they are and how
strong at every moment (px, alpha 0 to 1):

```lua
return x, y, w, h, radius, alpha, {
  icon  = { x = .., y = .., w = .., h = .., alpha = .. },                                  -- the icon of the app
  image = { x = .., y = .., w = .., h = .., alpha = .., src = "asset:img/demo.gif" },      -- a picture or animation, covers its box
}
```

`src` takes what `kami.image` takes (`asset:`, `file:`, `content:`, `data:`); a GIF or animated WebP moves while it is on screen and
is decoded at 512 px on the long side. The window itself (the first six values) can be the full screen with a growing alpha, which
is what `preset:launch-gif` does: the icon swells, a GIF grows out of the icon to the full screen and blends into the app, and
closing plays it backwards. Opening an app from the drawer, the dock, a folder or a shortcut all play it. The way home with the swipe
up from the bottom is played by the launcher: the window falls into the icon and the home screen is there early, but it is not
scripted; the back and home buttons are (`fx.app` with `a.closing`). `on_home(gesture)` is called when the home screen comes back,
with `true` for the swipe up.

**Your own widgets**

```lua
--@extend
widget {
  id = "hello", title = "Hello", w = 2, h = 1, sizes = { { 2, 1 }, { 4, 1 } },     -- sizes in grid cells
  draw = function(x, y, w, h, item)        -- pixels; item is the saved record of this widget
    ui.card(x, y, w, h)                    -- the glass card
    ui.text("Hello " .. (item.n or 0), x + w / 2, y + h / 2, 22, 1, 1, 1, 1, 1)     -- size in dp
    return false                           -- true while it animates, to keep the frames coming
  end,
  on_tap = function(x, y, w, h, item, tx, ty)
    item.n = (item.n or 0) + 1
    ui.save()                              -- write the arrangement, so item.n is kept
  end,
  menu = function(item) return { { "Reset", function() item.n = 0; ui.save() end } } end,   -- extra menu entries
}
```

Helpers: `ui.dp(v)`, `ui.text(...)`, `ui.card(x, y, w, h)`, `ui.accent(alpha)`, `ui.clamp`, `ui.save()`, `anim.*` and the
tables `cfg`, `fx`. A widget that changes slowly (a clock, a countdown) should call `kami.wake(seconds)` for its next change
instead of returning `true` from `draw`, which draws every display frame and costs battery.

### A whole home screen of your own

A script that does not start with `--@extend` replaces the built-in home screen completely: no pages, no grid, no dock unless you
draw them. The preset `orbit` (`apps/KamiShell/assets/presets/orbit.lua`, 22 KB, the home screen of `frost-orbit.zip`) is an example of how far that goes: the apps sit on a wheel at
the edge of the screen. What a script of this kind has to bring:

- `frame(dt)` draws everything (`kami.rect`, `ring`, `line`, `icon`, `text`, ...) and returns `true` while something moves. Nothing
  else needs frames: the clock is redrawn by the shell at the turn of a minute.
- `app_fx_duration(closing)`, `app_fx(t, a)` and `app_fx_target(key)` as globals, the same as `fx.app` of the built-in script
  (the window of an app grows out of the icon it was started from; remember that icon in `kami.launch`). While an app opens,
  `kami.launched()` is the time since it was started and `kami.resumed()` the time since the home screen came back: let the screen
  move away and return with them, and hide the icon that is on its way into the window.
- the touch hooks. For a list that scrolls, `kami.vscroll_config(max, true)` gives you the finger, the fling and the bounce at the
  ends for free (`kami.vscroll()` is the position); the wheel turns that position into angles, takes over when the finger lifts and
  drives it to the nearest app with its own spring (`kami.vscroll_set`). A touch that starts somewhere special (the rail at the edge)
  is taken in `on_down` by returning `true`.
- `kami.save` / `kami.load` for what the person arranged (the dock, which side the dial is on).

A module that is only JSON can carry such a script as the value of the setting `secure/kami_shell_script` (up to 32000 characters;
every other setting of a module is limited to 200). A script that comes with the Kami Shell app is a preset instead, and the module
names it, `preset:orbit`, and may add lines of Lua after that line: `frost-orbit.zip` sets the colour of the dial with a second line,
`ACC = { 0.62, 0.83, 1.0 }`.
For writing it without a phone: `lua5.4 tools/check.lua my.lua` and the simulator `tools/sim`, which draws the real renderer into
PNG files (see "Trying a script" below).

### The script language

Only `base` (without `load`, `dofile`, `require`, `collectgarbage`), `table`, `string`, `math` and `utf8` exist: no files, no
network, no clock except the ones below (`kami.include(name)` runs a preset that comes with the app). A script gets at most
96 MB. Everything is in pixels; `kami.density()` is pixels per dp. Colours are four numbers
0 to 1 (r, g, b, a). The origin is the top left corner.

**Hooks** the script defines (all optional except `frame`):

| Function | Called |
|---|---|
| `init()` | after the script was loaded |
| `frame(dt)` | every frame; draw here; return `true` while something is animating |
| `on_down(x, y)` | a finger went down; return `true` to take the whole touch (then `on_move`, `on_drop` follow) |
| `on_move(x, y)`, `on_drop(x, y, cancelled)` | a touch that was taken, by `on_down` or `kami.begin_drag()` |
| `on_release(x, y)` | a finger went up (not for a taken touch) |
| `on_tap(x, y)` | a short touch |
| `on_long_press(x, y)` | the finger stayed for half a second; call `kami.begin_drag()` to drag something |
| `on_swipe(dir, vx, vy)` | a swipe that was not a scroll: `"up"`, `"down"`, `"left"`, `"right"`, with the speed in px/s |
| `on_home()`, `on_back()` | the home or back button was pressed while the home screen was shown |
| `on_apps_changed()` | an app was installed, removed or changed |
| `on_image(tag, uri)` | the picture chooser of `kami.pick_image(tag)` returned a picture |
| `on_menu(n)` | the choice (1 based, 0 = dismissed) from `kami.menu` |
| `on_text(str)`, `on_submit(str)` | what is typed in the text field of `kami.keyboard`, and its enter key |
| `on_two_finger(dir)` | two fingers swiped `"left"` or `"right"` (switch on with `kami.live("twofinger", 1)`) |
| `on_overview()` | the Overview button, or swipe up and hold, while freeform windows are on |
| `on_pinch(dir, scale)` | two fingers came together (`"in"`) or went apart (`"out"`) |
| `on_resume()`, `on_pause()` | the home screen came back / went out of sight |
| `on_theme()` | the system colours, dark mode or the animation speed changed |

The home screen is not restarted by the system: the script keeps running in the background and the renderer sleeps when
nothing moves. `frame(dt)` returns `true` when it wants the next frame at once; otherwise the screen is only redrawn when
something happens, when the script asked with `kami.wake`, and at the turn of every minute for clocks.

**Drawing**

| Call | |
|---|---|
| `kami.rect(x, y, w, h, radius, r, g, b, a [, soft [, rot]])` | rounded rectangle; `soft` blurs the edge by that many pixels (glows, shadows); `rot` in degrees about the centre |
| `kami.vrect(x, y, w, h, radius, r1,g1,b1,a1, r2,g2,b2,a2 [, soft [, rot]])` | the same with a gradient from top to bottom; `kami.hrect` from left to right |
| `kami.border(x, y, w, h, radius, width, r, g, b, a [, soft [, rot]])` | only the outline, `width` thick, inside the box |
| `kami.ring(cx, cy, radius, width, r, g, b, a [, start [, sweep [, soft]]])` | a circle outline or an arc (degrees, 0 at the top, clockwise); `width >= radius` fills it |
| `kami.line(x1, y1, x2, y2, width, r, g, b, a [, soft])` | a line with round ends |
| `kami.icon(i, cx, cy, size [, alpha [, rot [, radius]]])` | the icon of app `i` (1 based, sorted by name) centred at cx, cy; returns `false` while it is being made. `kami.icon_key(key, ...)` by the key of the app |
| `kami.text(str, x, y, size, r, g, b, a [, align [, weight [, maxw]]])` | `y` is the vertical middle, `align` 0 left, 1 centre, 2 right of `x`, `weight` 100 to 900, `maxw` cuts with an ellipsis; returns the width, 0 while the label is being made. The system font, and so a font module, is used. Each different text is made once as a picture: change a running number a few times a second, not on every frame. `kami.measure(str, size [, weight [, maxw]])` gives width and height without drawing |
| `kami.push(tx, ty, sx, sy, rot, px, py [, alpha])` / `kami.pop()` | everything drawn until `pop` is moved, scaled and turned (degrees) about the point px, py, and multiplied by alpha; they nest |
| `kami.image(src, x, y, w, h [, alpha [, radius [, fit]]])` | a picture or an animation (GIF, animated WebP); returns `ready, animated` (`false` while it loads; keep returning `true` from `frame` while it is animated). `src` is `"asset:img/demo.gif"` (a file in the app), `"file:/path"`, `"content://..."` (what `pick_image` gives) or `"data:image/gif;base64,..."` (inside the script, for modules). `fit` 0 fills the box and crops (default), 1 fits inside, 2 stretches |
| `kami.clip(x, y, w, h)` / `kami.clip()` | clip to a rectangle in screen pixels / switch off |

**State**

| Call | |
|---|---|
| `kami.size()`, `kami.density()`, `kami.insets()` | width and height; pixels per dp; top and bottom system bars |
| `kami.ime()` | height of the keyboard, 0 when it is not shown |
| `kami.time()` | seconds since the shell started (for animations) |
| `kami.clock()` | hour, minute, second, weekday (0 = Sunday), day, month, year, is24h, milliseconds |
| `kami.battery()` | percent, charging |
| `kami.app_count()`, `kami.app(i)`, `kami.find(key)` | number of apps; label, package and key of app `i` (the key is the component and names one launcher entry for good); the index of a key |
| `kami.defaults()` | keys of apps that suit a first dock (phone, messages, browser, camera) |
| `kami.scroll()` | page position (0.0 is the first page, 1.5 is half way between page 2 and 3), velocity, target page |
| `kami.vscroll()` | position of the vertical list in pixels, velocity, maximum |
| `kami.touch()` | down, x, y, dx, dy (from where it started), seconds held, moved too far for a tap, axis (0 not decided, 1 horizontal, 2 vertical) |
| `kami.touch_velocity()` | vx, vy of the finger in px/s |
| `kami.pinch()` | active, scale, centre x, y of a two finger pinch |
| `kami.anim_scale()` | the system's animation speed: 1 normal, 0.5 twice as fast, 0 off |
| `kami.colors()` | the system colours: `accent`, `accent2`, `accent3`, `surface`, `on_surface`, `container` (each `{ r, g, b }`) and `dark` |
| `kami.stats()`, `kami.mem()` | what the frame before cost (`fps`, `frame_ms`, `lua_ms`, `draws`, `quads`, `textures`, `tex_kb`, `lua_kb`); KB the script holds |
| `kami.launched()`, `kami.resumed()` | seconds since an app was started from here (-1 if none) / since the home screen came back |

**Actions**

| Call | |
|---|---|
| `kami.set_pages(n)`, `kami.goto_page(n, animated)` | how many pages the scroll has; go to page `n` (0 based) |
| `kami.paging(on)` | whether a horizontal drag turns the pages (switch off while something covers them) |
| `kami.spring(stiffness, damping)` | the page scroll spring (170, 0.85 is the default; damping below 1 wobbles) |
| `kami.vscroll_config(max, on)`, `kami.vscroll_set(pos)` | the length of a list and whether a vertical drag scrolls it (with fling and a bounce at the ends); jump to a position |
| `kami.begin_drag()` | take the touch that is going on: moves go to `on_move`, the release to `on_drop` |
| `kami.save(key, table)`, `kami.load(key)` | keep a table (numbers, text, booleans, tables of them) in the app's files; keys are `a-z 0-9 _`, at most 32 characters, 100 KB |
| `kami.launch(i, x, y, w, h [, radius])` | start app `i`; the box (and its corner radius) is where its window grows from |
| `kami.live(cmd, ...)` | real app windows, see the next chapter |
| `kami.wake(seconds)` | call `frame` again in that time even when nothing moves (a script that polls something slow, a second hand); the earliest of several counts |
| `kami.pick_image(tag)` | the system picture chooser; the answer comes to `on_image(tag, uri)` |
| `kami.menu(title, {labels})` | a list dialog; the answer comes to `on_menu` |
| `kami.keyboard(true, x, y, w, h, size, text, hint)` / `kami.keyboard(false)` | a text field with the keyboard over that box (draw the background yourself) |
| `kami.app_info(i)`, `kami.uninstall(i)`, `kami.web_search(text)`, `kami.open("wallpaper" or "settings")`, `kami.toast(text)` | what they say |
| `kami.notifications()`, `kami.haptic([kind])`, `kami.log(text)` | pull down the notifications; a vibration (`"tick"`, `"click"`, `"confirm"`, `"reject"`, `"drag"`, `"drop"`, or the long press one); logcat |
| `kami.shortcuts(i)`, `kami.shortcut(i, id)` | the shortcuts of app `i` (`{ id, label }`, while Kami Shell is the home app) / start one |
| `kami.wallpaper(x)` | where the pages are (0..1), for wallpapers that move with them |
| `kami.include(name)` | runs a preset of the app as part of this script |

**Trying a script.** For development, put your script on the phone as `/data/data/com.kami.shell/files/shell.lua` (it is read
again when the home screen comes back; delete it to go back), or set it directly:
`adb shell settings put secure kami_shell_script preset:cube`. A module is the same setting, written when it is switched on.
Errors are in `adb logcat -s KamiShell`, with the stack of the script.

Without a phone: `lua5.4 apps/KamiShell/tools/check.lua my.lua` plays a few minutes of taps, drags and menus against a fake
`kami` table and stops at the first error; `apps/KamiShell/tools/sim` runs the real renderer on a Linux desktop and writes
screenshots (see `apps/KamiShell/README.md`).

**Not done:** Android app widgets (the ones apps provide), work profile, icon packs, notification dots, video, a wallpaper
from the shell (the system wallpaper shows through).

## Windows in tiles: the Tiling WM module

The **Tiling WM (larp)** module that ships with the ROM is made for people who like the look of Hyprland, i3 or sway and have
no window manager on a phone. It is also the biggest example of what one module can combine:

| Part of the module | What it does here |
|---|---|
| `home_app` | Kami Shell is the home screen |
| `settings` `secure/kami_shell_script` | the `tiling` script joined with a palette: `preset:tiling+pal-gruvbox` |
| `options` **Colours** | Gruvbox dark, Catppuccin mocha, Nord, Tokyo night. A choice sets the palette of the home screen and the system colours of tiles, notifications, volume panel, sliders, back arrow, pill and Settings |
| `fonts` | a monospace font for the system, the bar and the launcher |
| `wallpaper` | a dark grid with the outline of a dwindle layout; the lock screen has a neofetch-like block |
| `accent` | Material You seed, gruvbox orange |
| `targets` | square corners everywhere, a thin pill that does not wobble, launcher speed 0.6 |
| `settings` | square quick settings tiles, animation scales at 0.6, freeform windows on |

**The home screen.** The pages are numbered **workspaces**, the apps on a workspace are **tiles** that fill it with gaps and
thin borders (the focused tile has the accent border). The **bar** on top shows the workspace numbers, `~/` and the name of
the focused tile, battery and clock.

| Gesture | Does |
|---|---|
| swipe left / right | previous / next workspace |
| swipe up | the **launcher**: a terminal-style prompt, type to filter, enter opens the first hit (or searches the web), long press a row to keep the app on this workspace |
| swipe down | notifications |
| swipe up / down that starts on the bar | system settings / the wm menu |
| tap a number in the bar | go to that workspace |
| tap a tile | open the app inside the tile |
| long press a tile and drag | drop it on another tile to swap, on a number in the bar to send it to that workspace |
| long press a tile without moving | menu: open, send to workspace, close tile, app info |
| long press the bar or an empty place | wm menu: layout (dwindle, master, grid), gaps, corners, app size, live windows, spawn, wallpaper, settings |

**Live windows.** With `global/enable_freeform_support` and `global/force_resizable_activities` on, a tap on a tile opens the
app as a real window of the tile's size, scaled to a smaller density so it lays out like on a smaller screen, and it **stays
open**. The strip at the top of the tile shows its name and an **x** that closes the window. Several tiles can hold an app at
the same time. `<>` resizes: drag it and the divider of that tile's split follows your finger. `⇄` swaps the window with the
one you used before. Double tap the name and the window becomes a normal full screen app. A tile too small for a window starts
the app full screen like a phone does. **Two fingers** swiped left or right switch the workspace, also over a window.
Swipes that start inside a window belong to the app.

**Overview.** The Overview button, and swipe up and hold, open the overview of Kami Shell: everything that runs as square tiles,
two to a row, with the last picture of each app. Tap to go to it, **x** closes it. When Kami Shell is not the home app, or
freeform windows are off, the system's own overview is used.

**What a module can change**

- *In the module* (the switch of the module): the colours, as an option.
- *In the script setting*: the table `wm`, written after the preset line: `workspaces`, `max_tiles`, `layout`, `gap`, `border`,
  `focus_border`, `round`, `bar` (height), `text`, `label`, `show_pkg`, `autokeyboard`, `live` (windows on or off), `live_min`
  (the smallest tile that gets a window, dp), `strip`, `scale` (density of the windows), `speed` (how fast tiles move),
  `spring`, `binds` (any swipe: `launcher`, `notifications`, `settings`, `menu`, `wallpaper`, `first`, `none` or a Lua
  function), and the colours `wm.c` (`{ tile, tile_hi, bar, fg, dim, border, accent, ok, warn }` in `#rrggbb`).
- *The animations*: `fx.page(o)` (the workspace that slides), `fx.icon(o, col, row, cols, rows)` (a tile while the page moves),
  `fx.app_duration(closing)` and `fx.app(t, a)` (the app window), for example
  `function fx.app_duration(closing) return 0.1 end`.
- *Glass*: the preset `glass` (join it after the palette: `preset:tiling+pal-frost+glass`) turns tiles, windows, the bar, the
  launcher prompt and the overview into translucent panes. The numbers it sets are the table `wm` too: `wm.glass` (on or off),
  `wm.pane` (`top` and `bottom` opacity of a pane, `shine` the light on its top half, `edge` its thin lit edge), `wm.alpha`
  (`tile`, `bar`, `window`, `scrim`, `overview`: the opacities of the flat look and of the layers behind the launcher and the
  overview), `wm.overview` (`"cards"` the flat grid, `"glass"` rounded glass cards with the picture rounded and the name under it)
  and `wm.ov_cols` (cards in a row, 2 or 3). The glass looks best over a soft wallpaper, because what shows through a pane is the
  wallpaper.
- *Other parts* like in any module: the font files, the wallpapers, the numbers under `targets`.
- A person using the module changes layout, gaps and corners from the wm menu; that choice wins over the module until the
  app's data is cleared.

**The `kami.live(cmd, ...)` calls.** For your own tiling script. It never waits and returns a string:

| Command | |
|---|---|
| `supported` | `"1"` when freeform windows are on and the system side is ready |
| `list` | `app,visible,focused,left,top,right,bottom;` per window, top one first |
| `launch a l t r b` | open app `a` in a window with these bounds, or move its window |
| `resize a l t r b` | move and size a window |
| `front a`, `close a` | bring to front, close |
| `density a dpi` | a smaller density: the app lays out as on a smaller screen |
| `home` | the home screen over all windows; they stay open |
| `fullscreen a` | the window becomes a normal full screen app |
| `twofinger 0/1` | report two-finger swipes, also over windows, to `on_two_finger` |
| `otasks`, `opentask id`, `rmtask id` | everything that runs (`id,app,mode,visible;`), bring to front, close |
| `focusable 0/1` | 0: touching the home screen does not take the focus, so it does not come over the windows |

**Your own overview.** The overview is Lua: any Kami Shell script can draw its own, a stack of cards, a carousel, Metro tiles.
The system calls `on_overview()`; you read what runs with `kami.live("otasks")`, draw each app's last picture with
`kami.image("task:<id>:<n>", x, y, w, h)` (change `n` to get a new picture), and use `opentask` and `rmtask` for tap and close.
A module that only appends lines to the tiling preset can change numbers and the `on_overview` function but not the drawing;
for another look the module ships its own full script as `secure/kami_shell_script`.

Written for people who want the look: this is a home screen with real windows in tiles, not a window manager. The windows do
not overlap and cannot be dragged by hand, the tiles place them.

<!-- group: Reference and sharing -->

## Knob reference

This is every resource a module can set through `targets`, with its kind, its default and what it does. The list is made from the file that ships with the ROM, so it is always complete. The export under Modules lists every resource of your build too; entries in it marked `"untested": true` use the same mechanism as the checked ones, but nobody has seen them change on a device yet.

<!-- demo: knobs -->

### Not knobs yet

These were tried and had no effect, so they are not in the list: the number of quick settings columns and
rows as resources (use the `settings` keys above), tile height and icon size, the gap between tiles, status bar clock and icon
sizes and paddings, the number of notification icons, the default tile list.

## Examples and a complete module

### Examples to start from

These ship in the ROM repository, in `vendor/kami/modules/examples`. Import one on the phone, or open its `module.json`. The Python scripts next to them build the bigger ones.

| Module | What it shows |
|---|---|
| `sounds-example.zip` | A full sound pack: every slot, synthesised bells |
| `bootanimation-example.zip` | A boot and shutdown animation |
| `serif-font-example.zip` | The system font as a module |
| `status-icons-example.zip` | Status bar icons |
| `square-quick-settings.json` | Square tiles and notification cards, nothing else |
| `tile-mosaic.json` | Tiles of different sizes in a mosaic |
| `purple-shade.json`, `deck-tight.json`, `motion.json` | One small thing each: a flat shade, a tight recents deck, the easing curves |
| `metro-tiles.zip`, `flat-settings.zip`, `plain-list.zip`, `stock-pages.zip` | Settings layouts: flat tiles, square tiles, a list, stock pages |
| `dock.zip` | The pages of Settings as a floating dock |
| `back-lab.zip`, `pill-lab.zip`, `closing-lab.zip` | The looks of the back swipe, opening and leaving a page; the gesture pill and the speed; an app closing into its icon (speed and bounce) |
| `aurora.zip`, `deep-sea.zip`, `lava-lamp.zip` | Moving pictures everywhere: tiles, shade, panel, sliders, the card of Settings |
| `neon-dusk.zip`, `synthwave.zip` | Whole looks: font, colours, shapes, icons, a neon battery |
| `night-snow.zip` | A minimal night theme in frosted glass and ice blue that uses nearly every part: wallpaper and lock screen, a thin font, snow that falls in the shade, glass sheets and pages, calm animations, and four ways for a switch to turn (a moon that becomes a snowflake, jelly, spin, drop). Built by `make-night-snow.py` with `glasslib.py` |
| `frost-orbit.zip` | A whole home screen written as one script (needs the Kami Shell module, 1.2 or newer): the apps sit on a glass dial at the edge of the screen and are turned with the thumb, with a letter rail, search, a dock and its own app animation; the system around it is glass, with a monospace font. Built by `make-frost-orbit.py` with `glasslib.py`; the script is the preset `orbit` of Kami Shell |
| `make-kami-shell.py`, `make-app-module.py`, `tiling-larp.zip` | Kami Shell as an app module (build it with the APK), any APK as a module, and the tiling window manager look (needs the Kami Shell module). These are not in the ROM, they are for the module store |

### A complete module

A zip with options, a font, wallpapers, an accent and a script, put together from what is above:

```
nord-tiles.zip
 ├─ module.json
 ├─ fonts/Mono-Regular.ttf
 └─ wall/home.jpg, wall/lock.jpg
```

```json
{
  "format": "kamios-module", "version": 1,
  "id": "nord-tiles", "name": "Nord tiles", "author": "me",
  "description": "Square, cold, monospace",
  "restart": true,
  "home_app": "com.kami.shell",
  "accent": "#88C0D0",
  "accent_style": "TONAL_SPOT",
  "fonts": { "regular": "fonts/Mono-Regular.ttf" },
  "wallpaper": { "home": "wall/home.jpg", "lock": "wall/lock.jpg" },
  "targets": {
    "com.android.systemui": {
      "dimen/common_tile_default_active_tile_corner_radius": "0dp",
      "dimen/common_tile_default_inactive_tile_corner_radius": "0dp",
      "dimen/notification_corner_radius": "0dp",
      "dimen/qs_corner_radius": "0dp"
    },
    "com.android.launcher3": { "dimen/kami_launch_duration_scale": 0.6 }
  },
  "settings": {
    "system/qs_tile_shape": 3,
    "global/window_animation_scale": 0.6,
    "global/transition_animation_scale": 0.6,
    "global/animator_duration_scale": 0.6,
    "global/enable_freeform_support": 1,
    "global/force_resizable_activities": 1
  },
  "options": {
    "look": {
      "title": "Home screen",
      "default": "tiling",
      "choices": {
        "tiling": { "title": "Tiling", "settings": { "secure/kami_shell_script": "preset:tiling+pal-nord\nwm.gap = 6" } },
        "cube":   { "title": "Cube",   "settings": { "secure/kami_shell_script": "preset:cube" } }
      }
    }
  }
}
```

## The module store

Modules that other people made live in the module store. Open **Settings > KamiOS > Darkmoon Theme Engine > Module store** to browse them, and read what is in them before you switch one on.

### Using it

- A tap downloads a module and puts it in **Your modules**, switched off. You switch it on there, with the same warnings as for a module you imported yourself.
- **Updates.** When you open the store it checks the modules you have: those with a newer version in the store are under the **Updates** chip, with an **Update all** row. A module that is switched on stays on when it is updated (and an app that comes with it is updated in place, its data stays if the app names `keep_data`), so your changes are not taken away. The exception is a module that now asks for the warning of an advanced module and did not before: that one is switched off until you read the warning. A module without a `module_version` is compared with the version it had in the store when you downloaded it, so bump the version of your module with every release.
- Nothing is fetched until you open the store. Only https is used, the sizes are limited, and what comes back is data: a module from the store can do no more than any module you import by hand.
- The store has a search box (name, author, description and category) and a row of categories to filter by; only the categories that have a module are shown, and a **Updates** chip appears when a module you have is newer in the store. A module that names no category (yet) is listed under **Other**.
- An entry has a name, author, version, description, a `category`, a thumbnail and screenshots (a tap on a screenshot opens it full screen). The `module_version` of a module is compared with the one on the phone, so the store offers an update when yours is newer.

### Sharing your own

The store is a public GitHub repository, [`kamiosmodules/module-store`](https://github.com/kamiosmodules/module-store), with a small website. Adding or updating a module is a pull request and needs no update of the ROM.

1. Fork the repository and add a folder `modules/<id>/`. The folder name has to be **exactly** the `id` in your `module.json`.
2. Put `module.json` at the top of that folder, with the pictures, fonts and sounds it names next to it. Fill `name`, `author` and a real one-line `description`, a `module_version` and a `category` (see the table of fields above), so people find the module under the right heading.
3. Optional, for the store only (they are left out of the download): `thumbnail.png` (a small square icon) and a `screenshots/` folder with PNG, JPG, WebP or GIF files, shown in number order.
4. Open a pull request. A maintainer looks at it; once it is merged, a GitHub Action zips the modules, publishes them and rewrites `modules.json`, so the module is in the store 1 to 2 minutes later.

### Be careful with what you install

> [!warn]
> The maintainers look at pull requests, but that is not a security audit. A module can still restyle your system UI, set a launcher or change your wallpaper. Read what a module changes before you switch it on. Switching one on shows the apps it changes and a warning, every time.

## Safety, recovery and limits

### Safety

A module cannot run code, other than a Kami Shell script in its sandbox, and it can only set what the knob list, the settings of the phone and the overlay rules allow. Modules you import by hand are not reviewed by anyone, and modules from the store are only looked at, not audited. Read a module before you switch it on, and do not install every module you find on the internet.

### Recovery

A module that breaks the system UI or the launcher is not permanent:

- **Modules > Turn all modules off** puts everything back.
- **Safe mode turns every module off.** Hold **volume down** after the splash screen of the phone while it starts (or, from a
  computer, `adb root; adb shell setprop persist.sys.safemode 1; adb reboot`). The overlays of the modules are removed before
  the phone is unlocked, so a module that makes system UI crash again and again cannot keep the lock screen away; once the
  phone is unlocked the list of modules is cleared and the settings, wallpaper, sounds and home app are put back. A preview in
  Module Studio ends with a restart of the phone as well.
- If Settings is out of reach (a crash loop of the system UI): `adb shell settings delete system kami_modules_enabled`, then
  `adb shell cmd overlay list | grep com.android.settings:kami_` and `adb shell cmd overlay disable --user 0 <the names>`.
- If a Kami Shell script misbehaves: `adb shell settings delete secure kami_shell_script`, or choose another home app.

### Limits and what does not work

| | |
|---|---|
| Pictures | 2560 x 2560 px, 3 MB per file, 200 files and 32 MB per zip |
| Fonts | `.ttf`/`.otf`, 10 MB each |
| Sounds | `.ogg`, `.oga`, `.wav`, `.mp3`, `.flac`, `.m4a`; 15 MB per file, 64 MB per zip with sounds, the length and size per slot are in the table in Sounds |
| Launcher icons | up to 512 px |
| Options | 8 per module, 16 choices each |
| Axes per font slot | 4 |
| Script | 100 KB per `kami.save` table; a call longer than 120 ms is stopped |

- A module cannot run code, other than the Kami Shell script.
- It cannot set anything that is not in the knob list (`targets`), is not a setting of the phone (`settings`), or is text or a
  component name (`overlays`).
- It cannot change the Misc page.
- It cannot restyle the system's own recents screen beyond the knobs above. With Kami Shell as the home app the overview can be
  replaced by one of your own.
- Blur inside a single tile or a slider fill is not possible.
- Apps that draw their colours in code, or that are not installed, do not change.
- Colours that are system colours are taken when the module is switched on and do not follow a new wallpaper until you switch it
  off and on.
- Some things are read only when the system UI starts. Restart it from the Modules page.
