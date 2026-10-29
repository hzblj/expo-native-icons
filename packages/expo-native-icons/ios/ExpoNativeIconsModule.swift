import ExpoModulesCore

public class ExpoNativeIconsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoNativeIcons")

    View(NativeIconView.self) {
      Prop("resourceName") { (view: NativeIconView, name: String?) in
        view.resourceName = name
      }
      Prop("symbolName") { (view: NativeIconView, name: String?) in
        view.symbolName = name
      }
      Prop("iconColor") { (view: NativeIconView, color: UIColor?) in
        view.iconColor = color
      }
      Prop("secondaryColor") { (view: NativeIconView, color: UIColor?) in
        view.secondaryColor = color
      }
      Prop("tertiaryColor") { (view: NativeIconView, color: UIColor?) in
        view.tertiaryColor = color
      }
      Prop("renderingMode") { (view: NativeIconView, mode: String?) in
        view.renderingMode = mode
      }
      Prop("variableValue") { (view: NativeIconView, value: Double?) in
        view.variableValue = value
      }
      Prop("gradient") { (view: NativeIconView, gradient: Bool?) in
        view.gradient = gradient ?? false
      }
      Prop("transition") { (view: NativeIconView, transition: String?) in
        view.transition = transition
      }
      Prop("effect") { (view: NativeIconView, effect: NativeIconEffectRecord?) in
        view.effect = effect
      }
      Prop("effectTrigger") { (view: NativeIconView, trigger: String?) in
        view.effectTrigger = trigger
      }
      Prop("effectActive") { (view: NativeIconView, active: Bool?) in
        view.effectActive = active ?? true
      }

      OnViewDidUpdateProps { (view: NativeIconView) in
        view.applyProps()
      }
    }
  }
}
