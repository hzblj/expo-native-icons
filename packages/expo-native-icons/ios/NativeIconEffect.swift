import ExpoModulesCore
import Symbols
import UIKit

/**
 What `effect` asks for, flattened by the JavaScript side: the effect's `type` and whichever of its options apply to it.
 One record for every effect, because a prop takes one shape; fields an effect has no use for stay unset.
 */
struct NativeIconEffectRecord: Record, Equatable {
  @Field var type: String = ""
  @Field var direction: String?
  @Field var scope: String?
  @Field var angle: Double?
  @Field var fill: String?
  @Field var reversing: Bool?
  @Field var inactiveLayers: String?
  @Field var style: String?
  @Field var speed: Double?
  @Field var repeatCount: Int?
  @Field var repeatContinuous: Bool?
  @Field var repeatDelay: Double?

  static func == (lhs: Self, rhs: Self) -> Bool {
    lhs.type == rhs.type && lhs.direction == rhs.direction && lhs.scope == rhs.scope && lhs.angle == rhs.angle
      && lhs.fill == rhs.fill && lhs.reversing == rhs.reversing && lhs.inactiveLayers == rhs.inactiveLayers
      && lhs.style == rhs.style && lhs.speed == rhs.speed && lhs.repeatCount == rhs.repeatCount
      && lhs.repeatContinuous == rhs.repeatContinuous && lhs.repeatDelay == rhs.repeatDelay
  }

  /** Scale, appear and disappear are states: they hold while active, and there is nothing to play once. */
  var isState: Bool {
    type == "scale" || type == "appear" || type == "disappear"
  }
}

/**
 Plays a `NativeIconEffectRecord` on a `UIImageView` through UIKit's own symbol effects. `once` plays the effect a
 single time (the `effectTrigger` changed); otherwise it runs until removed (`effectActive`). An effect the system
 version lacks does nothing: wiggle, rotate and breathe need iOS 18.
 */
