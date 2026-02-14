<?php
/**
 * Telegram Bot Integration
 * Отправка заявок из контактной формы в Telegram
 */

// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// CORS headers
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=utf-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'error' => 'Method not allowed']);
    exit();
}

// ============================================
// CONFIGURATION
// ============================================
define('TELEGRAM_BOT_TOKEN', 'YOUR_BOT_TOKEN_HERE');
define('TELEGRAM_CHAT_ID', 'YOUR_CHAT_ID_HERE'); // Владислав (@I9006)

// ============================================
// GET INPUT DATA
// ============================================
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid JSON']);
    exit();
}

// ============================================
// VALIDATE REQUIRED FIELDS
// ============================================
$requiredFields = ['name', 'phone'];
foreach ($requiredFields as $field) {
    if (empty($data[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => "Missing required field: $field"]);
        exit();
    }
}

// ============================================
// FORMAT MESSAGE
// ============================================
function formatTelegramMessage($data) {
    $goal = $data['goal'] ?? 'Новая заявка';
    
    $message = "🎯 <b>$goal</b>\n\n";
    
    // Basic info
    if (!empty($data['name'])) {
        $message .= "👤 <b>Имя:</b> " . htmlspecialchars($data['name']) . "\n";
    }
    
    if (!empty($data['phone'])) {
        $message .= "📱 <b>Телефон:</b> " . htmlspecialchars($data['phone']) . "\n";
    }
    
    if (!empty($data['car'])) {
        $message .= "🚗 <b>Автомобиль:</b> " . htmlspecialchars($data['car']) . "\n";
    }
    
    // Service details
    if (!empty($data['service'])) {
        $message .= "\n💼 <b>Услуга:</b> " . htmlspecialchars($data['service']) . "\n";
    }
    
    if (!empty($data['film'])) {
        $message .= "🎞 <b>Пленка:</b> " . htmlspecialchars($data['film']) . "\n";
    }
    
    if (!empty($data['timing'])) {
        $message .= "⏰ <b>Когда:</b> " . htmlspecialchars($data['timing']) . "\n";
    }
    
    // Comments
    if (!empty($data['comment'])) {
        $message .= "\n💬 <b>Комментарий:</b>\n" . htmlspecialchars($data['comment']) . "\n";
    }
    
    if (!empty($data['notes'])) {
        $message .= "\n📝 <b>Уточнения:</b>\n" . htmlspecialchars($data['notes']) . "\n";
    }
    
    if (!empty($data['message'])) {
        $message .= "\n✉️ <b>Сообщение:</b>\n" . htmlspecialchars($data['message']) . "\n";
    }
    
    // Timestamp
    if (!empty($data['timestamp'])) {
        $message .= "\n🕐 " . htmlspecialchars($data['timestamp']);
    } else {
        $message .= "\n🕐 " . date('d.m.Y H:i:s');
    }
    
    return $message;
}

// ============================================
// SEND TO TELEGRAM
// ============================================
function sendTelegramMessage($message, $chatId, $botToken) {
    $url = "https://api.telegram.org/bot{$botToken}/sendMessage";
    
    $postData = [
        'chat_id' => $chatId,
        'text' => $message,
        'parse_mode' => 'HTML'
    ];
    
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($postData));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 10);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);
    
    if ($curlError) {
        return [
            'success' => false,
            'error' => 'cURL error: ' . $curlError
        ];
    }
    
    $result = json_decode($response, true);
    
    if ($httpCode !== 200 || !$result['ok']) {
        return [
            'success' => false,
            'error' => $result['description'] ?? 'Unknown Telegram API error',
            'http_code' => $httpCode,
            'response' => $result
        ];
    }
    
    return [
        'success' => true,
        'message_id' => $result['result']['message_id']
    ];
}

// ============================================
// MAIN EXECUTION
// ============================================

// Check if chat ID is configured
if (TELEGRAM_CHAT_ID === 'PLACEHOLDER') {
    // Try to get chat ID from recent messages
    $getUpdatesUrl = "https://api.telegram.org/bot" . TELEGRAM_BOT_TOKEN . "/getUpdates";
    $updates = @file_get_contents($getUpdatesUrl);
    
    if ($updates) {
        $updatesData = json_decode($updates, true);
        if (!empty($updatesData['result'])) {
            $lastUpdate = end($updatesData['result']);
            $detectedChatId = $lastUpdate['message']['chat']['id'] ?? null;
            
            if ($detectedChatId) {
                // Use detected chat ID
                $chatId = $detectedChatId;
                
                echo json_encode([
                    'success' => true,
                    'message' => 'Отправлено',
                    'note' => 'Chat ID обнаружен автоматически: ' . $chatId . '. Пожалуйста, обновите TELEGRAM_CHAT_ID в send-telegram.php',
                    'chat_id' => $chatId
                ]);
                exit();
            }
        }
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Chat ID не настроен. Пожалуйста, отправьте сообщение боту @ze_studio48bid_bot и обновите эту страницу.'
    ]);
    exit();
}

$message = formatTelegramMessage($data);
$result = sendTelegramMessage($message, TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN);

if ($result['success']) {
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Заявка успешно отправлена в Telegram',
        'message_id' => $result['message_id']
    ]);
} else {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $result['error'],
        'details' => $result
    ]);
}
?>
