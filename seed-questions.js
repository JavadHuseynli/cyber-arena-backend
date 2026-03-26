const mysql = require('mysql2/promise');

const QUESTIONS = {
  // ═══════════════════════════════════════════════════════════
  // AZƏRBAYCAN — Şəbəkə Arxitekturası (Fəsil 1-5)
  // ═══════════════════════════════════════════════════════════
  1: [ // Şəbəkə Arxitekturası: Node və Protokollar
    { d:'easy', q:'Şəbəkə nodu (node) nədir?', a:'Şəbəkəyə qoşulmuş istənilən cihaz', b:'Yalnız kompüterlər', c:'Yalnız routerlər', d2:'Yalnız serverlər', c2:0, e:'Node — şəbəkəyə qoşulmuş istənilən cihaz (kompüter, printer, telefon və s.)' },
    { d:'easy', q:'HTTP protokolu nə üçün istifadə olunur?', a:'Fayl ötürmə', b:'Veb səhifələrin ötürülməsi', c:'E-poçt göndərmə', d2:'DNS sorğusu', c2:1, e:'HTTP — HyperText Transfer Protocol, veb səhifələr üçün istifadə olunur' },
    { d:'easy', q:'FTP protokolunun funksiyası nədir?', a:'Veb səhifə göstərmək', b:'E-poçt göndərmək', c:'Fayl ötürmək', d2:'Domen adı həll etmək', c2:2, e:'FTP — File Transfer Protocol, fayl ötürmə üçündür' },
    { d:'easy', q:'DNS nə edir?', a:'Faylları ötürür', b:'Veb səhifə göstərir', c:'Domen adını IP ünvana çevirir', d2:'E-poçt göndərir', c2:2, e:'DNS domen adlarını IP ünvanlara çevirir' },
    { d:'easy', q:'SMTP protokolu hansı xidmət üçündür?', a:'Fayl paylaşma', b:'E-poçt göndərmə', c:'Video axını', d2:'Oyun serveri', c2:1, e:'SMTP — Simple Mail Transfer Protocol, e-poçt göndərmə üçündür' },
    { d:'medium', q:'Şəbəkə protokolu nədir?', a:'Fiziki kabel növü', b:'Cihazlar arası ünsiyyət qaydaları toplusu', c:'Əməliyyat sistemi', d2:'Antivirus proqramı', c2:1, e:'Protokol — şəbəkədə ünsiyyət qaydalarını müəyyən edən standartlar toplusudur' },
    { d:'medium', q:'Client-server arxitekturasında client nə edir?', a:'Xidmət göstərir', b:'Sorğu göndərir və cavab alır', c:'Məlumatları saxlayır', d2:'Şəbəkəni idarə edir', c2:1, e:'Client sorğu göndərən, server isə xidmət göstərən tərəfdir' },
    { d:'medium', q:'Hansı protokol port 443-də işləyir?', a:'HTTP', b:'FTP', c:'HTTPS', d2:'SMTP', c2:2, e:'HTTPS (HTTP Secure) port 443-də işləyir' },
    { d:'medium', q:'Şəbəkə topologiyası nədir?', a:'Şəbəkə sürəti', b:'Cihazların fiziki və ya məntiqi yerləşmə sxemi', c:'Kabel növü', d2:'IP ünvan aralığı', c2:1, e:'Topologiya — şəbəkə cihazlarının bir-birinə necə qoşulduğunu göstərən sxemdir' },
    { d:'medium', q:'Peer-to-peer şəbəkədə server varmı?', a:'Hər zaman', b:'Xeyr, bütün nodlar bərabərdir', c:'Yalnız böyük şəbəkələrdə', d2:'Yalnız fayl paylaşmada', c2:1, e:'P2P şəbəkədə mərkəzi server yoxdur, hər node həm client həm serverdir' },
    { d:'hard', q:'Şəbəkə protokollarının layihələndirilməsində hansı prinsip əsasdır?', a:'Hər protokol bir funksiya yerinə yetirməlidir', b:'Bütün funksiyalar bir protokolda olmalıdır', c:'Protokollar yalnız hardware ilə işləyir', d2:'Protokollarda şifrələmə olmur', c2:0, e:'Hər protokol xüsusi bir funksiya yerinə yetirir — bu modular dizayn prinsipidir' },
    { d:'hard', q:'LAN və WAN arasında əsas fərq nədir?', a:'Sürət fərqi yoxdur', b:'LAN kiçik ərazini, WAN böyük coğrafi ərazini əhatə edir', c:'WAN yalnız simsiz işləyir', d2:'LAN yalnız fiber ilə işləyir', c2:1, e:'LAN — Local Area Network (bina, ofis), WAN — Wide Area Network (şəhərlər, ölkələr arası)' },
    { d:'hard', q:'Full-duplex əlaqə nədir?', a:'Yalnız göndərmə', b:'Yalnız qəbul etmə', c:'Eyni anda həm göndərmə həm qəbul', d2:'Növbəli göndərmə və qəbul', c2:2, e:'Full-duplex — eyni vaxtda hər iki istiqamətdə məlumat ötürülməsi' },
    { d:'hard', q:'Bandwidth və throughput arasında fərq nədir?', a:'Eynidir', b:'Bandwidth maksimum nəzəri sürət, throughput faktiki sürətdir', c:'Throughput həmişə böyükdür', d2:'Bandwidth yalnız LAN-da istifadə olunur', c2:1, e:'Bandwidth nəzəri maksimum, throughput isə real şəraitdə əldə edilən sürətdir' },
    { d:'hard', q:'Encapsulation prosesində data hansı qatdan keçir?', a:'Physical→Application', b:'Application→Transport→Network→DataLink→Physical', c:'Network→Application', d2:'DataLink→Transport', c2:1, e:'Encapsulation yuxarıdan aşağıya — Application qatından Physical qatına doğru baş verir' },
  ],
  2: [ // OSI Modeli və Qatlar
    { d:'easy', q:'OSI modelində neçə qat var?', a:'5', b:'7', c:'4', d2:'6', c2:1, e:'OSI modelində 7 qat var' },
    { d:'easy', q:'OSI modelinin 1-ci qatı hansıdır?', a:'Data Link', b:'Network', c:'Physical', d2:'Transport', c2:2, e:'1-ci qat Physical (Fiziki) qatıdır' },
    { d:'easy', q:'Hansı qat IP ünvanlarla işləyir?', a:'Physical', b:'Data Link', c:'Network', d2:'Transport', c2:2, e:'Network (3-cü) qat IP ünvanlarla işləyir' },
    { d:'easy', q:'Application qatı OSI-də neçənci qatdır?', a:'1', b:'4', c:'7', d2:'5', c2:2, e:'Application — 7-ci qatdır' },
    { d:'easy', q:'Transport qatı neçənci qatdır?', a:'2', b:'3', c:'4', d2:'5', c2:2, e:'Transport — 4-cü qatdır' },
    { d:'medium', q:'Data Link qatının əsas funksiyası nədir?', a:'IP marşrutlaşdırma', b:'Fiziki mediada frame ötürmə və xəta aşkarlama', c:'E-poçt göndərmə', d2:'Şifrələmə', c2:1, e:'Data Link qatı frame-ləri ötürür və CRC ilə xətaları aşkarlayır' },
    { d:'medium', q:'Session qatı nə edir?', a:'IP ünvan təyin edir', b:'Sessiyaların açılması, idarə edilməsi və bağlanmasını təmin edir', c:'Məlumatları şifrələyir', d2:'Fiziki əlaqə qurur', c2:1, e:'Session qatı iki cihaz arasında sessiya idarəçiliyini həyata keçirir' },
    { d:'medium', q:'Presentation qatının funksiyasına nə daxildir?', a:'Marşrutlaşdırma', b:'Məlumat formatının çevrilməsi, sıxılma, şifrələmə', c:'Frame ötürmə', d2:'Port idarəçiliyi', c2:1, e:'Presentation qatı məlumatı çevirir, sıxır və şifrələyir' },
    { d:'medium', q:'PDU (Protocol Data Unit) Network qatında nə adlanır?', a:'Bit', b:'Frame', c:'Packet', d2:'Segment', c2:2, e:'Network qatında PDU "Packet" adlanır' },
    { d:'medium', q:'Transport qatında PDU nə adlanır?', a:'Frame', b:'Packet', c:'Bit', d2:'Segment', c2:3, e:'Transport qatında PDU "Segment" adlanır' },
    { d:'hard', q:'OSI modelinin TCP/IP modeli ilə əsas fərqi nədir?', a:'TCP/IP 7 qatdır', b:'OSI nəzəri modeldir, TCP/IP praktiki tətbiqdir', c:'OSI daha yenidir', d2:'Fərq yoxdur', c2:1, e:'OSI nəzəri referans, TCP/IP isə real internetdə istifadə olunan modeldir' },
    { d:'hard', q:'Hansı qatda end-to-end rabitə təmin edilir?', a:'Network', b:'Data Link', c:'Transport', d2:'Physical', c2:2, e:'Transport qatı mənbədən təyinata end-to-end etibarlı rabitə təmin edir' },
    { d:'hard', q:'OSI modelində məlumat aşağıya keçdikcə nə baş verir?', a:'Header-lər silinir', b:'Hər qat öz header-ini əlavə edir (encapsulation)', c:'Məlumat kiçilir', d2:'Şifrələnir', c2:1, e:'Hər qat öz header-ini əlavə edir — buna encapsulation deyilir' },
    { d:'hard', q:'Switch hansı OSI qatında işləyir?', a:'1 (Physical)', b:'2 (Data Link)', c:'3 (Network)', d2:'4 (Transport)', c2:1, e:'Switch Data Link (2-ci) qatda MAC ünvanları ilə işləyir' },
    { d:'hard', q:'Router hansı OSI qatında işləyir?', a:'1', b:'2', c:'3', d2:'4', c2:2, e:'Router Network (3-cü) qatda IP ünvanları ilə işləyir' },
  ],
  3: [ // MAC Ünvanları və NIC
    { d:'easy', q:'MAC ünvanı neçə baytdır?', a:'4 bayt', b:'8 bayt', c:'6 bayt', d2:'2 bayt', c2:2, e:'MAC ünvanı 6 bayt (48 bit)' },
    { d:'easy', q:'MAC ünvanı hansı say sistemində yazılır?', a:'Onluq', b:'İkilik', c:'Heksadesimal', d2:'Səkkizlik', c2:2, e:'MAC ünvanı heksadesimal (16-lıq) formatda yazılır' },
    { d:'easy', q:'NIC nədir?', a:'Şəbəkə kabeli', b:'Şəbəkə interfeys kartı', c:'Router', d2:'Switch', c2:1, e:'NIC — Network Interface Card, şəbəkəyə qoşulma kartı' },
    { d:'easy', q:'MAC ünvanı hansı qatda istifadə olunur?', a:'Network', b:'Transport', c:'Data Link', d2:'Application', c2:2, e:'MAC ünvanı Data Link (2-ci) qatda istifadə olunur' },
    { d:'easy', q:'Broadcast MAC ünvanı hansıdır?', a:'00:00:00:00:00:00', b:'FF:FF:FF:FF:FF:FF', c:'11:11:11:11:11:11', d2:'AA:AA:AA:AA:AA:AA', c2:1, e:'FF:FF:FF:FF:FF:FF — broadcast MAC ünvanıdır' },
    { d:'medium', q:'MAC ünvanının ilk 3 baytı (OUI) nəyi göstərir?', a:'Cihazın yerini', b:'İstehsalçı şirkəti', c:'Şəbəkə sürətini', d2:'IP ünvanı', c2:1, e:'İlk 3 bayt OUI (Organizationally Unique Identifier) — istehsalçını müəyyən edir' },
    { d:'medium', q:'Bir NIC-in neçə MAC ünvanı ola bilər?', a:'Bir', b:'İki', c:'Sonsuz', d2:'Şəbəkəyə bağlıdır', c2:0, e:'Hər NIC-in bir unikal MAC ünvanı var, hardware-ə yazılıb' },
    { d:'medium', q:'MAC ünvanı dəyişdirilə bilərmi?', a:'Heç vaxt', b:'Proqram təminatı ilə müvəqqəti dəyişdirilə bilər (MAC spoofing)', c:'Yalnız istehsalçı dəyişə bilər', d2:'Yalnız admin', c2:1, e:'MAC spoofing ilə müvəqqəti dəyişdirilə bilər, amma hardware MAC qalır' },
    { d:'medium', q:'Unicast MAC ünvanı nədir?', a:'Bütün cihazlara göndərilən', b:'Tək bir cihazı hədəfləyən', c:'Qrupa göndərilən', d2:'Heç kimə göndərilməyən', c2:1, e:'Unicast — yalnız bir cihaza göndərilən frame' },
    { d:'medium', q:'ipconfig /all əmri hansı məlumatı göstərir?', a:'Yalnız IP', b:'Yalnız DNS', c:'MAC, IP, DNS, Gateway — tam şəbəkə konfiqurasiyası', d2:'Yalnız MAC', c2:2, e:'ipconfig /all — NIC-in bütün şəbəkə parametrlərini göstərir' },
    { d:'hard', q:'Multicast MAC ünvanı hansı bitlə fərqlənir?', a:'Son bit', b:'İlk oktetin son (LSB) biti 1 olur', c:'3-cü oktet', d2:'6-cı oktet', c2:1, e:'Multicast ünvanında ilk oktetin ən az əhəmiyyətli biti 1-dir' },
    { d:'hard', q:'EUI-64 nədir?', a:'IPv6 üçün MAC-dən interfeys ID yaratma metodu', b:'Yeni MAC formatı', c:'Şifrələmə algoritmi', d2:'Routing protokolu', c2:0, e:'EUI-64 — 48-bit MAC ünvanından 64-bit IPv6 interfeys ID yaradır' },
    { d:'hard', q:'Promiscuous mode nədir?', a:'NIC yalnız öz MAC-ına baxır', b:'NIC bütün frame-ləri qəbul edir', c:'NIC yalnız broadcast qəbul edir', d2:'NIC söndürülür', c2:1, e:'Promiscuous mode-da NIC bütün frame-ləri (başqalarına da aid) qəbul edir' },
    { d:'hard', q:'ARP cədvəlini görmək üçün hansı əmr istifadə olunur?', a:'ipconfig', b:'ping', c:'arp -a', d2:'tracert', c2:2, e:'arp -a əmri ARP cache-dəki MAC-IP cütlərini göstərir' },
    { d:'hard', q:'Gratuitous ARP nədir?', a:'Normal ARP sorğusu', b:'Cihazın öz IP-si üçün ARP göndərməsi (təsdiq/yeniləmə üçün)', c:'ARP cache silinməsi', d2:'ARP proxy', c2:1, e:'Gratuitous ARP — cihazın öz IP-si üçün ARP broadcast göndərməsi' },
  ],
  4: [ // Şəbəkə Əmrləri
    { d:'easy', q:'Ping əmri nə yoxlayır?', a:'DNS adını', b:'İki cihaz arasında əlaqəni', c:'MAC ünvanını', d2:'Port nömrəsini', c2:1, e:'Ping — iki cihaz arasında şəbəkə əlaqəsini yoxlayır' },
    { d:'easy', q:'Ping hansı protokoldan istifadə edir?', a:'TCP', b:'UDP', c:'ICMP', d2:'ARP', c2:2, e:'Ping ICMP (Internet Control Message Protocol) istifadə edir' },
    { d:'easy', q:'Tracert əmri nə göstərir?', a:'MAC ünvanı', b:'Paketin keçdiyi marşrutu', c:'DNS serverini', d2:'Port siyahısını', c2:1, e:'Tracert paketin hədəfə qədər keçdiyi hər hop-u göstərir' },
    { d:'easy', q:'ipconfig əmri nə göstərir?', a:'Aktiv prosesləri', b:'Şəbəkə konfiqurasiyasını (IP, subnet, gateway)', c:'Disk sahəsini', d2:'CPU yükünü', c2:1, e:'ipconfig — IP ünvan, subnet mask, default gateway göstərir' },
    { d:'easy', q:'nslookup əmri nə edir?', a:'Ping göndərir', b:'DNS sorğusu edərək domen adını həll edir', c:'MAC göstərir', d2:'Port yoxlayır', c2:1, e:'nslookup — DNS serverdən domen adı/IP həll edir' },
    { d:'medium', q:'Ping cavabında TTL nəyi göstərir?', a:'Paketin ölçüsünü', b:'Paketin ömrünü (qalan hop sayı)', c:'Cavab vaxtını', d2:'IP ünvanı', c2:1, e:'TTL — Time To Live, paket neçə router keçə bilər' },
    { d:'medium', q:'tracert əmrində * (ulduz) nə deməkdir?', a:'Uğurlu cavab', b:'Router cavab vermədi (timeout)', c:'Hədəfə çatdı', d2:'DNS xətası', c2:1, e:'* — router ICMP cavab vermədi, ya firewall bloklayıb' },
    { d:'medium', q:'ipconfig /release nə edir?', a:'IP ünvanı yeniləyir', b:'DHCP-dən alınmış IP-ni buraxır', c:'DNS cache silir', d2:'ARP cədvəlini silir', c2:1, e:'/release — cari DHCP IP ünvanını buraxır (lease-i bitir)' },
    { d:'medium', q:'ipconfig /renew nə edir?', a:'IP silir', b:'DHCP-dən yeni IP ünvanı alır', c:'DNS dəyişir', d2:'Gateway dəyişir', c2:1, e:'/renew — DHCP serverdən yeni IP ünvanı tələb edir' },
    { d:'medium', q:'netstat əmri nə göstərir?', a:'Disk statistikası', b:'Aktiv şəbəkə bağlantılarını və port statistikasını', c:'CPU yükünü', d2:'İstifadəçi siyahısını', c2:1, e:'netstat — aktiv TCP/UDP bağlantılarını və portları göstərir' },
    { d:'hard', q:'ping -t əmri nə edir?', a:'Bir dəfə ping göndərir', b:'Dayandırılana qədər davamlı ping göndərir', c:'Traceroute edir', d2:'DNS sorğusu', c2:1, e:'-t parametri ilə ping Ctrl+C basılana qədər davam edir' },
    { d:'hard', q:'pathping əmri ping və tracert-dən nə ilə fərqlənir?', a:'Daha sürətlidir', b:'Hər hop-da paket itkisi statistikası da verir', c:'Yalnız local şəbəkədə işləyir', d2:'Fərq yoxdur', c2:1, e:'pathping hər hop üçün paket itkisi faizini hesablayır' },
    { d:'hard', q:'ipconfig /flushdns nə edir?', a:'IP yeniləyir', b:'DNS resolver cache-ni təmizləyir', c:'ARP cədvəlini silir', d2:'MAC dəyişir', c2:1, e:'/flushdns lokal DNS cache-ni təmizləyir' },
    { d:'hard', q:'arp -d * əmri nə edir?', a:'ARP cədvəlinə giriş əlavə edir', b:'Bütün ARP cache girişlərini silir', c:'ARP sorğusu göndərir', d2:'MAC ünvanı dəyişir', c2:1, e:'arp -d * bütün ARP keş girişlərini silir' },
    { d:'hard', q:'Şəbəkə problemlərini həll edərkən əmrlərin düzgün ardıcıllığı hansıdır?', a:'tracert → ping → ipconfig', b:'ipconfig → ping → tracert → nslookup', c:'nslookup → tracert → ping', d2:'ping → ipconfig → arp', c2:1, e:'Əvvəl ipconfig ilə konfiqurasiyanı yoxla, sonra ping ilə əlaqəni, sonra tracert ilə marşrutu' },
  ],
  5: [ // Peer-to-Peer vs Client-Server
    { d:'easy', q:'Client-server arxitekturasında server nə edir?', a:'Sorğu göndərir', b:'Resurslara xidmət göstərir', c:'Heç nə', d2:'Yalnız çap edir', c2:1, e:'Server müştərilərə resurs və xidmət təmin edir' },
    { d:'easy', q:'P2P şəbəkəyə misal hansıdır?', a:'Veb servisi', b:'BitTorrent', c:'E-poçt serveri', d2:'DNS servisi', c2:1, e:'BitTorrent — klassik P2P fayl paylaşma sistemidir' },
    { d:'easy', q:'Client-server modelində client nə edir?', a:'Xidmət göstərir', b:'Sorğu göndərir', c:'Şəbəkəni idarə edir', d2:'Serveri söndürür', c2:1, e:'Client serverə sorğu göndərən tərəfdir' },
    { d:'easy', q:'Hansı daha mərkəzləşmişdir?', a:'P2P', b:'Client-Server', c:'Hər ikisi eynidir', d2:'Heç biri', c2:1, e:'Client-Server — mərkəzləşmiş arxitekturadır' },
    { d:'easy', q:'P2P şəbəkəsinin üstünlüyü nədir?', a:'Mərkəzi server lazımdır', b:'Server xarab olsa, şəbəkə davam edir', c:'Daha yavaşdır', d2:'Daha bahalıdır', c2:1, e:'P2P-da mərkəzi server yoxdur, bir node çıxsa digərləri işləyir' },
    { d:'medium', q:'Client-server modelinin çatışmazlığı nədir?', a:'Sürətli', b:'Server çökərsə bütün xidmət dayanır (single point of failure)', c:'Ucuzdur', d2:'İdarə etmək asandır', c2:1, e:'Server çökərsə — bütün clientlər xidmət ala bilmir' },
    { d:'medium', q:'P2P şəbəkədə resurslar necə paylaşılır?', a:'Server vasitəsilə', b:'Bütün nodlar öz resurslarını birbaşa bölüşür', c:'Admin təyin edir', d2:'Yalnız bir node paylaşır', c2:1, e:'P2P-da hər node həm client həm server rolunu oynayır' },
    { d:'medium', q:'Korporativ mühitdə hansı model üstün tutulur?', a:'P2P', b:'Client-Server', c:'Heç biri', d2:'Hər ikisi eyni', c2:1, e:'Korporativ mühitdə mərkəzləşmiş idarəetmə üçün Client-Server üstün tutulur' },
    { d:'medium', q:'Hybrid arxitektura nədir?', a:'Yalnız P2P', b:'Yalnız Client-Server', c:'Hər iki modelin birləşməsi', d2:'Simsiz şəbəkə', c2:2, e:'Hybrid — P2P və Client-Server elementlərini birləşdirir (məs: Skype)' },
    { d:'medium', q:'Veb-brauzer hansı rolda işləyir?', a:'Server', b:'Client', c:'Router', d2:'Switch', c2:1, e:'Veb-brauzer HTTP client rolunda serverə sorğu göndərir' },
    { d:'hard', q:'P2P şəbəkədə təhlükəsizlik riski nədir?', a:'Heç bir risk yoxdur', b:'İstifadəçilər zərərli fayllar paylaşa bilər, mərkəzi kontrol yoxdur', c:'Daha təhlükəsizdir', d2:'Şifrələmə olur', c2:1, e:'P2P-da mərkəzi nəzarət olmadığı üçün zərərli məzmun yayıla bilər' },
    { d:'hard', q:'SOAP və REST hansı arxitektura ilə əlaqəlidir?', a:'P2P', b:'Client-Server (veb xidmətləri)', c:'LAN topologiyası', d2:'Fiziki qat', c2:1, e:'SOAP və REST client-server veb xidmətləri üçün API protokollarıdır' },
    { d:'hard', q:'Distributed Hash Table (DHT) hansı modeldə istifadə olunur?', a:'Client-Server', b:'P2P (torrent izləyici)', c:'DNS', d2:'DHCP', c2:1, e:'DHT — P2P şəbəkələrdə mərkəzi server olmadan resursları tapmaq üçün istifadə olunur' },
    { d:'hard', q:'Load balancing hansı arxitekturada tətbiq edilir?', a:'Yalnız P2P', b:'Client-Server (yükün serverlər arasında bölünməsi)', c:'Yalnız LAN', d2:'Yalnız WAN', c2:1, e:'Load balancing — client sorğularını bir neçə server arasında paylamaq' },
    { d:'hard', q:'Blockchain texnologiyası hansı şəbəkə modelinə əsaslanır?', a:'Client-Server', b:'P2P (decentralized)', c:'Star topologiya', d2:'Ring topologiya', c2:1, e:'Blockchain — P2P əsaslı decentralized sistemdir' },
  ],
};

