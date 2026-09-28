# Sound

Every sound is synthesised in `engine/sfx.js` with Web Audio. There are no samples. The same cue list plays
live in the browser (`SFX.Live`) and renders offline for export (`SFX.renderOffline`), so what you hear in
the dev page is what gets muxed.

## Placing sounds

```js
S.sfx(t, name, { gain, pitch, dur, pan, wet, ...soundSpecific });
```

`t` is style-local seconds. Put the cue on the exact time of the visual event, and use the same number you
pass to the tween (`tl.from(x, {...}, 2.4)` with `S.sfx(2.4, 'pop')`). `S.pop(el, t, {pitch})` and
`S.type(el, text, {t, sfx})` add their own cues.

## The library

| name | character | extra options |
|---|---|---|
| `whoosh` | pink-noise air sweep, panned across | `dur` `from` `to` (Hz) `q` `dir` |
| `swoosh` | short, brighter swish for UI moves | — |
| `pop` | bubble pop with a click transient | — |
| `click`, `tick`, `blip` | UI clicks, clock ticks, soft blips (use `pitch` for ladders) | — |
| `type` | typewriter key: strike, body thunk, release | — |
| `ding`, `bell` | struck bell (inharmonic partials) | `freq` |
| `impact` | layered hit for payoffs | — |
| `thud` | soft low hit for landings | — |
| `boom` | big low boom with tail | `dur` |
| `braam` | trailer braam: detuned low saws, opening filter | `dur` `freq` |
| `bass` | sub drop | `freq` |
| `stamp` | rubber stamp slam | — |
| `drum`, `heartbeat` | tom hit, double heartbeat | — |
| `riser` | pink-noise tension riser | `dur` |
| `drone` | low bed with optional air | `dur` `freq` `fade` `cutoff` `air` `airFreq` |
| `pad` | soft chord bed | `dur` `notes` (Hz array) `attack` `release` `cutoff` `wave` |
| `wind`, `thunder` | weather | `dur` |
| `paper`, `scratch`, `shutter`, `ratchet` | foley: paper slide, pencil scratch, camera shutter, dial ratchet | `dur` · `count` `gap` |
| `cash`, `coin`, `levelup` | payoffs: register, coin, game level-up | — |
| `shimmer` | sparkle run | `count` |
| `glitch`, `crt` | digital glitch, CRT power | `dur` |
| `ping`, `buzzer` | sonar ping, sports buzzer | `freq` · `dur` |
| `chord` | short stab chord | `notes` `dur` `wave` |
| `tone` | pure line-up tone (bars and tone) | `freq` `dur` |

Common options: `gain` (peak 0–1, each sound has a sensible default), `pitch` (multiplier), `pan` (−1…1),
`wet` (reverb send), `dur`. To hear every sound with its level: `node tools/render.mjs sfxtest`.

## Mixing rules

- **Every visible event gets a sound.** At most three sounds should land at the same instant. Hits land on the
  impact frame, not before.
- **A bed under every piece.** Run a `pad` or `drone` at gain ≤ 0.12 for the whole duration, so cuts between
  pieces never drop to silence. The pad chord (`padNotes`) is usually a param, so the mood can change with
  the niche.
- **Ladders.** Repeated events rise in pitch (`pitch: 1 + i * 0.2`) so a list feels like it's building.
- **Headroom.** Keep single hits ≤ 0.6 gain. The export normalises loudness, so balance matters more than
  level.
- **Reel mix.** After a first listen, trim loud or quiet pieces with the item's `mix` (dB) in the reel
  file. `node tools/render.mjs audio <reel.json>` prints peak, RMS and LUFS. The export targets −15 LUFS
  integrated with a −1 dBFS limiter (YouTube normalises to about −14).
