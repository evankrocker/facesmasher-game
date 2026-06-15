import SwiftUI

struct HomeView: View {
    @EnvironmentObject var gameState: GameState
    @EnvironmentObject var highScoreStore: HighScoreStore
    @State private var showPhotoSetup = false
    @State private var showHighScores = false
    @State private var showGame = false
    @State private var pulseTitle = false

    var body: some View {
        NavigationStack {
            ZStack {
                LinearGradient(
                    colors: [
                        Color(red: 0.1, green: 0.1, blue: 0.18),
                        Color(red: 0.12, green: 0.06, blue: 0.2)
                    ],
                    startPoint: .top, endPoint: .bottom
                )
                .ignoresSafeArea()

                VStack(spacing: 32) {
                    Spacer()

                    // Title
                    VStack(spacing: 4) {
                        Text("FACE")
                            .font(.system(size: 56, weight: .black, design: .rounded))
                            .foregroundColor(.yellow)
                        Text("SMASHER")
                            .font(.system(size: 48, weight: .black, design: .rounded))
                            .foregroundColor(.orange)
                    }
                    .scaleEffect(pulseTitle ? 1.04 : 1.0)
                    .shadow(color: .orange.opacity(0.5), radius: 16)
                    .onAppear {
                        withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
                            pulseTitle = true
                        }
                    }

                    // Face preview / setup
                    Button {
                        showPhotoSetup = true
                    } label: {
                        ZStack {
                            Circle()
                                .fill(Color.gray.opacity(0.2))
                                .frame(width: 120, height: 120)
                                .overlay(Circle().stroke(Color.yellow.opacity(0.5), lineWidth: 2))

                            if let face = gameState.faceImage {
                                Image(uiImage: face)
                                    .resizable()
                                    .scaledToFill()
                                    .frame(width: 120, height: 120)
                                    .clipShape(Circle())
                                    .overlay(Circle().stroke(Color.yellow, lineWidth: 3))
                            } else {
                                VStack(spacing: 6) {
                                    Image(systemName: "person.crop.circle.badge.plus")
                                        .font(.system(size: 36))
                                        .foregroundColor(.yellow.opacity(0.7))
                                    Text("Set Face")
                                        .font(.caption)
                                        .foregroundColor(.white.opacity(0.6))
                                }
                            }
                        }
                    }

                    // Difficulty
                    VStack(spacing: 8) {
                        Text("DIFFICULTY")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.5))
                            .tracking(2)
                        Picker("Difficulty", selection: $gameState.difficulty) {
                            ForEach(Difficulty.allCases, id: \.self) { d in
                                Text(d.rawValue).tag(d)
                            }
                        }
                        .pickerStyle(.segmented)
                        .padding(.horizontal, 32)
                    }

                    // Buttons
                    VStack(spacing: 16) {
                        NavigationLink {
                            GameView()
                                .environmentObject(gameState)
                                .environmentObject(highScoreStore)
                        } label: {
                            Text("PLAY!")
                                .font(.system(size: 24, weight: .black, design: .rounded))
                                .foregroundColor(.black)
                                .frame(maxWidth: .infinity)
                                .padding(.vertical, 16)
                                .background(
                                    gameState.faceImage != nil
                                        ? LinearGradient(colors: [.yellow, .orange], startPoint: .leading, endPoint: .trailing)
                                        : LinearGradient(colors: [.gray.opacity(0.4), .gray.opacity(0.4)], startPoint: .leading, endPoint: .trailing)
                                )
                                .clipShape(Capsule())
                                .shadow(color: .orange.opacity(0.4), radius: 8)
                        }
                        .disabled(gameState.faceImage == nil)
                        .padding(.horizontal, 40)

                        if gameState.faceImage == nil {
                            Text("Set a face photo to play!")
                                .font(.caption)
                                .foregroundColor(.yellow.opacity(0.7))
                        }

                        Button {
                            showHighScores = true
                        } label: {
                            Label("High Scores", systemImage: "trophy.fill")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white.opacity(0.8))
                                .padding(.horizontal, 24)
                                .padding(.vertical, 10)
                                .background(Color.white.opacity(0.1))
                                .clipShape(Capsule())
                        }
                    }

                    Spacer()

                    Text("Tap the faces before they disappear!")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.3))
                        .padding(.bottom, 8)
                }
            }
            .navigationBarHidden(true)
            .sheet(isPresented: $showPhotoSetup) {
                PhotoSetupView()
                    .environmentObject(gameState)
            }
            .sheet(isPresented: $showHighScores) {
                HighScoresView()
                    .environmentObject(highScoreStore)
            }
        }
    }
}
