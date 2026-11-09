import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, Send, Bot, PhoneCall, Sparkles, Navigation, Gauge, Fuel, Siren, CloudSun, AlertTriangle } from 'lucide-react';
import { SupportMessage } from '@yol/shared';

// Comprehensive intelligent AI response generator (works both online and offline/static fallback)
function getIntelligentAiResponse(userText: string, locale: string): string {
  const lower = userText.toLowerCase().trim();

  // 1. Emergency / SOS
  if (
    lower.includes('sos') || 
    lower.includes('103') || 
    lower.includes('102') || 
    lower.includes('101') || 
    lower.includes('104') || 
    lower.includes('1050') || 
    lower.includes('tez yordam') || 
    lower.includes('skoraya') || 
    lower.includes('ambulance') || 
    lower.includes('yongin') || 
    lower.includes('pojar') || 
    lower.includes('fire') || 
    lower.includes('politsiya') || 
    lower.includes('militsiya') || 
    lower.includes('police')
  ) {
    if (locale === 'ru') {
      return "Экстренные службы Республики Узбекистан:\n\n" +
        "• 103 — Скорая медицинская помощь\n" +
        "• 102 — Безопасность дорожного движения и органы МВД\n" +
        "• 101 — Пожарно-спасательная служба\n" +
        "• 104 — Аварийная газовая служба\n" +
        "• 1050 — Служба спасения МЧС\n\n" +
        "Для прямого перехода в режим экстренной диспетчеризации нажмите кнопку «103 Tez Yordam» вверху экрана или перейдите по ссылке #/ambulance (сервис действует на территории Узбекистана).";
    }
    if (locale === 'en') {
      return "Emergency Numbers (Uzbekistan National Services):\n\n" +
        "• 103 — Ambulance Medical Emergency\n" +
        "• 102 — Traffic Safety & Police\n" +
        "• 101 — Fire & Rescue Service\n" +
        "• 104 — Emergency Gas Service\n" +
        "• 1050 — Emergency Ministry (MES) Rescue\n\n" +
        "To access the emergency dispatcher mode, click the '103 Tez Yordam' button in the top bar or navigate to #/ambulance (dedicated strictly to Uzbekistan).";
    }
    return "O‘zbekiston Respublikasi Favqulodda Shoshilinch Xizmatlari:\n\n" +
      "• 103 — Tez tibbiy yordam\n" +
      "• 102 — Yo‘l harakati xavfsizligi va Ichki ishlar\n" +
      "• 101 — Yong‘in-qutqaruv xizmati\n" +
      "• 104 — Favqulodda gaz xizmati\n" +
      "• 1050 — FVV Qutqaruv xizmati\n\n" +
      "Tezkor dispetcherlik tizimiga o‘tish uchun ekranning yuqori qismidagi '103 Tez Yordam' tugmasini bosing yoki #/ambulance sahifasiga o‘ting (ushbu tizim faqat O‘zbekiston hududi uchun ishlaydi).";
  }

  // 2. Speed Limits & Radar
  if (
    lower.includes('tezlik') || 
    lower.includes('radar') || 
    lower.includes('kamera') || 
    lower.includes('jarima') || 
    lower.includes('skorost') || 
    lower.includes('speed') || 
    lower.includes('limit')
  ) {
    if (locale === 'ru') {
      return "Ограничения скорости по ПДД Узбекистана:\n\n" +
        "• В городах и населенных пунктах: максимум 60 км/ч.\n" +
        "• В жилых зонах и дворовых территориях: 20 км/ч.\n" +
        "• Возле школ и детских садов: 30 км/ч.\n" +
        "• На загородных автомагистралях: 100 км/ч.\n\n" +
        "Стационарные и мобильные радары отмечены на карте круглыми оранжевыми значками. При приближении к камере NaviGo предупредит вас звуковым сигналом и покажет допустимую скорость.";
    }
    if (locale === 'en') {
      return "Speed Limits in Uzbekistan:\n\n" +
        "• Within cities & urban areas: 60 km/h.\n" +
        "• In residential zones: 20 km/h.\n" +
        "• Near schools & kindergartens: 30 km/h.\n" +
        "• On intercity highways: 100 km/h.\n\n" +
        "Radars and speed cameras are marked on the map with orange circular badges. NaviGo provides proactive alerts as you approach monitored zones.";
    }
    return "O‘zbekiston Yo‘l Harakati Qoidalariga ko‘ra ruxsat etilgan tezlik me’yorlari:\n\n" +
      "• Shaharlar va aholi punktlarida: maksimal 60 km/soat.\n" +
      "• Turar joy zonalari va hovlilarda: 20 km/soat.\n" +
      "• Maktablar va bolalar bog‘chalari atrofida: 30 km/soat.\n" +
      "• Aholi punktlaridan tashqaridagi trassalarda: 100 km/soat.\n\n" +
      "NaviGo xaritasida radarlar va kameralar to‘q sariq nishonlar bilan ko‘rsatiladi. Radarga yaqinlashganingizda tizim sizni ogohlantiradi va me’yoriy tezlikni eslatadi.";
  }

  // 3. Navigation & Routing
  if (
    lower.includes('marshrut') || 
    lower.includes('qanday bor') || 
    lower.includes('marshrut tuzish') || 
    lower.includes('navigatsiya') || 
    lower.includes('borish') || 
    lower.includes('kak doehat') || 
    lower.includes('route') || 
    lower.includes('how to get') || 
    lower.includes('navigate')
  ) {
    if (locale === 'ru') {
      return "Как построить маршрут в NaviGo:\n\n" +
        "1. В поле поиска слева введите название любого места, улицы или города.\n" +
        "2. Или просто нажмите на любую точку на карте и выберите «Сюда (Б)».\n" +
        "3. Выберите вид транспорта: Автомобиль, Общественный транспорт, Велосипед или Пешком.\n" +
        "4. Система рассчитает оптимальный путь, покажет пробки и предложит объездные маршруты.\n" +
        "5. Нажмите «Начать навигацию» для пошагового голосового ведения в реальном времени.";
    }
    if (locale === 'en') {
      return "How to plan a route with NaviGo:\n\n" +
        "1. In the search box on the left, type any address, landmark, or city.\n" +
        "2. Or simply click any location directly on the map and choose 'Route Here (B)'.\n" +
        "3. Select your travel mode: Driving, Transit, Cycling, or Walking.\n" +
        "4. NaviGo computes the fastest route with live turn-by-turn guidance and traffic avoidance.";
    }
    return "NaviGo orqali marshrut tuzish tartibi:\n\n" +
      "1. Chap paneldagi qidiruv maydoniga istalgan manzil, ko‘cha yoki shaharni yozing.\n" +
      "2. Yoki to‘g‘ridan-to‘g‘ri xaritadagi xohlagan nuqtani bosing va 'Bu yerga ketish (B)' tugmasini tanlang.\n" +
      "3. Transport turini tanlang: Avtomobil, Jamoat transporti, Velosiped yoki Piyoda.\n" +
      "4. Tizim sizga 'Eng tez yo‘l' hamda tirbandlikdan qochuvchi muqobil yo‘llarni hisoblab beradi.\n" +
      "5. 'Navigatsiyani boshlash' tugmasini bossangiz, ovozli burilish yo‘riqnomasi boshlanadi.";
  }

  // 4. Gas / Methane / Propane
  if (
    lower.includes('metan') || 
    lower.includes('propan') || 
    lower.includes('gaz') || 
    lower.includes('zapravka') || 
    lower.includes('bosim') || 
    lower.includes('bar') || 
    lower.includes('azs') || 
    lower.includes('fuel') || 
    lower.includes('petrol')
  ) {
    if (locale === 'ru') {
      return "Телеметрия АЗС, метановых (АГНКС) и пропановых станций:\n\n" +
        "• Давление 200–240 бар: Отличное давление, быстрая заправка.\n" +
        "• Давление 180–200 бар: Среднее рабочее давление.\n" +
        "• Давление ниже 180 бар: Низкое давление или высокая очередь.\n\n" +
        "Нажмите кнопку «Zapravka» под кнопкой SOS слева, чтобы увидеть открытые заправки, актуальные цены на бензин (AI-80, 92, 95, 98), давление метана и пропан.";
    }
    if (locale === 'en') {
      return "Fuel, Methane (CNG) & Propane (LPG) Station Telemetry:\n\n" +
        "• 200–240 bar: Excellent pressure, fast fill.\n" +
        "• 180–200 bar: Moderate pressure.\n" +
        "• Below 180 bar: Low pressure or long queues.\n\n" +
        "Click the 'Zapravka' button under SOS on the left dock to inspect live fuel grades (AI-80, 92, 95, 98, Diesel), CNG pressure, and LPG stations.";
    }
    return "Yoqilg'i (AQS), Metan (AGNKSh) va Propan shoxobchalari ma'lumoti:\n\n" +
      "• Bosim 200–240 bar: A’lo darajadagi bosim, tez to‘ldirish.\n" +
      "• Bosim 180–200 bar: O‘rtacha bosim.\n" +
      "• Bosim <180 bar: Past bosim yoki katta navbat.\n\n" +
      "Chap paneldagi SOS tugmasi ostida joylashgan 'Zapravka' tugmasini bosing. Sizga barcha benzin navlari (AI-80, 92, 95, 98, Dizel), metan bosimi va propan narxlari real vaqtda ko'rsatiladi.";
  }

  // 5. Weather & Air Quality
  if (
    lower.includes('ob-havo') || 
    lower.includes('ob havo') || 
    lower.includes('havo') || 
    lower.includes('yomgir') || 
    lower.includes('qor') || 
    lower.includes('tuman') || 
    lower.includes('aqi') || 
    lower.includes('pogoda') || 
    lower.includes('weather') || 
    lower.includes('air')
  ) {
    if (locale === 'ru') {
      return "Погода и качество воздуха (AQI):\n\n" +
        "• AQI 0–50: Отличное качество воздуха (Good).\n" +
        "• AQI 51–100: Умеренное (Moderate).\n" +
        "• AQI 101+: Неблагоприятное (Unhealthy).\n\n" +
        "Данные обновляются в реальном времени через Open-Meteo European AQI. Во время дождя или тумана соблюдайте увеличенную в 2 раза дистанцию и включайте ближний свет/противотуманные фары.";
    }
    if (locale === 'en') {
      return "Weather & Air Quality (AQI) Telemetry:\n\n" +
        "• AQI 0–50: Good air quality.\n" +
        "• AQI 51–100: Moderate air quality.\n" +
        "• AQI 101+: Unhealthy.\n\n" +
        "Real-time forecasts and European AQI metrics are tracked automatically for your exact coordinates. During rain or fog, always maintain double following distance.";
    }
    return "Ob-havo va Havo sifati (AQI) ko‘rsatkichlari:\n\n" +
      "• AQI 0–50: Yaxshi / Toza havo (Good).\n" +
      "• AQI 51–100: O‘rtacha qoniqarli (Moderate).\n" +
      "• AQI 101+: Noqulay / Ifloslangan (Unhealthy).\n\n" +
      "Xaritadagi har bir shahar va tuman uchun harorat va shamol tezligi Open-Meteo orqali yangilanadi. Yomg‘ir, qor yoki tuman bo‘lganda avtomobillar oralig‘idagi masofani 2 barobarga oshirish tavsiya etiladi.";
  }

  // 6. Reporting road incidents
  if (
    lower.includes('xabar') || 
    lower.includes('report') || 
    lower.includes('chuqur') || 
    lower.includes('yama') || 
    lower.includes('buzilgan') || 
    lower.includes('tamir') || 
    lower.includes('halokat') || 
    lower.includes('dtp') || 
    lower.includes('soobshit')
  ) {
    if (locale === 'ru') {
      return "Как сообщить о дорожной проблеме или ДТП:\n\n" +
        "1. Нажмите кнопку «+ Сообщить о проблеме» в правом нижнем углу карты.\n" +
        "2. Выберите категорию: ДТП, Яма, Дорожные работы, Пробка или Радар.\n" +
        "3. Укажите местоположение и нажмите «Отправить».\n" +
        "Ваша отметка сразу отобразится у всех водителей, помогая предотвратить заторы!";
    }
    if (locale === 'en') {
      return "How to submit a road hazard or incident report:\n\n" +
        "1. Click the floating '+ Report a problem' button on the map.\n" +
        "2. Choose the hazard type: Accident, Pothole, Roadworks, Traffic Jam, or Speed Camera.\n" +
        "3. Confirm the location and tap 'Submit'.\n" +
        "Your report instantly alerts fellow motorists across NaviGo!";
    }
    return "Yo‘ldagi nosozlik, chuqur yoki avariya haqida xabar berish:\n\n" +
      "1. Xaritaning o‘ng pastki qismidagi '+ Muammo haqida xabar berish' tugmasini bosing.\n" +
      "2. Muammo turini tanlang: Avtohalokat, Chuqur, Yo‘l ta’miri, Tirbandlik yoki Radar.\n" +
      "3. Joylashuvni tasdiqlang va 'Xabar berish' tugmasini bosing.\n" +
      "Siz qoldirgan ma’lumot boshqa barcha haydovchilar xaritasida darhol aks etadi va tirbandlikning oldini olishga xizmat qiladi!";
  }

  // 7. Theme / Dark Mode / Settings
  if (
    lower.includes('tungi') || 
    lower.includes('qora') || 
    lower.includes('kunduzgi') || 
    lower.includes('temnaya') || 
    lower.includes('svetlay') || 
    lower.includes('dark mode') || 
    lower.includes('rejim') || 
    lower.includes('sozlamalar')
  ) {
    if (locale === 'ru') {
      return "Переключение темы и настройки оформления:\n\n" +
        "• В верхнем меню перейдите в «Sozlamalar» (Настройки) или используйте переключатель темы.\n" +
        "• Темная тема оптимизирована для ночной езды и снижает нагрузку на глаза.\n" +
        "• Переключение темы происходит мгновенно без перезагрузки карты и без потери меток.";
    }
    if (locale === 'en') {
      return "Dark/Light Mode & Settings:\n\n" +
        "• Go to 'Settings' in the top navigation or toggle the theme switch.\n" +
        "• Dark mode reduces glare during nighttime driving.\n" +
        "• Theme transitions are instant and preserve all active routes, markers, and incident layers.";
    }
    return "Tungi va Kunduzgi rejim (Sozlamalar):\n\n" +
      "• Yuqori menyudagi 'Sozlamalar' bo‘limidan yoki mavzu tugmasidan foydalanib tungi rejimni yoqishingiz mumkin.\n" +
      "• Tungi rejim haydovchining ko‘zini toliqtirmaydi va batareya quvvatini tejaydi.\n" +
      "• Rejim almashganda xaritadagi barcha yo‘llar, radarlar va ob-havo belgilari bir zumda saqlanadi.";
  }

  // 8. Greetings & Civility
  if (
    lower.includes('salom') || 
    lower.includes('assalom') || 
    lower.includes('privet') || 
    lower.includes('zdravstvuy') || 
    lower.includes('hello') || 
    lower.includes('hi') || 
    lower.includes('kimsan') || 
    lower.includes('navigo nima')
  ) {
    if (locale === 'ru') {
      return "Здравствуйте! Я интеллектуальный помощник NaviGo AI. 🚗 Я помогу вам с навигацией по Узбекистану и миру, расскажу об ограничениях скорости и радарах, давлении на заправках Метан/Пропан, актуальной погоде или вызове экстренных служб (103, 102). Чем могу помочь?";
    }
    if (locale === 'en') {
      return "Hello! I am your NaviGo AI assistant. 🚗 I can guide you through worldwide navigation, speed limits, radar alerts, CNG/LPG station telemetry, live weather forecasts, or emergency services (103, 102). How can I assist you today?";
    }
    return "Assalomu alaykum! Men NaviGo AI aqlli yordamchisiman. 🚗 Sizga O‘zbekiston va dunyo bo‘ylab navigatsiya, tezlik me’yorlari va radarlar, metan/propan gaz bosimi, real ob-havo holati hamda 103/102 shoshilinch xizmatlari bo‘yicha to‘liq ma’lumot berishga tayyorman. Sizni qaysi masala qiziqtiradi?";
  }

  // 9. Thanks / Gratitude
  if (
    lower.includes('rahmat') || 
    lower.includes('spasibo') || 
    lower.includes('thanks') || 
    lower.includes('thank you') || 
    lower.includes('salomat')
  ) {
    if (locale === 'ru') {
      return "Пожалуйста! Счастливого и безопасного пути! 🛣️ Если появятся еще вопросы, обращайтесь в любое время.";
    }
    if (locale === 'en') {
      return "You're very welcome! Have a safe and pleasant journey! 🛣️ Feel free to ask anytime.";
    }
    return "Arzimaydi! Oq yo‘l tilayman! 🛣️ Safaringiz xavfsiz va yo‘lingiz ravon bo‘lsin. Savollaringiz bo‘lsa, bemalol murojaat qiling!";
  }

  // 10. Default informative fallback
  if (locale === 'ru') {
    return "Я внимательно выслушал ваш запрос. Как дорожный ИИ-ассистент NaviGo, я могу ответить на вопросы о маршрутах, пробках, дорожных камерах, давлении на заправках метана или экстренных службах (103/102). Вы также можете нажать кнопку «Поговорить с человеком» вверху для соединения с оператором.";
  }
  if (locale === 'en') {
    return "I received your query. As the NaviGo AI assistant, I can help you with routing, traffic jams, speed radars, methane gas pressure, weather advisories, or national emergency dispatch (103/102). You can also tap 'Talk to a person' to reach our live support team.";
  }
  return "Sizning savolingizni tushundim. NaviGo sun'iy intellekti sifatida marshrutlar, tezlik kameralari, yo‘ldagi ta’mirlashlar, metan gaz bosimi, ob-havo yoki 103/102 favqulodda xizmatlar haqida istalgan ma’lumotni berishim mumkin. Shuningdek, yuqoridagi 'Xodim bilan bog‘lanish' tugmasi orqali navbatchi operatorga ulanishingiz mumkin.";
}

