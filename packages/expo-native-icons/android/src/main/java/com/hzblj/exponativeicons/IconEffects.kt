package com.hzblj.exponativeicons

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import kotlin.math.PI
import kotlin.math.abs
import kotlin.math.cos
import kotlin.math.exp
import kotlin.math.floor
import kotlin.math.max
import kotlin.math.min
import kotlin.math.sin

/** `effect` as the JavaScript side flattens it: the type and whichever of its options apply. */
class NativeIconEffectRecord : Record {
  @Field val type: String = ""
  @Field val direction: String? = null
  @Field val scope: String? = null
  @Field val angle: Double? = null
  @Field val fill: String? = null
  @Field val reversing: Boolean? = null
  @Field val inactiveLayers: String? = null
  @Field val style: String? = null
  @Field val speed: Double? = null
  @Field val repeatCount: Int? = null
  @Field val repeatContinuous: Boolean? = null
  @Field val repeatDelay: Double? = null

  /** Scale, appear and disappear are states: they hold while active, and there is nothing to play once. */
  val isState: Boolean
    get() = type == "scale" || type == "appear" || type == "disappear"

  fun sameAs(other: NativeIconEffectRecord?): Boolean =
    other != null && type == other.type && direction == other.direction && scope == other.scope &&
      angle == other.angle && fill == other.fill && reversing == other.reversing &&
      inactiveLayers == other.inactiveLayers && style == other.style && speed == other.speed &&
      repeatCount == other.repeatCount && repeatContinuous == other.repeatContinuous && repeatDelay == other.repeatDelay
}

/** How one layer is moved and faded in a frame: a scale and a turn about the icon's centre, a shift in icon sizes. */
internal class LayerFrame {
  var scale = 1f
  var rotation = 0f
  var dx = 0f
  var dy = 0f
  var alpha = 1f

  fun reset(): LayerFrame {
    scale = 1f
    rotation = 0f
    dx = 0f
    dy = 0f
    alpha = 1f
    return this
  }
}

/**
 * The SF Symbols effects redrawn for Android, as functions of time: Android has no symbol engine, so each effect is
 * its curve here, timed to look like the one UIKit plays. A layer-by-layer effect starts each motion group a little
 * after the one before.
 */
internal object IconEffects {
  const val STAGGER = 0.08f
  const val STATE_DURATION = 0.3f
  const val REPLACE_DURATION = 0.36f
  const val VARIABLE_DURATION = 0.2f

  /** Alpha of a layer a variable value leaves off: SF Symbols dims it to 30 %. */
  const val DIMMED = 0.3f

  /** One play of the effect, in seconds at speed 1. */
  fun duration(effect: NativeIconEffectRecord, variableLayers: Int): Float =
    when (effect.type) {
      "bounce" -> 0.9f
      "pulse" -> 1.1f
      "variableColor" -> max(variableLayers, 1) * 0.28f * (if (effect.reversing == true) 2 else 1) + 0.3f
      "wiggle" -> 0.72f
      "rotate" -> 1.0f
      "breathe" -> 1.8f
      else -> STATE_DURATION
    }

  /** The pause an effect running on its own cadence leaves between plays: one bounce or wiggle a second. */
  fun naturalPause(effect: NativeIconEffectRecord): Float =
    when (effect.type) {
      "bounce", "wiggle" -> 0.9f
      else -> 0f
    }

  /** Moves a layer `t` (0 to 1) of the way through one play of a moving effect. */
  fun move(effect: NativeIconEffectRecord, t: Float, frame: LayerFrame) {
    when (effect.type) {
      "bounce" -> frame.scale *= 1f + (if (effect.direction == "down") -0.8f else 1f) * keyframes(t, BOUNCE)
      "pulse" -> frame.alpha *= 1f - 0.65f * wave(t)
      "wiggle" -> wiggle(effect, t, frame)
      "rotate" -> frame.rotation += (if (effect.direction == "counterClockwise") -360f else 360f) * easeInOut(t)
      "breathe" -> {
        frame.scale *= 1f + 0.08f * wave(t)
        if (effect.style == "pulse") {
          frame.alpha *= 1f - 0.4f * wave(t)
        }
      }
    }
  }

  /** A state effect `progress` (0 to 1) of the way in: scaled, appeared or gone. */
  fun hold(effect: NativeIconEffectRecord, progress: Float, frame: LayerFrame) {
    when (effect.type) {
      "scale" -> frame.scale *= 1f + (if (effect.direction == "down") -0.2f else 0.2f) * progress
      "disappear" -> {
        frame.scale *= 1f + (if (effect.direction == "up") 0.3f else -0.5f) * progress
        frame.alpha *= 1f - progress
      }
      "appear" -> {
        frame.scale *= if (effect.direction == "down") 1.3f - 0.3f * progress else 0.5f + 0.5f * backOut(progress)
        frame.alpha *= progress
      }
    }
  }