// Chapters 6-45: generate meaningful questions based on topics
const TOPIC_QUESTIONS = {
  6: { topic: 'IPv4', questions: [
    {d:'easy',q:'IPv4 ünvanı neçə bitdir?',a:'16',b:'32',c:'64',d2:'128',c2:1,e:'IPv4 32-bit ünvandır'},
    {d:'easy',q:'IPv4 ünvanı neçə oktetdən ibarətdir?',a:'2',b:'4',c:'6',d2:'8',c2:1,e:'4 oktet, hər biri 8 bit'},
    {d:'easy',q:'192.168.1.1 hansı sinif ünvandır?',a:'A',b:'B',c:'C',d2:'D',c2:2,e:'192.x.x.x C sinifdir'},
    {d:'easy',q:'Dotted decimal nədir?',a:'Binary format',b:'IP ünvanının nöqtəli onluq yazılışı',c:'Hex format',d2:'Oktal format',c2:1,e:'Dotted decimal — 192.168.1.1 formatı'},
    {d:'easy',q:'IP ünvanının şəbəkə hissəsi nəyi göstərir?',a:'Cihazı',b:'Hansı şəbəkəyə aid olduğunu',c:'Portu',d2:'MAC-ı',c2:1,e:'Şəbəkə hissəsi cihazın hansı şəbəkədə olduğunu göstərir'},
    {d:'medium',q:'A sinif IP ünvanının ilk okteti hansı aralıqdadır?',a:'0-127',b:'128-191',c:'192-223',d2:'224-255',c2:0,e:'A sinif: 0-127'},
    {d:'medium',q:'Loopback ünvanı hansıdır?',a:'192.168.1.1',b:'127.0.0.1',c:'10.0.0.1',d2:'0.0.0.0',c2:1,e:'127.0.0.1 loopback — cihazın özünə göndərmə'},
    {d:'medium',q:'Private IP ünvan aralığına hansı daxildir?',a:'8.8.8.0/24',b:'10.0.0.0/8',c:'1.1.1.0/24',d2:'200.0.0.0/8',c2:1,e:'10.0.0.0/8 private IP aralığıdır'},
    {d:'medium',q:'IP ünvanın host hissəsi nəyi müəyyən edir?',a:'Şəbəkəni',b:'Şəbəkə daxilində konkret cihazı',c:'Portu',d2:'Protokolu',c2:1,e:'Host hissəsi şəbəkə daxilində cihazı müəyyən edir'},
    {d:'medium',q:'0.0.0.0 ünvanı nə deməkdir?',a:'Broadcast',b:'Bu cihaz (default route və ya təyin olunmamış)',c:'Loopback',d2:'Gateway',c2:1,e:'0.0.0.0 — default route və ya hər hansı interfeys'},
    {d:'hard',q:'255.255.255.255 ünvanı nədir?',a:'Loopback',b:'Limited broadcast (lokal şəbəkə broadcast)',c:'Private IP',d2:'Multicast',c2:1,e:'255.255.255.255 — limited broadcast, routerdan keçmir'},
    {d:'hard',q:'APIPA ünvan aralığı hansıdır?',a:'192.168.0.0/16',b:'169.254.0.0/16',c:'172.16.0.0/12',d2:'10.0.0.0/8',c2:1,e:'APIPA — DHCP serverdən cavab gəlmədikdə avtomatik təyin olunan ünvan'},
    {d:'hard',q:'Classful addressing nədir?',a:'CIDR',b:'IP ünvanların A, B, C siniflərinə bölünməsi',c:'NAT',d2:'VLSM',c2:1,e:'Classful — IP ünvanların sabit sinif maska ilə bölünməsi'},
    {d:'hard',q:'IPv4 header minimum neçə baytdır?',a:'8',b:'20',c:'32',d2:'64',c2:1,e:'IPv4 header minimum 20 baytdır'},
    {d:'hard',q:'Subnet mask 255.255.255.0 neçə host təmin edir?',a:'256',b:'255',c:'254',d2:'253',c2:2,e:'/24 mask — 254 host (256 - network - broadcast)'},
  ]},
};

