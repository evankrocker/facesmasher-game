import SwiftUI

struct MoleView: View {
    let index: Int
    @EnvironmentObject var gameState: GameState

    private var isActive: Bool { gameState.activeMoles.contains(index) }
    private var isSmashedState: Bool { gameState.smashedMoles.contains(index) }

    var body: some View {
        GeometryReader { geo in
            let size = geo.size.width
            ZStack {
                // Hole
                Ellipse()
                    .fill(Color(red: 0.1, green: 0.08, blue: 0.05))
                    .frame(width: size, height: size * 0.45)
                    .shadow(color: .black.opacity(0.8), radius: 8, x: 0, y: 4)
                    .frame(maxHeight: .infinity, alignment: .bottom)

                // Mole face
                if let face = gameState.faceImage {
                    Image(uiImage: face)
                        .resizable()
                        .scaledToFill()
                        .frame(width: size * 0.75, height: size * 0.75)
                        .clipShape(Circle())
                        .overlay(Circle().stroke(Color.yellow, lineWidth: 3))
                        .scaleEffect(isSmashedState ? 1.3 : 1.0)
                        .rotationEffect(isSmashedState ? .degrees(Double.random(in: -20...20)) : .zero)
                        .offset(y: isActive ? size * 0.05 : size * 0.7)
                        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isActive)
                        .animation(.spring(response: 0.2, dampingFraction: 0.4), value: isSmashedState)
                } else {
                    // Placeholder mole
                    Circle()
                        .fill(Color.brown)
                        .frame(width: size * 0.75, height: size * 0.75)
                        .overlay(Circle().stroke(Color.yellow, lineWidth: 3))
                        .overlay(
                            Text("🐹")
                                .font(.system(size: size * 0.4))
                        )
                        .offset(y: isActive ? size * 0.05 : size * 0.7)
                        .animation(.spring(response: 0.3, dampingFraction: 0.6), value: isActive)
                }

                // Smash overlay
                if isSmashedState {
                    ZStack {
                        ForEach(0..<6, id: \.self) { i in
                            Text(["⭐️", "💥", "✨", "🌟"][i % 4])
                                .font(.system(size: size * 0.18))
                                .offset(
                                    x: cos(Double(i) * .pi / 3) * Double(size) * 0.4,
                                    y: sin(Double(i) * .pi / 3) * Double(size) * 0.4
                                )
                        }
                        Text("SMASH!")
                            .font(.system(size: size * 0.18, weight: .black))
                            .foregroundColor(.yellow)
                            .shadow(color: .orange, radius: 4)
                    }
                    .transition(.scale.combined(with: .opacity))
                }
            }
            .frame(width: size, height: size)
            .contentShape(Rectangle())
            .onTapGesture {
                if isActive {
                    gameState.smashMole(index: index)
                }
            }
            .clipped()
        }
        .aspectRatio(1, contentMode: .fit)
    }
}
