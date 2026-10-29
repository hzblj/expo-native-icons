package com.hzblj.exponativeicons

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.LinearGradient
import android.graphics.Paint
import android.graphics.Shader
import android.graphics.drawable.Drawable
import android.os.SystemClock
import androidx.core.graphics.ColorUtils
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * An icon from the app's resources: the vector drawable the config plugin generated from an SVG, fitted into the view
 * and tinted. The view draws it itself rather than hosting an `ImageView`, so an icon in every list row costs one
 * view, and it draws in the first frame: the resource is inflated synchronously from the cache `Resources` keeps.
 * React Native's own `Image` cannot draw it at all: Fresco decodes bitmaps, not vector XML.
 *
 * Android has no symbol engine, so this is where the SF Symbols features are redrawn: the drawable's paths, read back
 * once as layers (`IconLayerCache`), are drawn one by one for the rendering modes, variable values and layer-by-layer
 * effects, and the effects and the replace transition run on the view's own frame loop (`postInvalidateOnAnimation`
 * while anything moves, nothing when idle). A drawable that cannot be split is drawn whole, its effects included.
 */
@SuppressLint("ViewConstructor")
class NativeIconView(context: Context, appContext: AppContext) : ExpoView(context, appContext) {
  private val defaultTint: ColorStateList? = context.obtainStyledAttributes(
    intArrayOf(android.R.attr.textColorPrimary)
  ).run {
    try {
      getColorStateList(0)
    } finally {
      recycle()
    }
  }

  /** What one name draws: its layers when the drawable splits into them, the drawable itself either way. */
  private class Content(val name: String, val drawable: Drawable?, val layers: IconLayers?)

  var resourceName: String? = null
  var iconColor: Color? = null
  var secondaryColor: Color? = null
  var tertiaryColor: Color? = null
  var renderingMode: String? = null
  var variableValue: Double? = null
  var gradient = false
  var transition: String? = null
  var effect: NativeIconEffectRecord? = null
  var effectTrigger: String? = null
  var effectActive = true

  private var content: Content? = null
  private var outgoing: Content? = null
  private var transitionStyle = "replace"
  private var transitionStart = 0L

  private var shownValue: Double? = null
  private var valueFrom: Double? = null
  private var valueStart = 0L

  private var playing: NativeIconEffectRecord? = null
  private var playOnce = false
  private var playStart = 0L

  /** The play a running effect stops after once `effectActive` turns off: it finishes the one under way, as UIKit does. */
  private var lastPlay: Int? = null
  private var lastTrigger: String? = null

  /** The state effect last held, and how far in it was when it last turned: it animates in and back out. */
  private var stateEffect: NativeIconEffectRecord? = null
  private var stateOn = false
  private var stateFrom = 0f
  private var stateStart = 0L

  private val paint = Paint(Paint.ANTI_ALIAS_FLAG)
  private val frame = LayerFrame()

  init {
    setWillNotDraw(false)
    importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
  }

  /** Called once React has set all of a render's props, so a new name and its transition arrive as one change. */
  fun applyProps() {
    applyContent()
    applyValue()
    applyEffect()
    content?.drawable?.let {
      it.setTintList(tintList())
      it.state = drawableState
    }
    invalidate()
  }

  private fun applyContent() {
    val name = resourceName
    if (name == content?.name) {
      return
    }

    content?.drawable?.callback = null
    val previous = content
    val id = DrawableIds.of(context, name)
    // `mutate()`: the inflated drawable shares its state with every other copy of the resource, tint included.
    val drawable = id.takeIf { it != 0 }?.let { context.getDrawable(it)?.mutate() }?.also {
      // The view's state, not a fresh drawable's empty one: `textColorPrimary` is a selector, and an empty state
      // matches its `state_enabled="false"` entry, the faded disabled colour.
      it.state = drawableState
      it.callback = this
    }
    content = name?.let { Content(it, drawable, IconLayerCache.of(context, id)) }

    val style = transition
    if (style != null && previous != null && isAttachedToWindow) {
      outgoing = previous
      transitionStyle = style
      transitionStart = SystemClock.uptimeMillis()
    } else {
      outgoing = null
    }
  }

  private fun applyValue() {
    if (variableValue == shownValue) {
      return
    }
    valueFrom = if (transition != null && isAttachedToWindow) shownValue else null
    valueStart = SystemClock.uptimeMillis()
    shownValue = variableValue
  }