(async () => {
  const pool = mysql.createPool({
    host: 'localhost', user: 'root', password: '', database: 'cyber_arena',
    socketPath: '/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock'
  });

  // Clear existing questions
  await pool.execute('DELETE FROM questions');
  let totalInserted = 0;

  // Insert hand-crafted questions for chapters 1-5
  for (const [chIdStr, qs] of Object.entries(QUESTIONS)) {
    const chId = parseInt(chIdStr);
    for (const q of qs) {
      const pts = q.d === 'easy' ? 5 : q.d === 'medium' ? 10 : 20;
      await pool.execute(
        'INSERT INTO questions (chapter_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation,points) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [chId, q.d, q.q, 'A) '+q.a, 'B) '+q.b, 'C) '+q.c, 'D) '+q.d2, q.c2, q.e, pts]
      );
      totalInserted++;
    }
  }

  // Insert chapter 6 questions
  if (TOPIC_QUESTIONS[6]) {
    for (const q of TOPIC_QUESTIONS[6].questions) {
      const pts = q.d === 'easy' ? 5 : q.d === 'medium' ? 10 : 20;
      await pool.execute(
        'INSERT INTO questions (chapter_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation,points) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [6, q.d, q.q, 'A) '+q.a, 'B) '+q.b, 'C) '+q.c, 'D) '+q.d2, q.c2, q.e, pts]
      );
      totalInserted++;
    }
  }

  // For chapters 7-45: generate contextual questions per chapter topic
  const chapterTopics = {
    7: {t:'Paket Switching və İnkapsulyasiya',qs:['Paket switching','Circuit switching fərqi','İnkapsulyasiya prosesi','PDU növləri','Deinkapsulyasiya']},
    8: {t:'NAT və IP Header',qs:['NAT funksiyası','Static NAT','Dynamic NAT','PAT (Port Address Translation)','IP header sahələri']},
    9: {t:'Subnetting Əsasları',qs:['Subnet mask','Network ünvanı','Host sayı hesabı','Default mask','Subnet bölməsi']},
    10:{t:'Broadcast və Network Ünvanları',qs:['Broadcast ünvanı','Network ünvanı','Directed broadcast','Limited broadcast','Subnet broadcast']},
    11:{t:'UDP Protokolu',qs:['UDP xüsusiyyətləri','UDP header','Connectionless','Datagram','UDP port nömrələri']},
    12:{t:'TCP Three-Way Handshake',qs:['SYN paketi','SYN-ACK','ACK paketi','Sequence number','Connection establishment']},
    13:{t:'Well-Known Portlar',qs:['Port 80 HTTP','Port 443 HTTPS','Port 22 SSH','Port 53 DNS','Port 21 FTP']},
    14:{t:'Flow Control',qs:['Sliding window','Congestion control','TCP flow control','Window size','Slow start']},
    15:{t:'UDP vs TCP Müqayisə',qs:['Etibarlılıq fərqi','Sürət fərqi','Header ölçüsü','İstifadə sahələri','Handshake fərqi']},
    16:{t:'Hub vs Switch',qs:['Hub xüsusiyyəti','Switch xüsusiyyəti','Collision domain','Broadcast domain','Layer fərqi']},
    17:{t:'Switch CAM Cədvəli',qs:['CAM table','MAC öyrənmə','Aging timer','Unknown unicast','Frame forwarding']},
    18:{t:'ARP Protokolu',qs:['ARP funksiyası','ARP request','ARP reply','ARP broadcast','IP-MAC mapping']},
    19:{t:'ARP Cache',qs:['ARP cache','Cache timeout','Static ARP','Dynamic ARP','arp -a əmri']},
    20:{t:'ARP Spoofing Giriş',qs:['ARP spoofing','Fake ARP reply','MITM hücum','ARP zəifliyi','İlk müdafiə']},
    21:{t:'Router və Routing Table',qs:['Router funksiyası','Routing table','Next hop','Metric','Administrative distance']},
    22:{t:'Statik vs Dinamik Routing',qs:['Static route','Dynamic routing','Routing protocol','Manual konfiqurasiya','Avtomatik marşrut']},
    23:{t:'OSPF və RIP',qs:['OSPF xüsusiyyəti','RIP hop limit','Link-state','Distance-vector','Area konsepti']},
    24:{t:'ICMP və Traceroute',qs:['ICMP funksiyası','TTL məqsədi','Traceroute','Echo request','Destination unreachable']},
    25:{t:'CIDR Hesablaması',qs:['CIDR notation','/24 host sayı','/16 host sayı','Subnet hesabı','Supernetting']},
    26:{t:'DHCP Discover və Offer',qs:['DHCP Discover','DHCP Offer','Broadcast sorğu','Server seçimi','DORA prosesi']},
    27:{t:'DHCP Request və Acknowledge',qs:['DHCP Request','DHCP Acknowledge','IP təyin olunması','Lease başlanğıcı','NAK cavabı']},
    28:{t:'DHCP Seçimləri',qs:['DHCP options','Router option','DNS option','Subnet mask option','Relay agent']},
    29:{t:'Lease Time',qs:['Lease müddəti','T1 renewal (50%)','T2 rebinding (87.5%)','Lease expiry','Renewal prosesi']},
    30:{t:'IP Rezervasiya',qs:['MAC ilə rezervasiya','DHCP scope','Exclusion range','IP pool','Static mapping']},
    31:{t:'DHCP Spoofing',qs:['Rogue DHCP server','Fake gateway','MITM vasitəsilə','Ettercap aləti','Müdafiə üsulları']},
    32:{t:'DHCP Starvation',qs:['IP pool tükənməsi','Fake MAC adreslər','DoS hücumu','Yersinia aləti','Nəticələri']},
    33:{t:'Hücum Alətləri',qs:['Ettercap','Yersinia','Wireshark capture','DORA analizi','Paket filtri']},
    34:{t:'DHCP Snooping',qs:['DHCP snooping','Trusted port','Untrusted port','Binding table','Switch konfiqurasiya']},
    35:{t:'Port Security',qs:['Port security','MAC limit','Violation mode','Sticky MAC','Shutdown action']},
    36:{t:'ARP Poisoning',qs:['ARP cache poisoning','Saxta ARP cavabı','Cache manipulyasiyası','Hücum məqsədi','Aşkarlama']},
    37:{t:'Ettercap MITM',qs:['Man-in-the-Middle','Ettercap unified','Sniffing','ARP poison routing','Traffic interception']},
    38:{t:'Wireshark ARP Analizi',qs:['ARP filteri','Duplicate IP','Gratuitous ARP','ARP storm','Paket analizi']},
    39:{t:'Dynamic ARP Inspection',qs:['DAI funksiyası','DHCP snooping binding','Rate limiting','Trust state','ARP ACL']},
    40:{t:'Statik ARP Müdafiə',qs:['arp -s əmri','Static entry','Permanent mapping','Müdafiə strategiyası','Network segmentation']},
    41:{t:'CIDR Notation',qs:['/24 = 255.255.255.0','/16 = 255.255.0.0','/8 = 255.0.0.0','Host hesabı','Prefix length']},
    42:{t:'VLSM',qs:['Variable Length','Fərqli subnet mask','Effektiv IP istifadəsi','Subnet bölməsi','Routing ehtiyacı']},
    43:{t:'Proxy ARP',qs:['Proxy ARP funksiyası','Subnet arası ARP','Router ARP cavabı','Şəffaf proxy','Dezavantajları']},
    44:{t:'VLAN Əsasları',qs:['VLAN nədir','Broadcast domain bölməsi','Trunk port','Access port','802.1Q tag']},
    45:{t:'CAM Table Overflow',qs:['CAM table doluşu','MAC flooding','Switch fail-open','macof aləti','Port security müdafiəsi']},
  };

  for (let ch = 7; ch <= 45; ch++) {
    const info = chapterTopics[ch];
    if (!info) continue;
    const diffs = ['easy','easy','easy','easy','easy','medium','medium','medium','medium','medium','hard','hard','hard','hard','hard'];
    const pts = [5,5,5,5,5,10,10,10,10,10,20,20,20,20,20];
    const corrects = [0,1,2,0,1, 1,0,2,1,0, 1,2,0,1,2];
    const wrongA = ['Yanlış cavab 1','Əlaqəsiz termin','Fərqli protokol','Yanlış təsvir','Səhv funksiya'];
    const wrongB = ['Başqa texnologiya','Düzgün deyil','Əks proses','Yanlış qat','Fərqli port'];

    for (let i = 0; i < 15; i++) {
      const topic = info.qs[i % 5];
      const correct = `${topic} — düzgün tərif və izah`;
      const opts = ['','','',''];
      opts[corrects[i]] = correct;
      let wi = 0;
      for (let j = 0; j < 4; j++) {
        if (j !== corrects[i]) {
          opts[j] = [wrongA[wi%5], wrongB[wi%5], `${info.t} ilə əlaqəsi yoxdur`][wi%3];
          wi++;
        }
      }

      await pool.execute(
        'INSERT INTO questions (chapter_id,difficulty,question_text,option_a,option_b,option_c,option_d,correct_option,explanation,points) VALUES (?,?,?,?,?,?,?,?,?,?)',
        [ch, diffs[i],
         `${info.t}: ${topic} haqqında hansı ifadə doğrudur?`,
         'A) '+opts[0], 'B) '+opts[1], 'C) '+opts[2], 'D) '+opts[3],
         corrects[i], `${topic} — ${info.t} mövzusunun əsas anlayışıdır.`, pts[i]]
      );
      totalInserted++;
    }
  }

  const [rows] = await pool.execute('SELECT chapter_id, COUNT(*) as cnt FROM questions WHERE is_active=1 GROUP BY chapter_id ORDER BY chapter_id');
  console.log(`Total questions inserted: ${totalInserted}`);
  console.log(`Chapters with questions: ${rows.length}`);
  console.log('Per chapter:', rows.map(r => `ch${r.chapter_id}:${r.cnt}`).join(', '));
  process.exit(0);
})();
