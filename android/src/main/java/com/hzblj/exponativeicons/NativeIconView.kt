package com.hzblj.exponativeicons

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.ColorStateList
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.drawable.Drawable
import expo.modules.kotlin.AppContext
import expo.modules.kotlin.views.ExpoView
import kotlin.math.min
import kotlin.math.roundToInt

/**
 * An icon from the app's resources: the vector drawable the config plugin generated from an SVG, fitted into the view
 * and tinted. The view draws the drawable itself rather than hosting an `ImageView`, so an icon in every list row costs
 * one view, and it draws in the first frame: the resource is inflated synchronously from the cache `Resources` keeps.
 * React Native's own `Image` cannot draw it at all: Fresco decodes bitmaps, not vector XML.
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

  private var resourceName: String? = null
  private var tint: ColorStateList? = defaultTint
  private var drawable: Drawable? = null

  init {
    setWillNotDraw(false)
    importantForAccessibility = IMPORTANT_FOR_ACCESSIBILITY_NO
  }

  fun setResourceName(name: String?) {
    if (name == resourceName) {
      return
    }
    resourceName = name
    drawable?.callback = null
    // `mutate()`: the inflated drawable shares its state with every other copy of the resource, tint included.
    drawable = DrawableIds.of(context, name).takeIf { it != 0 }?.let { context.getDrawable(it)?.mutate() }?.also {
      it.setTintList(tint)
      it.callback = this
    }
    updateDrawableBounds()
    invalidate()
  }

  fun setIconColor(color: Color?) {
    tint = color?.let { ColorStateList.valueOf(it.toArgb()) } ?: defaultTint
    drawable?.setTintList(tint)
    invalidate()
  }

  override fun onSizeChanged(width: Int, height: Int, oldWidth: Int, oldHeight: Int) {
    super.onSizeChanged(width, height, oldWidth, oldHeight)
    updateDrawableBounds()
  }

  override fun onDraw(canvas: Canvas) {
    super.onDraw(canvas)
    drawable?.draw(canvas)
  }

  override fun verifyDrawable(who: Drawable): Boolean = who === drawable || super.verifyDrawable(who)

  /** Centred and scaled to fit, keeping the glyph's own aspect ratio, like `ImageView`'s `FIT_CENTER`. */
  private fun updateDrawableBounds() {
    val drawable = drawable ?: return
    val intrinsicWidth = drawable.intrinsicWidth.takeIf { it > 0 } ?: width
    val intrinsicHeight = drawable.intrinsicHeight.takeIf { it > 0 } ?: height

    if (intrinsicWidth == 0 || intrinsicHeight == 0) {
      drawable.setBounds(0, 0, width, height)
      return
    }

    val scale = min(width.toFloat() / intrinsicWidth, height.toFloat() / intrinsicHeight)
    val fittedWidth = (intrinsicWidth * scale).roundToInt()
    val fittedHeight = (intrinsicHeight * scale).roundToInt()
    val left = (width - fittedWidth) / 2
    val top = (height - fittedHeight) / 2

    drawable.setBounds(left, top, left + fittedWidth, top + fittedHeight)
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
