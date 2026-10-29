package com.hzblj.exponativeicons

import android.annotation.SuppressLint
import android.content.Context
import android.content.res.Resources
import android.content.res.TypedArray
import android.graphics.Matrix
import android.graphics.Path
import android.graphics.RectF
import android.util.AttributeSet
import android.util.Xml
import androidx.core.graphics.PathParser
import org.xmlpull.v1.XmlPullParser

/**
 * One path of an icon's vector drawable, which is one layer of its symbol: `color` is the path's own fill for the
 * multicolor mode (null when it is the white every tinted icon is drawn in), `level` 0, 1 or 2 for primary, secondary
 * and tertiary, `threshold` the variable value above which it is on, `group` its motion group.
 */
internal class IconLayer(
  val path: Path,
  val color: Int?,
  val level: Int,
  val threshold: Float?,
  val group: Int
) {
  /** The path's bounds in viewport coordinates, which a gradient spans. */
  val bounds = RectF().also { path.computeBounds(it, true) }
}

/** An icon's paths in drawing order, in the coordinates of its viewport. */
internal class IconLayers(val viewportWidth: Float, val viewportHeight: Float, val layers: List<IconLayer>) {
  /** The layers a variable value switches, lowest threshold first. */
  val variableLayers: List<IconLayer> = layers.filter { it.threshold != null }.sortedBy { it.threshold }

  /** Each variable layer's place among them. */
  val variableIndex: Map<IconLayer, Int> = variableLayers.withIndex().associate { it.value to it.index }

  /** Each layer's motion group as a rank (0, 1, 2…), the order in which effects reach them layer by layer. */
  val groupRanks: Map<Int, Int> = layers.map { it.group }.distinct().sorted().withIndex().associate { it.value to it.index }
}

/**
 * Reads a vector drawable back into paths, once per resource: the config plugin writes each layer's level, threshold
 * and group into its path's `android:name` (`level=secondary;variable=0.5;group=1`) and its own colour into
 * `android:fillColor`. A drawable that draws anything paths and fills cannot say (strokes, clip paths, gradients) is
 * not split, and the view draws it whole.
 */
internal object IconLayerCache {
  private val cache = HashMap<Int, IconLayers?>()

  fun of(context: Context, id: Int): IconLayers? {
    if (id == 0) {
      return null
    }
    if (!cache.containsKey(id)) {
      cache[id] = try {
        parse(context.resources, id)
      } catch (_: Exception) {
        null
      }
    }
    return cache[id]
  }

  private val VECTOR = intArrayOf(android.R.attr.viewportWidth, android.R.attr.viewportHeight).sortedArray()
  private val GROUP = intArrayOf(
    android.R.attr.rotation,
    android.R.attr.pivotX,
    android.R.attr.pivotY,
    android.R.attr.scaleX,
    android.R.attr.scaleY,
    android.R.attr.translateX,
    android.R.attr.translateY
  ).sortedArray()
  private val PATH = intArrayOf(
    android.R.attr.name,
    android.R.attr.fillColor,
    android.R.attr.pathData,
    android.R.attr.strokeColor,
    android.R.attr.strokeWidth,
    android.R.attr.fillType
  ).sortedArray()

  private const val WHITE = 0xFFFFFFFF.toInt()

