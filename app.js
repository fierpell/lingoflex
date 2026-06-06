function showToast(message, type) {
  const container = document.getElementById("toast-container");
  const toast = document.createElement("div");
  toast.className = "toast toast-" + type;
  const icons = { success: "✅", error: "❌", info: "💡" };
  toast.innerHTML = '<span class="toast-icon">' + (icons[type] || "💡") + '</span><span class="toast-msg">' + message + '</span>';
  container.appendChild(toast);
  requestAnimationFrame(function() {
    toast.classList.add("toast-visible");
  });
  setTimeout(function() {
    toast.classList.remove("toast-visible");
    toast.classList.add("toast-hiding");
    setTimeout(function() { toast.remove(); }, 400);
  }, 3500);
}
const quizDatabase = [
  {
    question: "Hangi kelime 'cömert' anlamına gelir?",
    options: ["Generous", "Humble", "Reluctant", "Sufficient"],
    correct: 0
  },
  {
    question: "Choose the correct option: She is afraid ____ making mistakes.",
    options: ["on", "of", "to", "at"],
    correct: 1
  },
  {
    question: "Hangi kelime 'kaçınılmaz' anlamına gelir?",
    options: ["Ubiquitous", "Ephemeral", "Inevitable", "Superficial"],
    correct: 2
  },
  {
    question: "Complete the sentence: If I have time, I ____ study English.",
    options: ["would have", "will", "did", "have been"],
    correct: 1
  },
  {
    question: "Hangi kelime 'yüzeysel' anlamına gelir?",
    options: ["Scrutinize", "Benevolent", "Humble", "Superficial"],
    correct: 3
  }
];
const quotes = [
  '"The limits of my language mean the limits of my world." – Ludwig Wittgenstein',
  '"Language is the road map of a culture. It tells you where its people come from and where they are going." – Rita Mae Brown',
  '"One language sets you in a corridor for life. Two languages open every door along the way." – Frank Smith',
  '"Learning another language is not only learning different words for the same things, but learning another way to think about things." – Flora Lewis',
  '"Change your language and you change your thoughts." – Karl Albrecht'
];
let state = {
  xp: 0,
  streak: 0,
  lessonsCompleted: 0,
  lastActivityDate: null,
  completedVocabCount: { easy: 0, medium: 0, hard: 0 },
  level: "A1"
};
function loadState() {
  const savedState = localStorage.getItem("lingoflex_state");
  if (savedState) {
    try {
      state = JSON.parse(savedState);
    } catch (e) {
      console.error("State parse error:", e);
    }
  }
  checkStreak();
  updateUIStats();
}
function saveState() {
  localStorage.setItem("lingoflex_state", JSON.stringify(state));
  updateUIStats();
}
function checkStreak() {
  if (!state.lastActivityDate) return;
  const today = new Date().toDateString();
  const lastActive = new Date(state.lastActivityDate).toDateString();
  if (today === lastActive) return; 
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toDateString();
  if (lastActive === yesterdayStr) {
  } else {
    state.streak = 0;
  }
}
function completeLesson(xpReward = 15) {
  state.xp += xpReward;
  state.lessonsCompleted += 1;
  const today = new Date();
  const todayStr = today.toDateString();
  const lastActive = state.lastActivityDate ? new Date(state.lastActivityDate).toDateString() : null;
  if (lastActive !== todayStr) {
    state.streak += 1;
    state.lastActivityDate = today.getTime();
  }
  if (state.xp < 150) {
    state.level = "A1 Seviyesi";
  } else if (state.xp < 400) {
    state.level = "A2 Seviyesi";
  } else if (state.xp < 800) {
    state.level = "B1 Seviyesi";
  } else if (state.xp < 1400) {
    state.level = "B2 Seviyesi";
  } else {
    state.level = "C1 Seviyesi";
  }
  saveState();
  playSuccessSound();
}
let audioCtx = null;
function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}
function playClickSound() {
}
function playSuccessSound() {
}
function playFailSound() {
}
function updateUIStats() {
  document.getElementById("header-streak").textContent = `${state.streak} Gün`;
  document.getElementById("header-xp").textContent = `${state.xp} XP`;
  document.getElementById("sidebar-level").textContent = state.level;
  document.getElementById("dashboard-lessons").textContent = state.lessonsCompleted;
  const totalQuizzes = parseInt(localStorage.getItem("lingoflex_quizzes_taken") || 0);
  const totalCorrect = parseInt(localStorage.getItem("lingoflex_quiz_correct") || 0);
  const accuracy = totalQuizzes > 0 ? Math.round((totalCorrect / (totalQuizzes * 5)) * 100) : 0;
  document.getElementById("dashboard-accuracy").textContent = `${accuracy}%`;
  let rank = "Bronz";
  if (state.xp > 1000) rank = "Elmas";
  else if (state.xp > 600) rank = "Platin";
  else if (state.xp > 300) rank = "Altın";
  else if (state.xp > 100) rank = "Gümüş";
  document.getElementById("dashboard-rank").textContent = rank;
  const limitA = 150;
  const limitB = 600;
  const limitC = 1400;
  const pctA = Math.min(100, Math.round((state.xp / limitA) * 100));
  const pctB = state.xp > limitA ? Math.min(100, Math.round(((state.xp - limitA) / (limitB - limitA)) * 100)) : 0;
  const pctC = state.xp > limitB ? Math.min(100, Math.round(((state.xp - limitB) / (limitC - limitB)) * 100)) : 0;
  document.getElementById("progress-pct-a").textContent = `${pctA}%`;
  document.getElementById("progress-fill-a").style.width = `${pctA}%`;
  document.getElementById("progress-pct-b").textContent = `${pctB}%`;
  document.getElementById("progress-fill-b").style.width = `${pctB}%`;
  document.getElementById("progress-pct-c").textContent = `${pctC}%`;
  document.getElementById("progress-fill-c").style.width = `${pctC}%`;
}
function switchTab(tabId) {
  playClickSound();
  document.querySelectorAll(".nav-item").forEach(btn => btn.classList.remove("active"));
  document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("active"));
  const targetBtn = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
  if (targetBtn) targetBtn.classList.add("active");
  const targetPane = document.getElementById(`tab-${tabId}`);
  if (targetPane) targetPane.classList.add("active");
  const titles = {
    dashboard: "Panelim",
    vocabulary: "Kelime Kartları",
    sentence: "Cümle Kurma",
    challenge: "Günlük Sınav"
  };
  document.getElementById("page-title").textContent = titles[tabId] || "LingoFlex";
  if (tabId === "vocabulary") {
    loadVocabCard();
  } else if (tabId === "sentence") {
    loadSentencePuzzle();
  } else if (tabId === "challenge") {
    resetQuizUI();
  }
}
document.querySelectorAll(".nav-item").forEach(item => {
  item.addEventListener("click", () => {
    switchTab(item.getAttribute("data-tab"));
  });
});
let currentVocabLevel = "easy";
let currentVocabIndex = 0;
let isCardFlipped = false;
let currentDeck = [];
function shuffleVocabDeck() {
  const originalDeck = vocabDatabase[currentVocabLevel];
  if (originalDeck && originalDeck.length > 0) {
    currentDeck = [...originalDeck].sort(() => Math.random() - 0.5);
  } else {
    currentDeck = [];
  }
}
function loadVocabCard() {
  if (currentDeck.length === 0) {
    shuffleVocabDeck();
  }
  if (currentVocabIndex >= currentDeck.length) {
    currentVocabIndex = 0;
    triggerConfetti();
    completeLesson(25);
    showToast("Harika! Bu seviyedeki tüm kelimeleri gözden geçirdin. +25 XP kazandın!", "success");
    shuffleVocabDeck();
  }
  const wordData = currentDeck[currentVocabIndex];
  if (!wordData) return;
  document.getElementById("vocab-word-en").textContent = wordData.en;
  document.getElementById("vocab-phonetic").textContent = wordData.phonetic;
  document.getElementById("vocab-word-tr").textContent = wordData.tr;
  document.getElementById("vocab-definition").textContent = wordData.definition;
  document.getElementById("vocab-example").textContent = `"${wordData.example}"`;
  document.getElementById("vocab-example-tr").textContent = `"${wordData.exampleTr}"`;
  const cardInner = document.getElementById("vocab-card").querySelector(".flashcard");
  cardInner.classList.remove("flipped");
  isCardFlipped = false;
  document.getElementById("vocab-progress-text").textContent = `Kart: ${currentVocabIndex + 1}/${currentDeck.length}`;
  const progressPercent = ((currentVocabIndex + 1) / currentDeck.length) * 100;
  document.getElementById("vocab-progress-fill").style.width = `${progressPercent}%`;
}
document.getElementById("vocab-card").addEventListener("click", (e) => {
  if (e.target.closest("#vocab-tts-btn")) return;
  playClickSound();
  const cardInner = document.getElementById("vocab-card").querySelector(".flashcard");
  cardInner.classList.toggle("flipped");
  isCardFlipped = !isCardFlipped;
});
document.getElementById("vocab-tts-btn").addEventListener("click", () => {
  const word = document.getElementById("vocab-word-en").textContent;
  speakEnglish(word);
});
function speakEnglish(text) {
  if (!('speechSynthesis' in window)) {
    showToast("Tarayıcınız seslendirmeyi desteklemiyor.", "error");
    return;
  }
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-US";
  const voices = window.speechSynthesis.getVoices();
  const englishVoice = voices.find(v => v.lang.startsWith("en") && v.name.includes("Google")) || voices.find(v => v.lang.startsWith("en"));
  if (englishVoice) {
    utterance.voice = englishVoice;
  }
  window.speechSynthesis.speak(utterance);
}
if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => {};
}
document.querySelectorAll("[data-vocab-level]").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll("[data-vocab-level]").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentVocabLevel = btn.getAttribute("data-vocab-level");
    currentVocabIndex = 0;
    shuffleVocabDeck();
    loadVocabCard();
  });
});
document.getElementById("vocab-learn-btn").addEventListener("click", () => {
  currentVocabIndex++;
  completeLesson(5); 
  loadVocabCard();
});
document.getElementById("vocab-skip-btn").addEventListener("click", () => {
  if (currentDeck.length > 0) {
    const item = currentDeck.splice(currentVocabIndex, 1)[0];
    currentDeck.push(item);
    playClickSound();
    loadVocabCard();
  }
});
let currentPuzzleIndex = 0;
let assembledWords = [];
function loadSentencePuzzle() {
  if (currentPuzzleIndex >= sentenceDatabase.length) {
    currentPuzzleIndex = 0;
    triggerConfetti();
    completeLesson(30);
    showToast("Muhteşem! Tüm cümle kurma bölümlerini tamamladın. +30 XP kazandın!", "success");
  }
  const data = sentenceDatabase[currentPuzzleIndex];
  document.getElementById("puzzle-turkish-sentence").textContent = data.tr;
  const buildArea = document.getElementById("puzzle-build-area");
  buildArea.innerHTML = `<div class="placeholder-text" id="puzzle-placeholder">Kelimeleri buraya dizin...</div>`;
  const pool = document.getElementById("puzzle-words-pool");
  pool.innerHTML = "";
  assembledWords = [];
  document.getElementById("puzzle-feedback").classList.remove("active");
  const scrambled = [...data.words].sort(() => Math.random() - 0.5);
  scrambled.forEach((word, index) => {
    const chip = document.createElement("button");
    chip.className = "word-chip";
    chip.textContent = word;
    chip.setAttribute("data-word", word);
    chip.setAttribute("data-index", index);
    chip.addEventListener("click", () => {
      handleWordClick(chip);
    });
    pool.appendChild(chip);
  });
}
function handleWordClick(chip) {
  playClickSound();
  const placeholder = document.getElementById("puzzle-placeholder");
  if (placeholder) placeholder.remove();
  const word = chip.getAttribute("data-word");
  if (chip.classList.contains("placed")) {
    const index = assembledWords.indexOf(word);
    if (index > -1) {
      assembledWords.splice(index, 1);
    }
    const placedChips = document.getElementById("puzzle-build-area").querySelectorAll(".word-chip");
    placedChips.forEach(pc => {
      if (pc.textContent === word) pc.remove();
    });
    chip.classList.remove("placed");
    if (assembledWords.length === 0) {
      const buildArea = document.getElementById("puzzle-build-area");
      buildArea.innerHTML = `<div class="placeholder-text" id="puzzle-placeholder">Kelimeleri buraya dizin...</div>`;
    }
  } else {
    assembledWords.push(word);
    chip.classList.add("placed");
    const activeChip = document.createElement("button");
    activeChip.className = "word-chip";
    activeChip.textContent = word;
    activeChip.addEventListener("click", () => {
      handleWordClick(chip); 
    });
    document.getElementById("puzzle-build-area").appendChild(activeChip);
  }
}
document.getElementById("puzzle-reset-btn").addEventListener("click", () => {
  playClickSound();
  loadSentencePuzzle();
});
document.getElementById("puzzle-check-btn").addEventListener("click", () => {
  const data = sentenceDatabase[currentPuzzleIndex];
  const resultStr = assembledWords.join(" ").trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  const targetStr = data.en.trim().toLowerCase().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  const feedback = document.getElementById("puzzle-feedback");
  const fIcon = document.getElementById("puzzle-feedback-icon");
  const fTitle = document.getElementById("puzzle-feedback-title");
  const fDesc = document.getElementById("puzzle-feedback-desc");
  if (resultStr === targetStr) {
    playSuccessSound();
    fIcon.textContent = "🎉";
    fTitle.textContent = "Harika! Doğru Cümle";
    fDesc.textContent = `"${data.en}"`;
    feedback.classList.add("active");
    completeLesson(15);
  } else {
    playFailSound();
    showToast("Hatalı sıralama! Lütfen tekrar deneyin veya sıfırlayın.", "error");
  }
});
document.getElementById("puzzle-next-btn").addEventListener("click", () => {
  currentPuzzleIndex++;
  loadSentencePuzzle();
});
let currentQuestionIndex = 0;
let quizScore = 0;
let currentQuestion = null;
function generateDynamicQuestion() {
  const allWords = [...vocabDatabase.easy, ...vocabDatabase.medium, ...vocabDatabase.hard];
  if (allWords.length < 4) {
    return quizDatabase[Math.floor(Math.random() * quizDatabase.length)];
  }
  const targetIndex = Math.floor(Math.random() * allWords.length);
  const targetWord = allWords[targetIndex];
  const type = Math.random() < 0.5 ? 'tr_to_en' : 'en_to_tr';
  const options = [];
  const correctOptionText = type === 'tr_to_en' ? targetWord.en : targetWord.tr;
  options.push(correctOptionText);
  const wrongIndices = new Set();
  while (wrongIndices.size < 3) {
    const idx = Math.floor(Math.random() * allWords.length);
    if (idx !== targetIndex) {
      const wrongWord = allWords[idx];
      const wrongOptionText = type === 'tr_to_en' ? wrongWord.en : wrongWord.tr;
      if (wrongOptionText !== correctOptionText && !options.includes(wrongOptionText)) {
        options.push(wrongOptionText);
        wrongIndices.add(idx);
      }
    }
  }
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5);
  const correctIndex = shuffledOptions.indexOf(correctOptionText);
  const questionText = type === 'tr_to_en' 
    ? `Hangi kelime '${targetWord.tr}' anlamına gelir?` 
    : `'${targetWord.en}' kelimesinin Türkçe karşılığı nedir?`;
  return {
    question: questionText,
    options: shuffledOptions,
    correct: correctIndex
  };
}
function resetQuizUI() {
  document.getElementById("quiz-intro").classList.remove("hidden");
  document.getElementById("quiz-playground").classList.add("hidden");
}
document.getElementById("quiz-start-btn").addEventListener("click", () => {
  playClickSound();
  currentQuestionIndex = 0;
  quizScore = 0;
  document.getElementById("quiz-intro").classList.add("hidden");
  document.getElementById("quiz-playground").classList.remove("hidden");
  loadQuizQuestion();
});
function loadQuizQuestion() {
  currentQuestion = generateDynamicQuestion();
  document.getElementById("quiz-q-number").textContent = `Soru ${currentQuestionIndex + 1} (Doğru: ${quizScore})`;
  document.getElementById("quiz-progress-fill").style.width = '100%';
  document.getElementById("quiz-question-text").textContent = currentQuestion.question;
  const optionsContainer = document.getElementById("quiz-options-container");
  optionsContainer.innerHTML = "";
  const nextBtn = document.getElementById("quiz-next-q-btn");
  nextBtn.disabled = true;
  nextBtn.textContent = "Sonraki Soru ➡️";
  currentQuestion.options.forEach((option, idx) => {
    const btn = document.createElement("button");
    btn.className = "quiz-option-btn";
    btn.textContent = option;
    btn.addEventListener("click", () => {
      const optionButtons = optionsContainer.querySelectorAll(".quiz-option-btn");
      optionButtons.forEach(b => b.disabled = true);
      const isCorrect = idx === currentQuestion.correct;
      if (isCorrect) {
        btn.classList.add("correct");
        quizScore++;
        playSuccessSound();
      } else {
        btn.classList.add("incorrect");
        optionButtons[currentQuestion.correct].classList.add("correct");
        playFailSound();
      }
      nextBtn.disabled = false;
      document.getElementById("quiz-q-number").textContent = `Soru ${currentQuestionIndex + 1} (Doğru: ${quizScore})`;
    });
    optionsContainer.appendChild(btn);
  });
}
document.getElementById("quiz-next-q-btn").addEventListener("click", () => {
  playClickSound();
  currentQuestionIndex++;
  loadQuizQuestion();
});
document.getElementById("quiz-end-btn").addEventListener("click", () => {
  playClickSound();
  showQuizResults();
});
function showQuizResults() {
  const quizzesTaken = parseInt(localStorage.getItem("lingoflex_quizzes_taken") || 0) + 1;
  const quizCorrect = parseInt(localStorage.getItem("lingoflex_quiz_correct") || 0) + quizScore;
  localStorage.setItem("lingoflex_quizzes_taken", quizzesTaken);
  localStorage.setItem("lingoflex_quiz_correct", quizCorrect);
  const totalQuestions = currentQuestionIndex + 1;
  const xpReward = quizScore * 5;
  if (xpReward > 0) {
    showToast(`Sınav Tamamlandı! Toplam ${totalQuestions} sorudan ${quizScore} tanesini doğru cevapladınız. (+${xpReward} XP)`, "success");
    completeLesson(xpReward);
    triggerConfetti();
  } else {
    showToast(`Sınav Tamamlandı! Toplam ${totalQuestions} sorudan hiç doğru cevap veremediniz.`, "info");
  }
  resetQuizUI();
}
const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");
let confettiActive = false;
let confettiPieces = [];
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resizeCanvas);
resizeCanvas();
class ConfettiPiece {
  constructor() {
    this.x = Math.random() * canvas.width;
    this.y = Math.random() * -canvas.height - 20;
    this.size = Math.random() * 8 + 6;
    this.color = `hsl(${Math.random() * 360}, 90%, 60%)`;
    this.speed = Math.random() * 4 + 3;
    this.rotation = Math.random() * 360;
    this.rotationSpeed = Math.random() * 4 - 2;
  }
  update() {
    this.y += this.speed;
    this.rotation += this.rotationSpeed;
    if (this.y > canvas.height) {
      this.y = -20;
      this.x = Math.random() * canvas.width;
    }
  }
  draw() {
    ctx.save();
    ctx.translate(this.x + this.size / 2, this.y + this.size / 2);
    ctx.rotate((this.rotation * Math.PI) / 180);
    ctx.fillStyle = this.color;
    ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
    ctx.restore();
  }
}
function triggerConfetti() {
  if (confettiActive) return;
  confettiActive = true;
  confettiPieces = [];
  for (let i = 0; i < 120; i++) {
    confettiPieces.push(new ConfettiPiece());
  }
  setTimeout(() => {
    confettiActive = false;
  }, 4000); 
  requestAnimationFrame(renderConfetti);
}
function renderConfetti() {
  if (!confettiActive && confettiPieces.length === 0) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    return;
  }
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  confettiPieces.forEach((p, idx) => {
    p.update();
    p.draw();
    if (!confettiActive && p.y > canvas.height) {
      confettiPieces.splice(idx, 1);
    }
  });
  requestAnimationFrame(renderConfetti);
}
window.addEventListener("DOMContentLoaded", () => {
  loadState();
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  document.getElementById("daily-quote").textContent = randomQuote;
  injectSvgGradients();
});
function injectSvgGradients() {
  const svgNS = "http://www.w3.org/2000/svg";
  const defs = document.createElementNS(svgNS, "defs");
  const linearGradient = document.createElementNS(svgNS, "linearGradient");
  linearGradient.setAttribute("id", "ring-gradient");
  linearGradient.setAttribute("x1", "0%");
  linearGradient.setAttribute("y1", "0%");
  linearGradient.setAttribute("x2", "100%");
  linearGradient.setAttribute("y2", "100%");
  const stop1 = document.createElementNS(svgNS, "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "hsl(262, 83%, 62%)");
  const stop2 = document.createElementNS(svgNS, "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "hsl(190, 90%, 50%)");
  linearGradient.appendChild(stop1);
  linearGradient.appendChild(stop2);
  defs.appendChild(linearGradient);
  const scoreRingSvg = document.querySelector(".score-ring");
  if (scoreRingSvg) {
    scoreRingSvg.insertBefore(defs, scoreRingSvg.firstChild);
  }
}
