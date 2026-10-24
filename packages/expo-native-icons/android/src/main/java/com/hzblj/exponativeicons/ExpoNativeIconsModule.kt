package com.hzblj.exponativeicons

import android.graphics.Color
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoNativeIconsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoNativeIcons")

    View(NativeIconView::class) {
      Prop("resourceName") { view: NativeIconView, name: String? ->
        view.setResourceName(name)
      }
      Prop("iconColor") { view: NativeIconView, color: Color? ->
        view.setIconColor(color)
      }
    }
  }
}
