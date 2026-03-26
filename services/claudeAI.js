const pool = require('../db/connection');

// Pentest chapter contexts (45 chapters, keyed by chapter number)
const pentestChapterContexts = {
  // ── Bölmə 1: Şəbəkə Arxitekturası (Chapters 1-5) ──
  1: `Şəbəkə arxitekturası: node konsepsiyası (kompüter, printer, server, telefon), şəbəkə növləri, şəbəkə protokolları (HTTP, FTP, DNS, SMTP), protokolların vəzifələri, əsas terminologiya`,
  2: `OSI modeli: 7 qat (Physical, Data Link, Network, Transport, Session, Presentation, Application), hər qatın funksiyası, TCP/IP modeli ilə müqayisə, PDU adları (bit, frame, packet, segment, data)`,
  3: `MAC ünvanı: 6 bayt (48 bit), hex formatı, OUI (ilk 3 bayt), NIC (Network Interface Card), unicast/multicast/broadcast MAC, MAC spoofing, FF:FF:FF:FF:FF:FF broadcast`,
  4: `Şəbəkə əmrləri: ping (ICMP echo), tracert/traceroute (TTL-based), ipconfig /all (Windows), ifconfig (Linux), arp -a (ARP cache), nslookup (DNS query), netstat`,
  5: `Peer-to-peer vs Client-Server: P2P-də hər node həm client həm server, mərkəzi server yoxdur. Client-Server-də dedicated server, tək nöqtə failure riski, scalability fərqləri`,
  // ── Bölmə 2: IP Ünvanlama (Chapters 6-10) ──
  6: `IPv4 strukturu: 4 oktet, 32-bit, dotted decimal notation (192.168.1.1), Class A/B/C/D/E, şəbəkə hissəsi vs host hissəsi, subnet mask əsasları`,
  7: `Paket switching: store-and-forward, inkapsulyasiya prosesi (Application→Transport→Network→DataLink→Physical), deinkapsulyasiya (əks istiqamət), header əlavə olunması`,
  8: `NAT (Network Address Translation): private vs public IP, static NAT, dynamic NAT, PAT (Port Address Translation), NAT table, IP header sahələri: version, TTL, source/destination IP, protocol`,
  9: `Subnetting əsasları: subnet mask, /24=/16=/8 notation, şəbəkə ünvanı, host ünvanı, default gateway, subnet hesablama üsulları`,
  10: `Broadcast ünvanı: şəbəkədəki bütün cihazlara göndərmə, network ünvanı: şəbəkəni müəyyən edən ilk ünvan, host sayı hesablama (2^n - 2), directed broadcast vs limited broadcast`,
  // ── Bölmə 3: Nəqliyyat Protokolları (Chapters 11-15) ──
  11: `UDP protokolu: connectionless, unreliable, fast, datagram, 8-byte header (source port, dest port, length, checksum), real-time tətbiqlər (VoIP, streaming, DNS, TFTP)`,
  12: `TCP protokolu: connection-oriented, reliable, three-way handshake (SYN→SYN-ACK→ACK), four-way termination (FIN→ACK→FIN→ACK), sequence numbers, acknowledgment numbers`,
  13: `Port nömrələri: well-known (0-1023): HTTP:80, HTTPS:443, SSH:22, FTP:21, SMTP:25, DNS:53, DHCP:67/68. Registered (1024-49151), dynamic/ephemeral (49152-65535). Socket = IP + Port`,
  14: `Flow control: sliding window, TCP window size, congestion control (slow start, congestion avoidance), Nagle's algorithm, TCP keepalive`,
  15: `UDP vs TCP müqayisə: reliability, speed, overhead, use cases. UDP: DNS, DHCP, streaming. TCP: HTTP, FTP, SSH, SMTP. Header size fərqi, connection state`,
  // ── Bölmə 4: Şəbəkə Avadanlıqları (Chapters 16-20) ──
  16: `Hub vs Switch: Hub — Layer 1, broadcast domain yaradır, collision domain. Switch — Layer 2, MAC öyrənir, unicast forwarding, port-based communication`,
  17: `Switch CAM (Content Addressable Memory) table: MAC ünvanı öyrənmə prosesi, aging timer, MAC flooding attack, CAM table overflow, unknown unicast flooding`,
  18: `ARP (Address Resolution Protocol): IP→MAC çevrilmə, ARP request (broadcast), ARP reply (unicast), ARP table, Layer 2 və Layer 3 arasında körpü`,
  19: `ARP cache: arp -a əmri, statik vs dinamik ARP entries, cache timeout, gratuitous ARP (öz IP üçün broadcast), ARP announcement, ARP probe`,
  20: `ARP Spoofing hücumuna giriş: saxta ARP reply göndərmə, ARP cache zəhərlənməsi, man-in-the-middle potensialı, şəbəkə dinləmə riski`,
  // ── Bölmə 5: Marşrutlaşdırma (Chapters 21-25) ──
  21: `Router əsasları: Layer 3 cihaz, routing table, default gateway, subnet-lər arası paket yönləndirmə, hop-by-hop routing, administrative distance`,
  22: `Statik routing: manual konfiqurasiya, ip route əmri. Dinamik routing: routing protokolları, avtomatik yol tapma, konvergensiya. Müqayisə: scalability, overhead`,
  23: `OSPF: link-state protocol, area design, SPF algorithm, hello packets, LSA. RIP: distance-vector, hop count (max 15), split horizon, route poisoning`,
  24: `ICMP: error reporting, ping (echo request/reply), traceroute (TTL exceeded), destination unreachable. TTL: time-to-live, hop limit, routing loop prevention`,
  25: `CIDR (Classless Inter-Domain Routing): /24=255.255.255.0 (254 host), /25=128 (126 host), /26=192 (62 host), subnet calculation, supernetting, route aggregation`,
  // ── Bölmə 6: DHCP (Chapters 26-30) ──
  26: `DHCP DORA prosesi: Discover (broadcast, 0.0.0.0→255.255.255.255), Offer (server cavabı, təklif olunan IP), UDP port 67 (server), port 68 (client)`,
  27: `DHCP Request və Acknowledge: Request (client seçim edir, broadcast), Acknowledge (server təsdiq edir), DHCP NAK, configuration parameters`,
  28: `DHCP seçimləri: Option 1 (subnet mask), Option 3 (router/gateway), Option 6 (DNS server), Option 51 (lease time). DHCP Relay Agent: inter-VLAN DHCP, ip helper-address`,
  29: `Lease time: müddətli IP icarəsi, T1 renewal (50%), T2 rebinding (87.5%), lease expiration, DHCP release, infinite lease risks`,
  30: `DHCP reservation: MAC ünvanına görə sabit IP, DHCP scope, exclusion range, IP pool, address conflict detection`,
  // ── Bölmə 7: DHCP Təhlükəsizliyi (Chapters 31-35) ──
  31: `DHCP Spoofing: rogue DHCP server, attacker-ın saxta DHCP server qurması, yanlış gateway/DNS vermə, man-in-the-middle, traffic redirection`,
  32: `DHCP Starvation: IP hovuzunu tükəndirmə, saxta MAC ünvanları ilə bütün IP-ləri icarəyə alma, legitimate client-ləri bloklamaq, DoS hücumu`,
  33: `Hücum alətləri: Ettercap (MITM framework), Yersinia (Layer 2 attack tool), DHCP starvation script, Wireshark ilə DORA paketlərinin analizi`,
  34: `DHCP Snooping: switch-based defense, trusted vs untrusted ports, DHCP snooping binding table, rate limiting, rogue server detection`,
  35: `Port Security: MAC ünvanı limitləmə, sticky MAC, violation modes (shutdown, restrict, protect), maximum MAC sayı, aging`,
  // ── Bölmə 8: ARP Protokolu (Chapters 36-40) ──
  36: `ARP Cache Poisoning: saxta ARP reply göndərmə, victim-in ARP cache-ini dəyişdirmə, gateway impersonation, arpspoof tool, Ettercap ARP poisoning`,
  37: `Man-in-the-Middle (MITM): Ettercap unified sniffing, ARP poisoning ilə traffic interception, packet sniffing, credential capture, SSL stripping basics`,
  38: `Wireshark ARP analizi: arp filter, duplicate IP detection, ARP storm, ARP broadcast analizi, packet capture və decode, ARP anomaly detection`,
  39: `Dynamic ARP Inspection (DAI): DHCP snooping binding table ilə ARP validation, trusted/untrusted interfaces, ARP ACL, rate limiting, logging`,
  40: `Statik ARP: arp -s əmri, manual ARP entry, static ARP vs dynamic ARP, müdafiə strategiyası, VLAN segmentation ilə ARP scope limitləmə`,
  // ── Bölmə 9: CIDR/VLSM/VLAN (Chapters 41-45) ──
  41: `CIDR notation: /24=255.255.255.0 (254 hosts), /16=255.255.0.0 (65534 hosts), /8=255.0.0.0, wildcard mask, subnet hesablama, network/broadcast address tapma`,
  42: `VLSM (Variable Length Subnet Masking): fərqli ölçülü subnet-lər, IP israfının azaldılması, subnetting of subnets, address allocation optimization`,
  43: `Proxy ARP: router-in başqa subnet-dəki host adına ARP reply verməsi, subnet-lər arası ARP davranışı, proxy ARP enable/disable, routing vs proxy ARP`,
  44: `VLAN (Virtual LAN): logical segmentation, access ports, trunk ports, 802.1Q tagging, VLAN ID, inter-VLAN routing, broadcast domain isolation`,
  45: `CAM Table Overflow: macof tool ilə CAM table flooding, switch-in hub kimi davranması, sniffing imkanı, port security ilə müdafiə, MAC limiting`
};

