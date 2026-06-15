import SwiftUI

struct GameView: View {
    @EnvironmentObject var gameState: GameState
    @EnvironmentObject var highScoreStore: HighScoreStore
    @Environment(\.dismiss) var dismiss

    @State private var playerName: String = ""
    @State private var scoreSaved: Bool = false
    @State private var showHomeConfirm: Bool = false

    private let columns = [
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8),
        GridItem(.flexible(), spacing: 8)
    ]

    var timerColor: Color {
        gameState.timeRemaining < 10 ? .red : .white
    }

    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [Color(red: 0.1, green: 0.1, blue: 0.18), Color(red: 0.07, green: 0.07, blue: 0.13)],
                startPoint: .top, endPoint: .bottom
            )
            .ignoresSafeArea()

            VStack(spacing: 12) {
                // HUD
                HStack {
                    VStack(alignment: .leading, spacing: 2) {
                        Text("SCORE")
                            .font(.caption)
                            .foregroundColor(.yellow.opacity(0.7))
                        Text("\(gameState.score)")
                            .font(.system(size: 32, weight: .black, design: .rounded))
                            .foregroundColor(.yellow)
                    }
                    Spacer()
                    VStack(alignment: .center, spacing: 2) {
                        Text(gameState.difficulty.rawValue.uppercased())
                            .font(.caption)
                            .foregroundColor(.cyan.opacity(0.7))
                        Text(gameState.difficulty.rawValue)
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(.cyan)
                    }
                    Spacer()
                    VStack(alignment: .trailing, spacing: 2) {
                        Text("TIME")
                            .font(.caption)
                            .foregroundColor(timerColor.opacity(0.7))
                        Text(String(format: "%.0f", max(0, gameState.timeRemaining)))
                            .font(.system(size: 32, weight: .black, design: .rounded))
                            .foregroundColor(timerColor)
                            .animation(.none, value: gameState.timeRemaining)
                    }
                }
                .padding(.horizontal)
                .padding(.top, 8)

                // Grid
                LazyVGrid(columns: columns, spacing: 8) {
                    ForEach(0..<9) { i in
                        MoleView(index: i)
                            .environmentObject(gameState)
                    }
                }
                .padding(.horizontal, 12)

                Spacer()
            }

            // Game Over Overlay
            if gameState.isGameOver {
                gameOverOverlay
            }
        }
        .navigationBarHidden(true)
        .onAppear {
            gameState.startGame()
        }
        .onDisappear {
            gameState.resetGame()
        }
        .alert("Return to Home?", isPresented: $showHomeConfirm) {
            Button("Cancel", role: .cancel) {}
            Button("Go Home", role: .destructive) {
                gameState.resetGame()
                dismiss()
            }
        } message: {
            Text("Your current game will be lost.")
        }
    }

    var gameOverOverlay: some View {
        ZStack {
            Color.black.opacity(0.85)
                .ignoresSafeArea()

            VStack(spacing: 20) {
                Text("GAME OVER!")
                    .font(.system(size: 40, weight: .black, design: .rounded))
                    .foregroundColor(.yellow)
                    .shadow(color: .orange, radius: 8)

                Text("Score: \(gameState.score)")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)

                if !scoreSaved {
                    VStack(spacing: 12) {
                        Text("Save your score?")
                            .font(.headline)
                            .foregroundColor(.white.opacity(0.8))
                        TextField("Enter your name", text: $playerName)
                            .textFieldStyle(RoundedBorderTextFieldStyle())
                            .padding(.horizontal, 40)
                            .autocorrectionDisabled()

                        Button {
                            if !playerName.trimmingCharacters(in: .whitespaces).isEmpty {
                                highScoreStore.add(
                                    name: playerName.trimmingCharacters(in: .whitespaces),
                                    score: gameState.score,
                                    difficulty: gameState.difficulty
                                )
                                scoreSaved = true
                            }
                        } label: {
                            Text("Save Score")
                                .font(.system(size: 18, weight: .bold))
                                .foregroundColor(.black)
                                .padding(.horizontal, 32)
                                .padding(.vertical, 12)
                                .background(Color.yellow)
                                .clipShape(Capsule())
                        }
                        .disabled(playerName.trimmingCharacters(in: .whitespaces).isEmpty)
                    }
                } else {
                    Text("Score saved! 🎉")
                        .font(.headline)
                        .foregroundColor(.green)
                }

                HStack(spacing: 20) {
                    Button {
                        scoreSaved = false
                        playerName = ""
                        gameState.startGame()
                    } label: {
                        Text("Play Again")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 28)
                            .padding(.vertical, 12)
                            .background(Color.blue)
                            .clipShape(Capsule())
                    }

                    Button {
                        gameState.resetGame()
                        dismiss()
                    } label: {
                        Text("Home")
                            .font(.system(size: 18, weight: .bold))
                            .foregroundColor(.white)
                            .padding(.horizontal, 28)
                            .padding(.vertical, 12)
                            .background(Color.gray.opacity(0.6))
                            .clipShape(Capsule())
                    }
                }
            }
            .padding(32)
            .background(
                RoundedRectangle(cornerRadius: 24)
                    .fill(Color(red: 0.1, green: 0.1, blue: 0.18))
                    .shadow(color: .black.opacity(0.5), radius: 20)
            )
            .padding(.horizontal, 20)
        }
        .transition(.opacity.combined(with: .scale(scale: 0.9)))
        .animation(.spring(response: 0.4, dampingFraction: 0.7), value: gameState.isGameOver)
    }
}