  /**
   * How lit variable layer `index` of `count` is, `t` of the way through one play of `variableColor`: lit one after
   * another and kept on (cumulative) or one at a time (iterative), back the other way when reversing, and the rest
   * dimmed or hidden.
   */
  fun variableAlpha(effect: NativeIconEffectRecord, t: Float, index: Int, count: Int): Float {
    val inactive = if (effect.inactiveLayers == "hide") 0f else DIMMED
    val reversing = effect.reversing == true
    val forward = if (reversing) (if (t < 0.5f) t * 2f else (1f - t) * 2f) else t
    val position = forward * (count + 1)
    val lit = if (effect.fill == "iterative") {
      max(0f, 1f - abs(position - index - 1f))
    } else if (!reversing && position > count) {
      1f - (position - count)
    } else {
      (position - index).coerceIn(0f, 1f)
    }
    return inactive + (1f - inactive) * lit.coerceIn(0f, 1f)
  }

  /** The replace transition's outgoing icon, `t` (0 to 1) of the way through. */
  fun outgoing(transition: String, t: Float, frame: LayerFrame) {
    val out = (t * 2f).coerceIn(0f, 1f)
    when (transition) {
      "replaceOffUp" -> frame.alpha = 0f
      "replaceUpUp" -> {
        frame.scale = 1f + 0.4f * out
        frame.alpha = 1f - out
      }
      else -> {
        frame.scale = 1f - 0.5f * out
        frame.alpha = 1f - out
      }
    }
  }

  /** The replace transition's incoming icon, `t` (0 to 1) of the way through. */
  fun incoming(transition: String, t: Float, frame: LayerFrame) {
    val start = if (transition == "replaceOffUp") 0f else 0.25f
    val u = ((t - start) / (1f - start)).coerceIn(0f, 1f)
    frame.scale = 0.5f + 0.5f * backOut(u)
    frame.alpha = min(1f, u * 2.5f)
  }

  private fun wiggle(effect: NativeIconEffectRecord, t: Float, frame: LayerFrame) {
    val swing = exp(-3.5f * t) * sin(2f * PI.toFloat() * 3f * t)
    val angle = effect.angle
    when {
      angle != null -> {
        val radians = Math.toRadians(angle).toFloat()
        frame.dx += 0.12f * swing * cos(radians)
        frame.dy -= 0.12f * swing * sin(radians)
      }
      effect.direction == "left" || effect.direction == "backward" -> frame.dx -= 0.12f * swing
      effect.direction == "right" || effect.direction == "forward" -> frame.dx += 0.12f * swing
      effect.direction == "up" -> frame.dy -= 0.12f * swing
      effect.direction == "down" -> frame.dy += 0.12f * swing
      effect.direction == "counterClockwise" -> frame.rotation -= 16f * swing
      else -> frame.rotation += 16f * swing
    }
  }

  /** 0 → 1 → 0 once, eased. */
  private fun wave(t: Float): Float = (1f - cos(2f * PI.toFloat() * t)) / 2f

  /**
   * UIKit's bounce up, measured off the simulator: a 4 % dip, a swell to 122 % a third of the way in, a 7 % undershoot
   * and a settle by 0.9 s. Down plays it mirrored and a little smaller.
   */
  private val BOUNCE = floatArrayOf(0f, 0f, 0.15f, -0.04f, 0.36f, 0.22f, 0.56f, -0.07f, 0.74f, 0.025f, 0.88f, -0.008f, 1f, 0f)

  /** A curve through (time, value) pairs, eased between each pair so every keyframe is a turning point. */
  private fun keyframes(t: Float, points: FloatArray): Float {
    for (index in 2 until points.size step 2) {
      if (t <= points[index]) {
        val start = points[index - 2]
        val span = (points[index] - start).takeIf { it > 0f } ?: return points[index + 1]
        val eased = easeInOut(((t - start) / span).coerceIn(0f, 1f))
        return points[index - 1] + (points[index + 1] - points[index - 1]) * eased
      }
    }
    return points[points.size - 1]
  }

  private fun easeInOut(t: Float): Float = (1f - cos(PI.toFloat() * t)) / 2f

  /** Ease out with a small overshoot. */
  fun backOut(t: Float): Float {
    val c = 1.4f
    val u = t - 1f
    return 1f + (c + 1f) * u * u * u + c * u * u
  }

  /** Where in its cycle a play is: the cycle's index and the seconds into it. */
  fun cycle(elapsed: Float, period: Float): Pair<Int, Float> {
    if (period <= 0f) {
      return 0 to elapsed
    }
    val index = floor(elapsed / period).toInt()
    return index to (elapsed - index * period)
  }
}