@available(iOS 17.0, *)
enum NativeIconEffectPlayer {
  static func play(_ record: NativeIconEffectRecord, on view: UIImageView, once: Bool) {
    let options = options(for: record, once: once)

    switch record.type {
    case "bounce":
      let bounce: BounceSymbolEffect = record.direction == "down" ? .bounce.down : record.direction == "up" ? .bounce.up : .bounce
      let effect = scoped(record, bounce)
      if once {
        discrete(effect, on: view, options: options)
      } else if #available(iOS 18.0, *) {
        indefinite(effect, on: view, options: options)
      } else {
        discrete(effect, on: view, options: options.repeating)
      }
    case "pulse":
      let effect = scoped(record, PulseSymbolEffect.pulse)
      once ? discrete(effect, on: view, options: options) : indefinite(effect, on: view, options: options)
    case "variableColor":
      let effect = variableColor(record)
      once ? discrete(effect, on: view, options: options) : indefinite(effect, on: view, options: options)
    case "scale" where !once:
      let scale: ScaleSymbolEffect = record.direction == "down" ? .scale.down : .scale.up
      indefinite(scoped(record, scale), on: view, options: options)
    case "appear" where !once:
      let effect = record.direction == "down" ? AppearSymbolEffect.appear.down : record.direction == "up" ? .appear.up : .appear
      indefinite(scoped(record, effect), on: view, options: options)
    case "disappear" where !once:
      let effect =
        record.direction == "down" ? DisappearSymbolEffect.disappear.down : record.direction == "up" ? .disappear.up : .disappear
      indefinite(scoped(record, effect), on: view, options: options)
    default:
      if #available(iOS 18.0, *) {
        playNewer(record, on: view, options: options, once: once)
      }
    }
  }

  @available(iOS 18.0, *)
  private static func playNewer(_ record: NativeIconEffectRecord, on view: UIImageView, options: SymbolEffectOptions, once: Bool) {
    switch record.type {
    case "wiggle":
      let effect = scoped(record, wiggle(record))
      once ? discrete(effect, on: view, options: options) : indefinite(effect, on: view, options: options)
    case "rotate":
      let rotate: RotateSymbolEffect = record.direction == "counterClockwise" ? .rotate.counterClockwise : .rotate.clockwise
      let effect = scoped(record, rotate)
      once ? discrete(effect, on: view, options: options) : indefinite(effect, on: view, options: options)
    case "breathe":
      let breathe: BreatheSymbolEffect = record.style == "pulse" ? .breathe.pulse : record.style == "plain" ? .breathe.plain : .breathe
      let effect = scoped(record, breathe)
      once ? discrete(effect, on: view, options: options) : indefinite(effect, on: view, options: options)
    default:
      break
    }
  }

  /** Through a generic so the overload is the one asked for: bounce is both discrete and indefinite on iOS 18. */
  private static func discrete<E: SymbolEffect & DiscreteSymbolEffect>(_ effect: E, on view: UIImageView, options: SymbolEffectOptions) {
    view.addSymbolEffect(effect, options: options)
  }

  private static func indefinite<E: SymbolEffect & IndefiniteSymbolEffect>(_ effect: E, on view: UIImageView, options: SymbolEffectOptions) {
    view.addSymbolEffect(effect, options: options)
  }

  private static func scoped(_ record: NativeIconEffectRecord, _ effect: BounceSymbolEffect) -> BounceSymbolEffect {
    record.scope == "byLayer" ? effect.byLayer : record.scope == "wholeSymbol" ? effect.wholeSymbol : effect
  }

  private static func scoped(_ record: NativeIconEffectRecord, _ effect: PulseSymbolEffect) -> PulseSymbolEffect {
    record.scope == "byLayer" ? effect.byLayer : record.scope == "wholeSymbol" ? effect.wholeSymbol : effect
  }

  private static func scoped(_ record: NativeIconEffectRecord, _ effect: ScaleSymbolEffect) -> ScaleSymbolEffect {
    record.scope == "byLayer" ? effect.byLayer : record.scope == "wholeSymbol" ? effect.wholeSymbol : effect
  }

  private static func scoped(_ record: NativeIconEffectRecord, _ effect: AppearSymbolEffect) -> AppearSymbolEffect {
    record.scope == "byLayer" ? effect.byLayer : record.scope == "wholeSymbol" ? effect.wholeSymbol : effect
  }

  private static func scoped(_ record: NativeIconEffectRecord, _ effect: DisappearSymbolEffect) -> DisappearSymbolEffect {
    record.scope == "byLayer" ? effect.byLayer : record.scope == "wholeSymbol" ? effect.wholeSymbol : effect
  }

  @available(iOS 18.0, *)
  private static func scoped(_ record: NativeIconEffectRecord, _ effect: WiggleSymbolEffect) -> WiggleSymbolEffect {
    record.scope == "byLayer" ? effect.byLayer : record.scope == "wholeSymbol" ? effect.wholeSymbol : effect
  }

  @available(iOS 18.0, *)
  private static func scoped(_ record: NativeIconEffectRecord, _ effect: RotateSymbolEffect) -> RotateSymbolEffect {
    record.scope == "byLayer" ? effect.byLayer : record.scope == "wholeSymbol" ? effect.wholeSymbol : effect
  }

  @available(iOS 18.0, *)
  private static func scoped(_ record: NativeIconEffectRecord, _ effect: BreatheSymbolEffect) -> BreatheSymbolEffect {
    record.scope == "byLayer" ? effect.byLayer : record.scope == "wholeSymbol" ? effect.wholeSymbol : effect
  }

  private static func variableColor(_ record: NativeIconEffectRecord) -> VariableColorSymbolEffect {
    var effect = VariableColorSymbolEffect.variableColor

    if record.fill == "iterative" {
      effect = effect.iterative
    } else if record.fill == "cumulative" {
      effect = effect.cumulative
    }

    if let reversing = record.reversing {
      effect = reversing ? effect.reversing : effect.nonReversing
    }

    if record.inactiveLayers == "hide" {
      effect = effect.hideInactiveLayers
    } else if record.inactiveLayers == "dim" {
      effect = effect.dimInactiveLayers
    }

    return effect
  }

  @available(iOS 18.0, *)
  private static func wiggle(_ record: NativeIconEffectRecord) -> WiggleSymbolEffect {
    if let angle = record.angle {
      return .wiggle.custom(angle: angle)
    }

    switch record.direction {
    case "clockwise": return .wiggle.clockwise
    case "counterClockwise": return .wiggle.counterClockwise
    case "left": return .wiggle.left
    case "right": return .wiggle.right
    case "up": return .wiggle.up
    case "down": return .wiggle.down
    case "forward": return .wiggle.forward
    case "backward": return .wiggle.backward
    default: return .wiggle
    }
  }

  /**
   A trigger plays once unless a count says otherwise; a running effect keeps the effect's own cadence unless told to
   repeat continuously, a number of times, or with a pause.
   */
  private static func options(for record: NativeIconEffectRecord, once: Bool) -> SymbolEffectOptions {
    let options = record.speed.map { SymbolEffectOptions.default.speed($0) } ?? .default

    if #available(iOS 18.0, *) {
      if record.repeatContinuous == true {
        return options.repeat(.continuous)
      }
      if record.repeatCount != nil || (record.repeatDelay != nil && !once) {
        return options.repeat(.periodic(record.repeatCount, delay: record.repeatDelay))
      }
      return once ? options.nonRepeating : options
    }

    if let count = record.repeatCount {
      return options.repeat(count)
    }

    return once ? options.nonRepeating : options
  }

  /** The transition `transition` names between two icons; `automatic` also animates a change of variable value. */
  static func setImage(_ image: UIImage, on view: UIImageView, transition: String) {
    switch transition {
    case "replaceUpUp":
      view.setSymbolImage(image, contentTransition: .replace.upUp)
    case "replaceOffUp":
      view.setSymbolImage(image, contentTransition: .replace.offUp)
    case "magicReplace":
      if #available(iOS 18.0, *) {
        view.setSymbolImage(image, contentTransition: .replace.magic(fallback: .replace.downUp))
      } else {
        view.setSymbolImage(image, contentTransition: .replace.downUp)
      }
    case "automatic":
      view.setSymbolImage(image, contentTransition: .automatic)
    default:
      view.setSymbolImage(image, contentTransition: .replace.downUp)
    }
  }
}