  @SuppressLint("ResourceType")
  private fun parse(resources: Resources, id: Int): IconLayers? {
    val parser = resources.getXml(id)
    val attributes = Xml.asAttributeSet(parser)
    val matrices = ArrayDeque<Matrix>().apply { add(Matrix()) }
    val layers = mutableListOf<IconLayer>()
    var viewportWidth = 0f
    var viewportHeight = 0f

    parser.use {
      var event = parser.eventType
      while (event != XmlPullParser.END_DOCUMENT) {
        if (event == XmlPullParser.START_TAG) {
          when (parser.name) {
            "vector" -> resources.read(attributes, VECTOR) {
              viewportWidth = it.getFloat(VECTOR.indexOf(android.R.attr.viewportWidth), 0f)
              viewportHeight = it.getFloat(VECTOR.indexOf(android.R.attr.viewportHeight), 0f)
            }
            "group" -> matrices.addLast(groupMatrix(resources, attributes, matrices.last()))
            "path" -> layers.add(pathLayer(resources, attributes, matrices.last()) ?: return null)
            else -> return null
          }
        } else if (event == XmlPullParser.END_TAG && parser.name == "group") {
          matrices.removeLast()
        }
        event = parser.next()
      }
    }

    return if (viewportWidth > 0 && viewportHeight > 0 && layers.isNotEmpty()) {
      IconLayers(viewportWidth, viewportHeight, layers)
    } else {
      null
    }
  }

  /** A group's transform on top of its parent's, in the order `VectorDrawable` applies it. */
  private fun groupMatrix(resources: Resources, attributes: AttributeSet, parent: Matrix): Matrix {
    val local = Matrix()
    resources.read(attributes, GROUP) {
      val pivotX = it.getFloat(GROUP.indexOf(android.R.attr.pivotX), 0f)
      val pivotY = it.getFloat(GROUP.indexOf(android.R.attr.pivotY), 0f)
      local.postTranslate(-pivotX, -pivotY)
      local.postScale(it.getFloat(GROUP.indexOf(android.R.attr.scaleX), 1f), it.getFloat(GROUP.indexOf(android.R.attr.scaleY), 1f))
      local.postRotate(it.getFloat(GROUP.indexOf(android.R.attr.rotation), 0f), 0f, 0f)
      local.postTranslate(
        it.getFloat(GROUP.indexOf(android.R.attr.translateX), 0f) + pivotX,
        it.getFloat(GROUP.indexOf(android.R.attr.translateY), 0f) + pivotY
      )
    }
    return Matrix(parent).apply { preConcat(local) }
  }

  private fun pathLayer(resources: Resources, attributes: AttributeSet, matrix: Matrix): IconLayer? {
    var layer: IconLayer? = null
    resources.read(attributes, PATH) {
      val stroked = it.getFloat(PATH.indexOf(android.R.attr.strokeWidth), 0f) > 0f &&
        it.hasValue(PATH.indexOf(android.R.attr.strokeColor))
      val pathData = it.getString(PATH.indexOf(android.R.attr.pathData))
      if (stroked || pathData == null) {
        return@read
      }
      val path = PathParser.createPathFromPathData(pathData)
      path.transform(matrix)
      path.fillType = if (it.getInt(PATH.indexOf(android.R.attr.fillType), 0) == 1) {
        Path.FillType.EVEN_ODD
      } else {
        Path.FillType.WINDING
      }
      val fill = it.getColor(PATH.indexOf(android.R.attr.fillColor), WHITE)
      val meta = parseName(it.getString(PATH.indexOf(android.R.attr.name)))
      layer = IconLayer(
        path = path,
        color = fill.takeIf { color -> color != WHITE },
        level = when (meta["level"]) {
          "secondary" -> 1
          "tertiary" -> 2
          else -> 0
        },
        threshold = meta["variable"]?.toFloatOrNull(),
        group = meta["group"]?.toIntOrNull() ?: 0
      )
    }
    return layer
  }

  private fun parseName(name: String?): Map<String, String> =
    name.orEmpty().split(';').mapNotNull { entry ->
      val key = entry.substringBefore('=', "")
      key.takeIf { it.isNotEmpty() }?.let { it to entry.substringAfter('=') }
    }.toMap()

  private inline fun Resources.read(attributes: AttributeSet, ids: IntArray, block: (TypedArray) -> Unit) {
    val typed = obtainAttributes(attributes, ids)
    try {
      block(typed)
    } finally {
      typed.recycle()
    }
  }
}
