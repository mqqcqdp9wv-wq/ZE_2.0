#!/usr/bin/env python3
"""
Telegram Bot Integration - Python Backend
Отправка заявок из контактной формы в Telegram
"""

from http.server import HTTPServer, BaseHTTPRequestHandler
import json
import urllib.request
import urllib.parse
from datetime import datetime

# ============================================
# CONFIGURATION
# ============================================
TELEGRAM_BOT_TOKEN = '8223297194:AAGrxlYqx67E4FqjMCd_3m_BWNAD-Lxd59A'
TELEGRAM_CHAT_ID = '8141249044'  # Владислав (@I9006)

# ============================================
# FORMAT MESSAGE
# ============================================
def format_telegram_message(data):
    """Форматирование сообщения для Telegram"""
    goal = data.get('goal', 'Новая заявка')
    
    message = f"🎯 <b>{goal}</b>\n\n"
    
    # Basic info
    if data.get('name'):
        message += f"👤 <b>Имя:</b> {data['name']}\n"
    
    if data.get('phone'):
        message += f"📱 <b>Телефон:</b> {data['phone']}\n"
    
    if data.get('car'):
        message += f"🚗 <b>Автомобиль:</b> {data['car']}\n"
    
    # Service details
    if data.get('service'):
        message += f"\n💼 <b>Услуга:</b> {data['service']}\n"
    
    if data.get('services'):
        services_list = data['services']
        if isinstance(services_list, list) and services_list:
            message += f"\n💼 <b>Услуги:</b> {', '.join(services_list)}\n"
        elif services_list:
            message += f"\n💼 <b>Услуги:</b> {services_list}\n"
    
    if data.get('old_film'):
        message += f"🔄 <b>Старая пленка:</b> {data['old_film']}\n"
    
    if data.get('film'):
        message += f"🎞 <b>Пленка:</b> {data['film']}\n"
    
    if data.get('timing'):
        message += f"⏰ <b>Когда:</b> {data['timing']}\n"
    
    if data.get('when'):
        message += f"⏰ <b>Когда:</b> {data['when']}\n"
    
    if data.get('source'):
        message += f"📍 <b>Откуда узнали:</b> {data['source']}\n"
    
    if data.get('has_photo'):
        message += f"📷 <b>Есть фото:</b> {data['has_photo']}\n"
    
    if data.get('contact_method'):
        message += f"📞 <b>Как связаться:</b> {data['contact_method']}\n"
    
    # Comments
    if data.get('comment'):
        message += f"\n💬 <b>Комментарий:</b>\n{data['comment']}\n"
    
    if data.get('notes'):
        message += f"\n📝 <b>Уточнения:</b>\n{data['notes']}\n"
    
    if data.get('message'):
        message += f"\n✉️ <b>Сообщение:</b>\n{data['message']}\n"
    
    # Timestamp
    if data.get('timestamp'):
        message += f"\n🕐 {data['timestamp']}"
    else:
        message += f"\n🕐 {datetime.now().strftime('%d.%m.%Y %H:%M:%S')}"
    
    return message

# ============================================
# SEND TO TELEGRAM
# ============================================
def send_telegram_message(message, chat_id, bot_token):
    """Отправка сообщения в Telegram"""
    url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
    
    data = {
        'chat_id': chat_id,
        'text': message,
        'parse_mode': 'HTML'
    }
    
    try:
        req = urllib.request.Request(
            url,
            data=urllib.parse.urlencode(data).encode('utf-8'),
            headers={'Content-Type': 'application/x-www-form-urlencoded'}
        )
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode('utf-8'))
            
            if result.get('ok'):
                return {
                    'success': True,
                    'message_id': result['result']['message_id']
                }
            else:
                return {
                    'success': False,
                    'error': result.get('description', 'Unknown error')
                }
    
    except Exception as e:
        return {
            'success': False,
            'error': str(e)
        }

# ============================================
# HTTP REQUEST HANDLER
# ============================================
class TelegramHandler(BaseHTTPRequestHandler):
    
    def do_OPTIONS(self):
        """Handle preflight CORS"""
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()
    
    def do_POST(self):
        """Handle POST request"""
        try:
            # Read request body
            content_length = int(self.headers.get('Content-Length', 0))
            body = self.rfile.read(content_length).decode('utf-8')
            
            # Parse JSON
            data = json.loads(body)
            
            # Validate required fields
            if not data.get('name') or not data.get('phone'):
                self.send_response(400)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': 'Missing required fields: name or phone'
                }).encode('utf-8'))
                return
            
            # Format message
            message = format_telegram_message(data)
            
            # Send to Telegram
            result = send_telegram_message(message, TELEGRAM_CHAT_ID, TELEGRAM_BOT_TOKEN)
            
            if result['success']:
                self.send_response(200)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': True,
                    'message': 'Заявка успешно отправлена в Telegram',
                    'message_id': result['message_id']
                }).encode('utf-8'))
            else:
                self.send_response(500)
                self.send_header('Access-Control-Allow-Origin', '*')
                self.send_header('Content-Type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({
                    'success': False,
                    'error': result['error']
                }).encode('utf-8'))
        
        except json.JSONDecodeError:
            self.send_response(400)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': 'Invalid JSON'
            }).encode('utf-8'))
        
        except Exception as e:
            self.send_response(500)
            self.send_header('Access-Control-Allow-Origin', '*')
            self.send_header('Content-Type', 'application/json; charset=utf-8')
            self.end_headers()
            self.wfile.write(json.dumps({
                'success': False,
                'error': str(e)
            }).encode('utf-8'))
    
    def log_message(self, format, *args):
        """Custom log format"""
        print(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {format % args}")

# ============================================
# MAIN
# ============================================
if __name__ == '__main__':
    PORT = 9001
    server = HTTPServer(('0.0.0.0', PORT), TelegramHandler)
    print(f"🚀 Telegram Backend запущен на порту {PORT}")
    print(f"📱 Bot: @ze_studio48bid_bot")
    print(f"💬 Chat ID: {TELEGRAM_CHAT_ID}")
    print(f"⏳ Ожидание запросов...")
    server.serve_forever()
