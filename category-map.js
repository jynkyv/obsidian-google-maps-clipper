// Obsidian Google Map Clipper — Category to Template Mapping
// Maps Google Maps place categories (exact display names) to template IDs
//
// Google Maps shows a category label on each place page (e.g. "旅游胜地", "餐厅", "咖啡厅").
// We match that label to decide which template preset to auto-select.

const CATEGORY_RULES = [
    // ── 1. 娱乐与休闲 → attraction ──
    {
        templateId: 'attraction',
        categories: [
            // Chinese
            '旅游胜地', '游乐园', '水族馆', '植物园', '保龄球馆', '赌场',
            '电影院', '夜总会', '动物园', '野生动物园', '卡拉OK', '活动场馆',
            '水上乐园', '网吧', '庆典宴会厅',
            // English
            'tourist attraction', 'amusement park', 'aquarium', 'botanical garden',
            'bowling alley', 'casino', 'movie theater', 'movie theatre',
            'night club', 'nightclub', 'zoo', 'wildlife park', 'karaoke',
            'event venue', 'water park', 'internet cafe', 'banquet hall',
            'live music venue',
            // Japanese
            '観光名所', '遊園地', '水族館', 'ボウリング場', 'カジノ',
            '映画館', 'ナイトクラブ', '動物園', 'カラオケ', 'イベント会場',
            'ウォーターパーク', 'ネットカフェ'
        ]
    },
    // ── 2. 文化艺术 → museum ──
    {
        templateId: 'museum',
        categories: [
            '博物馆', '美术馆', '画廊', '城堡', '历史遗迹', '纪念碑',
            '地标', '剧院', '表演艺术中心', '雕塑', '文化地标',
            'museum', 'art museum', 'history museum', 'art gallery', 'gallery',
            'castle', 'historical place', 'monument', 'cultural landmark',
            'performing arts theater', 'performing arts theatre', 'sculpture',
            '博物館', '美術館', 'ギャラリー', '城', '劇場'
        ]
    },
    // ── 3. 餐饮 → restaurant / cafe / bar ──
    {
        templateId: 'restaurant',
        categories: [
            '餐厅', '餐馆', '中餐厅', '日料', '日本料理', '披萨店',
            '快餐店', '面馆', '火锅店', '烧烤店', '寿司店', '拉面店',
            '食堂', '定食', '小吃店', '饺子馆', '汉堡店', '牛排馆',
            '海鲜餐厅', '素食餐厅', '自助餐厅', '西餐厅', '韩国料理',
            '泰国餐厅', '越南餐厅', '印度餐厅', '意大利餐厅',
            '食堂和定食餐馆',
            'restaurant', 'chinese restaurant', 'japanese restaurant',
            'pizza restaurant', 'fast food restaurant', 'noodle shop',
            'hot pot restaurant', 'bbq restaurant', 'sushi restaurant',
            'ramen restaurant', 'hamburger restaurant', 'steak house',
            'steakhouse', 'seafood restaurant', 'vegetarian restaurant',
            'buffet restaurant', 'korean restaurant', 'thai restaurant',
            'vietnamese restaurant', 'indian restaurant', 'italian restaurant',
            'mexican restaurant', 'french restaurant', 'brunch restaurant',
            'family restaurant', 'diner', 'bistro', 'brasserie', 'trattoria',
            'food court', 'canteen', 'eatery',
            'レストラン', '食堂', '定食屋', 'ラーメン屋', '寿司屋',
            '焼肉屋', 'うどん屋', 'そば屋', '天ぷら屋', 'とんかつ屋',
            '居酒屋', 'カレー屋', '弁当屋', '丼もの', 'やきとり屋',
            'ファミリーレストラン', 'ファストフード'
        ]
    },
    {
        templateId: 'cafe',
        categories: [
            '咖啡厅', '咖啡店', '咖啡馆', '面包店', '烘焙坊', '甜品店',
            '冰淇淋店', '茶馆', '茶室', '奶茶店', '糕点店',
            'cafe', 'café', 'coffee shop', 'bakery', 'pastry shop',
            'patisserie', 'dessert shop', 'ice cream shop', 'tea house',
            'tea room', 'bubble tea', 'boba',
            'カフェ', 'コーヒーショップ', '喫茶店', 'パン屋', 'ベーカリー',
            'ケーキ屋', 'アイスクリーム屋', 'タピオカ'
        ]
    },
    {
        templateId: 'bar',
        categories: [
            '酒吧', '酒馆', '酒类专卖店', '演艺吧',
            'bar', 'pub', 'lounge', 'cocktail bar', 'wine bar',
            'beer garden', 'brewery', 'liquor store',
            'バー', 'パブ', 'ビアガーデン', '居酒屋'
        ]
    },
    // ── 4. 购物 → shop ──
    {
        templateId: 'shop',
        categories: [
            '购物中心', '商场', '百货公司', '超市', '杂货店', '便利店',
            '服装店', '书店', '五金店', '电子产品店', '家具店', '珠宝店',
            '鞋店', '宠物店', '商店', '市场', '药妆店', '礼品店',
            '花店', '文具店', '乐器店', '眼镜店', '手机店', '玩具店',
            'shopping mall', 'shopping center', 'department store',
            'supermarket', 'grocery store', 'convenience store',
            'clothing store', 'book store', 'bookstore', 'hardware store',
            'electronics store', 'furniture store', 'jewelry store',
            'shoe store', 'pet store', 'shop', 'store', 'market',
            'gift shop', 'florist', 'stationery store', 'toy store',
            'outlet', 'boutique', 'retail',
            'ショッピングモール', 'デパート', '百貨店', 'スーパー',
            'コンビニ', '本屋', '書店', '電器店', '家具屋',
            'ペットショップ', 'ドラッグストア', '花屋'
        ]
    },
    // ── 5. 健康与美容 → hospital / gym ──
    {
        templateId: 'hospital',
        categories: [
            '医院', '医生诊所', '诊所', '牙医诊所', '牙科', '药房',
            '美容院', '理发店', '水疗中心', '按摩店', '体检中心',
            '中医', '眼科', '皮肤科',
            'hospital', 'doctor', 'clinic', 'dentist', 'dental clinic',
            'pharmacy', 'drugstore', 'beauty salon', 'hair salon',
            'hair care', 'spa', 'massage', 'medical center',
            '病院', 'クリニック', '歯科', '薬局', '美容院',
            'ヘアサロン', 'スパ', 'マッサージ'
        ]
    },
    {
        templateId: 'gym',
        categories: [
            '健身房', '健身中心', '体育馆', '运动场', '游泳池', '瑜伽馆',
            '武术馆', '拳击馆', '攀岩馆',
            'gym', 'fitness center', 'sports center', 'stadium', 'arena',
            'swimming pool', 'yoga studio', 'martial arts school',
            'ジム', 'フィットネスセンター', 'スポーツセンター',
            'スタジアム', 'プール', 'ヨガスタジオ'
        ]
    },
    // ── 6. 住宿 → hotel ──
    {
        templateId: 'hotel',
        categories: [
            '酒店', '宾馆', '汽车旅馆', '青年旅舍', '民宿', '露营地',
            '度假村', '旅馆', '客栈',
            'hotel', 'motel', 'hostel', 'bed and breakfast', 'b&b',
            'campground', 'rv park', 'resort', 'lodge', 'guesthouse',
            'inn', 'accommodation',
            'ホテル', 'モーテル', 'ユースホステル', '旅館', '民宿',
            'キャンプ場', 'リゾート', 'ゲストハウス'
        ]
    },
    // ── 7. 公园 / 户外 → park ──
    {
        templateId: 'park',
        categories: [
            '公园', '国家公园', '城市公园', '花园', '自然保护区',
            '海滩', '森林', '湖泊', '山', '步道',
            'park', 'national park', 'city park', 'garden', 'nature reserve',
            'beach', 'forest', 'lake', 'mountain', 'trail', 'hiking trail',
            '公園', '国立公園', '庭園', '自然公園', 'ビーチ', '森'
        ]
    },
    // ── 8. 电影场景 → film_location ──
    {
        templateId: 'film_location',
        categories: [
            '电影制片厂', '影视基地', '电影拍摄地', '影视城',
            'film studio', 'movie studio', 'film location',
            '映画スタジオ', '撮影所'
        ]
    },
    // ── 9. 拍照打卡 → photo_spot ──
    {
        templateId: 'photo_spot',
        categories: [
            '观景点', '观景台', '风景名胜', '摄影点', '展望台', '自拍馆', '打卡地',
            'scenic spot', 'viewpoint', 'observation deck', 'photography studio', 'selfie studio',
            '絶景スポット', '展望台', '名所', '撮影スポット'
        ]
    }
];

/**
 * Match a Google Maps category string to a template ID.
 * First tries exact match (case-insensitive), then substring match.
 * Returns the templateId string, or 'default' if no match.
 */
function matchCategoryToTemplate(category) {
    if (!category) return 'default';
    const lower = category.toLowerCase().trim();

    // 1. Exact match
    for (const rule of CATEGORY_RULES) {
        for (const cat of rule.categories) {
            if (lower === cat.toLowerCase()) {
                return rule.templateId;
            }
        }
    }

    // 2. Substring match (category contains a known name)
    for (const rule of CATEGORY_RULES) {
        for (const cat of rule.categories) {
            if (lower.includes(cat.toLowerCase())) {
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
