import Foundation

enum Difficulty: String, CaseIterable, Codable {
    case easy = "Easy"
    case medium = "Medium"
    case hard = "Hard"

    var gameDuration: Double {
        switch self {
        case .easy: return 60
        case .medium: return 45
        case .hard: return 30
        }
    }

    var moleDisplayTime: Double {
        switch self {
        case .easy: return 2.5
        case .medium: return 1.5
        case .hard: return 0.8
        }
    }

    var spawnInterval: Double {
        switch self {
        case .easy: return 1.5
        case .medium: return 1.0
        case .hard: return 0.6
        }
    }

    var maxActiveMoles: Int {
        switch self {
        case .easy: return 1
        case .medium: return 2
        case .hard: return 3
        }
    }

    var pointsPerSmash: Int {
        switch self {
        case .easy: return 10
        case .medium: return 20
        case .hard: return 40
        }
    }
}
