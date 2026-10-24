import ExpoModulesCore
import UIKit

/**
 An icon from the app's asset catalog: the template image set the config plugin generated from an SVG, vector data
 kept, scaled to fit the view and tinted. A `UIImageView` rather than a SwiftUI host, so an icon in every list row costs
 no hosting controller.
 */
public final class NativeIconView: ExpoView {
  private let imageView = UIImageView()

  var resourceName: String? {
    didSet {
      guard resourceName != oldValue else {
        return
      }
      imageView.image = resourceName.flatMap { UIImage(named: $0) }?.withRenderingMode(.alwaysTemplate)
    }
  }

  var iconColor: UIColor? {
    didSet { imageView.tintColor = iconColor ?? .label }
  }

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    imageView.contentMode = .scaleAspectFit
    imageView.tintColor = .label
    imageView.isAccessibilityElement = false
    addSubview(imageView)
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    imageView.frame = bounds
  }
}
