import UIKit
import WebKit
import Capacitor

private var kToolbarKey: UInt8 = 0
private var swizzled = false

class MyViewController: CAPBridgeViewController {

    private var toolbarView: UIView!
    private var allButtons: [ToolbarButton] = []

    private struct ToolbarButton {
        let id: String
        let sfSymbol: String
        let title: String
    }

    override func viewDidLoad() {
        super.viewDidLoad()
        buildToolbar()
        swizzleInputAccessoryView()
    }

    // MARK: - Build scrollable toolbar

    private func buildToolbar() {
        let undoRedo: [ToolbarButton] = [
            .init(id: "undo", sfSymbol: "arrow.uturn.backward", title: "Undo"),
            .init(id: "redo", sfSymbol: "arrow.uturn.forward", title: "Redo"),
        ]
        let formatting: [ToolbarButton] = [
            .init(id: "bold", sfSymbol: "bold", title: "Bold"),
            .init(id: "italic", sfSymbol: "italic", title: "Italic"),
            .init(id: "strikethrough", sfSymbol: "strikethrough", title: "Strikethrough"),
            .init(id: "heading", sfSymbol: "number", title: "Heading"),
            .init(id: "list", sfSymbol: "list.bullet", title: "List"),
            .init(id: "checklist", sfSymbol: "checklist", title: "Checklist"),
            .init(id: "quote", sfSymbol: "text.quote", title: "Quote"),
            .init(id: "code", sfSymbol: "chevron.left.forwardslash.chevron.right", title: "Code"),
            .init(id: "link", sfSymbol: "link", title: "Link"),
        ]
        allButtons = undoRedo + formatting

        let barHeight: CGFloat = 44

        // Container view — this is what gets set as inputAccessoryView
        let container = InputAccessoryContainerView(frame: CGRect(x: 0, y: 0, width: UIScreen.main.bounds.width, height: barHeight))
        container.autoresizingMask = [.flexibleWidth]

        // Blur background to match system keyboard look
        let blur = UIVisualEffectView(effect: UIBlurEffect(style: .systemMaterial))
        blur.frame = container.bounds
        blur.autoresizingMask = [.flexibleWidth, .flexibleHeight]
        container.addSubview(blur)

        // Top separator line
        let topBorder = UIView()
        topBorder.backgroundColor = UIColor.separator
        topBorder.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(topBorder)
        NSLayoutConstraint.activate([
            topBorder.topAnchor.constraint(equalTo: container.topAnchor),
            topBorder.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            topBorder.trailingAnchor.constraint(equalTo: container.trailingAnchor),
            topBorder.heightAnchor.constraint(equalToConstant: 1.0 / UIScreen.main.scale),
        ])

        // Scroll view for buttons
        let scrollView = UIScrollView()
        scrollView.showsHorizontalScrollIndicator = false
        scrollView.showsVerticalScrollIndicator = false
        scrollView.alwaysBounceHorizontal = true
        scrollView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(scrollView)

        // Dismiss button pinned to the right
        let dismissBtn = UIButton(type: .system)
        dismissBtn.setImage(UIImage(systemName: "keyboard.chevron.compact.down"), for: .normal)
        dismissBtn.addTarget(self, action: #selector(dismissKeyboard), for: .touchUpInside)
        dismissBtn.accessibilityLabel = "Dismiss keyboard"
        dismissBtn.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(dismissBtn)

        NSLayoutConstraint.activate([
            dismissBtn.trailingAnchor.constraint(equalTo: container.trailingAnchor, constant: -8),
            dismissBtn.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            dismissBtn.widthAnchor.constraint(equalToConstant: 36),
            dismissBtn.heightAnchor.constraint(equalToConstant: barHeight),

            scrollView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            scrollView.topAnchor.constraint(equalTo: container.topAnchor),
            scrollView.bottomAnchor.constraint(equalTo: container.bottomAnchor),
            scrollView.trailingAnchor.constraint(equalTo: dismissBtn.leadingAnchor, constant: -4),
        ])

        // Stack view inside scroll view
        let stack = UIStackView()
        stack.axis = .horizontal
        stack.alignment = .center
        stack.spacing = 2
        stack.translatesAutoresizingMaskIntoConstraints = false
        scrollView.addSubview(stack)

        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.leadingAnchor, constant: 8),
            stack.trailingAnchor.constraint(equalTo: scrollView.contentLayoutGuide.trailingAnchor, constant: -8),
            stack.topAnchor.constraint(equalTo: scrollView.contentLayoutGuide.topAnchor),
            stack.bottomAnchor.constraint(equalTo: scrollView.contentLayoutGuide.bottomAnchor),
            stack.heightAnchor.constraint(equalTo: scrollView.frameLayoutGuide.heightAnchor),
        ])

        // Add undo/redo buttons
        for (i, btn) in undoRedo.enumerated() {
            stack.addArrangedSubview(makeButton(btn, tag: i))
        }

        // Divider
        stack.addArrangedSubview(makeDivider())

        // Format buttons
        for (i, btn) in formatting.enumerated() {
            stack.addArrangedSubview(makeButton(btn, tag: undoRedo.count + i))
        }

        toolbarView = container
    }

    private func makeButton(_ btn: ToolbarButton, tag: Int) -> UIButton {
        let button = UIButton(type: .system)
        button.setImage(UIImage(systemName: btn.sfSymbol), for: .normal)
        button.tag = tag
        button.accessibilityLabel = btn.title
        button.addTarget(self, action: #selector(toolbarButtonTapped(_:)), for: .touchUpInside)
        button.translatesAutoresizingMaskIntoConstraints = false
        NSLayoutConstraint.activate([
            button.widthAnchor.constraint(equalToConstant: 40),
            button.heightAnchor.constraint(equalToConstant: 40),
        ])
        return button
    }

    private func makeDivider() -> UIView {
        let container = UIView()
        container.translatesAutoresizingMaskIntoConstraints = false
        let line = UIView()
        line.backgroundColor = .separator
        line.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(line)
        NSLayoutConstraint.activate([
            container.widthAnchor.constraint(equalToConstant: 9),
            container.heightAnchor.constraint(equalToConstant: 40),
            line.centerXAnchor.constraint(equalTo: container.centerXAnchor),
            line.centerYAnchor.constraint(equalTo: container.centerYAnchor),
            line.widthAnchor.constraint(equalToConstant: 1),
            line.heightAnchor.constraint(equalToConstant: 24),
        ])
        return container
    }

    // MARK: - Actions

    @objc private func toolbarButtonTapped(_ sender: UIButton) {
        guard sender.tag >= 0, sender.tag < allButtons.count else { return }
        let id = allButtons[sender.tag].id
        webView?.evaluateJavaScript(
            "window.dispatchEvent(new CustomEvent('nativeToolbarTap',{detail:'\(id)'}))"
        )
    }

    @objc private func dismissKeyboard() {
        webView?.endEditing(true)
    }

    // MARK: - Swizzle WKContentView.inputAccessoryView

    private func swizzleInputAccessoryView() {
        guard !swizzled else { return }
        guard let wkContentViewClass = NSClassFromString("WKContentView") else { return }

        let sel = NSSelectorFromString("inputAccessoryView")
        guard let original = class_getInstanceMethod(wkContentViewClass, sel) else { return }

        let block: @convention(block) (AnyObject) -> UIView? = { obj in
            var view = obj as? UIView
            while let v = view {
                if let wk = v as? WKWebView {
                    return objc_getAssociatedObject(wk, &kToolbarKey) as? UIView
                }
                view = v.superview
            }
            return nil
        }

        method_setImplementation(original, imp_implementationWithBlock(block))
        swizzled = true

        if let wv = self.webView {
            objc_setAssociatedObject(wv, &kToolbarKey, toolbarView, .OBJC_ASSOCIATION_RETAIN_NONATOMIC)
        }
    }
}

/// Subclass so the system sizes the inputAccessoryView correctly.
/// Must override intrinsicContentSize to report the desired height.
class InputAccessoryContainerView: UIView {
    override var intrinsicContentSize: CGSize {
        return CGSize(width: UIView.noIntrinsicMetric, height: 44)
    }
}