// Reverse Engineering chapter contexts (45 chapters, keyed by chapter number)
const reverseChapterContexts = {
  // ── İsrail: Əsas Assembly (1-5) ──
  1: `İkilik say sistemi (binary): bit, bayt, 0 və 1, ikilikdən onluğa çevirmə, onluqdan ikilik. Hex (16-lıq) sistem: 0-9, A-F, hex↔binary↔decimal çevirmələr. ASCII kodlaşdırma, Unicode əsasları, endianness: little-endian vs big-endian, məlumat ölçüləri: byte, word, dword, qword`,
  2: `x86 registrləri: EAX, EBX, ECX, EDX (ümumi təyinatlı), ESP (stack pointer), EBP (base pointer), EIP (instruction pointer), EFLAGS. 64-bit: RAX, RBX, RCX, RDX, RSP, RBP, RIP. Registr ölçüləri: AL/AH/AX/EAX/RAX`,
  3: `Assembly əsas əmrləri: MOV (data transfer), PUSH/POP (stack), LEA (load effective address), XCHG. Ünvanlama rejimləri: immediate, register, direct, indirect [eax], indexed [eax+4], base+index [ebx+ecx*4]`,
  4: `Stek (stack): LIFO, PUSH/POP, funksiya çağırışları, stack frame. Function prologue: push ebp; mov ebp,esp; sub esp,N. Function epilogue: mov esp,ebp; pop ebp; ret. ESP vs EBP rolu`,
  5: `Arifmetik/məntiqi əmrlər: ADD, SUB, MUL, IMUL, DIV, IDIV. Bitwise: AND, OR, XOR, NOT, SHL, SHR, ROL, ROR. XOR ilə sıfırlama (xor eax,eax), XOR şifrələmə, flag-ların dəyişməsi`,
  // ── Estoniya: Axın kontrolu (6-10) ──
  6: `Şərti keçidlər: CMP (compare), TEST. Flags: ZF, CF, SF, OF. Conditional jumps: JE/JZ, JNE/JNZ, JG/JGE, JL/JLE, JA/JAE, JB/JBE. Signed vs unsigned müqayisə`,
  7: `Dövrələr Assembly-də: LOOP əmri (ECX-based), counter-based loops (dec ecx; jnz), do-while vs while pattern. C for loop-unun assembly ekvivalenti`,
  8: `Funksiyalar: CALL/RET mexanizmi, calling conventions: cdecl (caller cleanup), stdcall (callee cleanup), fastcall (registrlərlə), x64 calling convention (rcx,rdx,r8,r9). Stack frame layout`,
  9: `Sistem çağırışları: Linux int 0x80, syscall (x64). Windows: ntdll.dll, SYSENTER. Syscall nömrələri: read(0), write(1), open(2), exit(60). Parametr ötürmə qaydaları`,
  10: `GDB əsasları: break, run, continue, step, next, info registers, x/Nx (memory examine), disassemble, set $eax=value. Breakpoint növləri, watchpoint, backtrace`,
  // ── Rumıniya: Reverse Engineering alətləri (11-15) ──
  11: `PE formatı: DOS header (MZ), PE signature, COFF header, Optional header (entry point, image base), Section table (.text, .data, .rdata, .rsrc, .reloc). RVA vs VA. Section characteristics`,
  12: `Statik analiz: IDA Pro/Free, Ghidra (decompiler, CFG, xrefs), Cutter/Radare2. Strings analizi, import/export analizi, cross-references. C kodunun assembly-yə çevrilməsi`,
  13: `Dinamik analiz: x64dbg, OllyDbg debugger-ləri. Breakpoints: software (INT3/0xCC), hardware (DR0-DR3). Single-step, step over, step into. Memory dump, registr izləmə`,
  14: `IAT (Import Address Table), EAT (Export Address Table). DLL injection: LoadLibrary, CreateRemoteThread. API hooking: inline hook, IAT hook. DLL proxying`,
  15: `Anti-debugging: IsDebuggerPresent, NtQueryInformationProcess, PEB->BeingDebugged, timing checks (RDTSC, GetTickCount), TLS callbacks, self-modifying code. Bypass texnikaları`,
  // ── Keniya: Malware əsasları (16-20) ──
  16: `Zərərli proqram növləri: virus (self-replicating), worm (network), trojan (disguised), ransomware (encryption), rootkit (hiding), backdoor, keylogger, RAT (remote access), botnet`,
  17: `Packing: UPX, Themida, VMProtect. Pack detection: entropy analizi, section adları, PEiD/Detect It Easy. Unpacking: breakpoint on OEP, pushad/popad trick, ESP trick, memory dump`,
  18: `Ransomware reverse: şifrələmə alqoritmi identifikasiyası (AES, RSA, ChaCha20), key generation analizi, decryption routine tapma, key extraction from memory, file marker analizi`,
  19: `Rootkit analizi: kernel-mode vs user-mode rootkits, SSDT hooking, IRP hooking, DKOM (Direct Kernel Object Manipulation), driver reverse engineering, rootkit detection tools`,
  20: `Shellcode: position-independent code (PIC), null-byte avoidance, encoder-lər (shikata_ga_nai), shellcode extraction, shellcode debugging, egg-hunter shellcode`,
  // ── Sinqapur: Exploit development (21-25) ──
  21: `Buffer overflow: stack-based overflow, return address overwrite, NOP sled, shellcode injection. Format string vulnerability: %x, %n, %s. Use-after-free (UAF) əsasları`,
  22: `ROP (Return-Oriented Programming): gadget tapma (ROPgadget, ropper), chain qurma, DEP/NX bypass, ASLR bypass texnikaları, ret2libc, ret2plt`,
  23: `Fuzzing: AFL (American Fuzzy Lop), coverage-guided fuzzing, crash triaging, unique crash identification, corpus creation, dictionary-based fuzzing, sanitizers (ASAN, MSAN)`,
  24: `ARM Assembly: ARM vs Thumb mode, registrlər (R0-R15, CPSR), ARM əmrləri (LDR, STR, BL, BX), conditional execution, barrel shifter. Mobile RE: Android NDK, iOS ARM64`,
  25: `Real malware analizi: WannaCry (EternalBlue, kill switch), Stuxnet (PLC targeting, 4 zero-days), Emotet (modular, banking trojan). Analiz metodologiyası, IOC extraction`,
  // ── Cənubi Afrika: CTF/Advanced RE (26-30) ──
  26: `Crackme həlli: serial/keygen reverse, license check bypass, string comparison, algorithm reverse. Patching: NOP, JMP modification. Keygen writing methodology`,
  27: `Code obfuscation: control flow flattening, opaque predicates, dead code insertion, string encryption, metamorphic code, code virtualization (VMProtect, Themida)`,
  28: `Kriptoqrafiya RE: AES/RSA assembly implementation tanıma, side-channel attacks (timing, power), white-box cryptography, custom cipher reverse engineering`,
  29: `YARA rules: rule syntax, string patterns (text, hex, regex), condition operators, PE module, math module, malware signature creation, YARA scanning automation`,
  30: `Sandbox evasion: VM detection (CPUID, registry, MAC, process list), anti-sandbox (mouse movement, uptime, file count), environment fingerprinting, sleep-based evasion`,
  // ── Hindistan: Mobile/IoT RE (31-35) ──
  31: `Android RE: APK structure, Dalvik bytecode, smali syntax, jadx/apktool decompile, JNI native libs, Frida hooking, root detection bypass, SSL pinning bypass`,
  32: `iOS RE: ARM64, Objective-C runtime, class-dump, Hopper/IDA, Cydia Substrate, Frida gadget, jailbreak detection bypass, binary encryption (FairPlay)`,
  33: `Firmware RE: binwalk (extraction), MIPS/ARM cross-compilation, JTAG/UART debugging, firmware emulation (QEMU), embedded device RE, IoT protocol analysis`,
  34: `Protocol RE: binary protocol reverse (Wireshark, hex editor), network traffic capture, protocol state machine, custom dissector writing, encrypted protocol analysis`,
  35: `Windows internals: PEB/TEB structure, ntdll.dll syscall stubs, kernel32/kernelbase, handle table, object manager, process/thread internals, token manipulation`,
  // ── Braziliya: Linux/ELF (36-40) ──
  36: `Linux internals: /proc filesystem, ptrace syscall, LD_PRELOAD injection, GOT/PLT (Global Offset Table, Procedure Linkage Table), lazy binding, RELRO`,
  37: `ELF formatı: ELF header (e_ident, e_type, e_entry), Program headers (LOAD, DYNAMIC, INTERP), Section headers (.text, .plt, .got, .dynamic), dynamic linking process`,
  38: `Vulnerability research: CVE analizi, patch diffing (BinDiff, Diaphora), 1-day exploit development, root cause analysis, vulnerable function identification`,
  39: `C2 analizi: Cobalt Strike beacon reverse, C2 protocol decryption, config extraction, malleable C2 profiles, network IOC extraction, JARM fingerprinting`,
  40: `Supply chain attack: SolarWinds (SUNBURST) analizi, backdoor detection in build systems, dependency confusion, package repository attacks, code signing bypass`,
  // ── Finlandiya: Master level (41-45) ──
  41: `Compiler output: GCC vs MSVC çıxış fərqləri, optimization levels (-O0 to -O3), inlining, loop unrolling, vectorization, tail call optimization, debug vs release build`,
  42: `SIMD/SSE: XMM/YMM registrləri, SSE/SSE2/AVX əmrləri, packed operations, floating point, multimedia processing, SIMD optimized code recognition in disassembly`,
  43: `Game hacking: memory scanning (Cheat Engine), pointer chains, function hooking (Detours, MinHook), speed hack (timing functions), wallhack (rendering hooks), anti-cheat bypass`,
  44: `Kernel RE: ntoskrnl.exe reverse, driver development/RE, IOCTL handler analysis, IRP major functions, kernel debugging (WinDbg), PatchGuard, DSE bypass`,
  45: `APT analizi: multi-stage malware (dropper→loader→payload), attribution (TTP analysis, MITRE ATT&CK), lateral movement tools, data exfiltration techniques, threat intelligence`
};

