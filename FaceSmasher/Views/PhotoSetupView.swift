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
    @State private var showPicker = false

    private let previewSize: CGFloat = 240

    var body: some View {
        NavigationView {
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

                            // Dark overlay with circular cutout
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
                                    .onEnded { value in
                                        lastScale = cropScale
                                    },
                                DragGesture()
                                    .onChanged { value in
                                        cropOffset = CGSize(
                                            width: lastOffset.width + value.translation.width,
                                            height: lastOffset.height + value.translation.height
                                        )
                                    }
                                    .onEnded { value in
                                        lastOffset = cropOffset
                                    }
                            )
                        )

                        Text("Pinch to zoom, drag to reposition")
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
                    } else {
                        // Empty state
                        Circle()
                            .fill(Color.gray.opacity(0.2))
                            .frame(width: previewSize, height: previewSize)
                            .overlay(
                                Image(systemName: "person.crop.circle.badge.plus")
                                    .font(.system(size: 60))
                                    .foregroundColor(.gray)
                            )
                    }

                    PhotosPicker(selection: $selectedItem, matching: .images) {
                        Label("Choose Photo", systemImage: "photo.on.rectangle")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 28)
                            .padding(.vertical, 12)
                            .background(Color.blue.opacity(0.7))
                            .clipShape(Capsule())
                    }
                    .onChange(of: selectedItem) { newItem in
                        Task {
                            if let data = try? await newItem?.loadTransferable(type: Data.self),
                               let uiImage = UIImage(data: data) {
                                await MainActor.run {
                                    pickedImage = uiImage
                                    cropScale = 1.0
                                    cropOffset = .zero
                                    lastScale = 1.0
                                    lastOffset = .zero
                                }
                            }
                        }
                    }

                    Spacer()
                }
                .padding(.top, 20)
            }
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Cancel") { dismiss() }
                        .foregroundColor(.yellow)
                }
            }
        }
    }

    private func renderCroppedImage(from image: UIImage) -> UIImage? {
        let size = CGSize(width: 200, height: 200)
        let renderer = UIGraphicsImageRenderer(size: size)
        return renderer.image { ctx in
            let context = ctx.cgContext
            // Clip to circle
            context.addEllipse(in: CGRect(origin: .zero, size: size))
            context.clip()

            // Calculate draw rect based on scale and offset
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
            // Dark overlay
            Color.black.opacity(0.5)
            // Cut out circle
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
    }
}
