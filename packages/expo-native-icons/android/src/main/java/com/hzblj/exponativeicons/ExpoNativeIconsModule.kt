package com.hzblj.exponativeicons

import android.graphics.Color
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class ExpoNativeIconsModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("ExpoNativeIcons")

    View(NativeIconView::class) {
      Prop("resourceName") { view: NativeIconView, name: String? ->
        view.resourceName = name
      }
      Prop("iconColor") { view: NativeIconView, color: Color? ->
        view.iconColor = color
      }
      Prop("secondaryColor") { view: NativeIconView, color: Color? ->
        view.secondaryColor = color
      }
      Prop("tertiaryColor") { view: NativeIconView, color: Color? ->
        view.tertiaryColor = color
      }
      Prop("renderingMode") { view: NativeIconView, mode: String? ->
        view.renderingMode = mode
      }
      Prop("variableValue") { view: NativeIconView, value: Double? ->
        view.variableValue = value
      }
      Prop("gradient") { view: NativeIconView, gradient: Boolean? ->
        view.gradient = gradient ?: false
      }
      Prop("transition") { view: NativeIconView, transition: String? ->
        view.transition = transition
      }
      Prop("effect") { view: NativeIconView, effect: NativeIconEffectRecord? ->
        view.effect = effect
      }
      Prop("effectTrigger") { view: NativeIconView, trigger: String? ->
        view.effectTrigger = trigger
      }
      Prop("effectActive") { view: NativeIconView, active: Boolean? ->
        view.effectActive = active ?: true
      }

      OnViewDidUpdateProps { view: NativeIconView ->
        view.applyProps()
      }
    }
  }
}
