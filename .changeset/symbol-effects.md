---
'@hzblj/expo-native-icons': minor
---

Your icons get what SF Symbols do. The plugin now also writes a custom SF Symbol per SVG, and `NativeIcon` plays effects (`bounce`, `pulse`, `variableColor`, `wiggle`, `rotate`, `breathe`, `scale`, `appear`, `disappear`) once per `effectTrigger` change or while `effectActive`, animates a new `name` with a `transition`, and draws `hierarchical`, `palette` and `multicolor` rendering modes, a `variableValue` and a `gradient`. UIKit plays them on iOS; Android draws the same from the vector drawable's paths. Each path of an SVG is a layer: its `fill`, its opacity, `data-variable` and `data-motion-group` say how. `iconSymbolName` names the symbol. Even-odd holes are redrawn for the non-zero rule symbols fill by. Run a prebuild after upgrading: until then `NativeIcon` draws the image as before.
