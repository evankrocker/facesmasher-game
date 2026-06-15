import SwiftUI
import PhotosUI

struct PhotoSetupView: View {
    @EnvironmentObject var gameState: GameState
    @Environment(\.dismiss) var dismiss

    @State private var selectedItem: PhotosPickerItem? = nil
    @State private var pickedImage: UIImage? = nil
    @State private var cropScale: CGFloat = 1.0
    @State private var cropOffset: CGSize = .zero
    @State private var lastScale: CGFloat = 1.0
    @State private var lastOffset: CGSize = .zero

    private let previewSize: CGFloat = 240

    var body: some View {
        NavigationStack {
            ZStack {
                Color(red: 0.1, green: 0.1, blue: 0.18).ignoresSafeArea()

                VStack(spacing: 28) {
                    Text("Set Your Face")
                        .font(.system(size: 28, weight: .black, design: .rounded))
                        .foregroundColor(.yellow)

                    if let img = pickedImage {
                        // Crop preview
                        ZStack {
                            Color.black.opacity(0.4)
                                .frame(width: previewSize, height: previewSize)

                            Image(uiImage: img)
                                .resizable()
                                .scaledToFill()
                                .frame(width: previewSize * cropScale, height: previewSize * cropScale)
                                .offset(cropOffset)
                                .frame(width: previewSize, height: previewSize)
                                .clipped()

                            CropOverlay(size: previewSize)
                        }
                        .frame(width: previewSize, height: previewSize)
                        .clipShape(RoundedRectangle(cornerRadius: 12))
                        .gesture(
                            SimultaneousGesture(
                                MagnificationGesture()
                                    .onChanged { value in
                                        cropScale = max(1.0, lastScale * value)
                                    }
                                    .onEnded { _ in
                                        lastScale = cropScale
                                    },
                                DragGesture()
                                    .onChanged { value in
                                        cropOffset = CGSize(
                                            width: lastOffset.width + value.translation.width,
                                            height: lastOffset.height + value.translation.height
                                        )
                                    }
                                    .onEnded { _ in
                                        lastOffset = cropOffset
                                    }
                            )
                        )
                        .accessibilityLabel("Face crop preview")
                        .accessibilityHint("Pinch to zoom and drag to reposition your face")

                        Text("Pinch to zoom · Drag to reposition")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.6))

                        Button {
                            if let cropped = renderCroppedImage(from: img) {
                                gameState.saveFaceImage(cropped)
                                dismiss()
                            }
                        } label: {
                            Text("Use This Photo")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 40)
                                .padding(.vertical, 14)
                                .background(Color.yellow)
                                .clipShape(Capsule())
                        }
                        .accessibilityLabel("Use this photo as your game face")
                    } else {
                        Circle()
                            .fill(Color.gray.opacity(0.2))
                            .frame(width: previewSize, height: previewSize)
                            .overlay(
                                Image(systemName: "person.crop.circle.badge.plus")
                                    .font(.system(size: 60))
                                    .foregroundColor(.gray)
                            )
                            .accessibilityLabel("No photo selected")
                    }

                    PhotosPicker(selection: $selectedItem, matching: .images) {
                        Label("Choose from Library", systemImage: "photo.on.rectangle")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 28)
                            .padding(.vertical, 12)
                            .background(Color.blue.opacity(0.7))
                            .clipShape(Capsule())
                    }

                    Spacer()
                }
                .padding(.top, 20)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.yellow)
                }
            }
        }
        .task(id: selectedItem) {
            guard let item = selectedItem,
                  let data = try? await item.loadTransferable(type: Data.self),
                  let uiImage = UIImage(data: data) else { return }
            await MainActor.run {
                pickedImage = uiImage
                cropScale = 1.0
                cropOffset = .zero
                lastScale = 1.0
                lastOffset = .zero
            }
        }
    }

    private func renderCroppedImage(from image: UIImage) -> UIImage? {
        let size = CGSize(width: 200, height: 200)
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { ctx in
            let context = ctx.cgContext
            context.addEllipse(in: CGRect(origin: .zero, size: size))
            context.clip()
            let scaledSize = CGSize(width: size.width * cropScale, height: size.height * cropScale)
            let origin = CGPoint(
                x: (size.width - scaledSize.width) / 2 + cropOffset.width,
                y: (size.height - scaledSize.height) / 2 + cropOffset.height
            )
            image.draw(in: CGRect(origin: origin, size: scaledSize))
        }
    }
}

struct CropOverlay: View {
    let size: CGFloat

    var body: some View {
        ZStack {
            Color.black.opacity(0.5)
            Circle()
                .frame(width: size * 0.85, height: size * 0.85)
                .blendMode(.destinationOut)
        }
        .compositingGroup()
        .frame(width: size, height: size)
        .overlay(
            Circle()
                .stroke(Color.yellow, lineWidth: 2)
                .frame(width: size * 0.85, height: size * 0.85)
        )
        .allowsHitTesting(false)
    }
}
