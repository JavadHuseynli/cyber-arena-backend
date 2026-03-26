const express = require('express');
const pool = require('../db/connection');
const authMiddleware = require('../middleware/auth');
const { calculateComboScore, calculateAccuracy, updateUserXP } = require('../services/xpCalculator');

const router = express.Router();

const cyberCards = {
  // Azerbaijan
  1: { name:"PacketMon", rarity:"Common", power:40, type:"Network", color:"#00f5ff", description:"Şəbəkə paketlərinin ilk müdafiəçisi" },
  2: { name:"LayerGuard", rarity:"Common", power:44, type:"Network", color:"#00d4ff", description:"OSI qatlarını qoruyan keşikçi" },
  3: { name:"MACHunter", rarity:"Common", power:46, type:"Network", color:"#00b8ff", description:"MAC ünvanlarını izləyən ovçu" },
  4: { name:"CmdMaster", rarity:"Uncommon", power:50, type:"Network", color:"#0099ff", description:"Komanda xəttinin ustası" },
  5: { name:"NetArchon", rarity:"Uncommon", power:55, type:"Network", color:"#0077ff", description:"Şəbəkə arxitekturasının hökmdarı" },
  // Turkey
  6: { name:"IPDragon", rarity:"Common", power:42, type:"Routing", color:"#39ff14", description:"IP ünvanlar arasında uçan ejdəha" },
  7: { name:"SwitchBlade", rarity:"Common", power:45, type:"Routing", color:"#33ee11", description:"Paketləri kəskinliklə yönləndirən" },
  8: { name:"NATWalker", rarity:"Uncommon", power:52, type:"Routing", color:"#2ddd0e", description:"NAT sərhədlərini keçən səyyah" },
  9: { name:"SubnetSlicer", rarity:"Uncommon", power:56, type:"Routing", color:"#28cc0b", description:"Şəbəkəni parçalayan usta" },
  10:{ name:"BroadcastKing", rarity:"Rare", power:60, type:"Routing", color:"#22bb08", description:"Broadcast domaininin kralı" },
  // Germany
  11:{ name:"TCPKnight", rarity:"Uncommon", power:55, type:"Transport", color:"#ffd700", description:"Etibarlı əlaqəni qoruyan cəngavər" },
  12:{ name:"HandshakeX", rarity:"Uncommon", power:58, type:"Transport", color:"#eec600", description:"SYN-ACK ritual ustası" },
  13:{ name:"PortGuard", rarity:"Rare", power:62, type:"Transport", color:"#ddb700", description:"Port nömrələrinin keşikçisi" },
  14:{ name:"FlowMaster", rarity:"Rare", power:65, type:"Transport", color:"#cca800", description:"Axın kontrolunun ustası" },
  15:{ name:"TransportLord", rarity:"Rare", power:68, type:"Transport", color:"#bb9900", description:"Nəqliyyat qatının lordu" },
  // UK
  16:{ name:"ARPHunter", rarity:"Rare", power:65, type:"Recon", color:"#ff6b35", description:"MAC ünvanları ovlayan şikari" },
  17:{ name:"CAMKeeper", rarity:"Rare", power:67, type:"Recon", color:"#ee5a2a", description:"CAM cədvəlinin mühafizəçisi" },
  18:{ name:"ARPSpirit", rarity:"Epic", power:72, type:"Recon", color:"#dd4920", description:"ARP sorğularının ruhu" },
  19:{ name:"CacheWraith", rarity:"Epic", power:75, type:"Recon", color:"#cc3815", description:"ARP keşində gizlənən kölgə" },
  20:{ name:"SpoofWraith", rarity:"Epic", power:78, type:"Recon", color:"#bb270a", description:"İlk spoofing hücumunun yaradıcısı" },
  // USA
  21:{ name:"RouterGhost", rarity:"Rare", power:70, type:"Routing", color:"#9b59b6", description:"Marşrutlar arasında gizlənən kölgə" },
  22:{ name:"RouteForge", rarity:"Epic", power:74, type:"Routing", color:"#8e44ad", description:"Marşrutları döyən ustakar" },
  23:{ name:"OSPFOracle", rarity:"Epic", power:77, type:"Routing", color:"#7d3c98", description:"OSPF yollarını görən kahin" },
  24:{ name:"TraceHawk", rarity:"Epic", power:80, type:"Routing", color:"#6c3483", description:"Paket izlərini görən şahin" },
  25:{ name:"SubnetMage", rarity:"Legendary", power:85, type:"Routing", color:"#5b2c6f", description:"Subnet sehrbazı" },
  // China
  26:{ name:"DHCPWizard", rarity:"Epic", power:78, type:"Protocol", color:"#e74c3c", description:"IP ünvanları büyüləyən sehrbaz" },
  27:{ name:"LeaseKeeper", rarity:"Epic", power:80, type:"Protocol", color:"#d63031", description:"Lease vaxtının mühafizəçisi" },
  28:{ name:"RelayRunner", rarity:"Epic", power:82, type:"Protocol", color:"#c0392b", description:"DHCP relay qaçışçısı" },
  29:{ name:"TimeWarden", rarity:"Legendary", power:86, type:"Protocol", color:"#a93226", description:"Vaxt müddətinin hakimi" },
  30:{ name:"ReserveX", rarity:"Legendary", power:88, type:"Protocol", color:"#922b21", description:"IP rezervasiyanın kilidi" },
  // Russia
  31:{ name:"StarvationX", rarity:"Epic", power:82, type:"Attack", color:"#ff0080", description:"DHCP hovuzunu tükəndirən yırtıcı" },
  32:{ name:"PoolDrain", rarity:"Epic", power:84, type:"Attack", color:"#e60073", description:"IP hovuzunu boşaldan" },
  33:{ name:"ToolSmith", rarity:"Legendary", power:87, type:"Attack", color:"#cc0066", description:"Hücum alətlərinin ustası" },
  34:{ name:"SnoopShield", rarity:"Legendary", power:89, type:"Attack", color:"#b30059", description:"Snooping müdafiə qalxanı" },
  35:{ name:"PortFortress", rarity:"Legendary", power:92, type:"Attack", color:"#990050", description:"Port təhlükəsizliyinin qalası" },
  // South Korea
  36:{ name:"SpoofPhantom", rarity:"Legendary", power:88, type:"Exploit", color:"#ff4500", description:"ARP cədvəllərini aldadan xəyal" },
  37:{ name:"MITMReaper", rarity:"Legendary", power:90, type:"Exploit", color:"#e63e00", description:"MITM hücumunun qara biçinçisi" },
  38:{ name:"WireShark", rarity:"Legendary", power:92, type:"Exploit", color:"#cc3700", description:"Paket axınının köpəkbalığı" },
  39:{ name:"DAIGuardian", rarity:"Legendary", power:95, type:"Exploit", color:"#b33000", description:"DAI müdafiəsinin mələyi" },
  40:{ name:"ARPFortress", rarity:"Legendary", power:98, type:"Exploit", color:"#992900", description:"ARP müdafiəsinin son qalası" },
  // Japan
  41:{ name:"SubnetLord", rarity:"Legendary", power:90, type:"Master", color:"#ffd700", description:"Bütün şəbəkəyə hökmranlıq edən" },
  42:{ name:"VLSMSage", rarity:"Legendary", power:93, type:"Master", color:"#eec600", description:"VLSM hesablamasının müdriki" },
  43:{ name:"ProxyMaster", rarity:"Legendary", power:95, type:"Master", color:"#ddb700", description:"Proxy ARP sənətinin ustası" },
  44:{ name:"VLANNinja", rarity:"Legendary", power:97, type:"Master", color:"#cca800", description:"VLAN seqmentlərinin ninjası" },
  45:{ name:"OverflowGod", rarity:"Legendary", power:100, type:"Master", color:"#bb9900", description:"CAM overflow — son boss" },

  // ═══ REVERSE ENGINEERING CARDS (DB chapter IDs: 46-54) ═══
  // RE Chapter 1 — Binary Systems
  46:{ name:"BitFlip", rarity:"Common", power:40, type:"Binary", color:"#00ff88", description:"Bitləri çevirən ilk addım" },
  // RE Chapter 2 — x86 Assembly
  47:{ name:"AsmCoder", rarity:"Common", power:44, type:"Assembly", color:"#ff3366", description:"Assembly kodunun yazarı" },
  // RE Chapter 3 — Registers & Memory
  48:{ name:"RegMaster", rarity:"Uncommon", power:52, type:"Memory", color:"#9933ff", description:"Registrlərin ustası" },
  // RE Chapter 4 — Stack & Calling
  49:{ name:"StackDiver", rarity:"Uncommon", power:58, type:"Stack", color:"#ff9900", description:"Stekin dərinliklərinə dalğıc" },
  // RE Chapter 5 — PE & ELF
  50:{ name:"PEParser", rarity:"Rare", power:65, type:"Format", color:"#33ccff", description:"PE formatının açarı" },
  // RE Chapter 6 — Static Analysis
  51:{ name:"GhidraGhost", rarity:"Rare", power:70, type:"Analysis", color:"#ff0066", description:"Ghidra-nın kölgəsi" },
  // RE Chapter 7 — Dynamic Analysis
  52:{ name:"DebugDemon", rarity:"Epic", power:78, type:"Debug", color:"#ffcc00", description:"Debugger-in iblisi" },
  // RE Chapter 8 — Anti-RE
  53:{ name:"PackerWraith", rarity:"Epic", power:85, type:"Evasion", color:"#cc00ff", description:"Packing-in kölgəsi" },
  // RE Chapter 9 — Malware Analysis
  54:{ name:"MalwareHunter", rarity:"Legendary", power:100, type:"Malware", color:"#ff0000", description:"Zərərli proqramların ovçusu — son boss" },
};

