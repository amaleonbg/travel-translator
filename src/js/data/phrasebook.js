/**
 * A small offline phrasebook.
 *
 * It earns its place twice over. For a traveller it is the fastest path to the
 * twenty sentences that actually come up — you do not want to be composing
 * "where is the nearest pharmacy" from scratch while feeling ill. And in the
 * browser preview, where ML Kit is not available, it doubles as the translation
 * source, so the whole app can be exercised on a laptop with real sentences
 * rather than placeholder text.
 *
 * Keys are the four language codes. Every entry has all four, deliberately:
 * a partially translated phrasebook is worse than a smaller complete one.
 */
export const PHRASEBOOK = [
  {
    category: "Greetings & basics",
    phrases: [
      { en: "Hello", bg: "Здравейте", pt: "Olá", es: "Hola" },
      { en: "Good morning", bg: "Добро утро", pt: "Bom dia", es: "Buenos días" },
      { en: "Good evening", bg: "Добър вечер", pt: "Boa noite", es: "Buenas noches" },
      { en: "Please", bg: "Моля", pt: "Por favor", es: "Por favor" },
      { en: "Thank you", bg: "Благодаря", pt: "Obrigado", es: "Gracias" },
      { en: "Excuse me", bg: "Извинете", pt: "Com licença", es: "Perdone" },
      { en: "Yes", bg: "Да", pt: "Sim", es: "Sí" },
      { en: "No", bg: "Не", pt: "Não", es: "No" },
      { en: "Do you speak English?", bg: "Говорите ли английски?", pt: "Fala inglês?", es: "¿Habla inglés?" },
      { en: "I don't understand", bg: "Не разбирам", pt: "Não entendo", es: "No entiendo" },
      { en: "Could you repeat that, please?", bg: "Може ли да повторите, моля?", pt: "Pode repetir, por favor?", es: "¿Puede repetirlo, por favor?" },
      { en: "Goodbye", bg: "Довиждане", pt: "Adeus", es: "Adiós" },
    ],
  },
  {
    category: "Getting around",
    phrases: [
      { en: "Where is the bus station?", bg: "Къде е автогарата?", pt: "Onde fica a estação de autocarros?", es: "¿Dónde está la estación de autobuses?" },
      { en: "Where is the train station?", bg: "Къде е гарата?", pt: "Onde fica a estação de comboios?", es: "¿Dónde está la estación de tren?" },
      { en: "Where is the airport?", bg: "Къде е летището?", pt: "Onde fica o aeroporto?", es: "¿Dónde está el aeropuerto?" },
      { en: "How much is a ticket?", bg: "Колко струва билетът?", pt: "Quanto custa um bilhete?", es: "¿Cuánto cuesta un billete?" },
      { en: "I would like a taxi, please", bg: "Бих искал такси, моля", pt: "Queria um táxi, por favor", es: "Quisiera un taxi, por favor" },
      { en: "Please take me to this address", bg: "Моля, закарайте ме на този адрес", pt: "Leve-me a esta morada, por favor", es: "Lléveme a esta dirección, por favor" },
      { en: "Is it far from here?", bg: "Далеч ли е оттук?", pt: "É longe daqui?", es: "¿Está lejos de aquí?" },
      { en: "Stop here, please", bg: "Спрете тук, моля", pt: "Pare aqui, por favor", es: "Pare aquí, por favor" },
    ],
  },
  {
    category: "Where you are staying",
    phrases: [
      { en: "I have a reservation", bg: "Имам резервация", pt: "Tenho uma reserva", es: "Tengo una reserva" },
      { en: "What time is check-out?", bg: "В колко часа е напускането?", pt: "A que horas é o check-out?", es: "¿A qué hora es la salida?" },
      { en: "The key does not work", bg: "Ключът не работи", pt: "A chave não funciona", es: "La llave no funciona" },
      { en: "There is no hot water", bg: "Няма топла вода", pt: "Não há água quente", es: "No hay agua caliente" },
      { en: "Could I have more towels?", bg: "Може ли още кърпи?", pt: "Pode trazer mais toalhas?", es: "¿Me puede traer más toallas?" },
      { en: "What is the Wi-Fi password?", bg: "Каква е паролата за Wi-Fi?", pt: "Qual é a palavra-passe do Wi-Fi?", es: "¿Cuál es la contraseña del Wi-Fi?" },
      { en: "The air conditioning is not working", bg: "Климатикът не работи", pt: "O ar condicionado não funciona", es: "El aire acondicionado no funciona" },
    ],
  },
  {
    category: "Eating out",
    phrases: [
      { en: "A table for two, please", bg: "Маса за двама, моля", pt: "Uma mesa para dois, por favor", es: "Una mesa para dos, por favor" },
      { en: "The menu, please", bg: "Менюто, моля", pt: "A ementa, por favor", es: "La carta, por favor" },
      { en: "I am vegetarian", bg: "Аз съм вегетарианец", pt: "Sou vegetariano", es: "Soy vegetariano" },
      { en: "I am allergic to nuts", bg: "Алергичен съм към ядки", pt: "Sou alérgico a frutos secos", es: "Soy alérgico a los frutos secos" },
      { en: "Water, please", bg: "Вода, моля", pt: "Água, por favor", es: "Agua, por favor" },
      { en: "The bill, please", bg: "Сметката, моля", pt: "A conta, por favor", es: "La cuenta, por favor" },
      { en: "It was delicious", bg: "Беше много вкусно", pt: "Estava delicioso", es: "Estaba delicioso" },
    ],
  },
  {
    category: "Shopping & money",
    phrases: [
      { en: "How much does this cost?", bg: "Колко струва това?", pt: "Quanto custa isto?", es: "¿Cuánto cuesta esto?" },
      { en: "That is too expensive", bg: "Това е твърде скъпо", pt: "Isso é muito caro", es: "Eso es demasiado caro" },
      { en: "Do you take card?", bg: "Приемате ли карти?", pt: "Aceitam cartão?", es: "¿Aceptan tarjeta?" },
      { en: "Where is the cash machine?", bg: "Къде има банкомат?", pt: "Onde há um multibanco?", es: "¿Dónde hay un cajero automático?" },
      { en: "I am just looking, thank you", bg: "Само разглеждам, благодаря", pt: "Estou só a ver, obrigado", es: "Solo estoy mirando, gracias" },
      { en: "Can I have a receipt?", bg: "Може ли касова бележка?", pt: "Pode dar-me o recibo?", es: "¿Me da el recibo?" },
    ],
  },
  {
    category: "Health & emergency",
    phrases: [
      { en: "I need a doctor", bg: "Имам нужда от лекар", pt: "Preciso de um médico", es: "Necesito un médico" },
      { en: "Call an ambulance", bg: "Извикайте линейка", pt: "Chame uma ambulância", es: "Llame a una ambulancia" },
      { en: "Where is the nearest pharmacy?", bg: "Къде е най-близката аптека?", pt: "Onde fica a farmácia mais próxima?", es: "¿Dónde está la farmacia más cercana?" },
      { en: "I am in pain here", bg: "Боли ме тук", pt: "Dói-me aqui", es: "Me duele aquí" },
      { en: "I feel unwell", bg: "Не се чувствам добре", pt: "Não me sinto bem", es: "No me encuentro bien" },
      { en: "Help!", bg: "Помощ!", pt: "Socorro!", es: "¡Socorro!" },
      { en: "Call the police", bg: "Извикайте полиция", pt: "Chame a polícia", es: "Llame a la policía" },
      { en: "I have lost my passport", bg: "Изгубих си паспорта", pt: "Perdi o meu passaporte", es: "He perdido mi pasaporte" },
    ],
  },
  {
    category: "When something goes wrong",
    phrases: [
      { en: "I am lost", bg: "Изгубих се", pt: "Estou perdido", es: "Estoy perdido" },
      { en: "Can you help me, please?", bg: "Може ли да ми помогнете, моля?", pt: "Pode ajudar-me, por favor?", es: "¿Puede ayudarme, por favor?" },
      { en: "Where is the toilet?", bg: "Къде е тоалетната?", pt: "Onde fica a casa de banho?", es: "¿Dónde está el baño?" },
      { en: "My phone has no signal", bg: "Телефонът ми няма обхват", pt: "O meu telemóvel não tem rede", es: "Mi teléfono no tiene cobertura" },
      { en: "I missed my flight", bg: "Изпуснах полета си", pt: "Perdi o meu voo", es: "He perdido mi vuelo" },
      { en: "Someone has stolen my bag", bg: "Откраднаха ми чантата", pt: "Roubaram-me a mala", es: "Me han robado el bolso" },
    ],
  },
];

/** Flat list, for search and for the preview translator's lookup table. */
export const ALL_PHRASES = PHRASEBOOK.flatMap((g) =>
  g.phrases.map((p) => ({ ...p, category: g.category }))
);

/** Normalise for matching: case, accents and trailing punctuation all ignored. */
export function normalise(text) {
  return String(text || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[¿?¡!.,;:'"()]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

const INDEX = new Map();
for (const phrase of ALL_PHRASES) {
  for (const code of ["en", "bg", "pt", "es"]) {
    const key = `${code}:${normalise(phrase[code])}`;
    if (!INDEX.has(key)) INDEX.set(key, phrase);
  }
}

/** Exact phrasebook hit, or null. Used by the browser preview translator. */
export function lookup(text, sourceCode) {
  return INDEX.get(`${sourceCode}:${normalise(text)}`) || null;
}

export function searchPhrases(query, code = "en") {
  const q = normalise(query);
  if (!q) return ALL_PHRASES;
  return ALL_PHRASES.filter((p) =>
    ["en", "bg", "pt", "es"].some((c) => normalise(p[c]).includes(q)) ||
    normalise(p.category).includes(q)
  );
}
