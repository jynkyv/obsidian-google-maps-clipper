// Obsidian Google Map Clipper — Default Template Presets
// Shared between background.js, popup.js and settings.js

const DEFAULT_TEMPLATES = [
    {
        id: 'default',
        name: '默认',
        icon: 'map-pin',
        color: '#8b5cf6',
        folder: 'Resources/Places',
        tags: '',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'coordinates', 'priceRange', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'restaurant',
        name: '餐厅',
        icon: 'utensils',
        color: '#f59e0b',
        folder: 'Resources/Places',
        tags: 'places/restaurant',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'cafe',
        name: '咖啡店',
        icon: 'coffee',
        color: '#78716c',
        folder: 'Resources/Places',
        tags: 'places/cafe',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'attraction',
        name: '景点、寺庙、游乐场',
        icon: 'landmark',
        color: '#ef4444',
        folder: 'Resources/Places',
        tags: 'places/attraction',
        properties: ['name', 'address', 'rating', 'category', 'hours', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'hotel',
        name: '旅馆',
        icon: 'bed',
        color: '#8b5cf6',
        folder: 'Resources/Places',
        tags: 'places/hotel',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'bar',
        name: '酒吧',
        icon: 'wine',
        color: '#a855f7',
        folder: 'Resources/Places',
        tags: 'places/bar',
        properties: ['name', 'address', 'rating', 'phone', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'shop',
        name: '购物',
        icon: 'shopping-bag',
        color: '#14b8a6',
        folder: 'Resources/Places',
        tags: 'places/shopping',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'hours', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'park',
        name: '公园、河流、湖泊',
        icon: 'trees',
        color: '#10b981',
        folder: 'Resources/Places',
        tags: 'places/park',
        properties: ['name', 'address', 'rating', 'category', 'hours', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'museum',
        name: '美术馆、博物馆',
        icon: 'palette',
        color: '#f97316',
        folder: 'Resources/Places',
        tags: 'places/museum',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'gym',
        name: '运动 / 健身',
        icon: 'dumbbell',
        color: '#ef4444',
        folder: 'Resources/Places',
        tags: 'places/sports',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'hospital',
        name: '医疗 / 诊所',
        icon: 'heart-pulse',
        color: '#dc2626',
        folder: 'Resources/Places',
        tags: 'places/medical',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'hours', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'wanted',
        name: '想去',
        icon: 'bookmark',
        color: '#eab308',
        folder: 'Resources/Places',
        tags: 'places/wanted',
        properties: ['name', 'address', 'rating', 'category', 'priceRange', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'film_location',
        name: '电影场景',
        icon: 'film',
        color: '#4f46e5',
        folder: 'Resources/Places',
        tags: 'places/film_scene',
        properties: ['name', 'address', 'rating', 'category', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [
            { key: 'movie', defaultValue: '' }
        ],
        noteTemplate: ''
    },
    {
        id: 'photo_spot',
        name: '观景台',
        icon: 'camera',
        color: '#f97316',
        folder: 'Resources/Places',
        tags: 'places/photo_spot',
        properties: ['name', 'address', 'rating', 'category', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [
            { key: 'vibe', defaultValue: '' }
        ],
        noteTemplate: ''
    },
    {
        id: 'citywalk',
        name: '街道、社区、城市漫步',
        icon: 'footprints',
        color: '#f472b6',
        folder: 'Resources/Places',
        tags: 'places/citywalk',
        properties: ['name', 'address', 'rating', 'category', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'shrine',
        name: '神社',
        icon: 'torii-gate',
        color: '#ef4444',
        folder: 'Resources/Places',
        tags: 'places/shrine',
        properties: ['name', 'address', 'rating', 'category', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'office',
        name: '办公/银行',
        icon: 'building',
        color: '#64748b',
        folder: 'Resources/Places',
        tags: 'places/office',
        properties: ['name', 'address', 'rating', 'category', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'station',
        name: '车站',
        icon: 'train',
        color: '#6366f1',
        folder: 'Resources/Places',
        tags: 'places/station',
        properties: ['name', 'address', 'rating', 'category', 'coordinates', 'googleMapsUrl', 'photoUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    }
];

// For use in other scripts via importScripts or <script>
if (typeof globalThis !== 'undefined') {
    globalThis.DEFAULT_TEMPLATES = DEFAULT_TEMPLATES;
}
