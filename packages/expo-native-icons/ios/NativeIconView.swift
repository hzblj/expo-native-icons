import ExpoModulesCore
import UIKit

/**
 An icon from the app's asset catalog: the custom SF Symbol the config plugin generated from an SVG, so UIKit's symbol
 machinery works on it (effects, the replace transition, hierarchical, palette and multicolor rendering, variable
 values), drawn at the point size that makes its square box fill the view. A catalog from before symbols were
 generated has only the template image: then the image is drawn, scaled to fit and tinted, without any of that.

 A `UIImageView` rather than a SwiftUI host, so an icon in every list row costs no hosting controller. Props are applied
 together once React has set them all (`applyProps`), so a new name and its transition arrive as one change.
 */
public final class NativeIconView: ExpoView {
  private let imageView = UIImageView()

  var resourceName: String?
  var symbolName: String?
  var iconColor: UIColor?
  var secondaryColor: UIColor?
  var tertiaryColor: UIColor?
  var renderingMode: String?
  var variableValue: Double?
  var gradient = false
  var transition: String?
  var effect: NativeIconEffectRecord?
  var effectTrigger: String?
  var effectActive = true

  /** What the image view shows, so a prop that did not change it neither reloads it nor restarts an effect. */
  private var shown: (name: String, variableValue: Double?, isSymbol: Bool)?
  private var playing: NativeIconEffectRecord?
  private var lastTrigger: String?
  private var pointSize: CGFloat = 0

  public required init(appContext: AppContext? = nil) {
    super.init(appContext: appContext)
    imageView.contentMode = .center
    imageView.tintColor = .label
    imageView.isAccessibilityElement = false
    addSubview(imageView)
  }

  public override func layoutSubviews() {
    super.layoutSubviews()
    imageView.frame = bounds

    let side = min(bounds.width, bounds.height)

    if side > 0, side != pointSize {
      pointSize = side
      applyConfiguration()
    }
  }

  func applyProps() {
    imageView.tintColor = iconColor ?? .label
    applyImage()
    applyConfiguration()
    applyEffect()
  }

  private func applyImage() {
    let symbol = symbolName.flatMap { name -> UIImage? in
      let image = variableValue.map { UIImage(named: name, in: nil, variableValue: $0, configuration: nil) } ?? UIImage(named: name)
      return image?.isSymbolImage == true ? image : nil
    }

    guard let symbol, let symbolName else {
      showTemplateImage()
      return
    }

    if let shown, shown.isSymbol, shown.name == symbolName, shown.variableValue == variableValue {
      return
    }

    let previous = shown
    shown = (symbolName, variableValue, true)
    imageView.contentMode = .center

    guard #available(iOS 17.0, *), let transition, let previous, previous.isSymbol, window != nil else {
      imageView.image = symbol
      return
    }

    let sameIcon = previous.name == symbolName
    NativeIconEffectPlayer.setImage(symbol, on: imageView, transition: sameIcon ? "automatic" : transition)
  }

  private func showTemplateImage() {
    guard let resourceName else {
      shown = nil
      imageView.image = nil
      return
    }

    if let shown, !shown.isSymbol, shown.name == resourceName {
      return
    }

    shown = (resourceName, nil, false)
    imageView.contentMode = .scaleAspectFit
    imageView.image = UIImage(named: resourceName)?.withRenderingMode(.alwaysTemplate)
  }

  /**
   The symbol's size and colours. At the small symbol scale a symbol's box is its point size, so the view's shorter
   side is the point size and the box fills the view, centred, as the image did.
   */
  private func applyConfiguration() {
    guard shown?.isSymbol == true, pointSize > 0 else {
      return
    }

    let tint = iconColor ?? .label
    var configuration = UIImage.SymbolConfiguration(pointSize: pointSize, weight: .regular, scale: .small)

    switch renderingMode {
    case "hierarchical":
      configuration = configuration.applying(UIImage.SymbolConfiguration(hierarchicalColor: tint))
    case "palette":
      let secondary = secondaryColor ?? tint
      let colors = [tint, secondary, tertiaryColor ?? secondary]
      configuration = configuration.applying(UIImage.SymbolConfiguration(paletteColors: colors))
    case "multicolor":
      configuration = configuration.applying(UIImage.SymbolConfiguration.preferringMulticolor())
    default:
      if #available(iOS 16.0, *) {
        configuration = configuration.applying(UIImage.SymbolConfiguration.preferringMonochrome())
      }
    }

    if gradient, #available(iOS 26.0, *) {
      configuration = configuration.applying(UIImage.SymbolConfiguration(colorRenderingMode: .gradient))
    }

    imageView.preferredSymbolConfiguration = configuration
  }

  /**
   Starts, restarts or stops the effect. With an `effectTrigger` it plays once each time the trigger changes (not when
   the view first appears); without one it runs while `effectActive`. Scale, appear and disappear are states that hold
   while active, so they always follow `effectActive`.
   */
  private func applyEffect() {
    guard #available(iOS 17.0, *) else {
      return
    }

    let trigger = effectTrigger
    let previousTrigger = lastTrigger
    lastTrigger = trigger

    guard let effect, shown?.isSymbol == true else {
      stopEffect()
      return
    }

    if let trigger, !effect.isState {
      if playing != nil {
        stopEffect()
      }
      if let previousTrigger, previousTrigger != trigger {
        NativeIconEffectPlayer.play(effect, on: imageView, once: true)
      }
      return
    }

    if !effectActive {
      stopEffect()
      return
    }

    if playing != effect {
      stopEffect()
      playing = effect
      NativeIconEffectPlayer.play(effect, on: imageView, once: false)
    }
  }

  private func stopEffect() {
    guard #available(iOS 17.0, *), playing != nil else {
      return
    }

    playing = nil
    imageView.removeAllSymbolEffects(animated: true)
  }
}
