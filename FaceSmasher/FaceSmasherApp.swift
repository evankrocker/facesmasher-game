import SwiftUI

@main
struct FaceSmasherApp: App {
    @StateObject private var gameState = GameState()
    @StateObject private var highScoreStore = HighScoreStore()

    var body: some Scene {
        WindowGroup {
            HomeView()
                .environmentObject(gameState)
                .environmentObject(highScoreStore)
                .preferredColorScheme(.dark)
        }
    }
}