// Get questions for a chapter
router.get('/chapters/:chapterId/questions', authMiddleware, async (req, res) => {
  try {
    const chapterId = parseInt(req.params.chapterId);
    const userId = req.user.id;

    // Get user's field
    const [userRows] = await pool.execute('SELECT field FROM users WHERE id = ?', [userId]);
    const userField = userRows.length > 0 ? (userRows[0].field || 'pentest') : 'pentest';

    // Verify this chapter belongs to user's field
    const [chapterCheck] = await pool.execute(
      'SELECT id, field FROM chapters WHERE id = ?', [chapterId]
    );
    if (chapterCheck.length > 0 && chapterCheck[0].field !== userField) {
      return res.status(403).json({ error: 'Bu missiya sizin sahənizə aid deyil.' });
    }

    // Check chapter access
    const [progress] = await pool.execute(
      'SELECT status, attempts FROM user_chapter_progress WHERE user_id = ? AND chapter_id = ?',
      [userId, chapterId]
    );

    if (progress.length === 0 || progress[0].status === 'locked') {
      return res.status(403).json({ error: 'Bu missiya kilidlidir. Əvvəlki missiyanı 80%+ ilə keçməlisiniz.' });
    }
    // Allow access if available, completed, or approved (for retries)
    const allowedStatuses = ['available', 'completed', 'approved'];
    if (!allowedStatuses.includes(progress[0].status)) {
      return res.status(403).json({ error: 'Bu missiyaya giriş mümkün deyil.' });
    }

    if (progress[0].attempts >= 5) {
      return res.status(403).json({ error: 'Maksimum cəhd sayına çatdınız (5). Admin ilə əlaqə saxlayın.' });
    }

    // Verify previous chapter is approved (passed with 80%+)
    const [currentChapter] = await pool.execute('SELECT number, field FROM chapters WHERE id = ?', [chapterId]);
    if (currentChapter.length > 0 && currentChapter[0].number > 1) {
      const prevNumber = currentChapter[0].number - 1;
      const [prevChapter] = await pool.execute('SELECT id FROM chapters WHERE number = ? AND field = ?', [prevNumber, userField]);
      if (prevChapter.length > 0) {
        const [prevProgress] = await pool.execute(
          'SELECT status FROM user_chapter_progress WHERE user_id = ? AND chapter_id = ?',
          [userId, prevChapter[0].id]
        );
        if (prevProgress.length > 0 && prevProgress[0].status !== 'approved') {
          return res.status(403).json({ error: `Əvvəlki missiyanı (Missiya ${prevNumber}) 80%+ ilə keçməlisiniz!` });
        }
      }
    }

    // Shuffle questions — each attempt gets random order, different for each user
    const [questions] = await pool.execute(
      `SELECT id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, points
       FROM questions WHERE chapter_id = ? AND is_active = TRUE
       ORDER BY RAND()`,
      [chapterId]
    );

    if (questions.length === 0) {
      return res.status(404).json({ error: 'No questions available for this chapter. Admin must generate questions first.' });
    }

    res.json({ questions, timeLimit: 720 }); // 12 minutes in seconds
  } catch (err) {
    console.error('Get questions error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit quiz answers
router.post('/chapters/:chapterId/submit', authMiddleware, async (req, res) => {
  try {
    const chapterId = parseInt(req.params.chapterId);
    const userId = req.user.id;
    const { answers, timeTaken } = req.body;

    // Validate chapter access
    const [progress] = await pool.execute(
      'SELECT status, attempts, score FROM user_chapter_progress WHERE user_id = ? AND chapter_id = ?',
      [userId, chapterId]
    );

    if (progress.length === 0 || progress[0].status === 'locked') {
      return res.status(403).json({ error: 'Bu missiya kilidlidir' });
    }

    if (progress[0].attempts >= 5) {
      return res.status(403).json({ error: 'Maksimum cəhd sayına çatdınız (5)' });
    }

    // Fetch correct answers from DB for server-side validation
    const [questions] = await pool.execute(
      'SELECT id, correct_option, points, difficulty, explanation FROM questions WHERE chapter_id = ? AND is_active = TRUE ORDER BY id',
      [chapterId]
    );

    // Validate and score server-side
    const scoredAnswers = [];
    let comboStreak = 0;
    let maxCombo = 0;

    for (const question of questions) {
      const userAnswer = answers.find(a => a.questionId === question.id);
      const selectedOption = userAnswer ? userAnswer.selected : -1;
      const isCorrect = selectedOption === question.correct_option;

      if (isCorrect) {
        comboStreak++;
        maxCombo = Math.max(maxCombo, comboStreak);
      } else {
        comboStreak = 0;
      }

      scoredAnswers.push({
        questionId: question.id,
        selected: selectedOption,
        correct: isCorrect,
        correctOption: question.correct_option,
        points: question.points,
        difficulty: question.difficulty,
        explanation: question.explanation
      });
    }

    const totalScore = calculateComboScore(scoredAnswers);
    const accuracy = calculateAccuracy(scoredAnswers);

    // Keep BEST score across all attempts
    const attempt = progress[0].attempts + 1;
    const previousBest = progress[0].score || 0;
    const finalScore = Math.max(previousBest, totalScore);
    const isNewBest = totalScore > previousBest;
    const wasNotYetApproved = progress[0].status !== 'approved';

    const passThreshold = 80;
    const passed = accuracy >= passThreshold;

    // Update progress — keep best score
    if (passed) {
      // Passed: mark as approved
      await pool.execute(
        `UPDATE user_chapter_progress
         SET status = 'approved', score = ?, accuracy = GREATEST(accuracy, ?), attempts = ?, completed_at = NOW(), approved_at = NOW(), time_taken = ?
         WHERE user_id = ? AND chapter_id = ?`,
        [finalScore, accuracy, attempt, timeTaken || 0, userId, chapterId]
      );
    } else {
      // Not passed: keep available for retry
      await pool.execute(
        `UPDATE user_chapter_progress
         SET status = 'available', score = ?, accuracy = GREATEST(accuracy, ?), attempts = ?, completed_at = NOW(), time_taken = ?
         WHERE user_id = ? AND chapter_id = ?`,
        [finalScore, accuracy, attempt, timeTaken || 0, userId, chapterId]
      );
    }

    // Save quiz session
    await pool.execute(
      `INSERT INTO quiz_sessions (user_id, chapter_id, score, answers, time_taken, combo_max, completed_at)
       VALUES (?, ?, ?, ?, ?, ?, NOW())`,
      [userId, chapterId, totalScore, JSON.stringify(scoredAnswers), timeTaken || 0, maxCombo]
    );

    // XP
    const xpToAdd = wasNotYetApproved && passed ? totalScore : (isNewBest ? Math.max(0, totalScore - previousBest) : 0);
    const xpResult = await updateUserXP(userId, Math.max(0, xpToAdd));

    // Award card ONLY if passed (80%+)
    const card = cyberCards[chapterId];
    let awardedCard = null;

    if (card && passed) {
      const [existingCard] = await pool.execute(
        'SELECT id FROM user_cards WHERE user_id = ? AND chapter_id = ?',
        [userId, chapterId]
      );
      if (existingCard.length === 0) {
        await pool.execute(
          'INSERT INTO user_cards (user_id, chapter_id, card_name, rarity) VALUES (?, ?, ?, ?)',
          [userId, chapterId, card.name, card.rarity]
        );
        awardedCard = card;
      }
    }

    // ═══ AUTO-UNLOCK NEXT MISSION — every time passed, check if next is still locked ═══
    let nextChapterUnlocked = null;
    if (passed) {
      // Get current chapter's field and number
      const [currentChapterRow] = await pool.execute('SELECT id, number, field FROM chapters WHERE id = ?', [chapterId]);
      const currentChapter = currentChapterRow[0];
      if (currentChapter) {
        const [nextChapterRow] = await pool.execute(
          'SELECT id, number FROM chapters WHERE number = ? AND field = ?',
          [currentChapter.number + 1, currentChapter.field]
        );
        if (nextChapterRow.length > 0) {
          const nextChapter = nextChapterRow[0];
          const [nextProgress] = await pool.execute(
            'SELECT id, status FROM user_chapter_progress WHERE user_id = ? AND chapter_id = ?',
            [userId, nextChapter.id]
          );
          if (nextProgress.length > 0 && nextProgress[0].status === 'locked') {
            await pool.execute(
              "UPDATE user_chapter_progress SET status = 'available' WHERE user_id = ? AND chapter_id = ?",
              [userId, nextChapter.id]
            );
            nextChapterUnlocked = nextChapter.number;
          }
        }
      }
    }

    // Log activity
    await pool.execute(
      'INSERT INTO activity_log (user_id, action, page, metadata) VALUES (?, ?, ?, ?)',
      [userId, 'quiz_complete', `/quiz/${chapterId}`, JSON.stringify({ score: totalScore, accuracy, attempt })]
    );

    // Socket events
    const io = req.app.get('io');
    if (io) {
      io.to('admin').emit('quiz:complete', { userId, chapterId, score: totalScore, accuracy });
      io.emit('leaderboard:update');
      if (nextChapterUnlocked) {
        io.to(`user:${userId}`).emit('chapter:approved', {
          userId, chapterId,
          message: `Missiya tamamlandı! Növbəti missiya (${nextChapterUnlocked}) açıldı!`
        });
      }
    }

    res.json({
      score: totalScore,
      finalScore,
      accuracy,
      maxCombo,
      attempt,
      maxAttempts: 5,
      attemptsLeft: 5 - attempt,
      isNewBest,
      xp: xpResult?.xp,
      level: xpResult?.level,
      answers: scoredAnswers,
      card: awardedCard,
      nextChapterUnlocked,
      passed,
      passThreshold,
    });
  } catch (err) {
    console.error('Submit quiz error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get chapter progress for current user (filtered by field)
router.get('/progress', authMiddleware, async (req, res) => {
  try {
    const [userRows] = await pool.execute('SELECT field FROM users WHERE id = ?', [req.user.id]);
    const userField = userRows.length > 0 ? (userRows[0].field || 'pentest') : 'pentest';

    const [progress] = await pool.execute(
      `SELECT ucp.*, c.number, c.title, c.title_az, c.field
       FROM user_chapter_progress ucp
       JOIN chapters c ON c.id = ucp.chapter_id
       WHERE ucp.user_id = ? AND c.field = ?
       ORDER BY c.number`,
      [req.user.id, userField]
    );
    res.json({ progress });
  } catch (err) {
    console.error('Get progress error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get cards data
router.get('/cards-data', (req, res) => {
  res.json({ cards: cyberCards });
});

module.exports = router;
