/**
 * 🖼️ Сервис получения изображений из Wikimedia Commons
 * Бесплатный API, без ключа — идеально для GeoGuesser!
 */

const config = require('../config');

/**
 * Кеш изображений: locationId -> { url, title }
 * Сохраняется в памяти для быстрого доступа
 */
const imageCache = new Map();

/**
 * Получить изображение для локации из Wikimedia Commons
 * @param {Object} location - Объект локации из базы данных
 * @returns {Promise<{url: string, title: string}|null>} URL изображения или null
 */
async function fetchImageForLocation(location) {
  // Проверяем кеш
  if (imageCache.has(location.id)) {
    return imageCache.get(location.id);
  }

  try {
    const result = await fetchFromWikimediaGeo(location.lat, location.lng);

    if (result) {
      imageCache.set(location.id, result);
      return result;
    }

    // Фолбэк: поиск по названию
    const nameResult = await fetchFromWikimediaSearch(location.landmark);
    if (nameResult) {
      imageCache.set(location.id, nameResult);
      return nameResult;
    }

    // Второй фолбэк: поиск по русскому названию
    const nameRuResult = await fetchFromWikimediaSearch(location.landmarkRu);
    if (nameRuResult) {
      imageCache.set(location.id, nameRuResult);
      return nameRuResult;
    }

    return null;
  } catch (error) {
    console.error(`[Wikimedia] Ошибка для "${location.landmark}":`, error.message);
    return null;
  }
}

/**
 * Поиск фото по координатам (geosearch)
 * @param {number} lat - Широта
 * @param {number} lng - Долгота
 * @returns {Promise<{url: string, title: string}|null>}
 */
async function fetchFromWikimediaGeo(lat, lng) {
  const { apiUrl, searchRadius, searchLimit, thumbWidth, userAgent, minImageWidth } = config.wikimedia;

  const params = new URLSearchParams({
    action: 'query',
    generator: 'geosearch',
    ggsprimary: 'all',
    ggsnamespace: '6', // Файлы
    ggscoord: `${lat}|${lng}`,
    ggsradius: String(searchRadius),
    ggslimit: String(searchLimit),
    prop: 'imageinfo',
    iilimit: '1',
    iiprop: 'url|size|mime',
    iiurlwidth: String(thumbWidth),
    format: 'json',
    origin: '*',
  });

  const response = await fetch(`${apiUrl}?${params}`, {
    headers: { 'User-Agent': userAgent },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!data.query || !data.query.pages) {
    return null;
  }

  // Фильтруем и сортируем изображения
  const images = Object.values(data.query.pages)
    .filter(page => {
      const info = page.imageinfo?.[0];
      if (!info) return false;

      // Только JPEG и PNG
      const mime = info.mime || '';
      if (!mime.startsWith('image/jpeg') && !mime.startsWith('image/png')) return false;

      // Минимальный размер
      if (info.width < minImageWidth) return false;

      // Исключаем SVG, иконки, логотипы
      const title = (page.title || '').toLowerCase();
      if (title.includes('icon') || title.includes('logo') || title.includes('flag') ||
          title.includes('map') || title.includes('coat') || title.includes('seal') ||
          title.includes('.svg') || title.includes('diagram') || title.includes('plan')) {
        return false;
      }

      return true;
    })
    .map(page => {
      const info = page.imageinfo[0];
      return {
        url: (info.thumburl || info.url).replace(/ /g, '%20'),
        title: page.title?.replace('File:', '').replace(/\.[^.]+$/, '') || 'Unknown',
        width: info.width || 0,
        height: info.height || 0,
        // Предпочитаем пейзажные фото (ширина > высота)
        isLandscape: (info.width || 0) > (info.height || 0),
      };
    })
    .sort((a, b) => {
      // Сначала пейзажные
      if (a.isLandscape && !b.isLandscape) return -1;
      if (!a.isLandscape && b.isLandscape) return 1;
      // Потом по размеру (больше = лучше)
      return (b.width * b.height) - (a.width * a.height);
    });

  if (images.length === 0) return null;

  // Берём случайное из топ-3 лучших (для разнообразия)
  const topImages = images.slice(0, Math.min(3, images.length));
  const chosen = topImages[Math.floor(Math.random() * topImages.length)];

  return { url: chosen.url, title: chosen.title };
}

/**
 * Поиск фото по названию (текстовый поиск) — фолбэк
 * @param {string} query - Название места
 * @returns {Promise<{url: string, title: string}|null>}
 */
async function fetchFromWikimediaSearch(query) {
  const { apiUrl, thumbWidth, userAgent, minImageWidth } = config.wikimedia;

  const params = new URLSearchParams({
    action: 'query',
    generator: 'search',
    gsrnamespace: '6', // Файлы
    gsrsearch: `${query}`,
    gsrlimit: '5',
    prop: 'imageinfo',
    iilimit: '1',
    iiprop: 'url|size|mime',
    iiurlwidth: String(thumbWidth),
    format: 'json',
    origin: '*',
  });

  const response = await fetch(`${apiUrl}?${params}`, {
    headers: { 'User-Agent': userAgent },
    signal: AbortSignal.timeout(10000),
  });

  if (!response.ok) return null;

  const data = await response.json();

  if (!data.query || !data.query.pages) return null;

  const images = Object.values(data.query.pages)
    .filter(page => {
      const info = page.imageinfo?.[0];
      if (!info) return false;

      const mime = info.mime || '';
      if (!mime.startsWith('image/jpeg') && !mime.startsWith('image/png')) return false;
      if (info.width < minImageWidth) return false;

      const title = (page.title || '').toLowerCase();
      if (title.includes('icon') || title.includes('logo') || title.includes('flag') ||
          title.includes('map') || title.includes('coat') || title.includes('seal') ||
          title.includes('.svg') || title.includes('diagram') || title.includes('plan')) {
        return false;
      }

      return true;
    })
    .map(page => {
      const info = page.imageinfo[0];
      return {
        url: (info.thumburl || info.url).replace(/ /g, '%20'),
        title: page.title?.replace('File:', '').replace(/\.[^.]+$/, '') || 'Unknown',
        width: info.width || 0,
        height: info.height || 0,
      };
    })
    .sort((a, b) => (b.width * b.height) - (a.width * a.height));

  if (images.length === 0) return null;

  return { url: images[0].url, title: images[0].title };
}

/**
 * Очистить кеш изображений
 */
function clearCache() {
  imageCache.clear();
}

/**
 * Получить размер кеша
 */
function getCacheSize() {
  return imageCache.size;
}

module.exports = {
  fetchImageForLocation,
  clearCache,
  getCacheSize,
};
