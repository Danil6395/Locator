/**
 * 🌍 База данных локаций для GeoGuesser Bot
 */

const locations = [
  // ==========================================
  // 🟢 ЛЁГКИЙ УРОВЕНЬ (EASY) - Очень известные
  // ==========================================
  {
    id: 1,
    difficulty: "easy",
    lat: 48.8584, lng: 2.2945,
    landmark: "Eiffel Tower", landmarkRu: "Эйфелева башня",
    city: "Paris", cityRu: "Париж",
    country: "France", countryRu: "Франция",
    continent: "Europe", continentRu: "Европа",
    hint: "This iron tower was built in 1889", hintRu: "Эта железная башня построена в 1889 году",
    aliases: ["tour eiffel", "эйфелева", "эйфелева башня"],
    funFact: "It was supposed to be temporary!", funFactRu: "Её планировали снести через 20 лет!"
  },
  {
    id: 2,
    difficulty: "easy",
    lat: 41.8902, lng: 12.4922,
    landmark: "Colosseum", landmarkRu: "Колизей",
    city: "Rome", cityRu: "Рим",
    country: "Italy", countryRu: "Италия",
    continent: "Europe", continentRu: "Европа",
    hint: "Gladiators used to fight here", hintRu: "Здесь когда-то сражались гладиаторы",
    aliases: ["colosseo", "coliseum"],
    funFact: "It could hold up to 80,000 spectators.", funFactRu: "Он вмещал до 80 000 зрителей."
  },
  {
    id: 3,
    difficulty: "easy",
    lat: 40.6892, lng: -74.0445,
    landmark: "Statue of Liberty", landmarkRu: "Статуя Свободы",
    city: "New York", cityRu: "Нью-Йорк",
    country: "USA", countryRu: "США",
    continent: "North America", continentRu: "Северная Америка",
    hint: "A famous gift from France", hintRu: "Знаменитый подарок от Франции",
    aliases: ["liberty statue", "статуя свободы"],
    funFact: "The statue's exterior is made of copper and turned green due to oxidation.", funFactRu: "Статуя сделана из меди и позеленела из-за окисления."
  },
  {
    id: 4,
    difficulty: "easy",
    lat: 27.1751, lng: 78.0421,
    landmark: "Taj Mahal", landmarkRu: "Тадж-Махал",
    city: "Agra", cityRu: "Агра",
    country: "India", countryRu: "Индия",
    continent: "Asia", continentRu: "Азия",
    hint: "A white marble mausoleum", hintRu: "Мавзолей из белого мрамора",
    aliases: ["тадж махал", "tajmahal"],
    funFact: "It took about 22 years to build.", funFactRu: "Его строили около 22 лет."
  },
  {
    id: 5,
    difficulty: "easy",
    lat: -22.9519, lng: -43.2105,
    landmark: "Christ the Redeemer", landmarkRu: "Статуя Христа Искупителя",
    city: "Rio de Janeiro", cityRu: "Рио-де-Жанейро",
    country: "Brazil", countryRu: "Бразилия",
    continent: "South America", continentRu: "Южная Америка",
    hint: "Giant statue overlooking a famous city", hintRu: "Гигантская статуя, возвышающаяся над городом",
    aliases: ["cristo redentor", "христос искупитель", "статуя христа"],
    funFact: "It is 30 meters tall, not including its 8-meter pedestal.", funFactRu: "Её высота 30 метров, не считая 8-метрового пьедестала."
  },
  {
    id: 6,
    difficulty: "easy",
    lat: -33.8568, lng: 151.2153,
    landmark: "Sydney Opera House", landmarkRu: "Сиднейский оперный театр",
    city: "Sydney", cityRu: "Сидней",
    country: "Australia", countryRu: "Австралия",
    continent: "Oceania", continentRu: "Океания",
    hint: "Famous performing arts centre with a sail-like roof", hintRu: "Знаменитый театр с крышей в форме парусов",
    aliases: ["opera house", "сиднейская опера", "оперный театр"],
    funFact: "It was designed by Danish architect Jørn Utzon.", funFactRu: "Его спроектировал датский архитектор Йорн Утзон."
  },
  {
    id: 7,
    difficulty: "easy",
    lat: 51.5007, lng: -0.1246,
    landmark: "Big Ben", landmarkRu: "Биг-Бен",
    city: "London", cityRu: "Лондон",
    country: "United Kingdom", countryRu: "Великобритания",
    continent: "Europe", continentRu: "Европа",
    hint: "A huge clock tower", hintRu: "Огромная часовая башня",
    aliases: ["elizabeth tower", "биг бен", "башня елизаветы"],
    funFact: "Big Ben is actually the name of the bell inside, not the tower itself.", funFactRu: "Биг-Бен — это на самом деле название колокола внутри, а не самой башни."
  },
  {
    id: 8,
    difficulty: "easy",
    lat: 35.6586, lng: 139.7454,
    landmark: "Tokyo Tower", landmarkRu: "Телевизионная башня Токио",
    city: "Tokyo", cityRu: "Токио",
    country: "Japan", countryRu: "Япония",
    continent: "Asia", continentRu: "Азия",
    hint: "Red and white tower similar to the Eiffel Tower", hintRu: "Красно-белая башня, похожая на Эйфелеву",
    aliases: ["токийская башня", "tokyo tower"],
    funFact: "It is painted white and international orange to comply with air safety regulations.", funFactRu: "Она выкрашена в белый и международный оранжевый цвета в соответствии с правилами авиационной безопасности."
  },
  {
    id: 9,
    difficulty: "easy",
    lat: 29.9792, lng: 31.1342,
    landmark: "Great Pyramid of Giza", landmarkRu: "Пирамида Хеопса",
    city: "Giza", cityRu: "Гиза",
    country: "Egypt", countryRu: "Египет",
    continent: "Africa", continentRu: "Африка",
    hint: "Ancient wonder of the world", hintRu: "Древнее чудо света",
    aliases: ["пирамиды", "пирамида гизы", "pyramids", "pyramid of giza"],
    funFact: "It was the tallest man-made structure in the world for more than 3,800 years.", funFactRu: "Она была самым высоким искусственным сооружением в мире более 3800 лет."
  },
  {
    id: 10,
    difficulty: "easy",
    lat: 40.4319, lng: 116.5704,
    landmark: "Great Wall of China", landmarkRu: "Великая Китайская стена",
    city: "Beijing", cityRu: "Пекин",
    country: "China", countryRu: "Китай",
    continent: "Asia", continentRu: "Азия",
    hint: "A very long defensive structure", hintRu: "Очень длинное оборонительное сооружение",
    aliases: ["китайская стена", "great wall", "стена"],
    funFact: "It is not a single, continuous wall, but a series of walls and fortifications.", funFactRu: "Это не одна сплошная стена, а серия стен и укреплений."
  },
  {
    id: 11,
    difficulty: "easy",
    lat: 55.7520, lng: 37.6175,
    landmark: "Red Square", landmarkRu: "Красная площадь",
    city: "Moscow", cityRu: "Москва",
    country: "Russia", countryRu: "Россия",
    continent: "Europe", continentRu: "Европа",
    hint: "Famous square with a colorful cathedral", hintRu: "Знаменитая площадь с красочным собором",
    aliases: ["красная площадь", "собор василия блаженного", "st basil's cathedral"],
    funFact: "The name 'Red' has nothing to do with communism; it originally meant 'Beautiful' in old Russian.", funFactRu: "Название 'Красная' изначально означало 'Красивая' на старорусском."
  },
  {
    id: 12,
    difficulty: "easy",
    lat: 43.8790, lng: -79.0959,
    landmark: "Niagara Falls", landmarkRu: "Ниагарский водопад",
    city: "Niagara Falls", cityRu: "Ниагара-Фолс",
    country: "Canada", countryRu: "Канада", // Partially in USA, but often associated with Canada side
    continent: "North America", continentRu: "Северная Америка",
    hint: "Famous massive waterfalls", hintRu: "Знаменитый мощный водопад",
    aliases: ["niagara", "ниагара"],
    funFact: "About 3,160 tons of water flows over Niagara Falls every second.", funFactRu: "Каждую секунду с водопада падает около 3160 тонн воды."
  },

  // ==========================================
  // 🟡 СРЕДНИЙ УРОВЕНЬ (MEDIUM) - Известные места
  // ==========================================
  {
    id: 101,
    difficulty: "medium",
    lat: 41.4036, lng: 2.1744,
    landmark: "Sagrada Familia", landmarkRu: "Саграда Фамилия",
    city: "Barcelona", cityRu: "Барселона",
    country: "Spain", countryRu: "Испания",
    continent: "Europe", continentRu: "Европа",
    hint: "An unfinished church by Gaudí", hintRu: "Недостроенная церковь Гауди",
    aliases: ["храм святого семейства", "la sagrada familia"],
    funFact: "Construction began in 1882 and it's still not finished!", funFactRu: "Строительство началось в 1882 году и до сих пор не завершено!"
  },
  {
    id: 102,
    difficulty: "medium",
    lat: 37.8199, lng: -122.4783,
    landmark: "Golden Gate Bridge", landmarkRu: "Мост Золотые Ворота",
    city: "San Francisco", cityRu: "Сан-Франциско",
    country: "USA", countryRu: "США",
    continent: "North America", continentRu: "Северная Америка",
    hint: "Iconic red suspension bridge", hintRu: "Знаменитый красный подвесной мост",
    aliases: ["золотые ворота", "golden gate"],
    funFact: "The color is officially called 'International Orange'.", funFactRu: "Цвет моста официально называется «международный оранжевый»."
  },
  {
    id: 103,
    difficulty: "medium",
    lat: 13.4125, lng: 103.8670,
    landmark: "Angkor Wat", landmarkRu: "Ангкор-Ват",
    city: "Siem Reap", cityRu: "Сиемреап",
    country: "Cambodia", countryRu: "Камбоджа",
    continent: "Asia", continentRu: "Азия",
    hint: "Giant temple complex in the jungle", hintRu: "Гигантский храмовый комплекс в джунглях",
    aliases: ["ангкор ват", "angkor"],
    funFact: "It is the largest religious monument in the world.", funFactRu: "Это крупнейший религиозный памятник в мире."
  },
  {
    id: 104,
    difficulty: "medium",
    lat: 44.8805, lng: 15.6152,
    landmark: "Plitvice Lakes", landmarkRu: "Плитвицкие озёра",
    city: "Plitvice", cityRu: "Плитвица",
    country: "Croatia", countryRu: "Хорватия",
    continent: "Europe", continentRu: "Европа",
    hint: "A chain of beautiful cascading lakes", hintRu: "Цепь красивейших каскадных озер",
    aliases: ["плитвицы", "plitvice", "плитвицкие озера"],
    funFact: "The lakes are famous for their constantly changing colors.", funFactRu: "Озера славятся своими постоянно меняющимися цветами воды."
  },
  {
    id: 105,
    difficulty: "medium",
    lat: -13.1631, lng: -72.5450,
    landmark: "Machu Picchu", landmarkRu: "Мачу-Пикчу",
    city: "Cusco", cityRu: "Куско",
    country: "Peru", countryRu: "Перу",
    continent: "South America", continentRu: "Южная Америка",
    hint: "Ancient Incan city in the mountains", hintRu: "Древний город инков в горах",
    aliases: ["мачу пикчу"],
    funFact: "It was built without the use of mortar.", funFactRu: "Город был построен без использования строительного раствора."
  },
  {
    id: 106,
    difficulty: "medium",
    lat: 37.9715, lng: 23.7267,
    landmark: "Acropolis of Athens", landmarkRu: "Афинский Акрополь",
    city: "Athens", cityRu: "Афины",
    country: "Greece", countryRu: "Греция",
    continent: "Europe", continentRu: "Европа",
    hint: "Ancient citadel above the city", hintRu: "Древняя цитадель на холме над городом",
    aliases: ["парфенон", "parthenon", "акрополь", "acropolis"],
    funFact: "The Parthenon was originally painted in bright colors.", funFactRu: "Парфенон изначально был раскрашен в яркие цвета."
  },
  {
    id: 107,
    difficulty: "medium",
    lat: 48.6360, lng: -1.5115,
    landmark: "Mont Saint-Michel", landmarkRu: "Мон-Сен-Мишель",
    city: "Normandy", cityRu: "Нормандия",
    country: "France", countryRu: "Франция",
    continent: "Europe", continentRu: "Европа",
    hint: "A tidal island with a stunning abbey", hintRu: "Остров-крепость с аббатством",
    aliases: ["мон сен мишель", "mont saint michel", "сен мишель"],
    funFact: "It becomes completely surrounded by water during high tides.", funFactRu: "Во время сильных приливов он полностью окружен водой."
  },
  {
    id: 108,
    difficulty: "medium",
    lat: 51.1788, lng: -1.8262,
    landmark: "Stonehenge", landmarkRu: "Стоунхендж",
    city: "Amesbury", cityRu: "Эймсбери",
    country: "United Kingdom", countryRu: "Великобритания",
    continent: "Europe", continentRu: "Европа",
    hint: "Circle of huge standing stones", hintRu: "Круг из огромных вертикальных камней",
    aliases: ["стоунхендж", "стоунхенж"],
    funFact: "Some of the stones were transported from over 150 miles away.", funFactRu: "Некоторые камни были привезены сюда с расстояния более 240 км."
  },
  {
    id: 109,
    difficulty: "medium",
    lat: -25.3444, lng: 131.0369,
    landmark: "Uluru", landmarkRu: "Улуру",
    city: "Alice Springs", cityRu: "Алис-Спрингс",
    country: "Australia", countryRu: "Австралия",
    continent: "Oceania", continentRu: "Океания",
    hint: "Massive sandstone monolith", hintRu: "Массивный монолит из песчаника",
    aliases: ["ayers rock", "эйерс-рок", "улуру"],
    funFact: "It appears to change color at different times of the day and year.", funFactRu: "Кажется, что он меняет цвет в разное время дня и года."
  },
  {
    id: 110,
    difficulty: "medium",
    lat: 52.3731, lng: 4.8922,
    landmark: "Dam Square", landmarkRu: "Площадь Дам",
    city: "Amsterdam", cityRu: "Амстердам",
    country: "Netherlands", countryRu: "Нидерланды",
    continent: "Europe", continentRu: "Европа",
    hint: "Central square in the city of canals", hintRu: "Центральная площадь в городе каналов",
    aliases: ["дам", "dam square"],
    funFact: "The Royal Palace on the square rests on 13,659 wooden piles.", funFactRu: "Королевский дворец на площади покоится на 13 659 деревянных сваях."
  },

  // ==========================================
  // 🔴 СЛОЖНЫЙ УРОВЕНЬ (HARD) - Менее популярные
  // ==========================================
  {
    id: 201,
    difficulty: "hard",
    lat: 38.6431, lng: 34.8289,
    landmark: "Cappadocia", landmarkRu: "Каппадокия",
    city: "Nevsehir", cityRu: "Невшехир",
    country: "Turkey", countryRu: "Турция",
    continent: "Asia", continentRu: "Азия",
    hint: "Famous for hot air balloons and rock formations", hintRu: "Известна воздушными шарами и скальными образованиями",
    aliases: ["каппадокия", "göreme", "гереме"],
    funFact: "People have lived in these rock formations for thousands of years.", funFactRu: "Люди жили в этих скалах тысячелетиями."
  },
  {
    id: 202,
    difficulty: "hard",
    lat: 47.5622, lng: 13.6493,
    landmark: "Hallstatt", landmarkRu: "Хальштатт",
    city: "Hallstatt", cityRu: "Хальштатт",
    country: "Austria", countryRu: "Австрия",
    continent: "Europe", continentRu: "Европа",
    hint: "A picturesque Alpine village on a lake", hintRu: "Живописная альпийская деревня на озере",
    aliases: ["гальштат", "хальштат", "гальштатт"],
    funFact: "A full-scale replica of this village was built in China.", funFactRu: "В Китае была построена полномасштабная копия этой деревни."
  },
  {
    id: 203,
    difficulty: "hard",
    lat: -7.6079, lng: 110.2038,
    landmark: "Borobudur", landmarkRu: "Боробудур",
    city: "Magelang", cityRu: "Магеланг",
    country: "Indonesia", countryRu: "Индонезия",
    continent: "Asia", continentRu: "Азия",
    hint: "World's largest Buddhist temple", hintRu: "Крупнейший в мире буддийский храм",
    aliases: ["боробудур", "candi borobudur"],
    funFact: "It consists of nine stacked platforms topped by a central dome.", funFactRu: "Он состоит из девяти ярусов, увенчанных центральным куполом."
  },
  {
    id: 204,
    difficulty: "hard",
    lat: 30.3285, lng: 35.4444,
    landmark: "Petra", landmarkRu: "Петра",
    city: "Wadi Musa", cityRu: "Вади-Муса",
    country: "Jordan", countryRu: "Иордания",
    continent: "Asia", continentRu: "Азия",
    hint: "Ancient city carved into red rock", hintRu: "Древний город, высеченный в красной скале",
    aliases: ["петра", "al khazneh"],
    funFact: "It's also known as the Rose City due to the color of the stone.", funFactRu: "Она также известна как Розовый город из-за цвета камня."
  },
  {
    id: 205,
    difficulty: "hard",
    lat: -22.8415, lng: -68.2831,
    landmark: "Valle de la Luna", landmarkRu: "Лунная долина",
    city: "San Pedro de Atacama", cityRu: "Сан-Педро-де-Атакама",
    country: "Chile", countryRu: "Чили",
    continent: "South America", continentRu: "Южная Америка",
    hint: "Desert landscape that looks like the moon", hintRu: "Пустынный ландшафт, похожий на луну",
    aliases: ["valley of the moon", "лунная долина", "атакама", "atacama"],
    funFact: "It is considered one of the driest places on Earth.", funFactRu: "Считается одним из самых засушливых мест на Земле."
  },
  {
    id: 206,
    difficulty: "hard",
    lat: 44.2127, lng: 43.1444,
    landmark: "Mount Elbrus", landmarkRu: "Гора Эльбрус",
    city: "Terskol", cityRu: "Терскол",
    country: "Russia", countryRu: "Россия",
    continent: "Europe", continentRu: "Европа",
    hint: "The highest mountain in Europe", hintRu: "Самая высокая гора Европы",
    aliases: ["эльбрус", "elbrus"],
    funFact: "Elbrus is an inactive volcano.", funFactRu: "Эльбрус — это спящий вулкан."
  },
  {
    id: 207,
    difficulty: "hard",
    lat: 38.8435, lng: -104.8732,
    landmark: "Garden of the Gods", landmarkRu: "Сад богов",
    city: "Colorado Springs", cityRu: "Колорадо-Спрингс",
    country: "USA", countryRu: "США",
    continent: "North America", continentRu: "Северная Америка",
    hint: "Public park featuring red rock formations", hintRu: "Парк с уникальными красными скалами",
    aliases: ["сад богов", "garden of gods"],
    funFact: "The park was given to the city on the condition it remain free forever.", funFactRu: "Парк был передан городу с условием, что он навсегда останется бесплатным."
  },
  {
    id: 208,
    difficulty: "hard",
    lat: 29.3516, lng: 110.5300,
    landmark: "Zhangjiajie National Forest Park", landmarkRu: "Чжанцзяцзе",
    city: "Zhangjiajie", cityRu: "Чжанцзяцзе",
    country: "China", countryRu: "Китай",
    continent: "Asia", continentRu: "Азия",
    hint: "Tall pillar-like rocks", hintRu: "Высокие скалы в виде столбов",
    aliases: ["чжанцзяцзе", "avatar mountains", "горы аватар", "zhangjiajie"],
    funFact: "These mountains inspired the floating peaks in the movie Avatar.", funFactRu: "Эти горы вдохновили создателей парящих скал в фильме «Аватар»."
  },
  {
    id: 209,
    difficulty: "hard",
    lat: 64.9313, lng: -19.0212,
    landmark: "Geysir", landmarkRu: "Гейсир",
    city: "Haukadalur", cityRu: "Хаукадалюр",
    country: "Iceland", countryRu: "Исландия",
    continent: "Europe", continentRu: "Европа",
    hint: "The hot spring that gave all other geysers their name", hintRu: "Горячий источник, давший название всем гейзерам",
    aliases: ["гейзир", "большой гейзер", "the great geysir"],
    funFact: "It can hurl boiling water up to 70 meters in the air.", funFactRu: "Он может выбрасывать кипящую воду на высоту до 70 метров."
  },
  {
    id: 210,
    difficulty: "hard",
    lat: 14.1008, lng: -89.7610,
    landmark: "Copán Ruinas", landmarkRu: "Копан",
    city: "Copan Ruinas", cityRu: "Копан-Руинас",
    country: "Honduras", countryRu: "Гондурас",
    continent: "North America", continentRu: "Северная Америка",
    hint: "Archaeological site of the Maya civilization", hintRu: "Археологический памятник цивилизации майя",
    aliases: ["копан", "copan"],
    funFact: "It was the capital city of a major Classic period kingdom.", funFactRu: "Это была столица крупного царства классического периода."
  }
];

module.exports = locations;
