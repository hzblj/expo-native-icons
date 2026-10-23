import ExpoModulesCore

public class ExpoNativeIconsModule: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoNativeIcons")

    View(NativeIconView.self) {
      Prop("resourceName") { (view: NativeIconView, name: String?) in
        view.resourceName = name
      }
      Prop("iconColor") { (view: NativeIconView, color: UIColor?) in
        view.iconColor = color
      }
    }
  }
}
