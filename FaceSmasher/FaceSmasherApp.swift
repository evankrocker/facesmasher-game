import SwiftUI

@main
struct FaceSmasherApp: App {
    @StateObject private var gameState = GameState()
    @StateObject private var highScoreStore = HighScoreStore()

    init() {
        // Kick iCloud sync immediately so data is fresh before first use
        NSUbiquitousKeyValueStore.default.synchronize()
    }

    var body: some Scene {
        WindowGroup {
            HomeView()
                .environmentObject(gameState)
                .environmentObject(highScoreStore)
                .preferredColorScheme(.dark)
        }
    }
}
