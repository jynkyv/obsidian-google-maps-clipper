// Obsidian Google Map Clipper — Default Template Presets
// Shared between background.js, popup.js and settings.js

const DEFAULT_TEMPLATES = [
    {
        id: 'default',
        name: '默认',
        icon: 'map-pin',
        color: '#8b5cf6',
        folder: 'Places',
        tags: 'places',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'coordinates', 'priceRange', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'restaurant',
        name: '餐厅',
        icon: 'utensils',
        color: '#f59e0b',
        folder: 'Places/Restaurants',
        tags: 'places, places/restaurant',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'cafe',
        name: '咖啡店',
        icon: 'coffee',
        color: '#78716c',
        folder: 'Places/Cafes',
        tags: 'places, places/cafe',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'attraction',
        name: '景点',
        icon: 'landmark',
        color: '#3b82f6',
        folder: 'Places/Attractions',
        tags: 'places, places/attraction',
        properties: ['name', 'address', 'rating', 'category', 'hours', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'hotel',
        name: '酒店 / 民宿',
        icon: 'bed',
        color: '#ec4899',
        folder: 'Places/Hotels',
        tags: 'places, places/hotel',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'bar',
        name: '酒吧',
        icon: 'wine',
        color: '#a855f7',
        folder: 'Places/Bars',
        tags: 'places, places/bar',
        properties: ['name', 'address', 'rating', 'phone', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'shop',
        name: '商店 / 购物',
        icon: 'shopping-bag',
        color: '#14b8a6',
        folder: 'Places/Shopping',
        tags: 'places, places/shopping',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'hours', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'park',
        name: '公园 / 户外',
        icon: 'trees',
        color: '#22c55e',
        folder: 'Places/Parks',
        tags: 'places, places/park',
        properties: ['name', 'address', 'rating', 'category', 'hours', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'museum',
        name: '博物馆 / 展览',
        icon: 'palette',
        color: '#f97316',
        folder: 'Places/Museums',
        tags: 'places, places/museum',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'gym',
        name: '运动 / 健身',
        icon: 'dumbbell',
        color: '#ef4444',
        folder: 'Places/Sports',
        tags: 'places, places/sports',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'priceRange', 'hours', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'hospital',
        name: '医疗 / 诊所',
        icon: 'heart-pulse',
        color: '#dc2626',
        folder: 'Places/Medical',
        tags: 'places, places/medical',
        properties: ['name', 'address', 'rating', 'phone', 'website', 'hours', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    },
    {
        id: 'wanted',
        name: '想去',
        icon: 'bookmark',
        color: '#eab308',
        folder: 'Places/Wanted',
        tags: 'places, places/wanted',
        properties: ['name', 'address', 'rating', 'category', 'priceRange', 'coordinates', 'googleMapsUrl', 'tags', 'created'],
        customProperties: [],
        noteTemplate: ''
    }
];

// For use in other scripts via importScripts or <script>
if (typeof globalThis !== 'undefined') {
    globalThis.DEFAULT_TEMPLATES = DEFAULT_TEMPLATES;
}
