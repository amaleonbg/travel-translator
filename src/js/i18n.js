/**
 * The app's own interface, in four languages.
 *
 * Not to be confused with the languages the app *translates* between — this is
 * the language of the buttons and labels themselves. A Bulgarian traveller
 * should not have to read an English interface to use a Bulgarian translator,
 * and a Spanish one should not either.
 *
 * How it works: every visible string has a key, and every key has all four
 * languages. `npm run verify` fails if any key is missing one, because a
 * half-translated interface is worse than an English one — the user cannot tell
 * whether the app is broken or just incomplete.
 *
 * Strings are kept short deliberately. Long sentences are where translations
 * drift, and where a German-length string breaks a phone layout.
 *
 * `{name}` placeholders are substituted at call time, so word order can differ
 * between languages — which it does: Bulgarian and Spanish do not put the verb
 * where English does.
 */

export const UI_LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "bg", label: "Български", flag: "🇧🇬" },
  { code: "pt", label: "Português", flag: "🇵🇹" },
  { code: "es", label: "Español", flag: "🇪🇸" },
];

export const STRINGS = {
  // --- Header ---------------------------------------------------------------
  "app.name": {
    en: "Travel Translator", bg: "Пътен преводач",
    pt: "Tradutor de viagem", es: "Traductor de viaje",
  },
  "chip.offline": {
    en: "Works offline", bg: "Работи офлайн",
    pt: "Funciona offline", es: "Funciona sin conexión",
  },
  "chip.onlineWithBackup": {
    en: "Online, offline backup", bg: "Онлайн, с офлайн резерв",
    pt: "Online, com reserva offline", es: "En línea, con respaldo sin conexión",
  },
  "chip.needsInternet": {
    en: "Needs internet", bg: "Нужен е интернет",
    pt: "Precisa de internet", es: "Necesita internet",
  },
  "chip.phrasesOnly": {
    en: "Phrases only", bg: "Само готови фрази",
    pt: "Apenas frases", es: "Solo frases",
  },
  "chip.install": { en: "Install", bg: "Инсталирай", pt: "Instalar", es: "Instalar" },
  "chip.browserPreview": {
    en: "Browser preview", bg: "Преглед в браузър",
    pt: "Pré-visualização no navegador", es: "Vista previa en el navegador",
  },

  // --- Tabs -----------------------------------------------------------------
  "tab.translate": { en: "Translate", bg: "Превод", pt: "Traduzir", es: "Traducir" },
  "tab.phrases": { en: "Phrases", bg: "Фрази", pt: "Frases", es: "Frases" },
  "tab.log": { en: "Log", bg: "Дневник", pt: "Registo", es: "Registro" },
  "tab.settings": { en: "Settings", bg: "Настройки", pt: "Definições", es: "Ajustes" },

  // --- Compose --------------------------------------------------------------
  "compose.title": {
    en: "Compose a message", bg: "Съставете съобщение",
    pt: "Escrever uma mensagem", es: "Redactar un mensaje",
  },
  "compose.activeUser": { en: "Active user", bg: "Активен потребител", pt: "Utilizador ativo", es: "Usuario activo" },
  "compose.sends": { en: "(sends)", bg: "(изпраща)", pt: "(envia)", es: "(envía)" },
  "compose.passiveUser": { en: "Passive user", bg: "Пасивен потребител", pt: "Utilizador passivo", es: "Usuario pasivo" },
  "compose.receives": { en: "(receives)", bg: "(получава)", pt: "(recebe)", es: "(recibe)" },
  "compose.swap": {
    en: "Swap direction", bg: "Размени посоката",
    pt: "Inverter a direção", es: "Invertir la dirección",
  },
  "compose.autoDetect": {
    en: "Work out the language from what is written",
    bg: "Разпознай езика по написаното",
    pt: "Detetar o idioma pelo que está escrito",
    es: "Detectar el idioma por lo escrito",
  },
  "compose.autoDetectHint": {
    en: "Useful when someone else has typed into your phone. Checked against the four languages only.",
    bg: "Полезно, когато някой друг е писал на телефона ви. Проверява се само срещу четирите езика.",
    pt: "Útil quando outra pessoa escreveu no seu telemóvel. Verificado apenas nos quatro idiomas.",
    es: "Útil cuando otra persona ha escrito en su teléfono. Se comprueba solo con los cuatro idiomas.",
  },
  "compose.tapToSpeak": {
    en: "Hold the phone up and tap to speak",
    bg: "Вдигнете телефона и докоснете, за да говорите",
    pt: "Levante o telemóvel e toque para falar",
    es: "Levante el teléfono y toque para hablar",
  },
  "compose.listening": {
    en: "Listening — tap to stop", bg: "Слушам — докоснете за спиране",
    pt: "A ouvir — toque para parar", es: "Escuchando — toque para parar",
  },
  "compose.typeLabel": { en: "Type the message", bg: "Напишете съобщението", pt: "Escreva a mensagem", es: "Escriba el mensaje" },
  "compose.typePlaceholder": {
    en: "Type what you want to say, in your own language.",
    bg: "Напишете какво искате да кажете, на своя език.",
    pt: "Escreva o que quer dizer, no seu idioma.",
    es: "Escriba lo que quiere decir, en su idioma.",
  },
  "compose.continue": { en: "Continue", bg: "Продължи", pt: "Continuar", es: "Continuar" },
  "compose.characters": { en: "{n} characters", bg: "{n} знака", pt: "{n} caracteres", es: "{n} caracteres" },
  "compose.label": { en: "Label", bg: "Етикет", pt: "Etiqueta", es: "Etiqueta" },
  "compose.labelHint": {
    en: "(optional — helps when reviewing later)",
    bg: "(по избор — помага при преглед по-късно)",
    pt: "(opcional — ajuda ao rever mais tarde)",
    es: "(opcional — ayuda al revisar después)",
  },
  "compose.labelPlaceholder": {
    en: "e.g. pharmacy, noisy street", bg: "напр. аптека, шумна улица",
    pt: "ex. farmácia, rua barulhenta", es: "p. ej. farmacia, calle ruidosa",
  },
  "compose.typeSomethingFirst": {
    en: "Type something first.", bg: "Първо напишете нещо.",
    pt: "Escreva algo primeiro.", es: "Escriba algo primero.",
  },
  "compose.sameLanguage": {
    en: "The two languages must be different.",
    bg: "Двата езика трябва да са различни.",
    pt: "Os dois idiomas têm de ser diferentes.",
    es: "Los dos idiomas deben ser diferentes.",
  },
  "compose.nowDirection": { en: "Now {from} → {to}", bg: "Сега {from} → {to}", pt: "Agora {from} → {to}", es: "Ahora {from} → {to}" },

  // --- Modes ----------------------------------------------------------------
  "mode.audioSpeaks": { en: "Audio (speaks)", bg: "Глас (говори)", pt: "Áudio (fala)", es: "Audio (habla)" },
  "mode.textTypes": { en: "Text (types)", bg: "Текст (пише)", pt: "Texto (escreve)", es: "Texto (escribe)" },
  "mode.textReads": { en: "Text (reads)", bg: "Текст (чете)", pt: "Texto (lê)", es: "Texto (lee)" },
  "mode.audioListens": { en: "Audio (listens)", bg: "Глас (слуша)", pt: "Áudio (ouve)", es: "Audio (escucha)" },
  "mode.speaks": { en: "Speaks", bg: "Говори", pt: "Fala", es: "Habla" },
  "mode.types": { en: "Types", bg: "Пише", pt: "Escreve", es: "Escribe" },
  "mode.reads": { en: "Reads", bg: "Чете", pt: "Lê", es: "Lee" },
  "mode.listens": { en: "Listens", bg: "Слуша", pt: "Ouve", es: "Escucha" },

  // --- Review ---------------------------------------------------------------
  "review.title": {
    en: "Check before sending", bg: "Проверете преди изпращане",
    pt: "Verifique antes de enviar", es: "Compruebe antes de enviar",
  },
  "review.yourMessage": { en: "Your message", bg: "Вашето съобщение", pt: "A sua mensagem", es: "Su mensaje" },
  "review.correctHint": {
    en: "Correct anything the phone got wrong before translating.",
    bg: "Поправете каквото телефонът е разбрал погрешно, преди да преведете.",
    pt: "Corrija o que o telemóvel percebeu mal antes de traduzir.",
    es: "Corrija lo que el teléfono entendió mal antes de traducir.",
  },
  "review.plainHint": {
    en: "Short, plain sentences translate far more reliably than long ones.",
    bg: "Кратките, прости изречения се превеждат много по-надеждно от дългите.",
    pt: "Frases curtas e simples traduzem-se muito melhor do que as longas.",
    es: "Las frases cortas y sencillas se traducen mucho mejor que las largas.",
  },
  "review.translateCheck": { en: "Translate & check", bg: "Преведи и провери", pt: "Traduzir e verificar", es: "Traducir y comprobar" },
  "review.discard": { en: "Discard", bg: "Откажи", pt: "Descartar", es: "Descartar" },
  "review.theyWillSee": { en: "They will see", bg: "Те ще видят", pt: "Eles verão", es: "Ellos verán" },
  "review.backTranslated": {
    en: "Translated back, to check the meaning",
    bg: "Преведено обратно, за проверка на смисъла",
    pt: "Traduzido de volta, para verificar o sentido",
    es: "Traducido de vuelta, para comprobar el sentido",
  },
  "review.backNote": {
    en: "If it still says what you meant, the message is safe to show. If it drifts, reword it above.",
    bg: "Ако все още означава това, което искахте, съобщението е безопасно за показване. Ако се отклонява, преформулирайте го горе.",
    pt: "Se ainda diz o que queria, a mensagem é segura para mostrar. Se se desviar, reformule acima.",
    es: "Si sigue diciendo lo que quería, la mensaje es seguro mostrarlo. Si se desvía, reformúlelo arriba.",
  },
  "review.show": { en: "Show it to them", bg: "Покажете им го", pt: "Mostrar-lhes", es: "Mostrárselo" },
  "review.willRead": {
    en: "The phone will read it aloud in their language.",
    bg: "Телефонът ще го прочете на глас на техния език.",
    pt: "O telemóvel vai lê-la em voz alta no idioma deles.",
    es: "El teléfono lo leerá en voz alta en su idioma.",
  },
  "review.holdUp": {
    en: "Hold the phone up so they can read it.",
    bg: "Вдигнете телефона, за да могат да го прочетат.",
    pt: "Levante o telemóvel para que possam ler.",
    es: "Levante el teléfono para que puedan leerlo.",
  },
  "review.unsure": {
    en: "The phone was unsure what it heard.",
    bg: "Телефонът не е сигурен какво е чул.",
    pt: "O telemóvel não teve a certeza do que ouviu.",
    es: "El teléfono no estaba seguro de lo que oyó.",
  },
  "review.nothingToTranslate": {
    en: "There is nothing to translate.", bg: "Няма какво да се преведе.",
    pt: "Não há nada para traduzir.", es: "No hay nada que traducir.",
  },
  "review.translating": {
    en: "Translating…", bg: "Превеждам…", pt: "A traduzir…", es: "Traduciendo…",
  },
  "review.meaningShifted": {
    en: "The meaning shifted noticeably. Try shorter, simpler wording.",
    bg: "Смисълът се промени осезаемо. Опитайте с по-кратък и прост израз.",
    pt: "O sentido mudou visivelmente. Tente uma formulação mais curta e simples.",
    es: "El sentido cambió notablemente. Pruebe con palabras más cortas y simples.",
  },
  "review.checkFailed": {
    en: "The check could not be run.", bg: "Проверката не можа да бъде извършена.",
    pt: "A verificação não pôde ser feita.", es: "No se pudo realizar la comprobación.",
  },

  // --- Result ---------------------------------------------------------------
  "result.title": { en: "Result", bg: "Резултат", pt: "Resultado", es: "Resultado" },
  "result.ready": { en: "Ready.", bg: "Готово.", pt: "Pronto.", es: "Listo." },
  "result.showFullScreen": { en: "Show full screen", bg: "Покажи на цял екран", pt: "Ver em ecrã inteiro", es: "Ver a pantalla completa" },
  "result.sent": { en: "Sent", bg: "Изпратено", pt: "Enviado", es: "Enviado" },
  "result.received": { en: "Received", bg: "Получено", pt: "Recebido", es: "Recibido" },
  "result.copy": { en: "Copy", bg: "Копирай", pt: "Copiar", es: "Copiar" },
  "result.copied": { en: "Copied.", bg: "Копирано.", pt: "Copiado.", es: "Copiado." },
  "result.copyFailed": {
    en: "Could not copy on this device.", bg: "Копирането не е възможно на това устройство.",
    pt: "Não foi possível copiar neste dispositivo.", es: "No se pudo copiar en este dispositivo.",
  },
  "result.readAloudAgain": { en: "🔊 Read it aloud again", bg: "🔊 Прочети отново на глас", pt: "🔊 Ler novamente em voz alta", es: "🔊 Leer otra vez en voz alta" },
  "result.readAloud": { en: "🔊 Read aloud", bg: "🔊 Прочети на глас", pt: "🔊 Ler em voz alta", es: "🔊 Leer en voz alta" },
  "result.newMessage": { en: "New message", bg: "Ново съобщение", pt: "Nova mensagem", es: "Nuevo mensaje" },
  "result.afterCorrecting": {
    en: ", after correcting what the phone heard.",
    bg: ", след поправка на чутото от телефона.",
    pt: ", após corrigir o que o telemóvel ouviu.",
    es: ", tras corregir lo que oyó el teléfono.",
  },
  "result.driftWarning": {
    en: "The round-trip check came back quite different from what you wrote. Read the back-translation before relying on it.",
    bg: "Обратната проверка се различава доста от написаното. Прочетете обратния превод, преди да разчитате на него.",
    pt: "A verificação de ida e volta ficou bastante diferente do que escreveu. Leia a retradução antes de confiar nela.",
    es: "La comprobación de ida y vuelta salió bastante distinta de lo que escribió. Lea la retraducción antes de fiarse.",
  },
  "result.uncertain": { en: "Uncertain transcription.", bg: "Несигурно разпознаване.", pt: "Transcrição incerta.", es: "Transcripción incierta." },

  // --- Metrics --------------------------------------------------------------
  "metric.meaningMatch": { en: "Meaning match", bg: "Съвпадение на смисъла", pt: "Correspondência de sentido", es: "Coincidencia de sentido" },
  "metric.heardClearly": { en: "Heard clearly", bg: "Чуто ясно", pt: "Ouvido com clareza", es: "Oído con claridad" },
  "metric.speech": { en: "Speech", bg: "Реч", pt: "Fala", es: "Voz" },
  "metric.translation": { en: "Translation", bg: "Превод", pt: "Tradução", es: "Traducción" },
  "metric.total": { en: "Total", bg: "Общо", pt: "Total", es: "Total" },
  "metric.spokenFor": { en: "Spoken for", bg: "Говорено за", pt: "Falado durante", es: "Hablado durante" },
  "metric.detected": { en: "Detected", bg: "Разпознат", pt: "Detetado", es: "Detectado" },

  // --- Engine labels --------------------------------------------------------
  "engine.onDevice": {
    en: "Translated on this phone", bg: "Преведено на този телефон",
    pt: "Traduzido neste telemóvel", es: "Traducido en este teléfono",
  },
  "engine.online": {
    en: "Translated over the internet", bg: "Преведено през интернет",
    pt: "Traduzido através da internet", es: "Traducido por internet",
  },
  "engine.phrasebook": {
    en: "From the built-in phrases", bg: "От вградените фрази",
    pt: "Das frases incorporadas", es: "De las frases integradas",
  },
  "engine.passthrough": {
    en: "Same language — nothing to translate", bg: "Същият език — няма какво да се превежда",
    pt: "Mesmo idioma — nada a traduzir", es: "Mismo idioma — nada que traducir",
  },

  // --- Rating ---------------------------------------------------------------
  "rating.question": {
    en: "Was this actually correct?", bg: "Наистина ли беше правилно?",
    pt: "Isto estava mesmo correto?", es: "¿Fue realmente correcto?",
  },
  "rating.saved": { en: "Saved", bg: "Запазено", pt: "Guardado", es: "Guardado" },

  // --- Phrasebook -----------------------------------------------------------
  "phrases.title": { en: "Phrasebook", bg: "Разговорник", pt: "Livro de frases", es: "Libro de frases" },
  "phrases.note": {
    en: "Ready-made sentences that need no translation engine. Tap one to use it, or tap the speaker to hear it.",
    bg: "Готови изречения, които не изискват преводач. Докоснете едно, за да го използвате, или високоговорителя, за да го чуете.",
    pt: "Frases prontas que não precisam de tradutor. Toque numa para a usar, ou no altifalante para a ouvir.",
    es: "Frases listas que no necesitan traductor. Toque una para usarla, o el altavoz para oírla.",
  },
  "phrases.searchPlaceholder": {
    en: "Search — try 'pharmacy', 'ticket'", bg: "Търсене — опитайте „аптека“, „билет“",
    pt: "Pesquisar — tente 'farmácia', 'bilhete'", es: "Buscar — pruebe 'farmacia', 'billete'",
  },
  "phrases.noMatch": { en: "Nothing matched “{q}”.", bg: "Няма съвпадения за „{q}“.", pt: "Nada corresponde a “{q}”.", es: "Nada coincide con «{q}»." },
  "phrases.matches": { en: "Matches", bg: "Съвпадения", pt: "Correspondências", es: "Coincidencias" },

  // Phrasebook categories
  // The four language names, in each of the four languages. A Bulgarian user
  // reading "Portuguese" in a Bulgarian interface has to stop and decode it;
  // the native name still leads, because that is what people recognise.
  "lang.en": { en: "English", bg: "Английски", pt: "Inglês", es: "Inglés" },
  "lang.bg": { en: "Bulgarian", bg: "Български", pt: "Búlgaro", es: "Búlgaro" },
  "lang.pt": { en: "Portuguese", bg: "Португалски", pt: "Português", es: "Portugués" },
  "lang.es": { en: "Spanish", bg: "Испански", pt: "Espanhol", es: "Español" },

  "detect.flipped": { en: "Detected {lang} — direction flipped.", bg: "Разпознат {lang} — посоката е обърната.", pt: "Detetado {lang} — direção invertida.", es: "Detectado {lang} — dirección invertida." },
  "detect.found": { en: "Detected {lang}.", bg: "Разпознат {lang}.", pt: "Detetado {lang}.", es: "Detectado {lang}." },
  "review.hintSpeech": {
    en: "Correct anything the phone got wrong before translating.",
    bg: "Поправете каквото телефонът е сгрешил, преди да преведете.",
    pt: "Corrija o que o telemóvel entendeu mal antes de traduzir.",
    es: "Corrija lo que el teléfono haya entendido mal antes de traducir.",
  },
  "review.hintType": {
    en: "Short, plain sentences translate far more reliably than long ones.",
    bg: "Кратките, простите изречения се превеждат много по-надеждно от дългите.",
    pt: "Frases curtas e simples traduzem-se muito melhor do que as longas.",
    es: "Las frases cortas y sencillas se traducen mucho mejor que las largas.",
  },
  "review.uncertain": {
    en: " The recogniser scored this {pct}%. Read it carefully before translating.",
    bg: " Разпознаването оцени това на {pct}%. Прочетете внимателно, преди да преведете.",
    pt: " O reconhecimento deu {pct}% a isto. Leia com atenção antes de traduzir.",
    es: " El reconocimiento le dio un {pct}%. Léalo con atención antes de traducir.",
  },
  "review.sure": { en: "{pct}% sure", bg: "{pct}% сигурност", pt: "{pct}% de certeza", es: "{pct}% de seguridad" },
  "phrases.readAloud": { en: "Read aloud in {lang}", bg: "Прочети на глас на {lang}", pt: "Ler em voz alta em {lang}", es: "Leer en voz alta en {lang}" },
  "log.selectRow": { en: "Select message {id}", bg: "Избери съобщение {id}", pt: "Selecionar mensagem {id}", es: "Seleccionar mensaje {id}" },
  "cat.greetings": { en: "Greetings & basics", bg: "Поздрави и основни", pt: "Saudações e básicos", es: "Saludos y básicos" },
  "cat.gettingAround": { en: "Getting around", bg: "Придвижване", pt: "Deslocações", es: "Desplazarse" },
  "cat.staying": { en: "Where you are staying", bg: "Къде отсядате", pt: "Onde está alojado", es: "Dónde se aloja" },
  "cat.eating": { en: "Eating out", bg: "Хранене навън", pt: "Comer fora", es: "Comer fuera" },
  "cat.shopping": { en: "Shopping & money", bg: "Пазаруване и пари", pt: "Compras e dinheiro", es: "Compras y dinero" },
  "cat.health": { en: "Health & emergency", bg: "Здраве и спешни случаи", pt: "Saúde e emergência", es: "Salud y emergencia" },
  "cat.problems": { en: "When something goes wrong", bg: "Когато нещо се обърка", pt: "Quando algo corre mal", es: "Cuando algo va mal" },

  // --- Message log ----------------------------------------------------------
  "log.title": { en: "Message Log", bg: "Дневник на съобщенията", pt: "Registo de mensagens", es: "Registro de mensajes" },
  "log.note": {
    en: "Every message stays on this phone. Nothing is uploaded, and deleting a row deletes it for good.",
    bg: "Всяко съобщение остава на този телефон. Нищо не се качва, а изтриването на ред го премахва завинаги.",
    pt: "Cada mensagem fica neste telemóvel. Nada é enviado, e apagar uma linha apaga-a definitivamente.",
    es: "Cada mensaje se queda en este teléfono. Nada se sube, y borrar una fila la borra para siempre.",
  },
  "log.refresh": { en: "Refresh", bg: "Обнови", pt: "Atualizar", es: "Actualizar" },
  "log.exportCsv": { en: "Export CSV", bg: "Експорт в CSV", pt: "Exportar CSV", es: "Exportar CSV" },
  "log.exportSelected": { en: "Export selected", bg: "Експорт на избраните", pt: "Exportar selecionados", es: "Exportar seleccionados" },
  "log.delete": { en: "Delete", bg: "Изтрий", pt: "Eliminar", es: "Eliminar" },
  "log.selected": { en: "{n} selected", bg: "{n} избрани", pt: "{n} selecionados", es: "{n} seleccionados" },
  "log.empty": { en: "No messages yet.", bg: "Все още няма съобщения.", pt: "Ainda não há mensagens.", es: "Aún no hay mensajes." },
  "log.when": { en: "When", bg: "Кога", pt: "Quando", es: "Cuándo" },
  "log.who": { en: "Who", bg: "Кой", pt: "Quem", es: "Quién" },
  "log.lang": { en: "Lang", bg: "Език", pt: "Idioma", es: "Idioma" },
  "log.rating": { en: "Rating", bg: "Оценка", pt: "Avaliação", es: "Valoración" },
  "log.status": { en: "Status", bg: "Статус", pt: "Estado", es: "Estado" },
  "log.confirmDelete": {
    en: "Delete {n} message(s)? This cannot be undone.",
    bg: "Да се изтрият ли {n} съобщения? Това е необратимо.",
    pt: "Eliminar {n} mensagem(ns)? Isto não pode ser desfeito.",
    es: "¿Eliminar {n} mensaje(s)? Esto no se puede deshacer.",
  },
  "log.deleted": { en: "Deleted {n}.", bg: "Изтрити {n}.", pt: "Eliminadas {n}.", es: "Eliminados {n}." },
  "log.exported": { en: "Exported.", bg: "Експортирано.", pt: "Exportado.", es: "Exportado." },
  "log.statusSent": { en: "sent", bg: "изпратено", pt: "enviado", es: "enviado" },
  "log.statusPreview": { en: "preview", bg: "преглед", pt: "pré-visualização", es: "vista previa" },
  "log.selectAll": { en: "All", bg: "Всички", pt: "Todos", es: "Todos" },
  "log.selectNone": { en: "None", bg: "Никой", pt: "Nenhum", es: "Ninguno" },

  // --- Settings -------------------------------------------------------------
  "settings.appLanguage": { en: "App language", bg: "Език на приложението", pt: "Idioma da aplicação", es: "Idioma de la aplicación" },
  "settings.packsTitle": { en: "Offline language packs", bg: "Офлайн езикови пакети", pt: "Pacotes de idioma offline", es: "Paquetes de idioma sin conexión" },
  "settings.packsNote": {
    en: "These make the app work with no signal. Download on Wi-Fi before you travel — about 30 MB each, kept once downloaded. English cannot be removed because every translation passes through it.",
    bg: "Те позволяват на приложението да работи без сигнал. Изтеглете ги през Wi-Fi преди пътуване — по около 30 MB, запазват се. Английският не може да се премахне, защото всеки превод минава през него.",
    pt: "Estes fazem a aplicação funcionar sem rede. Descarregue por Wi-Fi antes de viajar — cerca de 30 MB cada, guardados depois. O inglês não pode ser removido porque cada tradução passa por ele.",
    es: "Estos hacen que la aplicación funcione sin cobertura. Descárguelos por Wi-Fi antes de viajar — unos 30 MB cada uno, se conservan. El inglés no se puede quitar porque toda traducción pasa por él.",
  },
  "settings.onThisPhone": { en: "On this phone", bg: "На този телефон", pt: "Neste telemóvel", es: "En este teléfono" },
  "settings.notDownloaded": { en: "Not downloaded", bg: "Не е изтеглен", pt: "Não descarregado", es: "No descargado" },
  "settings.download": { en: "Download", bg: "Изтегли", pt: "Descarregar", es: "Descargar" },
  "settings.remove": { en: "Remove", bg: "Премахни", pt: "Remover", es: "Quitar" },
  "settings.required": { en: "Required", bg: "Задължителен", pt: "Necessário", es: "Necesario" },
  "settings.allPacksPresent": { en: "All packs are on this phone", bg: "Всички пакети са на този телефон", pt: "Todos os pacotes estão neste telemóvel", es: "Todos los paquetes están en este teléfono" },
  "settings.downloadMissing": { en: "Download missing packs", bg: "Изтегли липсващите пакети", pt: "Descarregar pacotes em falta", es: "Descargar paquetes que faltan" },
  "settings.internetTitle": { en: "Using the internet", bg: "Използване на интернет", pt: "Usar a internet", es: "Usar internet" },
  "settings.useInternet": {
    en: "Use the internet when it is available",
    bg: "Използвай интернет, когато е наличен",
    pt: "Usar a internet quando estiver disponível",
    es: "Usar internet cuando esté disponible",
  },
  "settings.internetHintNative": {
    en: "This phone can translate on its own. Turning this on uses an online translator instead when there is a signal — usually better on Bulgarian, but the text leaves your phone.",
    bg: "Този телефон може да превежда сам. Включването използва онлайн преводач при наличие на сигнал — обикновено по-добър за български, но текстът напуска телефона ви.",
    pt: "Este telemóvel traduz sozinho. Ativar isto usa um tradutor online quando há rede — normalmente melhor em búlgaro, mas o texto sai do seu telemóvel.",
    es: "Este teléfono traduce por sí solo. Activarlo usa un traductor en línea cuando hay señal — normalmente mejor en búlgaro, pero el texto sale de su teléfono.",
  },
  "settings.internetHintWeb": {
    en: "The web version has no translation engine of its own, because no phone browser provides one. Without this, only the built-in phrases work.",
    bg: "Уеб версията няма собствен преводач, защото никой мобилен браузър не предлага такъв. Без това работят само вградените фрази.",
    pt: "A versão web não tem tradutor próprio, porque nenhum navegador de telemóvel oferece um. Sem isto, só funcionam as frases incorporadas.",
    es: "La versión web no tiene traductor propio, porque ningún navegador de móvil ofrece uno. Sin esto, solo funcionan las frases integradas.",
  },
  "settings.internetOffWarning": {
    en: "With this off, this web version can only use the built-in phrases. For full translation with no internet, install the Android app.",
    bg: "С това изключено, тази уеб версия може да използва само вградените фрази. За пълен превод без интернет инсталирайте Android приложението.",
    pt: "Com isto desligado, esta versão web só usa as frases incorporadas. Para tradução completa sem internet, instale a aplicação Android.",
    es: "Con esto desactivado, esta versión web solo usa las frases integradas. Para traducción completa sin internet, instale la aplicación Android.",
  },
  "settings.behaviourTitle": { en: "How the phone behaves", bg: "Как се държи телефонът", pt: "Como o telemóvel se comporta", es: "Cómo se comporta el teléfono" },
  "settings.autoSpeak": { en: "Read the translation aloud automatically", bg: "Чети превода на глас автоматично", pt: "Ler a tradução em voz alta automaticamente", es: "Leer la traducción en voz alta automáticamente" },
  "settings.autoSpeakHint": {
    en: "When the passive user is set to Audio, speak the result as soon as it is ready.",
    bg: "Когато пасивният потребител е на Глас, изговаряй резултата веднага щом е готов.",
    pt: "Quando o utilizador passivo está em Áudio, dizer o resultado assim que estiver pronto.",
    es: "Cuando el usuario pasivo está en Audio, decir el resultado en cuanto esté listo.",
  },
  "settings.bigText": { en: "Always open the result full screen", bg: "Винаги отваряй резултата на цял екран", pt: "Abrir sempre o resultado em ecrã inteiro", es: "Abrir siempre el resultado a pantalla completa" },
  "settings.bigTextHint": {
    en: "Large text on a plain background — easier to hold up for someone else to read.",
    bg: "Едър текст на обикновен фон — по-лесно за показване на друг човек.",
    pt: "Texto grande em fundo simples — mais fácil de mostrar a outra pessoa.",
    es: "Texto grande sobre fondo liso — más fácil de mostrar a otra persona.",
  },
  "settings.testTools": { en: "Show review tools", bg: "Покажи инструменти за преглед", pt: "Mostrar ferramentas de revisão", es: "Mostrar herramientas de revisión" },
  "settings.testToolsHint": {
    en: "The 1–5 accuracy rating, the label box and CSV export.",
    bg: "Оценката 1–5 за точност, полето за етикет и експортът в CSV.",
    pt: "A avaliação de precisão 1–5, a caixa de etiqueta e a exportação CSV.",
    es: "La valoración de precisión 1–5, la casilla de etiqueta y la exportación CSV.",
  },
  "settings.capabilityTitle": { en: "What works without internet", bg: "Какво работи без интернет", pt: "O que funciona sem internet", es: "Qué funciona sin internet" },
  "settings.privacyTitle": { en: "Privacy", bg: "Поверителност", pt: "Privacidade", es: "Privacidad" },
  "settings.privacyNote": {
    en: "This app has no server and no account. Messages are stored only on this device and are removed when the app is uninstalled.",
    bg: "Това приложение няма сървър и няма акаунт. Съобщенията се съхраняват само на това устройство и се премахват при деинсталиране.",
    pt: "Esta aplicação não tem servidor nem conta. As mensagens ficam guardadas apenas neste dispositivo e são removidas ao desinstalar.",
    es: "Esta aplicación no tiene servidor ni cuenta. Los mensajes se guardan solo en este dispositivo y se eliminan al desinstalarla.",
  },
  "settings.deleteAll": { en: "Delete every message", bg: "Изтрий всички съобщения", pt: "Eliminar todas as mensagens", es: "Eliminar todos los mensajes" },
  "settings.confirmDeleteAll": {
    en: "Delete every message stored on this phone? This cannot be undone.",
    bg: "Да се изтрият ли всички съобщения на този телефон? Това е необратимо.",
    pt: "Eliminar todas as mensagens guardadas neste telemóvel? Isto não pode ser desfeito.",
    es: "¿Eliminar todos los mensajes guardados en este teléfono? Esto no se puede deshacer.",
  },
  "settings.logCleared": { en: "Message log cleared.", bg: "Дневникът е изчистен.", pt: "Registo limpo.", es: "Registro borrado." },
  "settings.aboutMb": { en: "about 30 MB", bg: "около 30 MB", pt: "cerca de 30 MB", es: "unos 30 MB" },
  "settings.usedByOthers": { en: "used by every other language", bg: "използва се от всички други езици", pt: "usado por todos os outros idiomas", es: "usado por todos los demás idiomas" },
  "settings.previewNote": {
    en: "Browser preview — packs only exist on a phone.",
    bg: "Преглед в браузър — пакетите съществуват само на телефон.",
    pt: "Pré-visualização — os pacotes só existem num telemóvel.",
    es: "Vista previa — los paquetes solo existen en un teléfono.",
  },

  // --- Capability lines -----------------------------------------------------
  "cap.typingAlways": {
    en: "Typing and translation: always offline",
    bg: "Писане и превод: винаги офлайн",
    pt: "Escrita e tradução: sempre offline",
    es: "Escritura y traducción: siempre sin conexión",
  },
  "cap.speechOffline": { en: "Speaking works offline", bg: "Говоренето работи офлайн", pt: "Falar funciona offline", es: "Hablar funciona sin conexión" },
  "cap.speechNeedsPack": { en: "Speaking needs the offline pack", bg: "Говоренето изисква офлайн пакета", pt: "Falar precisa do pacote offline", es: "Hablar necesita el paquete sin conexión" },
  "cap.speechOnline": { en: "Speaking needs internet on this phone", bg: "Говоренето изисква интернет на този телефон", pt: "Falar precisa de internet neste telemóvel", es: "Hablar necesita internet en este teléfono" },
  "cap.speechUnknown": { en: "Speaking: not reported by this device", bg: "Говорене: устройството не съобщава", pt: "Falar: não reportado por este dispositivo", es: "Hablar: no informado por este dispositivo" },
  "cap.voiceYes": { en: "Reading aloud works", bg: "Четенето на глас работи", pt: "A leitura em voz alta funciona", es: "La lectura en voz alta funciona" },
  "cap.voiceNo": { en: "No voice installed for reading aloud", bg: "Няма инсталиран глас за четене", pt: "Sem voz instalada para leitura", es: "Sin voz instalada para la lectura" },

  // --- First-run banner -----------------------------------------------------
  "banner.packsTitle": {
    en: "Download the language packs before you travel.",
    bg: "Изтеглете езиковите пакети преди пътуване.",
    pt: "Descarregue os pacotes de idioma antes de viajar.",
    es: "Descargue los paquetes de idioma antes de viajar.",
  },
  "banner.packsBody": {
    en: " {list} not on this phone yet. Downloading needs Wi-Fi once — after that the app never touches the internet again.",
    bg: " {list} още не са на този телефон. Изтеглянето изисква Wi-Fi веднъж — след това приложението не използва интернет.",
    pt: " {list} ainda não estão neste telemóvel. Descarregar precisa de Wi-Fi uma vez — depois a aplicação não usa mais a internet.",
    es: " {list} aún no están en este teléfono. Descargar necesita Wi-Fi una vez — después la aplicación no usa más internet.",
  },
  "banner.downloadNow": { en: "Download now", bg: "Изтегли сега", pt: "Descarregar agora", es: "Descargar ahora" },
  "banner.later": { en: "Later", bg: "По-късно", pt: "Mais tarde", es: "Más tarde" },
  "banner.packsMissing": { en: "Packs missing", bg: "Липсват пакети", pt: "Faltam pacotes", es: "Faltan paquetes" },
  "banner.iosInstall": {
    en: "Add this to your Home Screen. Tap Share, then Add to Home Screen.",
    bg: "Добавете това към началния екран. Докоснете Сподели, после Добави към началния екран.",
    pt: "Adicione ao Ecrã principal. Toque em Partilhar e depois Adicionar ao Ecrã principal.",
    es: "Añádalo a la pantalla de inicio. Toque Compartir y luego Añadir a pantalla de inicio.",
  },


  // --- Speech and voice notes (these embed a language name) -----------------
  "speech.offlineOk": {
    en: "{lang} speech works offline on this phone.",
    bg: "Говоренето на {lang} работи офлайн на този телефон.",
    pt: "Falar {lang} funciona offline neste telemóvel.",
    es: "Hablar {lang} funciona sin conexión en este teléfono.",
  },
  "speech.needsPack": {
    en: "Speaking {lang} works, but uses the internet on this phone. To make it work with no signal too, install the offline pack: the Google app → Settings → Voice → Offline speech recognition → {lang}. Typing is always offline.",
    bg: "Говоренето на {lang} работи, но използва интернет на този телефон. За да работи и без сигнал, инсталирайте офлайн пакета: приложението Google → Настройки → Глас → Офлайн разпознаване → {lang}. Писането винаги е офлайн.",
    pt: "Falar {lang} funciona, mas usa a internet neste telemóvel. Para funcionar sem rede, instale o pacote offline: aplicação Google → Definições → Voz → Reconhecimento offline → {lang}. Escrever é sempre offline.",
    es: "Hablar {lang} funciona, pero usa internet en este teléfono. Para que funcione sin cobertura, instale el paquete sin conexión: aplicación Google → Ajustes → Voz → Reconocimiento sin conexión → {lang}. Escribir siempre es sin conexión.",
  },
  "speech.needsInternet": {
    en: "This phone has no built-in recogniser for spoken {lang}, so speaking it needs an internet connection. Type the message instead — typing is always offline and always accurate.",
    bg: "Този телефон няма вграден разпознавател за говорим {lang}, затова говоренето изисква интернет. Напишете съобщението — писането е винаги офлайн и винаги точно.",
    pt: "Este telemóvel não tem reconhecimento para {lang} falado, por isso falar precisa de internet. Escreva a mensagem — escrever é sempre offline e sempre exato.",
    es: "Este teléfono no tiene reconocimiento para {lang} hablado, así que hablar necesita internet. Escriba el mensaje — escribir es siempre sin conexión y siempre exacto.",
  },
  "voice.none": {
    en: "No {lang} voice is installed on this phone, so it cannot read the translation aloud — the written translation is unaffected. To add one: Settings → Additional settings → Languages & input → Text-to-speech output → the gear beside your engine → Install voice data → {lang}.",
    bg: "Няма инсталиран глас за {lang} на този телефон, затова не може да чете превода на глас — писменият превод не е засегнат. За да добавите: Настройки → Допълнителни настройки → Езици и въвеждане → Синтез на реч → зъбното колело → Инсталирай гласови данни → {lang}.",
    pt: "Não há voz de {lang} instalada neste telemóvel, por isso não pode ler a tradução em voz alta — a tradução escrita não é afetada. Para adicionar: Definições → Definições adicionais → Idiomas e introdução → Conversão de texto em voz → a engrenagem → Instalar dados de voz → {lang}.",
    es: "No hay voz de {lang} instalada en este teléfono, así que no puede leer la traducción en voz alta — la traducción escrita no se ve afectada. Para añadirla: Ajustes → Ajustes adicionales → Idiomas e introducción → Salida de texto a voz → el engranaje → Instalar datos de voz → {lang}.",
  },
  "models.offline": {
    en: "There is no connection. Language packs are the one thing this app needs the internet for — download them before you travel.",
    bg: "Няма връзка. Езиковите пакети са единственото, за което приложението се нуждае от интернет — изтеглете ги преди пътуване.",
    pt: "Não há ligação. Os pacotes de idioma são a única coisa para que esta aplicação precisa de internet — descarregue-os antes de viajar.",
    es: "No hay conexión. Los paquetes de idioma son lo único para lo que esta aplicación necesita internet — descárguelos antes de viajar.",
  },
  "models.pivotRequired": {
    en: "English cannot be removed. Every translation passes through English internally, so deleting it would break all four languages.",
    bg: "Английският не може да бъде премахнат. Всеки превод минава през английски вътрешно, така че изтриването му би счупило и четирите езика.",
    pt: "O inglês não pode ser removido. Cada tradução passa internamente pelo inglês, por isso removê-lo quebraria os quatro idiomas.",
    es: "El inglés no se puede quitar. Cada traducción pasa internamente por el inglés, así que quitarlo rompería los cuatro idiomas.",
  },
  "models.ready": { en: "{lang} is now available offline.", bg: "{lang} вече е достъпен офлайн.", pt: "{lang} está agora disponível offline.", es: "{lang} ya está disponible sin conexión." },
  "models.removed": { en: "{lang} pack removed.", bg: "Пакетът {lang} е премахнат.", pt: "Pacote {lang} removido.", es: "Paquete {lang} quitado." },
  "models.downloading": { en: "Downloading {lang}…", bg: "Изтегляне на {lang}…", pt: "A descarregar {lang}…", es: "Descargando {lang}…" },
  "models.allReady": { en: "All language packs are ready.", bg: "Всички езикови пакети са готови.", pt: "Todos os pacotes estão prontos.", es: "Todos los paquetes están listos." },
  "models.someFailed": { en: "Some packs did not download.", bg: "Някои пакети не се изтеглиха.", pt: "Alguns pacotes não foram descarregados.", es: "Algunos paquetes no se descargaron." },
  "models.confirmRemove": {
    en: "Remove the {lang} pack? Translation into {lang} will stop working until you download it again.",
    bg: "Да се премахне ли пакетът {lang}? Преводът към {lang} ще спре да работи, докато не го изтеглите отново.",
    pt: "Remover o pacote {lang}? A tradução para {lang} deixará de funcionar até o descarregar de novo.",
    es: "¿Quitar el paquete {lang}? La traducción a {lang} dejará de funcionar hasta que lo descargue otra vez.",
  },
  "models.notWifi": {
    en: "You are not on Wi-Fi. Each pack is around 30 MB. Download over mobile data anyway?",
    bg: "Не сте на Wi-Fi. Всеки пакет е около 30 MB. Да се изтегли ли през мобилни данни?",
    pt: "Não está em Wi-Fi. Cada pacote tem cerca de 30 MB. Descarregar por dados móveis mesmo assim?",
    es: "No está en Wi-Fi. Cada paquete son unos 30 MB. ¿Descargar con datos móviles igualmente?",
  },

  // --- Errors ---------------------------------------------------------------
  "err.noSpeech": {
    en: "Nothing was heard. Try again, closer to the microphone, or type it instead.",
    bg: "Нищо не беше чуто. Опитайте отново, по-близо до микрофона, или напишете.",
    pt: "Nada foi ouvido. Tente de novo, mais perto do microfone, ou escreva.",
    es: "No se oyó nada. Inténtelo de nuevo, más cerca del micrófono, o escríbalo.",
  },
  "err.micDenied": {
    en: "Microphone access was refused. Allow it in your phone's settings, or type instead.",
    bg: "Достъпът до микрофона е отказан. Разрешете го в настройките или пишете.",
    pt: "O acesso ao microfone foi recusado. Permita-o nas definições, ou escreva.",
    es: "Se denegó el acceso al micrófono. Permítalo en los ajustes, o escriba.",
  },
  "err.noRecogniser": {
    en: "This phone has no speech recogniser available. Type the message instead.",
    bg: "Този телефон няма наличен разпознавател на реч. Напишете съобщението.",
    pt: "Este telemóvel não tem reconhecimento de voz. Escreva a mensagem.",
    es: "Este teléfono no tiene reconocimiento de voz. Escriba el mensaje.",
  },
  "err.online": {
    en: "Could not reach the online translator. Check your connection, or turn the internet option off in Settings.",
    bg: "Онлайн преводачът е недостъпен. Проверете връзката или изключете интернет опцията в Настройки.",
    pt: "Não foi possível contactar o tradutor online. Verifique a ligação, ou desligue a opção de internet nas Definições.",
    es: "No se pudo contactar con el traductor en línea. Compruebe la conexión, o desactive la opción de internet en Ajustes.",
  },
  "err.quota": {
    en: "The free daily online allowance is used up. It resets tomorrow.",
    bg: "Безплатният дневен лимит е изчерпан. Възстановява се утре.",
    pt: "O limite diário gratuito acabou. Repõe-se amanhã.",
    es: "El límite diario gratuito se ha agotado. Se restablece mañana.",
  },
  "err.noEngineWeb": {
    en: "This web version has no translation engine of its own on a phone. Turn on “Use the internet” in Settings, or install the Android app. The built-in phrases still work.",
    bg: "Тази уеб версия няма собствен преводач на телефон. Включете „Използвай интернет“ в Настройки или инсталирайте Android приложението. Вградените фрази работят.",
    pt: "Esta versão web não tem tradutor próprio num telemóvel. Ative “Usar a internet” nas Definições, ou instale a aplicação Android. As frases incorporadas funcionam.",
    es: "Esta versión web no tiene traductor propio en un teléfono. Active «Usar internet» en Ajustes, o instale la aplicación Android. Las frases integradas funcionan.",
  },
  "err.startFailed": {
    en: "The app failed to start: {message}",
    bg: "Приложението не успя да стартира: {message}",
    pt: "A aplicação não conseguiu iniciar: {message}",
    es: "La aplicación no pudo iniciarse: {message}",
  },
};

