const fs = require('fs');
const path = require('path');

const botMenuPath = path.join(__dirname, 'api', 'vk-bot-menu-structure.json');
const canvasPath = path.join(__dirname, '04-Автоматизация', 'Конструктор-ВК-Бота.canvas');

const menuData = JSON.parse(fs.readFileSync(botMenuPath, 'utf8'));

// Размещение по слоям (сверху вниз)
const layoutConfig = {
    "welcome": { x: 3000, y: 0 },
    
    // Level 1
    "price": { x: 0, y: 500 },
    "films": { x: 2500, y: 500 },
    "process": { x: 4500, y: 500 },
    "faq": { x: 6500, y: 500 },
    "contacts": { x: 8000, y: 500 },

    // Level 2 (Price)
    "price_tint": { x: -1000, y: 1000 },
    "price_shield": { x: 1000, y: 1000 },
    
    // Level 3 (Zones)
    "zone_rear": { x: -3000, y: 1500 },
    "zone_front": { x: -2000, y: 1500 },
    "zone_wind": { x: -1000, y: 1500 },
    "zone_full": { x: 0, y: 1500 },

    // Level 4 (Materials)
    "mat_mc_rear": { x: -3200, y: 2200 },
    "mat_ct_rear": { x: -2800, y: 2200 },
    "mat_mc_front": { x: -2200, y: 2200 },
    "mat_ct_front": { x: -1800, y: 2200 },
    "mat_mc_wind": { x: -1200, y: 2200 },
    "mat_ct_wind": { x: -800, y: 2200 },
    "mat_mc_full": { x: -200, y: 2200 },
    "mat_ct_full": { x: 200, y: 2200 },
    "mat_help": { x: 800, y: 2200 },

    // Level 2 (Films)
    "film_mc": { x: 1500, y: 1000 },
    "film_ct": { x: 2000, y: 1000 },
    "film_cs": { x: 2500, y: 1000 },
    "film_help": { x: 3000, y: 1000 },

    // Level 2 (Process)
    "proc_time": { x: 3500, y: 1000 },
    "proc_prep": { x: 4000, y: 1000 },
    "proc_disasm": { x: 4500, y: 1000 },
    "proc_wash": { x: 5000, y: 1000 },
    "proc_warranty": { x: 5500, y: 1000 },

    // Level 2 (FAQ Cats)
    "faq_law": { x: 6000, y: 1000 },
    "faq_process": { x: 6500, y: 1000 },
    "faq_quality": { x: 7000, y: 1000 },

    // Level 3 (FAQ deep)
    "faq_law_gost": { x: 5500, y: 1500 },
    "faq_law_gps": { x: 5900, y: 1500 },
    "faq_law_adas": { x: 6300, y: 1500 },

    "faq_process_inside": { x: 6700, y: 1500 },
    "faq_process_wash": { x: 7100, y: 1500 },
    "faq_process_time": { x: 7500, y: 1500 },

    "faq_quality_why": { x: 7900, y: 1500 },
    "faq_quality_color": { x: 8300, y: 1500 },
    "faq_quality_iwfa": { x: 8700, y: 1500 }
};

const nodes = [];
const edges = [];
let edgeIdCounter = 1;

menuData.nodes.forEach(n => {
    let textStr = `# ${n.id}\n**Текст:**\n${n.text}`;
    if (n.keyboard && n.keyboard.buttons) {
        textStr += `\n***\n**Кнопки:**\n`;
        n.keyboard.buttons.forEach(row => {
            row.forEach(btn => {
                textStr += `- ${btn.label}\n`;
                if (btn.target && btn.target !== 'welcome') {
                    // avoid drawing back-edges to parent to keep the tree clean top-down
                    if (btn.label !== 'Назад') {
                        edges.push({
                            id: `e_${edgeIdCounter++}`,
                            fromNode: n.id,
                            fromSide: "bottom",
                            toNode: btn.target,
                            toSide: "top"
                        });
                    }
                }
            });
        });
    }

    const pos = layoutConfig[n.id] || { x: Math.random() * 2000, y: 3000 };

    nodes.push({
        id: n.id,
        type: "text",
        text: textStr.trim(),
        x: pos.x,
        y: pos.y,
        width: 350,
        height: 300
    });
});

const canvasData = {
    nodes,
    edges,
    metadata: { version: "1.0-1.0", frontmatter: {} }
};

fs.writeFileSync(canvasPath, JSON.stringify(canvasData, null, '\t'));
console.log('Canvas generated successfully!');
