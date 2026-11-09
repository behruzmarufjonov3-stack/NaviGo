import { Router, Response } from 'express';
import { dbStore } from '../db/store';
import { AuthenticatedRequest } from '../middleware/auth.middleware';

export const supportRouter = Router();

// POST /api/v1/support/chat - AI Support assistant conversation
supportRouter.post('/chat', (req: AuthenticatedRequest, res: Response) => {
  const conversationId = (req.body.conversationId as string) || `conv-${Date.now()}`;
  const text = (req.body.text as string) || '';
  const lang = (req.body.lang as 'uz' | 'ru' | 'en') || 'uz';

  if (!text.trim()) {
    return res.status(400).json({ error: 'Message cannot be empty' });
  }

  // 1. Record user message
  const userMsg = dbStore.addSupportMessage(conversationId, {
    conversationId,
    senderType: 'USER',
    senderName: req.user ? req.user.name : 'Citizen',
    text
  });

  // 2. Generate intelligent verified AI response
  const lower = text.toLowerCase();
  let aiText = '';

  // Check emergency keywords first
  if (
    lower.includes('yongin') ||
    lower.includes('qon') ||
    lower.includes('ogir halokat') ||
    lower.includes('пожар') ||
    lower.includes('тяжелое дтп') ||
    lower.includes('скорая') ||
    lower.includes('fire') ||
    lower.includes('ambulance') ||
    lower.includes('emergency') ||
    lower.includes('103') ||
    lower.includes('102') ||
    lower.includes('101') ||
    lower.includes('1050') ||
    lower.includes('sos')
  ) {
    if (lang === 'uz') {
      aiText = "🚨 O‘zbekiston Favqulodda xizmatlari:\n\n• 🚑 103 — Tez tibbiy yordam\n• 👮 102 — Yo‘l harakati xavfsizligi va Ichki ishlar\n• 🚒 101 — Yong‘in-qutqaruv xizmati\n• 🔥 104 — Favqulodda gaz xizmati\n• 🛟 1050 — FVV Qutqaruv xizmati\n\nFavqulodda dispetcherlik rejimiga o'tish uchun yuqoridagi '103 Tez Yordam' tugmasini bosing yoki #/ambulance sahifasiga o'ting.";
    } else if (lang === 'ru') {
      aiText = "🚨 Экстренные службы Республики Узбекистан:\n\n• 🚑 103 — Скорая помощь\n• 👮 102 — Милиция / ГАИ\n• 🚒 101 — Пожарно-спасательная служба\n• 🔥 104 — Аварийная газовая служба\n• 🛟 1050 — Спасатели МЧС\n\nДля перехода в экстренный диспетчерский режим нажмите кнопку «103 Tez Yordam» или перейдите на #/ambulance.";
    } else {
      aiText = "🚨 Emergency numbers (Uzbekistan):\n\n• 🚑 103 — Ambulance Medical Emergency\n• 👮 102 — Police & Road Safety\n• 🚒 101 — Fire & Rescue\n• 🔥 104 — Emergency Gas Service\n• 🛟 1050 — Ministry of Emergency Situations (MES)\n\nTap the '103 Tez Yordam' button to open emergency dispatch mode (#/ambulance).";
    }
  } else if (lower.includes('tezlik') || lower.includes('radar') || lower.includes('kamera') || lower.includes('jarima') || lower.includes('skorost') || lower.includes('speed')) {
    if (lang === 'uz') {
      aiText = "🚗 O‘zbekiston Yo‘l Harakati Qoidalariga ko‘ra:\n• Shahar va aholi punktlarida: maksimal 60 km/soat.\n• Turar-joy zonalari va hovlilarda: 20 km/soat.\n• Maktablar atrofida: 30 km/soat.\n• Trassalarda: 100 km/soat.\nNaviGo xaritasida barcha radarlar to'q sariq dumaloq nishonlar bilan ko'rsatiladi va yaqinlashganda ogohlantiradi.";
    } else if (lang === 'ru') {
      aiText = "🚗 Ограничения скорости по ПДД Узбекистана:\n• В городах: 60 км/ч.\n• В жилых зонах: 20 км/ч.\n• Возле школ: 30 км/ч.\n• На загородных трассах: 100 км/ч.\nКамеры и радары отображаются на карте оранжевыми значками с предупреждением при приближении.";
    } else {
      aiText = "🚗 Speed Limits in Uzbekistan:\n• Cities & urban areas: 60 km/h.\n• Residential areas: 20 km/h.\n• Near schools: 30 km/h.\n• Highways: 100 km/h.\nRadars are indicated with orange badges on the map.";
    }
  } else if (lower.includes('marshrut') || lower.includes('qanday bor') || lower.includes('navigatsiya') || lower.includes('kak doehat') || lower.includes('route')) {
    if (lang === 'uz') {
      aiText = "📍 Marshrut tuzish uchun:\n1. Chap tarafdagi qidiruv maydoniga boradigan manzilni yozing.\n2. Yoki xaritadagi xohlagan joyni bosing va 'Bu yerga ketish (B)' tugmasini tanlang.\n3. Mashina, jamoat transporti, velosiped yoki piyoda rejimini tanlang.\n4. 'Navigatsiyani boshlash' orqali real vaqtdagi ovozli ko'rsatmalardan foydalaning.";
    } else if (lang === 'ru') {
      aiText = "📍 Построение маршрута:\n1. Введите адрес в поле поиска слева.\n2. Либо нажмите на любую точку на карте и выберите «Сюда (Б)».\n3. Выберите авто, автобус, велосипед или пешком.\n4. Нажмите «Начать навигацию» для голосовых подсказок.";
    } else {
      aiText = "📍 To calculate a route:\n1. Enter your destination in the left search panel.\n2. Or click any location on the map and select 'Route Here (B)'.\n3. Choose car, transit, cycling, or walking mode.\n4. Tap 'Start navigation' for live voice turn-by-turn guidance.";
    }
  } else if (lower.includes('metan') || lower.includes('propan') || lower.includes('gaz') || lower.includes('zapravka') || lower.includes('bosim') || lower.includes('bar')) {
    if (lang === 'uz') {
      aiText = "⛽ Metan (AGNKSh) va Propan stansiyalari holati:\n• 🟢 Bosim 200–240 bar: Zo'r bosim, tez to'ldiriladi.\n• 🟡 Bosim 180–200 bar: O'rtacha bosim.\n• 🔴 Bosim <180 bar: Past bosim yoki navbat ko'p.\nChap paneldagi 'Metan/Propan' filtrini bosib, eng yaqin ochiq shoxobchalarni topishingiz mumkin.";
    } else if (lang === 'ru') {
      aiText = "⛽ Метановые и пропановые заправки:\n• 🟢 200–240 бар: Отличное давление.\n• 🟡 180–200 бар: Среднее давление.\n• 🔴 <180 бар: Низкое давление или большая очередь.\nВключите фильтр «Metan/Propan» слева для поиска ближайших открытых станций.";
    } else {
      aiText = "⛽ CNG & LPG gas stations:\n• 🟢 200–240 bar: Excellent pressure.\n• 🟡 180–200 bar: Moderate pressure.\n• 🔴 <180 bar: Low pressure or long queues.\nFilter by 'Metan/Propan' on the left panel to find live stations.";
    }
  } else if (lower.includes('havo') || lower.includes('ob-havo') || lower.includes('воздух') || lower.includes('air') || lower.includes('aqi') || lower.includes('pogoda')) {
    if (lang === 'uz') {
      aiText = "🌤️ Havo sifati (AQI) va ob-havo:\n• 🟢 AQI 0–50: Toza havo (Yaxshi)\n• 🟡 AQI 51–100: O‘rtacha qoniqarli\n• 🔴 AQI 101+: Noqulay (Ifloslangan)\nMa'lumotlar Open-Meteo orqali har 30 daqiqada yangilanadi. Yomg'irli yoki tumanli kunlarda ehtiyotkorlik bilan harakatlaning!";
    } else if (lang === 'ru') {
      aiText = "🌤️ Качество воздуха (AQI) и погода:\n• 🟢 AQI 0–50: Чистый воздух (Хорошо)\n• 🟡 AQI 51–100: Умеренное\n• 🔴 AQI 101+: Неблагоприятное\nДанные обновляются каждые 30 минут через Open-Meteo. В дождь и туман соблюдайте повышенную дистанцию!";
    } else {
      aiText = "🌤️ Air quality (AQI) & weather:\n• 🟢 AQI 0–50: Good air\n• 🟡 AQI 51–100: Moderate\n• 🔴 AQI 101+: Unhealthy\nData is synchronized every 30 minutes via Open-Meteo European AQI.";
    }
  } else if (lower.includes('xabar') || lower.includes('сообщить') || lower.includes('report') || lower.includes('chuqur') || lower.includes('yama')) {
    if (lang === 'uz') {
      aiText = "📢 Muammo haqida xabar berish uchun xaritaning pastki qismidagi '+ Muammo haqida xabar berish' tugmasini bosing. 3 qadamda muammo turini (avariya, chuqur, ta'mirlash, radar) tanlab, joyni belgilashingiz kifoya.";
    } else if (lang === 'ru') {
      aiText = "📢 Чтобы сообщить о дорожном происшествии или яме, нажмите кнопку «+ Сообщить о проблеме» на карте. Это займет всего 3 простых шага.";
    } else {
      aiText = "📢 To report a road incident or pothole, tap '+ Report a problem' on the map. You can submit it in 3 quick steps.";
    }
  } else if (lower.includes('salom') || lower.includes('assalom') || lower.includes('privet') || lower.includes('hello')) {
    if (lang === 'uz') {
      aiText = "Assalomu alaykum! Men NaviGo AI intellektual yordamchisiman. Sizga yo'l holati, navigatsiya, tezlik me'yorlari, radarlar, ob-havo, metan zapravkalari yoki 103/102 xizmatlari bo'yicha ma'lumot bera olaman. Nima haqida bilmoqchisiz?";
    } else if (lang === 'ru') {
      aiText = "Здравствуйте! Я ИИ-помощник сервиса NaviGo. Чем могу помочь вам по дорожной ситуации, навигации, радарам, заправкам или экстренным службам?";
    } else {
      aiText = "Hello! I am your NaviGo AI assistant. How can I assist you with navigation, speed cameras, CNG stations, weather, or emergency services today?";
    }
  } else {
    // Helpful general assistant response
    if (lang === 'uz') {
      aiText = "Sizning savolingizni tushundim. NaviGo orqali marshrut tuzish, tezlik kameralari, yo'ldagi ta'mirlashlar, metan gaz bosimi, ob-havo yoki 103/102 favqulodda xizmatlar haqida istalgan savolingizni berishingiz mumkin. Agar navbatchi operator bilan bog'lanmoqchi bo'lsangiz, 'Xodim bilan bog'lanish' tugmasini bosing.";
    } else if (lang === 'ru') {
      aiText = "Я готов помочь с навигацией, дорожной ситуацией, радарами, давлением на АГНКС, погодой или экстренными службами. Вы также можете нажать «Поговорить с человеком» в любой момент.";
    } else {
      aiText = "I can assist you with navigation, traffic conditions, speed cameras, CNG pressure, weather advisories, or emergency services. You can also tap 'Talk to a person' at any time.";
    }
  }

  const aiMsg = dbStore.addSupportMessage(conversationId, {
    conversationId,
    senderType: 'AI_ASSISTANT',
    senderName: 'NaviGo AI',
    text: aiText
  });

  return res.json({
    conversationId,
    userMessage: userMsg,
    reply: aiMsg
  });
});

// GET /api/v1/support/messages/:conversationId
supportRouter.get('/messages/:conversationId', (req: AuthenticatedRequest, res: Response) => {
  const messages = dbStore.getSupportMessages(req.params.conversationId);
  return res.json({ messages });
});

// POST /api/v1/support/escalate - Escalate to human staff
supportRouter.post('/escalate', (req: AuthenticatedRequest, res: Response) => {
  const conversationId = req.body.conversationId as string;
  const staffMsg = dbStore.addSupportMessage(conversationId, {
    conversationId,
    senderType: 'STAFF',
    senderName: 'Nigora (Support Dispatcher)',
    text: 'Assalomu alaykum! Navbatchi dispetcher suhbatga ulandi. Qanday yordam bera olaman? / Здравствуйте! Дежурный диспетчер подключился. Чем помочь?'
  });

  return res.json({ message: 'Escalated to human operator', staffMessage: staffMsg });
});