// ---------------------------------------------------------------------------

let current = "en";

/** The language the interface is currently in. */
export function uiLanguage() {
  return current;
}

export function setUiLanguage(code) {
  current = STRINGS["app.name"] && UI_LANGUAGES.some((l) => l.code === code) ? code : "en";
  if (typeof document !== "undefined") document.documentElement.lang = current;
  return current;
}

/**
 * The phone's own language, if it is one of the four.
 *
 * A Bulgarian traveller who installs this should not have to find the language
 * picker before they can read anything — so the first run guesses from the
 * device, and the picker is there to correct it.
 */
export function deviceLanguage() {
  if (typeof navigator === "undefined") return "en";
  const candidates = [navigator.language, ...(navigator.languages || [])];
  for (const tag of candidates) {
    const base = String(tag || "").toLowerCase().split("-")[0];
    if (UI_LANGUAGES.some((l) => l.code === base)) return base;
  }
  return "en";
}

/**
 * Look up a string. Falls back to English, then to the key itself.
 *
 * Returning the key rather than an empty string is deliberate: a missing
 * translation should look obviously wrong in testing, not silently blank.
 */
export function t(key, params) {
  const entry = STRINGS[key];
  if (!entry) return key;
  let text = entry[current] ?? entry.en ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}

/**
 * Apply translations to the page.
 *
 * Elements opt in with `data-i18n` (text), `data-i18n-placeholder`,
 * `data-i18n-title` or `data-i18n-aria`. Keeping the keys in the markup means
 * the HTML stays readable and there is no giant list of element ids to
 * maintain in parallel.
 */
export function applyTranslations(root = document) {
  root.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  root.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  root.querySelectorAll("[data-i18n-title]").forEach((el) => {
    el.title = t(el.dataset.i18nTitle);
  });
  root.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
}
