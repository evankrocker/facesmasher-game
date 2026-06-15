import SwiftUI

struct HighScoresView: View {
    @EnvironmentObject var highScoreStore: HighScoreStore
    @Environment(\.dismiss) var dismiss
    @State private var selectedDifficulty: Difficulty = .medium
    @State private var showClearConfirm = false

    private let dateFormatter: DateFormatter = {
        let f = DateFormatter()
        f.dateStyle = .short
        f.timeStyle = .none
        return f
    }()

    var body: some View {
        NavigationView {
            ZStack {
                Color(red: 0.1, green: 0.1, blue: 0.18).ignoresSafeArea()

                VStack(spacing: 0) {
                    // Difficulty picker
                    Picker("Difficulty", selection: $selectedDifficulty) {
                        ForEach(Difficulty.allCases, id: \.self) { d in
                            Text(d.rawValue).tag(d)
                        }
                    }
                    .pickerStyle(.segmented)
                    .padding()

                    let top = highScoreStore.topScores(for: selectedDifficulty)

                    if top.isEmpty {
                        Spacer()
                        VStack(spacing: 12) {
                            Image(systemName: "trophy")
                                .font(.system(size: 50))
                                .foregroundColor(.yellow.opacity(0.3))
                            Text("No scores yet!")
                                .font(.title3)
                                .foregroundColor(.white.opacity(0.5))
                            Text("Play a game to set the first record.")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.3))
                        }
                        Spacer()
                    } else {
                        List {
                            ForEach(Array(top.enumerated()), id: \.element.id) { i, entry in
                                HStack {
                                    Text("\(i + 1).")
                                        .font(.system(size: 18, weight: .bold))
                                        .foregroundColor(rankColor(i))
                                        .frame(width: 30)

                                    VStack(alignment: .leading) {
                                        Text(entry.playerName)
                                            .font(.system(size: 16, weight: .semibold))
                                            .foregroundColor(.white)
                                        Text(dateFormatter.string(from: entry.date))
                                            .font(.caption)
                                            .foregroundColor(.white.opacity(0.4))
                                    }

                                    Spacer()

                                    Text("\(entry.score)")
                                        .font(.system(size: 20, weight: .black, design: .rounded))
                                        .foregroundColor(.yellow)
                                }
                                .listRowBackground(Color(red: 0.13, green: 0.13, blue: 0.22))
                            }
                        }
                        .listStyle(.plain)
                        .scrollContentBackground(.hidden)
                    }
                }
            }
            .navigationTitle("High Scores")
            .navigationBarTitleDisplayMode(.inline)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Done") { dismiss() }
                        .foregroundColor(.yellow)
                }
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Clear") { showClearConfirm = true }
                        .foregroundColor(.red.opacity(0.8))
                }
            }
            .alert("Clear Scores?", isPresented: $showClearConfirm) {
                Button("Cancel", role: .cancel) {}
                Button("Clear \(selectedDifficulty.rawValue)", role: .destructive) {
                    highScoreStore.clearScores(for: selectedDifficulty)
                }
            } message: {
                Text("This will remove all \(selectedDifficulty.rawValue) scores.")
            }
        }
    }

    private func rankColor(_ rank: Int) -> Color {
        switch rank {
        case 0: return .yellow
        case 1: return Color(white: 0.75)
        case 2: return Color(red: 0.8, green: 0.5, blue: 0.2)
        default: return .white.opacity(0.5)
        }
    }
}