// Combined context resolver — resolves by DB chapter ID
const chapterContexts = {};

function getChapterContext(chapterId, field) {
  const contexts = field === 'reverse' ? reverseChapterContexts : pentestChapterContexts;
  return contexts;
}

async function generateQuestions(chapterId, field = 'pentest', chapterNumber = null) {
  // Use chapterNumber to look up context in field-specific map
  const contexts = field === 'reverse' ? reverseChapterContexts : pentestChapterContexts;
  const lookupKey = chapterNumber || chapterId;
  const context = contexts[lookupKey];
  if (!context) {
    throw new Error(`Invalid chapter: ID=${chapterId}, field=${field}, number=${lookupKey}`);
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.CLAUDE_API_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4000,
      system: `Sen kibertəhlükəsizlik müəllimisən. Sənə verilən mövzu əsasında MÜTLƏQ yalnız JSON formatında cavab ver. Heç bir izahat, heç bir markdown, heç bir əlavə mətn yazma. Yalnız JSON. Tələbələr üçün maraqlı, düşündürücü, praktiki suallar yaz. Suallar real həyat ssenariləri ilə əlaqəli olsun.`,
      messages: [{
        role: 'user',
        content: `Bu mövzu üzrə 15 test sualı yarat: ${context}

      JSON formatı:
      {
        "questions": [
          {
            "id": 1,
            "difficulty": "easy|medium|hard",
            "question": "Sual mətni Azərbaycanca",
            "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
            "correct": 0,
            "explanation": "Düzgün cavabın izahı",
            "points": 5
          }
        ]
      }

      Qaydalar:
      - 5 easy (5pt hərəsi), 5 medium (10pt hərəsi), 5 hard (20pt hərəsi) sual
      - Suallar Azərbaycanca olsun
      - Variant sayı: hər sualda 4 variant (A,B,C,D)
      - "correct" field: düzgün cavabın index-i (0,1,2,3)
      - Hard suallar real hücum ssenarilərini əhatə etsin
      - Qarmaqarışıq, yaddaqalan suallar yaz`
      }]
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.content[0].text;

  // Parse JSON from response (handle potential markdown wrapping)
  let parsed;
  try {
    parsed = JSON.parse(content);
  } catch {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0]);
    } else {
      throw new Error('Failed to parse Claude response as JSON');
    }
  }

  return parsed.questions;
}

async function generateAndStoreQuestions(chapterId, field = 'pentest', chapterNumber = null) {
  const questions = await generateQuestions(chapterId, field, chapterNumber);

  // Deactivate old questions for this chapter
  await pool.execute(
    'UPDATE questions SET is_active = FALSE WHERE chapter_id = ?',
    [chapterId]
  );

  // Insert new questions
  for (const q of questions) {
    const points = q.difficulty === 'easy' ? 5 : q.difficulty === 'medium' ? 10 : 20;
    await pool.execute(
      `INSERT INTO questions (chapter_id, difficulty, question_text, option_a, option_b, option_c, option_d, correct_option, explanation, points)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        chapterId,
        q.difficulty,
        q.question,
        q.options[0],
        q.options[1],
        q.options[2],
        q.options[3],
        q.correct,
        q.explanation || '',
        points
      ]
    );
  }

  return questions;
}

module.exports = { generateQuestions, generateAndStoreQuestions, pentestChapterContexts, reverseChapterContexts, getChapterContext };