  /**
   * Starts, restarts or stops the effect, as iOS does: with an `effectTrigger` it plays once each time the trigger
   * changes (not when the view first appears); without one it runs while `effectActive`. Scale, appear and disappear
   * are states that follow `effectActive`.
   */
  private fun applyEffect() {
    val trigger = effectTrigger
    val previousTrigger = lastTrigger
    lastTrigger = trigger
    val effect = effect
    val now = SystemClock.uptimeMillis()

    if (effect == null) {
      playing = null
      turnState(null, false, now)
      return
    }

    if (effect.isState) {
      playing = null
      turnState(effect, effectActive, now)
      return
    }

    turnState(null, false, now)

    if (trigger != null) {
      if (previousTrigger != null && previousTrigger != trigger) {
        playing = effect
        playOnce = true
        playStart = now
        lastPlay = null
      } else if (!playOnce) {
        playing = null
      }
      return
    }

    val running = playing
    if (!effectActive) {
      if (running != null && !playOnce && lastPlay == null) {
        lastPlay = currentPlay(running, now)
      }
    } else if (!effect.sameAs(running) || playOnce || lastPlay != null) {
      playing = effect
      playOnce = false
      playStart = now
      lastPlay = null
    }
  }

  private fun turnState(effect: NativeIconEffectRecord?, on: Boolean, now: Long) {
    if (effect != null && !effect.sameAs(stateEffect)) {
      stateEffect = effect
      stateOn = on
      stateFrom = 0f
      stateStart = now
      if (effect.type == "appear" && !on) {
        stateFrom = 1f
      }
      return
    }
    val held = stateEffect ?: return
    val active = effect != null && on
    if (active != stateOn) {
      // Appear plays in from nothing each time it turns on again.
      stateFrom = if (held.type == "appear" && active) 0f else stateProgress(held, now)
      stateOn = active
      stateStart = now
    }
    if (effect == null && stateProgress(held, now) == 0f) {
      stateEffect = null
    }
  }

  /** How far a state effect is in (0 to 1) for motion group `rank`: layer by layer, each group a little later. */
  private fun stateProgress(effect: NativeIconEffectRecord, now: Long, rank: Int = 0): Float {
    val speed = effect.speed?.toFloat() ?: 1f
    val elapsed = (now - stateStart) / 1000f * speed - rank * IconEffects.STAGGER
    val t = (elapsed / IconEffects.STATE_DURATION).coerceIn(0f, 1f)
    val target = if (stateOn) 1f else 0f
    // Appear plays in when it turns on and stays: turning it off leaves the icon as it is.
    if (effect.type == "appear" && !stateOn) {
      return 1f
    }
    return stateFrom + (target - stateFrom) * t
  }

  override fun drawableStateChanged() {
    super.drawableStateChanged()
    if (content?.drawable?.setState(drawableState) == true) {
      invalidate()
    }
  }

  override fun verifyDrawable(who: Drawable): Boolean =
    who === content?.drawable || who === outgoing?.drawable || super.verifyDrawable(who)

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    val now = SystemClock.uptimeMillis()
    var animating = false

    val leaving = outgoing
    var transitionT = 1f
    if (leaving != null) {
      transitionT = ((now - transitionStart) / 1000f / IconEffects.REPLACE_DURATION).coerceIn(0f, 1f)
      if (transitionT >= 1f) {
        outgoing = null
      } else {
        animating = true
        drawContent(canvas, leaving, now) { _, frame -> IconEffects.outgoing(transitionStyle, transitionT, frame) }
      }
    }

    val current = content ?: return
    animating = drawContent(canvas, current, now) { _, frame ->
      if (outgoing != null) {
        IconEffects.incoming(transitionStyle, transitionT, frame)
      }
    } || animating

