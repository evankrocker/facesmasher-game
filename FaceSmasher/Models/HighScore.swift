import Foundation

struct HighScore: Identifiable, Codable {
    let id: UUID
    let playerName: String
    let score: Int
    let difficulty: Difficulty
    let date: Date
}

class HighScoreStore: ObservableObject {
    @Published var scores: [HighScore] = []

    init() {
        load()
    }

    func add(name: String, score: Int, difficulty: Difficulty) {
        let entry = HighScore(id: UUID(), playerName: name, score: score, difficulty: difficulty, date: Date())
        scores.append(entry)
        scores = Array(scores.sorted { $0.score > $1.score }.prefix(50))
        save()
    }

    func topScores(for difficulty: Difficulty) -> [HighScore] {
        scores.filter { $0.difficulty == difficulty }
              .sorted { $0.score > $1.score }
              .prefix(10)
              .map { $0 }
    }

    func clearScores(for difficulty: Difficulty) {
        scores.removeAll { $0.difficulty == difficulty }
        save()
    }

    private func save() {
        if let data = try? JSONEncoder().encode(scores) {
            UserDefaults.standard.set(data, forKey: "highScores")
        }
    }

    private func load() {
        if let data = UserDefaults.standard.data(forKey: "highScores"),
           let decoded = try? JSONDecoder().decode([HighScore].self, from: data) {
            scores = decoded
        }
    }
}
