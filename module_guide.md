# Making KamiOS modules

A module changes how KamiOS looks and behaves **without a build, an install or a signature**. It is one JSON file, or a zip
that holds that file together with the pictures, fonts and wallpapers it names. You import it on the phone, switch it on, and
switch it off again to get everything back as it was.

This guide is the whole manual for people who want to write their own. The modules that ship with the ROM are made the same
way, from the same parts.

KamiOS is not public yet, so some of the examples here cannot be tried until the first builds are out. Everything below was
written from the working system. Where something has not been looked at on a real phone, the text says so.

## Contents

1. [What a module can do](#what-a-module-can-do)
2. [Your first module](#your-first-module)
3. [The file](#the-file)
4. [Targets: the knobs](#targets-the-knobs)
5. [Options: choices inside a module](#options-choices-inside-a-module)
6. [Overlays for any app](#overlays-for-any-app)
7. [Zip modules and pictures](#zip-modules-and-pictures)
8. [Fonts](#fonts)
9. [Emoji](#emoji)
10. [Sounds](#sounds)
11. [Boot and shutdown animation](#boot-and-shutdown-animation)
12. [Settings layout: how Settings looks and moves](#settings-layout-how-settings-looks-and-moves)
13. [Wallpaper, home app, accent, launcher icons](#wallpaper-home-app-accent-launcher-icons)
14. [Settings: layout, blur, speed](#settings-layout-blur-speed)
15. [Moving pictures](#moving-pictures)
16. [Knob reference](#knob-reference)
17. [Kami Shell: a home screen in Lua](#kami-shell-a-home-screen-in-lua)
18. [Windows in tiles: the Tiling WM module](#windows-in-tiles-the-tiling-wm-module)
19. [A complete module](#a-complete-module)
20. [The module store](#the-module-store)
21. [Safety and recovery](#safety-and-recovery)
22. [Limits and what does not work](#limits-and-what-does-not-work)

## What a module can do

A module works in two ways, and one module can use both:

1. **Resources.** Colours, sizes, corner radii, shapes and pictures that the quick settings, the shade, the volume panel,
   notifications, the launcher, Settings and the system read (`targets`). With `overlays` the same works for any other
   app, for the resource types that are safe.
2. **Settings.** Options that already exist on the phone (quick settings layout, blur, animation speed, the Kami Shell script,
   freeform windows, ...) that the module writes while it is on (`settings`). The old values come back when it is switched off.

On top of that a module can carry fonts, system sounds, a boot animation, wallpapers, an accent colour, launcher icons, a different home app, and a script for
the Kami Shell home screen.

A module cannot run code of its own. The only code it can bring is a Lua script for Kami Shell (see below), which runs in a
sandbox with no files and no network.

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
| Wallpaper and lock screen | `wallpaper` |
| Material You accent colour and style | `accent`, `accent_style` |
| Home app | `home_app` |
| Icons of apps in the launcher | `launcher_icons` |
| Quick settings layout, blur, gradients, animation speed | `settings` |
| A different home screen, even a tiling window manager | `settings` with the Kami Shell script |
| Choices for the user | `options` |

## Your first module

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

## The file

| Field | |
|---|---|
| `format` | always `"kamios-module"` |
| `version` | always `1` |
| `id` | `a-z`, `0-9`, `-` and `_`. Importing a file with the id of a module you already have replaces it. The ids of the modules that ship with the ROM cannot be used. |
| `name`, `author`, `description` | shown in the list |
| `module_version` | optional, like `1.2` or `2.0-beta`. Shown in the lists, and compared with the version in the module store to offer an update. `version` above is the version of the file format, not of your module. |
| `category` | optional: `theme`, `launcher`, `tweak`, `sounds`, `bootanimation`, `emoji`, `fonts`, `wallpaper` or `icons`. Where the module is listed. Without it the phone works it out from what the module sets: only sounds (or only a boot animation, emoji, fonts, a wallpaper, launcher icons) gets its own heading; a home app without fonts or a wallpaper is a launcher; a module that mixes a style part (font, wallpaper, accent, icons, sounds, boot animation) with anything else, or reaches into three or more apps, is a theme; the rest are tweaks. |
| `group` | optional. Modules of the same group switch each other off. Use it for separate modules that exclude each other; for the choices inside one module use `options`. |
| `restart` | optional, `true`. System UI is started again when the module is switched, for resources that are only read at start. |
| `targets` | knob resources, per package, see below |
| `options` | choices for the user |
| `overlays` | resources of any app |
| `bootanimation`, `shutdownanimation`, `fonts`, `wallpaper`, `home_app`, `accent`, `accent_style`, `launcher_icons` | see the sections below |
| `settings` | options of the phone to write while the module is on |

**Values** by kind:

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

## Targets: the knobs

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

## Options: choices inside a module

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

## Overlays for any app

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
- Settings can be overlaid too. If a module makes the phone unusable, see [Safety and recovery](#safety-and-recovery).
- Nobody reviews modules. Switching one on shows the apps it changes and a warning, every time.

## Zip modules and pictures

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

## Fonts

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

## Emoji

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

A module can replace the sounds of the system. It works as a **sound pack** (a module with only `sounds`) or as a part of a
theme: `sounds` sits in the same file as colours, fonts and wallpapers.

```json
"sounds": {
  "ringtone": { "file": "sounds/ring.ogg", "title": "Glass ringtone" },
  "notification": "sounds/notify.ogg",
  "touch": "sounds/tick.wav",
  "charging": "sounds/charge.ogg"
}
```

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

## Settings layout: how Settings looks and moves

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

### main: the first screen

| Key | Meaning |
|---|---|
| `hero` | `false` takes the card with the name of the system away |
| `columns` | 1, 2 or 3 tiles in a row (the tiles that have no `size` share the row) |
| `tiles` | a list. The tiles named here come first, in this order; the others follow in the usual order |
| `text` | the texts of the tiles: `title_size` (10 to 28 sp), `title_lines` (1 to 3), `summary_size` (9 to 20 sp), `summary_lines` (0 to 3; 0 shows no summary line). With 3 tiles in a row the titles are 14 sp unless you say otherwise |

A tile has `page` and any of: `size` (`third`, `half` or `full` of the width; a tile with a size starts a row of its own),
`color` and `text_color` (`#RRGGBB` or `#AARRGGBB`; the symbol takes the text colour), `hide` (`true` takes the tile off the screen).

Pages that are tiles: `network`, `connected_devices`, `sound`, `display`, `themes` (the Theme Engine), `notifications`, `modes`,
`wallpaper`, `kamios` (the KamiOS settings), `battery`, `storage`, `apps`, `system`.

The pages that Android lists under them are tiles of the same grid, so the whole main screen looks uniform: `about_device`,
`safety_center`, `security`, `privacy`, `location`, `accounts` (passwords and passkeys), `accounts_and_backup`, `supervision`,
`emergency`, `accessibility`, `support`. They follow the others in the usual order, and `size`, `color`, `text_color` and `hide`
work on them like on any tile. Which of them exist depends on the phone: where Android has Safety Center, the tile called "Security
and privacy" is `safety_center` and `security` is not on the screen. Colouring both is harmless.

**`themes` and `kamios` cannot be hidden**: they are the way
back to the modules, so a layout can never lock you out. Corner radius, gap and tile height are `targets` as before
(`dimen/kami_bento_radius`, `kami_bento_gap`, `kami_bento_tile_height`).

### pages: the sub pages

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

## Wallpaper, home app, accent, launcher icons

**Wallpaper and lock screen**

```json
"wallpaper": "wallpaper.jpg"
"wallpaper": { "home": "wallpaper.jpg", "lock": "lock.jpg" }
```

A string sets both screens, an object sets the home screen and the lock screen on their own (one of them or both). The pictures
are in the zip (PNG, WebP, JPG, up to 2560 px and 3 MB; an animated one shows its first frame). Before a module sets a
screen, Settings keeps what is there (a copy of the picture, the live wallpaper that was running, or "the lock screen shows
the home wallpaper"). When no module sets that screen any more it is given back, unless you picked another wallpaper in the
meantime. If two modules set the same screen, the last one switched on wins.

**Home app**

`"home_app": "com.example.launcher"` makes that launcher the home app while the module is on (nothing happens when it is not
installed). The app that was home before comes back when the module is switched off, unless you picked another in the
meantime. KamiOS ships two extra home screens you can name here: `com.kami.shell` (the scripted one, see below) and
`com.metro.launcher` (a Windows Phone start screen with live tiles).

**Accent colour (Material You)**

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

**Launcher icons**

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

## Settings: layout, blur, speed

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

**Quick settings layout**

| Key | Value |
|---|---|
| `system/qs_tiles_columns`, `system/qs_tiles_columns_landscape` | number of columns |
| `system/qs_tiles_rows`, `system/qs_tiles_rows_landscape` | rows of the open panel |
| `system/qs_tile_shape` | 0 dynamic, 1 smooth rounded square, 2 rounded square, 3 square, 4 circle |
| `system/qs_panel_style` | 0 card, 1 classic |
| `system/qs_tile_label_hide` | `true` hides the labels of the small tiles |

`system/qs_tile_icon_shape` is not available to modules. To round or square the icon background use the
`common_tile_default_*_icon_corner_radius` knobs.

**Blur and tones**

| Key | Value |
|---|---|
| `system/kami_blur_strength` | 10 to 150, percent of the normal blur (100 is the default). Scales every window blur of the system UI: shade, lock screen, bouncer. Live. |
| `system/kami_shade_dual_tone` | `true` (default) the stock shade, notifications on their own scrim; `false` one tone and one blur for quick settings and notifications |
| `system/kami_shade_qs_tone` | 0 to 100 (default 0), an extra tone behind the quick settings while the dual tone shade is on |
| `system/kami_qs_dual_tone` | `true` (default) tiles with two targets (Wi-Fi, Bluetooth, mobile data) draw the icon in its own colour; `false` draws them in one colour |

**Gradients**

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

**Speed**

For every animation of the system a module can set the three animation scales of the developer options:
`global/window_animation_scale`, `global/transition_animation_scale`, `global/animator_duration_scale`. 1 is stock, 0.5 twice
as fast, 0 none. The knob `dimen/kami_launch_duration_scale` (launcher) makes only the opening of apps from the launcher
faster or slower (0.6 faster, 1.5 slower).

**Easing curves and times of the system animations**

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

**Freeform windows**

`global/enable_freeform_support` and `global/force_resizable_activities`, both set to `1`, let apps open as real windows. The
Tiling WM module uses this, see below.

## Moving pictures

Many surfaces take a picture, and nearly all of them take an animated GIF or WebP too. An animation plays while its surface is
on screen and stops when it is not. Some rules for all of them:

- Keep animations small: a few hundred pixels, a few dozen frames. A tile decodes its own copy, and an animation keeps
  drawing, which costs battery. Use them for things you look at, not for a long reading page.
- A picture **covers** its surface (centred, cropped, like a wallpaper). A small wide image does for a tile.
- Give a picture some **alpha** to let the colour behind it, or the blur, show through.
- Android blurs a whole window, not a part of one. Blur inside a single tile or slider is not possible; a translucent colour
  on it lets the blurred shade show through.

**The page behind Settings** (`com.android.settings`)

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

**Quick settings tiles, the shade, the volume panel** (`com.android.systemui`)

| Resource | Where the picture is |
|---|---|
| `drawable/kami_qs_tile_active_image` | behind the icon and text of every tile that is on, over its colour |
| `drawable/kami_qs_tile_inactive_image` | the same for the tiles that are off |
| `drawable/kami_shade_background` | over the dim layer behind the whole shade; it fades in and out as the shade opens and is as strong as the dim layer |
| `drawable/kami_volume_dialog_image` | over the background of the volume panel, cut to its rounded corners |

**Pictures for single tiles.** For a tile of its own there are eight more slots of each:
`kami_qs_tile_active_image_1` to `_8` (tile on) and `kami_qs_tile_inactive_image_1` to `_8` (tile off). The string
`string/kami_qs_tile_picture_map` says which tile uses which slot: `"internet:1,bt:2,flashlight:3"` (the tile name, a colon,
the slot number). A tile that is not named, or whose slot is empty, keeps the picture for all tiles. The names are the
ones quick settings uses: `internet`, `bt`, `cell`, `airplane`, `flashlight`, `nfc`, `cast`, `hotspot`, `location`,
`rotation`, `dnd`, `battery`, `saver`, `inversion`, `night`, and so on. A tile of an app is `custom(package/Class)`.

**Notification cards.** `color/kami_notification_bg` replaces the card background (day and night values work, give it some
alpha to see the shade through). `drawable/kami_notification_image` is drawn over it, cut to the corners of the card
(`notification_corner_radius` still sets them). Cards that an app colours (a call, a music player) keep the app's colour and
get no picture. The text colour is not a knob: it follows the light or dark theme. Give a light colour and picture for day
and a dark one for night.

**Slider fills.** `drawable/kami_brightness_slider_image` fills the active part of the brightness bar in quick settings;
`drawable/kami_volume_slider_image` the active part of the volume sliders (panel and quick settings). The picture is clipped
to the filled part and its rounded shape, and the fill colour is dropped while a picture is set. A translucent colour works
too: the colour knobs of the sliders take alpha (`#80ff2020`).

**Status bar icons as GIFs.** Every `stat_sys_*` knob takes an animated GIF or WebP; it plays while the icon is shown.

**The battery.** Pictures replace the battery everywhere (status bar, lock screen, shade header) as soon as a frame or a fill
is set. With both empty the stock battery is back.

| Resource | What |
|---|---|
| `drawable/kami_battery_frame` | the outline, always drawn |
| `drawable/kami_battery_fill` | the inside, shown from the empty side up to the charge level |
| `drawable/kami_battery_charging` | a picture over both while the phone charges (a bolt) |
| `integer/kami_battery_fill_direction` | `0` fills from the left, `1` upwards (a standing battery) |

Make them **white with transparency**: the status bar tints them (charging green, red when low). They are drawn at the same
size, as large as fits the status bar, so give them the same canvas. The percentage text and the battery saver tile are not
part of this.

**The back gesture arrow.** The arrow that follows your finger when you swipe back from the screen edge:
`color/kami_back_arrow` (the arrow), `color/kami_back_arrow_bg` (the round shape behind it), `dimen/navigation_edge_arrow_thickness`
(the line). The shape is `integer/config_backGestureArrowMode` (0 the stock line arrow, 1 a filled arrow, 2 your own) with
`string/config_backGestureArrowPathData` for mode 2: SVG path data in a box where x runs from 0 (the tip) towards the screen
edge and y from -1 to 1. The stock chevron is `M 1,-1 L 0,0 L 1,1`; add a tail with `M 0,0 L 2,0`. The other edge mirrors
it. A path that cannot be read falls back to the chevron. The colours are read when the panel is set up, so restart the
system UI.

**The back swipe animation.** What the two screens do when you swipe back from the edge, between two apps or two screens of
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

**Going into a screen and leaving it.** `string/kami_open_style` is how a screen of an app comes in when you open it (a sub page of
Settings, the details of something), `string/kami_close_style` how it goes when the app finishes it (the arrow in the top bar, the
back button); `integer/kami_transition_duration` is the length in milliseconds. They take the same names as the back swipe
(`stock`, `off`, `fade`, `zoom`, `flip`, `book`, `spin`, `glitch`). Leaving plays the same poses as the back swipe; going in has
looks of its own, because the new screen is on top of the old one: it zooms in, lands like a page from the right edge, or is
thrown in from the side. Opening an app (a new task), dialogs and screens that bring an animation of their own keep their
animation. The picture over the back swipe is not drawn here.
`examples/make-back-lab.py` builds a module with the looks of the back swipe, of opening a page and of leaving a page as three
separate choices, and a glitch animation over the swipe.

**The gesture pill** (the bar at the bottom that you swipe up from), resources of `com.android.launcher3`:

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

## Knob reference

This is the list of groups a module can set through `targets`. The export under Modules lists every resource of your build
with its kind and its default; entries in it marked `"untested": true` use the same mechanism as the checked ones, but nobody
has seen them change on a device yet.

**Quick settings** (`com.android.systemui`)

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

**Tile sizes**: `string/kami_qs_tile_layout` gives tiles a size of their own, as a list like
`internet:2x1,flashlight:1x2,dnd:2x2`: the name of the tile, a colon, the columns it covers, an `x` and the rows it covers (1 to
3). The names are the ones of the tile pictures below (`internet`, `bt`, `flashlight`, `dnd`, ...). A tile of one column shows
only its symbol, wider ones show the label too, and a tile that covers several rows is centred in all of them.

Join tiles with a plus to put several of them in one cell: `dnd+flashlight:2x2` is one big cell with Do Not Disturb above the
flashlight (in a cell of one row they sit side by side). Each keeps its own switch.

The tiles keep their order and each cell goes to the first free place from the top left, so a tall tile leaves a gap beside it
that the small tiles after it fill. A tile that is not in the list keeps its stock size, and an empty list keeps the stock grid.
The `tile-mosaic.json` example is made for four columns. Only the panel itself changes: the edit screen still shows the stock grid.

Tile symbols: the `drawable/qs_<name>_icon_on` and `_off` knobs, with the names `airplane`, `flashlight`, `dnd`, `bluetooth`,
`location`, `auto_rotate`, `battery_saver`, `hotspot`, `nightlight`, `invert_colors`, `light_dark_theme`, `data_saver`. White
PNGs, tinted by the tile, scaled to 24 dp high. They do not animate (the originals are animated vectors). Seen changing:
airplane, auto rotate, flashlight and the Bluetooth symbol of a tile that is off. The others are untested.

**Shade** (`com.android.systemui`)

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

**Status bar icons** (`com.android.systemui`, kind drawable): `stat_sys_airplane_mode`, `stat_sys_alarm`,
`stat_sys_ringer_vibrate`, `stat_sys_ringer_silent`, `stat_sys_data_saver`, `stat_sys_nfc` (all seen changing),
`stat_sys_hotspot`, `stat_sys_data_bluetooth_connected`, `stat_sys_cast`, `stat_sys_headset`, `stat_sys_vpn_ic`,
`stat_sys_rotate_portrait` (same mechanism, not seen yet). Not knobs: the do-not-disturb icon (it comes from the active mode),
Wi-Fi and mobile signal (several states and levels), the Bluetooth icons with a battery level (ten variants).

**Volume panel** (`com.android.systemui`)

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

The width of the slider cannot be changed: the track is drawn with its own size. Icons of the panel (`drawable`, scaled to 24
dp high, white shapes; the panel may tint them): `ic_volume_media`, `ic_volume_media_low`, `ic_volume_media_mute`,
`ic_volume_ringer`, `ic_volume_ringer_mute`, `ic_volume_ringer_vibrate`, `ic_mobile_vibrate`, `ic_ring_volume`,
`ic_ring_volume_off`, `ic_volume_alarm_mute`, `ic_alarm`, `ic_volume_system`, `ic_volume_system_mute`,
`ic_notifications_active`, `ic_notifications_off`, `ic_tuner`, `ic_volume_odi_captions`, `ic_music_note`. `ic_volume_media`
and `ic_mobile_vibrate` have been seen changing.

**Lock screen shortcuts** (`com.android.systemui`): the two buttons at the bottom corners (flashlight, camera, wallet and the
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

**Brightness bar** (`com.android.systemui`): `color/kami_brightness_slider_active` (filled part and thumb),
`color/kami_brightness_slider_inactive` (empty part). The shape is `integer/kami_slider_shape` or the setting
`system/qs_brightness_slider_shape`.

**Recents** (`com.android.launcher3`). These tune the stack of cards. They only act while "Stacked cards" is on in the
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

**Settings main screen** (`com.android.settings`, the KamiOS look: a card, tiles, a list; with the KamiOS style switch off the
stock look returns)

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
| `color/kami_page_bg`, `drawable/kami_page_background` | | The page behind, see "Moving pictures" |

With these a flat, square Settings is a module, not a build.

**Shade clock** (`com.android.systemui`): the clock and the date above the quick settings. A size of 0 and a fully transparent
colour keep the look of the theme.

| Resource | Kind | Default | What |
|---|---|---|---|
| `dimen/kami_shade_clock_size`, `dimen/kami_shade_date_size` | dimension | 0sp | Text size of the clock and of the date |
| `color/kami_shade_clock_color`, `color/kami_shade_date_color` | color | transparent | Their colours |
| `dimen/kami_shade_clock_offset_x`, `..._offset_y`, `dimen/kami_shade_date_offset_x`, `..._offset_y` | dimension | 0dp | Move them; negative is left or up |
| `string/kami_shade_clock_digits` | string | empty | One entry for every digit from the left (hour tens, hour ones, minute tens, minute ones), separated by commas; an entry is `scale/colour/lift` and any part may be empty: `1.3/#FF5CC8/-4,1/#FFFFFF/0,,` makes the first digit bigger, pink and 4dp lower and the second white |
| `dimen/kami_shade_clock_expanded_scale` | float | 0 | How much bigger the clock gets when the quick settings are open (1 to 4). 0 keeps the size the clock has in the stock theme, whatever size you gave it, so a big clock does not run into the date |

**Unlock and screen on** (`com.android.systemui`): how the lock screen goes away and comes back.

| Resource | Kind | Default | What |
|---|---|---|---|
| `integer/kami_unlock_duration` | int | 0 | Length of the unlock animation in milliseconds; 0 keeps the stock 300 |
| `dimen/kami_unlock_start_scale` | float | 0.95 | How big the screen behind the lock screen is when unlocking starts, 1 is full size: 1.3 starts big and shrinks into place, 0.5 grows from half |
| `dimen/kami_unlock_translation_y`, `dimen/kami_unlock_translation_x` | float | 0.05, 0 | Where it starts, as a part of the screen height or width (negative is up or left) |
| `dimen/kami_unlock_rotation` | float | 0 | Degrees it is turned at the start; it turns back to 0 |
| `dimen/kami_unlock_pivot_y` | float | 0.66 | The height it grows and turns around, 0 top to 1 bottom |
| `integer/kami_wake_style` | int | 0 | How the lock screen comes in when the screen turns on: 0 stock, 1 starts big and settles, 2 starts small and grows, 3 rises from below, 4 falls in with a bounce, 5 turns in, 6 flips like a card |
| `integer/kami_wake_duration` | int | 350 | Length of it in milliseconds (80 to 2000) |

**Screen off effects** are not a knob but a setting: `system/screen_off_animation` takes 0 (fade), 1 (CRT), 2 (scale) and, with the
KamiOS display service, 10 vortex, 11 dissolve into blocks, 12 ripple, 13 blinds, 14 glitch, 15 warp. The effects with a shader
of their own (10 to 15) need a build that has them; the other builds treat an unknown value as the fade.

**Bottom sheets and the expanded volume panel** (`com.android.systemui`): tapping the settings icon under the volume bar opens a
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

**Settings switches and sliders** (`com.android.settings`): the switches and sliders of the Settings pages, with the KamiOS style on.
A fully transparent colour and a transparent picture keep the theme.

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

**Not knobs yet.** These were tried and had no effect, so they are not in the list: the number of quick settings columns and
rows as resources (use the `settings` keys above), tile height and icon size, the gap between tiles, status bar clock and icon
sizes and paddings, the number of notification icons, the default tile list.

## Kami Shell: a home screen in Lua

Kami Shell is an optional home screen for KamiOS. It is drawn by a small renderer and the look, the arrangement of the icons
and every animation are a Lua script that a module can replace. You can switch it on as a module (home app
`com.kami.shell`) or choose it under Settings > Apps > Default apps > Home app. It keeps the gestures and the recents screen
of the system launcher.

The built-in script is a normal home screen: pages you arrange by long press and drag, folders, widgets (clock, analog
clock, date, battery, search bar, note, stopwatch, counter, year progress), an app drawer with a letter rail and search, a
swipe down for notifications.

### Which script runs

A module sets it with the setting `secure/kami_shell_script`:

- `preset:<name>`: a script that ships with the app. `preset:a+b` loads several one after the other. Lines after the first
  line are Lua that runs after the presets, so a module can change a number without a script of its own:

  ```
  preset:tiling+pal-nord
  wm.gap = 10
  ```

- Or the whole Lua script as the text of the setting.

Presets: `cube`, `wave`, `fan`, `grid-big`, `minimal`, `widgets-demo` (change the pages and icons only), and `tiling` with the
palettes `pal-gruvbox`, `pal-catppuccin`, `pal-nord`, `pal-tokyo` (a whole home screen, see the next chapter).

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

`cfg` holds the columns, icon size, label size, spring, how dark the wallpaper is dimmed, accent, glass colour, whether the
first page starts with clock and search, the dock size and the most pages.

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

Helpers: `ui.dp(v)`, `ui.text(...)`, `ui.card(x, y, w, h)`, `ui.clamp`, `ui.save()` and the tables `cfg`, `fx`.

### The script language

Only `base` (without `load`, `dofile`, `require`, `collectgarbage`), `table`, `string`, `math` and `utf8` exist: no files, no
network, no clock except the ones below. Everything is in pixels; `kami.density()` is pixels per dp. Colours are four numbers
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

The home screen is not restarted by the system: the script keeps running in the background and the renderer sleeps when
nothing moves. `frame(dt)` returns `true` when it wants the next frame at once; otherwise the screen is only redrawn when
something happens, and every 10 seconds for the clock.

**Drawing**

| Call | |
|---|---|
| `kami.rect(x, y, w, h, radius, r, g, b, a [, soft [, rot]])` | rounded rectangle; `soft` blurs the edge by that many pixels (glows, shadows); `rot` in degrees about the centre |
| `kami.vrect(x, y, w, h, radius, r1,g1,b1,a1, r2,g2,b2,a2 [, soft [, rot]])` | the same with a gradient from top to bottom |
| `kami.icon(i, cx, cy, size [, alpha [, rot [, radius]]])` | the icon of app `i` (1 based, sorted by name) centred at cx, cy; returns `false` while it is being made |
| `kami.text(str, x, y, size, r, g, b, a [, align [, weight [, maxw]]])` | `y` is the vertical middle, `align` 0 left, 1 centre, 2 right of `x`, `weight` 100 to 900, `maxw` cuts with an ellipsis; returns the width, 0 while the label is being made. The system font, and so a font module, is used |
| `kami.push(tx, ty, sx, sy, rot, px, py [, alpha])` / `kami.pop()` | everything drawn until `pop` is moved, scaled and turned (degrees) about the point px, py, and multiplied by alpha; they nest |
| `kami.image(src, x, y, w, h [, alpha [, radius [, fit]]])` | a picture or an animation (GIF, animated WebP); returns `ready, animated` (`false` while it loads; keep returning `true` from `frame` while it is animated). `src` is `"asset:img/demo.gif"` (a file in the app), `"file:/path"`, `"content://..."` (what `pick_image` gives) or `"data:image/gif;base64,..."` (inside the script, for modules). `fit` 0 fills the box and crops (default), 1 fits inside, 2 stretches |
| `kami.clip(x, y, w, h)` / `kami.clip()` | clip to a rectangle in screen pixels / switch off |

**State**

| Call | |
|---|---|
| `kami.size()`, `kami.density()`, `kami.insets()` | width and height; pixels per dp; top and bottom system bars |
| `kami.ime()` | height of the keyboard, 0 when it is not shown |
| `kami.time()` | seconds since the shell started (for animations) |
| `kami.clock()` | hour, minute, second, weekday (0 = Sunday), day, month, year, is24h |
| `kami.battery()` | percent, charging |
| `kami.app_count()`, `kami.app(i)` | number of apps; label, package and key of app `i` (the key is the component and names one launcher entry for good) |
| `kami.defaults()` | keys of apps that suit a first dock (phone, messages, browser, camera) |
| `kami.scroll()` | page position (0.0 is the first page, 1.5 is half way between page 2 and 3), velocity, target page |
| `kami.vscroll()` | position of the vertical list in pixels, velocity, maximum |
| `kami.touch()` | down, x, y, dx, dy (from where it started), seconds held, moved too far for a tap, axis (0 not decided, 1 horizontal, 2 vertical) |
| `kami.touch_velocity()` | vx, vy of the finger in px/s |
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
| `kami.wake(seconds)` | call `frame` again in that time even when nothing moves (for a script that polls something slow) |
| `kami.pick_image(tag)` | the system picture chooser; the answer comes to `on_image(tag, uri)` |
| `kami.menu(title, {labels})` | a list dialog; the answer comes to `on_menu` |
| `kami.keyboard(true, x, y, w, h, size, text, hint)` / `kami.keyboard(false)` | a text field with the keyboard over that box (draw the background yourself) |
| `kami.app_info(i)`, `kami.uninstall(i)`, `kami.web_search(text)`, `kami.open("wallpaper" or "settings")`, `kami.toast(text)` | what they say |
| `kami.notifications()`, `kami.haptic()`, `kami.log(text)` | pull down the notifications, a tick, logcat |

**Trying a script.** For development, put your script on the phone as `/data/data/com.kami.shell/files/shell.lua` (it is read
again when the home screen comes back; delete it to go back), or set it directly:
`adb shell settings put secure kami_shell_script preset:cube`. A module is the same setting, written when it is switched on.

**Not done:** Android app widgets (the ones apps provide), work profile, icon packs and shortcuts from app menus, video, a
wallpaper from the shell (the system wallpaper shows through).

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

## A complete module

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

Settings > KamiOS > Darkmoon Theme Engine > **Module store** lists modules that other people made. A tap downloads one and puts it in
**Your modules**, switched off: you switch it on there, with the same warnings as for a module you imported yourself. The list is a
file (`modules.json`) in a GitHub repository, so adding or updating a module is a push to that repository and needs no update of the
ROM. Each entry has an id (the id in `module.json`), a name, author, version and description, a link to the zip, a thumbnail and
screenshots (PNG, JPG, WebP or GIF; a tap on a screenshot opens it full screen). Put a `module_version` in your `module.json` so that
the store can tell when yours is newer than the one on the phone.

Nobody at KamiOS reviews the modules in the store. Read what a module changes before you switch it on.

## Safety and recovery

Nobody reviews modules, and there is no store. Read a module before you switch it on, and do not install every module you
find on the internet. Switching one on shows the apps it changes and a warning.

A module that breaks the system UI or the launcher is not permanent:

- **Modules > Turn all modules off** puts everything back.
- **Safe mode turns every module off.**
- If Settings is out of reach (a crash loop of the system UI): `adb shell settings delete system kami_modules_enabled`, then
  `adb shell cmd overlay list | grep com.android.settings:kami_` and `adb shell cmd overlay disable --user 0 <the names>`.
- If a Kami Shell script misbehaves: `adb shell settings delete secure kami_shell_script`, or choose another home app.

## Limits and what does not work

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