    if (animating) {
      postInvalidateOnAnimation()
    }
  }

  /**
   * Draws one icon with the running effect on top of `base` (the transition's share of the frame). Returns whether
   * anything is still moving, so the next frame gets drawn.
   */
  private fun drawContent(canvas: Canvas, content: Content, now: Long, base: (Int, LayerFrame) -> Unit): Boolean {
    val layers = content.layers
    val drawable = content.drawable
    var moving = false

    if (layers == null) {
      drawable ?: return false
      moving = layerFrame(0, 1, 0, now, base)
      drawWhole(canvas, drawable)
      return moving
    }

    val scale = min(width / layers.viewportWidth, height / layers.viewportHeight)
    val left = (width - layers.viewportWidth * scale) / 2f
    val top = (height - layers.viewportHeight * scale) / 2f
    val tint = tintColor()
    val tintAlpha = Color.alpha(tint) / 255f
    val groups = if ((playing ?: stateEffect)?.scope == "wholeSymbol") 1 else layers.groupRanks.size

    val save = if (tintAlpha < 1f) canvas.saveLayerAlpha(0f, 0f, width.toFloat(), height.toFloat(), (tintAlpha * 255).roundToInt()) else canvas.save()

    for (layer in layers.layers) {
      val rank = if (groups == 1) 0 else layers.groupRanks[layer.group] ?: 0
      moving = layerFrame(rank, groups, layers.variableLayers.size, now, base) || moving
      val index = layers.variableIndex[layer]
      if (index != null) {
        val (alpha, valueMoving) = variableAlpha(layer, index, layers.variableLayers.size, now)
        frame.alpha *= alpha
        moving = moving || valueMoving
      }
      if (frame.alpha <= 0f) {
        continue
      }

      val color = layerColor(layer, tint)
      paint.color = ColorUtils.setAlphaComponent(color, 255)
      paint.alpha = (frame.alpha * hierarchyAlpha(layer) * 255).roundToInt().coerceIn(0, 255)
      paint.shader = if (gradient) gradientFor(layer, color) else null

      canvas.save()
      transform(canvas)
      canvas.translate(left, top)
      canvas.scale(scale, scale)
      canvas.drawPath(layer.path, paint)
      canvas.restore()
    }

    canvas.restoreToCount(save)
    return moving
  }

  /** A drawable that does not split into layers, drawn whole: fitted like `FIT_CENTER`, the frame applied to it all. */
  private fun drawWhole(canvas: Canvas, drawable: Drawable) {
    val intrinsicWidth = drawable.intrinsicWidth.takeIf { it > 0 } ?: width
    val intrinsicHeight = drawable.intrinsicHeight.takeIf { it > 0 } ?: height
    val fit = if (intrinsicWidth == 0 || intrinsicHeight == 0) 1f else min(width.toFloat() / intrinsicWidth, height.toFloat() / intrinsicHeight)
    val fittedWidth = (intrinsicWidth * fit).roundToInt()
    val fittedHeight = (intrinsicHeight * fit).roundToInt()
    val left = (width - fittedWidth) / 2
    val top = (height - fittedHeight) / 2

    drawable.setBounds(left, top, left + fittedWidth, top + fittedHeight)
    drawable.alpha = (frame.alpha * 255).roundToInt().coerceIn(0, 255)
    canvas.save()
    transform(canvas)
    drawable.draw(canvas)
    canvas.restore()
  }

  private fun transform(canvas: Canvas) {
    val side = min(width, height).toFloat()
    canvas.translate(width / 2f + frame.dx * side, height / 2f + frame.dy * side)
    canvas.rotate(frame.rotation)
    canvas.scale(frame.scale, frame.scale)
    canvas.translate(-width / 2f, -height / 2f)
  }

  /**
   * Fills `frame` for a layer of motion group `rank` (of `groups`) at `now`: the transition's share, then the running
   * effect's, then the held state's. Returns whether it is still moving.
   */
  private fun layerFrame(rank: Int, groups: Int, variableLayers: Int, now: Long, base: (Int, LayerFrame) -> Unit): Boolean {
    frame.reset()
    base(rank, frame)
    var moving = outgoing != null

    val effect = playing
    if (effect != null && effect.type != "variableColor") {
      val t = playProgress(effect, rank, groups, variableLayers, now)
      if (t != null) {
        IconEffects.move(effect, t, frame)
        moving = true
      }
    } else if (effect != null) {
      moving = moving || playProgress(effect, 0, 1, variableLayers, now) != null
    }

    val state = stateEffect
    if (state != null) {
      IconEffects.hold(state, stateProgress(state, now, rank), frame)
      val stateLength = IconEffects.STATE_DURATION + IconEffects.STAGGER * (groups - 1)
      moving = moving || (now - stateStart) / 1000f < stateLength / (state.speed?.toFloat() ?: 1f)
    }
    return moving
  }

  /**
   * How far into its current play a running effect is for motion group `rank`, or null once it has finished (and in
   * the pause between plays, where it is at rest). Repeats as the effect asks: once per trigger unless counted,
   * continuously, a number of times, or on the effect's own cadence.
   */
  private fun playProgress(effect: NativeIconEffectRecord, rank: Int, groups: Int, variableLayers: Int, now: Long): Float? {
    val speed = effect.speed?.toFloat()?.takeIf { it > 0f } ?: 1f
    val elapsed = (now - playStart) / 1000f * speed
    val duration = IconEffects.duration(effect, variableLayers)
    val length = duration + IconEffects.STAGGER * (groups - 1)
    val pause = when {
      effect.repeatContinuous == true -> 0f
      effect.repeatDelay != null -> effect.repeatDelay.toFloat()
      playOnce -> 0f
      else -> IconEffects.naturalPause(effect)
    }
    val plays = min(effect.repeatCount ?: if (playOnce) 1 else Int.MAX_VALUE, (lastPlay ?: Int.MAX_VALUE - 1) + 1)
    val (index, within) = IconEffects.cycle(elapsed, length + pause)

    if (index >= plays || (lastPlay != null && within > length)) {
      if (rank == groups - 1) {
        post { if (playing === effect && (playOnce || lastPlay != null)) playing = null }
      }
      return null
    }
    if (within > length) {
      return 0f
    }
    return ((within - rank * IconEffects.STAGGER) / duration).coerceIn(0f, 1f)
  }

  /** The index of the play a running effect is in, so it can stop at that play's end. */
  private fun currentPlay(effect: NativeIconEffectRecord, now: Long): Int {
    val speed = effect.speed?.toFloat()?.takeIf { it > 0f } ?: 1f
    val layers = content?.layers
    val duration = IconEffects.duration(effect, layers?.variableLayers?.size ?: 0)
    val groups = if (effect.scope == "wholeSymbol") 1 else layers?.groupRanks?.size ?: 1
    val pause = when {
      effect.repeatContinuous == true -> 0f
      effect.repeatDelay != null -> effect.repeatDelay.toFloat()
      else -> IconEffects.naturalPause(effect)
    }
    val period = duration + IconEffects.STAGGER * (groups - 1) + pause
    return IconEffects.cycle((now - playStart) / 1000f * speed, period).first
  }

  /**
   * SF Symbols' gradient, layer by layer: each layer's colour lightened at its top and in full at its bottom, over the
   * layer's own height, so a small badge gets its own shading.
   */
  private fun gradientFor(layer: IconLayer, color: Int): Shader {
    val opaque = color or 0xFF000000.toInt()
    return LinearGradient(
      0f,
      layer.bounds.top,
      0f,
      layer.bounds.bottom,
      ColorUtils.blendARGB(opaque, Color.WHITE, 0.22f),
      opaque,
      Shader.TileMode.CLAMP
    )
  }

  /**
   * A variable layer's alpha: lit by the running `variableColor`, or else on or dimmed by `variableValue`, easing from
   * the last value when a transition is set.
   */
  private fun variableAlpha(layer: IconLayer, index: Int, count: Int, now: Long): Pair<Float, Boolean> {
    val effect = playing
    if (effect != null && effect.type == "variableColor") {
      val t = playProgress(effect, 0, 1, count, now) ?: return 1f to false
      return IconEffects.variableAlpha(effect, t, index, count) to true
    }

    val threshold = layer.threshold ?: return 1f to false
    val on = { value: Double? -> if (value == null || value > threshold) 1f else IconEffects.DIMMED }
    val from = valueFrom ?: return on(shownValue) to false
    val t = ((now - valueStart) / 1000f / IconEffects.VARIABLE_DURATION).coerceIn(0f, 1f)
    if (t >= 1f) {
      valueFrom = null
    }
    return on(from) + (on(shownValue) - on(from)) * t to (t < 1f)
  }

  private fun tintList(): ColorStateList? = iconColor?.let { ColorStateList.valueOf(it.toArgb()) } ?: defaultTint

  private fun tintColor(): Int = tintList()?.getColorForState(drawableState, Color.BLACK) ?: Color.BLACK

  private fun layerColor(layer: IconLayer, tint: Int): Int =
    when (renderingMode) {
      "palette" -> {
        val secondary = secondaryColor?.toArgb() ?: tint
        when (layer.level) {
          0 -> tint
          1 -> secondary
          else -> tertiaryColor?.toArgb() ?: secondary
        }
      }
      "multicolor" -> layer.color ?: tint
      else -> tint
    }

  /** Hierarchical: the primary layers in full, secondary at half, tertiary at a quarter. */
  private fun hierarchyAlpha(layer: IconLayer): Float =
    if (renderingMode != "hierarchical") {
      1f
    } else {
      when (layer.level) {
        0 -> 1f
        1 -> 0.5f
        else -> 0.25f
      }
    }
}

/**
 * A drawable in the app's resources by name, where the plugin writes the icons; 0 when there is none. Remembered per
 * name: `getIdentifier` walks the resource table on every call, and a list of rows asks for the same few icons again
 * and again. Resource ids never change while the app runs.
 */
object DrawableIds {
  private val ids = HashMap<String, Int>()

  @SuppressLint("DiscouragedApi")
  fun of(context: Context, name: String?): Int {
    if (name.isNullOrEmpty()) {
      return 0
    }
    return ids.getOrPut(name) { context.resources.getIdentifier(name, "drawable", context.packageName) }
  }
}
