<?php
/**
 * Minimal, dependency-free hit counter for the "QR codes generated" ticker.
 * Stores a single integer in data/counter.json. No visitor data of any
 * kind is read, logged, or stored — only a running total is incremented.
 *
 * Usage:
 *   counter.php?action=get  -> returns current count, does not increment
 *   counter.php?action=hit  -> increments and returns the new count
 */

header('Content-Type: application/json');

$dataDir = __DIR__ . '/data';
$file = $dataDir . '/counter.json';

if (!is_dir($dataDir)) {
    @mkdir($dataDir, 0755, true);
}

if (!file_exists($file)) {
    @file_put_contents($file, json_encode(['count' => 0]));
}

$action = isset($_GET['action']) && $_GET['action'] === 'hit' ? 'hit' : 'get';

$fp = @fopen($file, 'c+');
if (!$fp) {
    http_response_code(500);
    echo json_encode(['error' => 'counter unavailable']);
    exit;
}

flock($fp, LOCK_EX);
$contents = stream_get_contents($fp);
$data = json_decode($contents, true);
if (!is_array($data) || !isset($data['count']) || !is_int($data['count'])) {
    $data = ['count' => 0];
}

if ($action === 'hit') {
    $data['count'] += 1;
    ftruncate($fp, 0);
    rewind($fp);
    fwrite($fp, json_encode($data));
    fflush($fp);
}

flock($fp, LOCK_UN);
fclose($fp);

echo json_encode(['count' => $data['count']]);
