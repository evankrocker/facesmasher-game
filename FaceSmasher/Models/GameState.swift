import SwiftUI
import Combine

class GameState: ObservableObject {
    @Published var score: Int = 0
    @Published var timeRemaining: Double = 60
    @Published var isPlaying: Bool = false
    @Published var isGameOver: Bool = false
    @Published var activeMoles: Set<Int> = []
    @Published var smashedMoles: Set<Int> = []
    @Published var faceImage: UIImage? = nil
    @Published var difficulty: Difficulty = .medium

    private var countdownTimer: AnyCancellable?
    private var spawnTimer: AnyCancellable?
    private var moleTimers: [Int: DispatchWorkItem] = [:]

    init() {
        loadFaceImage()
    }

    func startGame() {
        score = 0
        timeRemaining = difficulty.gameDuration
        activeMoles = []
        smashedMoles = []
        isPlaying = true
        isGameOver = false
        startCountdown()
        startSpawning()
    }

    func smashMole(index: Int) {
        guard activeMoles.contains(index) else { return }
        activeMoles.remove(index)
        moleTimers[index]?.cancel()
        moleTimers[index] = nil
        score += difficulty.pointsPerSmash
        withAnimation(.spring(response: 0.3, dampingFraction: 0.5)) {
            smashedMoles.insert(index)
        }
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.4) { [weak self] in
            withAnimation {
                self?.smashedMoles.remove(index)
            }
        }
    }

    func endGame() {
        isPlaying = false
        isGameOver = true
        countdownTimer?.cancel()
        spawnTimer?.cancel()
        moleTimers.values.forEach { $0.cancel() }
        moleTimers = [:]
        activeMoles = []
        smashedMoles = []
    }

    func resetGame() {
        isPlaying = false
        isGameOver = false
        score = 0
        timeRemaining = difficulty.gameDuration
        activeMoles = []
        smashedMoles = []
        countdownTimer?.cancel()
        spawnTimer?.cancel()
        moleTimers.values.forEach { $0.cancel() }
        moleTimers = [:]
    }

    private func startCountdown() {
        countdownTimer?.cancel()
        countdownTimer = Timer.publish(every: 0.1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self = self else { return }
                if self.timeRemaining > 0.05 {
                    self.timeRemaining -= 0.1
                } else {
                    self.timeRemaining = 0
                    self.endGame()
                }
            }
    }

    private func startSpawning() {
        spawnTimer?.cancel()
        spawnTimer = Timer.publish(every: difficulty.spawnInterval, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                self?.spawnMole()
            }
    }

    private func spawnMole() {
        guard isPlaying else { return }
        let available = Set(0...8).subtracting(activeMoles).subtracting(smashedMoles)
        guard !available.isEmpty else { return }
        let currentActive = activeMoles.count
        guard currentActive < difficulty.maxActiveMoles else { return }
        guard let index = available.randomElement() else { return }
        withAnimation(.spring(response: 0.3, dampingFraction: 0.6)) {
            activeMoles.insert(index)
        }
        let workItem = DispatchWorkItem { [weak self] in
            guard let self = self else { return }
            if self.activeMoles.contains(index) {
                withAnimation(.easeIn(duration: 0.3)) {
                    self.activeMoles.remove(index)
                }
            }
            self.moleTimers[index] = nil
        }
        moleTimers[index] = workItem
        DispatchQueue.main.asyncAfter(deadline: .now() + difficulty.moleDisplayTime, execute: workItem)
    }

    func saveFaceImage(_ image: UIImage) {
        faceImage = image
        if let data = image.jpegData(compressionQuality: 0.8) {
            UserDefaults.standard.set(data, forKey: "faceImage")
        }
    }

    private func loadFaceImage() {
        if let data = UserDefaults.standard.data(forKey: "faceImage"),
           let image = UIImage(data: data) {
            faceImage = image
        }
    }
}
