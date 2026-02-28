// Obsidian Google Map Clipper — Category to Template Mapping
// Maps Google Maps place categories to template IDs via keyword matching

const CATEGORY_RULES = [
    {
        templateId: 'restaurant',
        keywords: [
            // Chinese
            '餐', '饭店', '食堂', '定食', '料理', '火锅', '烧烤', '小吃', '面馆', '粉', '饺子',
            '快餐', '小龙虾', '串', '炸鸡', '汉堡', '披萨', '寿司', '拉面',
            // English
            'restaurant', 'food', 'dining', 'eatery', 'diner', 'grill', 'bbq',
            'pizza', 'burger', 'sushi', 'ramen', 'noodle', 'steakhouse', 'bistro',
            'brasserie', 'trattoria', 'fast food', 'takeaway', 'take-out',
            // Japanese
            '食堂', 'レストラン', 'ラーメン', '焼肉', '寿司', '居酒屋', 'うどん', 'そば',
            '定食', '丼', 'カレー', '弁当', 'とんかつ', '天ぷら', 'やきとり',
            // General
            'canteen', 'cafeteria'
        ]
    },
    {
        templateId: 'cafe',
        keywords: [
            '咖啡', '茶', 'café', 'cafe', 'coffee', 'tea house', 'bakery',
            '面包', '甜品', '甜点', 'dessert', 'pastry', 'patisserie',
            'カフェ', 'コーヒー', '喫茶', 'パン屋', 'ベーカリー',
            'bubble tea', '奶茶', '珍珠奶茶', 'boba'
        ]
    },
    {
        templateId: 'bar',
        keywords: [
            '酒吧', '酒馆', 'bar', 'pub', 'lounge', 'cocktail', 'brewery',
            'wine bar', 'beer', 'nightclub', '夜店', 'club',
            'バー', '居酒屋', 'パブ', 'ビアガーデン'
        ]
    },
    {
        templateId: 'hotel',
        keywords: [
            '酒店', '宾馆', '旅馆', '民宿', '客栈', '青年旅舍',
            'hotel', 'motel', 'hostel', 'inn', 'resort', 'lodge', 'guesthouse',
            'bed and breakfast', 'b&b', 'airbnb', 'accommodation',
            'ホテル', '旅館', '民宿', 'ゲストハウス', 'ユースホステル'
        ]
    },
    {
        templateId: 'attraction',
        keywords: [
            '景点', '景区', '名胜', '古迹', '遗址', '纪念碑', '地标',
            'attraction', 'landmark', 'monument', 'heritage', 'temple', 'shrine',
            'church', 'cathedral', 'castle', 'palace', 'tower', 'bridge',
            '神社', '寺', '城', 'タワー', '名所',
            'tourist', 'sightseeing', '观光'
        ]
    },
    {
        templateId: 'museum',
        keywords: [
            '博物馆', '美术馆', '展览', '画廊', '艺术',
            'museum', 'gallery', 'exhibition', 'art center',
            '博物館', '美術館', 'ギャラリー'
        ]
    },
    {
        templateId: 'park',
        keywords: [
            '公园', '花园', '植物园', '动物园', '水族馆', '自然',
            'park', 'garden', 'botanical', 'zoo', 'aquarium', 'nature',
            'trail', 'beach', '海滩', 'forest', '森林',
            '公園', '庭園', '植物園', '動物園', '水族館'
        ]
    },
    {
        templateId: 'shop',
        keywords: [
            '商店', '商场', '购物', '超市', '便利店', '市场', '百货',
            'shop', 'store', 'mall', 'market', 'supermarket', 'convenience',
            'boutique', 'outlet', 'department store', 'retail',
            'ショップ', 'マーケット', 'スーパー', 'コンビニ', 'デパート', '百貨店',
            'gift shop', '礼品店', '书店', 'bookstore', '本屋',
            '药店', 'pharmacy', 'ドラッグストア'
        ]
    },
    {
        templateId: 'gym',
        keywords: [
            '健身', '运动', '体育', '游泳', '瑜伽', '武术',
            'gym', 'fitness', 'sport', 'swimming', 'yoga', 'martial',
            'stadium', 'arena',
            'ジム', 'フィットネス', 'スポーツ', 'スタジアム'
        ]
    },
    {
        templateId: 'hospital',
        keywords: [
            '医院', '诊所', '医疗', '牙科', '药房', '体检',
            'hospital', 'clinic', 'medical', 'dental', 'doctor', 'health',
            '病院', 'クリニック', '歯科', '薬局'
        ]
    }
];

/**
 * Match a Google Maps category string to a template ID.
 * Returns the templateId string, or 'default' if no match.
 */
function matchCategoryToTemplate(category) {
    if (!category) return 'default';
    const lower = category.toLowerCase();

    for (const rule of CATEGORY_RULES) {
        for (const keyword of rule.keywords) {
            if (lower.includes(keyword.toLowerCase())) {
                return rule.templateId;
            }
        }
    }

    return 'default';
}

// Export for use in other scripts
if (typeof globalThis !== 'undefined') {
    globalThis.CATEGORY_RULES = CATEGORY_RULES;
    globalThis.matchCategoryToTemplate = matchCategoryToTemplate;
}