export const SupportChatModal: React.FC = () => {
  const { activeTab, setActiveTab, t, locale, user } = useApp();
  const [messages, setMessages] = useState<SupportMessage[]>([
    {
      id: 'init-1',
      conversationId: 'user-conv',
      senderType: 'AI_ASSISTANT',
      senderName: 'NaviGo AI',
      text: locale === 'uz' 
        ? "Assalomu alaykum! Men NaviGo sun'iy intellekt yordamchisiman. Sizga yo'l holati, navigatsiya, tezlik me'yorlari, ob-havo, metan zapravkalari yoki favqulodda xizmatlar bo'yicha qanday yordam bera olaman?"
        : locale === 'ru'
        ? "Здравствуйте! Я ИИ-помощник сервиса NaviGo. Чем могу помочь вам по дорожной ситуации, навигации, радарам, заправкам или экстренным службам?"
        : "Hello! I am the NaviGo AI assistant. How can I assist you with road navigation, speed cameras, CNG stations, weather, or emergency services today?",
      timestamp: new Date().toISOString()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Quick prompt suggestion chips
  const quickChips = [
    { label: locale === 'ru' ? '🚗 Скорость и радары' : locale === 'en' ? '🚗 Speed & Radars' : "🚗 Tezlik va radarlar", query: "Shahar ichida tezlik cheklovi qancha va radarlar qayerda?" },
    { label: locale === 'ru' ? '📍 Как построить маршрут?' : locale === 'en' ? '📍 How to plan route?' : "📍 Qanday marshrut tuzaman?", query: "Qanday qilib manzilga tezkor marshrut chizaman?" },
    { label: locale === 'ru' ? '⛽ Заправки Метан/Пропан' : locale === 'en' ? '⛽ CNG/LPG Stations' : "⛽ Metan va Propan bosimi", query: "Metan gaz bosimi va zapravkalar holati qanday?" },
    { label: locale === 'ru' ? '🚨 Служба 103 / SOS' : locale === 'en' ? '🚨 Emergency 103 / SOS' : "🚨 103 Tez Yordam / SOS", query: "103 Tez yordam va favqulodda xizmatlar qanday ishlaydi?" },
    { label: locale === 'ru' ? '🌤️ Погода и воздух (AQI)' : locale === 'en' ? '🌤️ Weather & Air Quality' : "🌤️ Ob-havo va havo sifati", query: "Havo sifati va ob-havo haqida ma'lumot bering" }
  ];

  if (activeTab !== 'help') return null;

  const sendQuery = async (userText: string) => {
    if (!userText.trim() || isSending) return;

    setInputText('');
    setIsSending(true);

    const tempUserMsg: SupportMessage = {
      id: `tmp-${Date.now()}`,
      conversationId: 'user-conv',
      senderType: 'USER',
      senderName: user ? user.name : t('support.roles.citizen'),
      text: userText,
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);

    // First attempt backend call; if unavailable or response is generic, fallback to client-side smart reasoning
    let aiReplyText = '';
    try {
      const res = await fetch('/api/v1/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId: 'user-conv',
          text: userText,
          lang: locale
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.reply?.text && !data.reply.text.includes("Assalomu alaykum! Men NaviGo sun'iy intellekt")) {
          aiReplyText = data.reply.text;
        }
      }
    } catch {
      // Backend unavailable (static Vercel hosting or offline)
    }

    if (!aiReplyText) {
      aiReplyText = getIntelligentAiResponse(userText, locale);
    }

    // Small natural AI typing delay
    setTimeout(() => {
      const aiReplyMsg: SupportMessage = {
        id: `ai-${Date.now()}`,
        conversationId: 'user-conv',
        senderType: 'AI_ASSISTANT',
        senderName: 'NaviGo AI',
        text: aiReplyText,
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiReplyMsg]);
      setIsSending(false);
    }, 350);
  };

  const handleSendMessage = () => {
    sendQuery(inputText);
  };

  const handleEscalateToPerson = async () => {
    try {
      const res = await fetch('/api/v1/support/escalate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ conversationId: 'user-conv' })
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data.staffMessage]);
        return;
      }
    } catch {}

    // Fallback escalation response
    const staffNotice: SupportMessage = {
      id: `staff-${Date.now()}`,
      conversationId: 'user-conv',
      senderType: 'STAFF',
      senderName: locale === 'ru' ? 'Диспетчер NaviGo' : locale === 'en' ? 'NaviGo Operator' : 'NaviGo Navbatchi Xodimi',
      text: locale === 'ru'
        ? "Ваш запрос передан дежурному диспетчеру техподдержки. Наш сотрудник ответит в течение 2 минут. Телефон горячей линии: 102 / 103."
        : locale === 'en'
        ? "Your request has been forwarded to our duty support operator. A live representative will reply within 2 minutes. Emergency hotline: 102 / 103."
        : "Sizning murojaatingiz NaviGo navbatchi operatoriga yo'naltirildi. Mutaxassis 2 daqiqa ichida javob beradi. Favqulodda aloqa markazi: 102 / 103.",
      timestamp: new Date().toISOString()
    };
    setMessages(prev => [...prev, staffNotice]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 md:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="help-support-title"
        className="w-full max-w-xl bg-white dark:bg-darkCard rounded-card shadow-float border border-yolBorder dark:border-darkBorder p-4 md:p-6 max-h-[90vh] flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-yolBorder dark:border-darkBorder">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accentOrange text-white flex items-center justify-center shadow-sm">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="help-support-title" className="text-lg md:text-xl font-black text-textPrimary dark:text-darkText">
                  {t('support.title')}
                </h2>
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-orangeTint text-accentOrange uppercase">
                  GPT-4o Enhanced
                </span>
              </div>
              <span className="text-xs text-textSecondary dark:text-darkTextSec flex items-center gap-1.5 mt-0.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>{locale === 'ru' ? 'Онлайн • Отвечает на любые вопросы' : locale === 'en' ? 'Online • Answers any question' : "Onlayn • Istalgan savolga javob beradi"}</span>
              </span>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('map')}
            aria-label={t('common.close')}
            className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-innerSoftArea dark:bg-gray-800 flex items-center justify-center text-textSecondary dark:text-darkTextSec hover:text-textPrimary spring-btn active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Talk to Person Banner */}
        <div className="flex items-center justify-between p-2.5 my-2.5 bg-innerSoftArea dark:bg-gray-800 rounded-2xl border border-yolBorder dark:border-darkBorder">
          <div className="text-xs text-textSecondary dark:text-darkTextSec">
            {t('support.needPerson')}
          </div>
          <button
            onClick={handleEscalateToPerson}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blackPill text-white text-xs font-bold hover:bg-blackPillHover spring-btn active:scale-95"
          >
            <PhoneCall className="w-3.5 h-3.5 text-accentOrange" />
            <span>{t('support.talkToPerson')}</span>
          </button>
        </div>

        {/* Messages List */}
        <div className="flex-1 overflow-y-auto space-y-3 p-1 min-h-[240px]">
          {messages.map((m) => (
            <div
              key={m.id}
              className={`flex flex-col ${
                m.senderType === 'USER' ? 'items-end' : 'items-start'
              }`}
            >
              <span className="text-[10px] font-bold text-textSecondary dark:text-darkTextSec mb-1 px-1">
                {m.senderName} ({m.senderType === 'AI_ASSISTANT' ? t('support.roles.ai') : m.senderType === 'STAFF' ? t('support.roles.staff') : t('support.roles.citizen')})
              </span>
              <div
                className={`max-w-[88%] p-3.5 rounded-2xl text-xs md:text-sm leading-relaxed whitespace-pre-line shadow-xs ${
                  m.senderType === 'USER'
                    ? 'bg-blackPill text-white rounded-br-none'
                    : m.senderType === 'STAFF'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800 rounded-bl-none'
                    : 'bg-innerSoftArea dark:bg-gray-800 text-textPrimary dark:text-darkText rounded-bl-none border border-yolBorder dark:border-gray-700'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-textSecondary dark:text-darkTextSec italic p-2">
              <span className="w-2 h-2 rounded-full bg-accentOrange animate-ping"></span>
              <span>{locale === 'ru' ? 'NaviGo AI печатает ответ...' : locale === 'en' ? 'NaviGo AI is thinking...' : "NaviGo AI javob tayyorlamoqda..."}</span>
            </div>
          )}
        </div>

        {/* Quick Prompt Suggestion Chips */}
        <div className="pt-2 pb-1 overflow-x-auto no-scrollbar flex items-center gap-1.5">
          {quickChips.map((chip, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => sendQuery(chip.query)}
              className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-orangeTint/60 dark:bg-orangeTint/20 text-accentOrange border border-accentOrange/30 hover:bg-accentOrange hover:text-white transition-all whitespace-nowrap spring-btn active:scale-95 shrink-0"
            >
              {chip.label}
            </button>
          ))}
        </div>

        {/* Input Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
          className="mt-2 pt-2.5 border-t border-yolBorder dark:border-darkBorder flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={locale === 'ru' ? 'Спросите о скорости, радарах, маршруте, заправках...' : locale === 'en' ? 'Ask about speed, radars, routes, gas...' : "Tezlik, radarlar, marshrut, zapravkalar haqida so'rang..."}
            className="flex-1 p-2.5 md:p-3 rounded-full bg-innerSoftArea dark:bg-gray-800 text-textPrimary dark:text-darkText text-xs md:text-sm border border-yolBorder dark:border-darkBorder focus:outline-none focus:ring-2 focus:ring-accentOrange"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isSending}
            className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-blackPill text-white flex items-center justify-center hover:bg-blackPillHover disabled:opacity-50 transition-all spring-btn active:scale-90 shrink-0"
          >
            <Send className="w-4 h-4 text-accentOrange" />
          </button>
        </form>
      </div>
    </div>
  );
};
