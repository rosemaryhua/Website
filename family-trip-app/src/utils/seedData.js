export const SEED_ITINERARIES = {
  family1: [
    // Hua Family — TAIPEI: Mar 30 – Apr 6
    // Accommodation: Kimpton Da An Hotel (free bike rental, complimentary breakfast 7-10am)
    // Fu Hang Soy Milk opens 5:30am, Ruian Soy Milk shop 24/7

    // DAY 1 — Monday Mar 30
    { date: '2026-03-30', time: '18:45', activity: 'Arrive at Taipei', location: 'Taoyuan Airport', notes: '' },
    { date: '2026-03-30', time: '20:15', activity: 'Transfer to Kimpton Da An Hotel', location: 'Kimpton Da An Hotel Taipei', notes: 'Free bike rental, complimentary breakfast 7-10am', lat: '25.0416', lng: '121.5437' },
    { date: '2026-03-30', time: '20:30', activity: 'Dinner / rest at hotel', location: 'Kimpton Da An Hotel', notes: '', lat: '25.0416', lng: '121.5437' },

    // DAY 2 — Tuesday Mar 31 (DeAragons land 4am)
    { date: '2026-03-31', time: '', activity: 'Taoyuan??', location: '', notes: '' },
    { date: '2026-03-31', time: '11:30', activity: 'Chiao Hu Wonderland', location: '', notes: 'Hours: 11:30 AM – 6:00 PM', lat: '25.0617', lng: '121.3614' },

    // DAY 3 — Wednesday Apr 1
    { date: '2026-04-01', time: '10:00', activity: 'Kuo Yuan Ye Pastry Museum DIY', location: 'Kuo Yuan Ye Pastry Museum', notes: 'DeAragons, Huas, Wongs bought tix', lat: '25.0919', lng: '121.5265' },
    { date: '2026-04-01', time: '13:00', activity: 'Taipei Children\'s Amusement Park', location: 'Taipei Children\'s Amusement Park', notes: '', lat: '25.0969', lng: '121.5146' },
    { date: '2026-04-01', time: '15:00', activity: 'Le Hair Salon?', location: '', notes: '' },
    { date: '2026-04-01', time: '18:00', activity: 'Dinner at Sunrise Buffet', location: 'Sunrise Buffet', notes: '' },

    // DAY 4 — Thursday Apr 2
    { date: '2026-04-02', time: '', activity: 'Huashan 1914 Creative Park', location: 'Huashan 1914 Creative Park', notes: '', lat: '25.044', lng: '121.5294' },
    { date: '2026-04-02', time: '', activity: 'Taipei 101', location: 'Taipei 101', notes: '', lat: '25.0339', lng: '121.5644' },
    { date: '2026-04-02', time: '', activity: 'Keelung day trip', location: 'Keelung', notes: '' },

    // DAY 5 — Friday Apr 3
    { date: '2026-04-03', time: '11:30', activity: 'Brunch at Mr. Tree Station Daan with Agnes/Millie', location: 'Mr. Tree Station, Daan', notes: '', lat: '25.0294', lng: '121.5473' },
    { date: '2026-04-03', time: '13:00', activity: 'Taipei Zoo', location: 'Taipei Zoo', notes: '', lat: '24.9983', lng: '121.581' },
    { date: '2026-04-03', time: '15:00', activity: 'Maokong Gondola', location: 'Maokong', notes: '', lat: '24.9983', lng: '121.5796' },

    // DAY 6 — Saturday Apr 4 (Cousin day)
    { date: '2026-04-04', time: '', activity: 'Laser tag & BBQ', location: '', notes: '' },

    // DAY 7 — Sunday Apr 5
    { date: '2026-04-05', time: '09:00', activity: 'Easter Mass (+ egg hunt)', location: '', notes: '' },
    { date: '2026-04-05', time: '14:00', activity: 'Yongkang Street & Chiang Kai-Shek Memorial', location: 'Yongkang / CKS Memorial Hall', notes: '', lat: '25.0346', lng: '121.5224' },
    { date: '2026-04-05', time: '20:30', activity: 'Dinner with Kus at Indulge Bistro', location: 'Indulge Bistro', notes: '', lat: '25.0418', lng: '121.5458' },

    // DAY 8 — Monday Apr 6 (Taipei → Seoul)
    { date: '2026-04-06', time: '12:00', activity: 'Hotel check out', location: 'Kimpton Da An Hotel', notes: '', lat: '25.0416', lng: '121.5437' },
    { date: '2026-04-06', time: '12:55', activity: 'Flight OZ 712: TPE → ICN (arrive 16:30)', location: 'Taoyuan → Incheon Airport Terminal 2', notes: 'Pickup at Door 5, Gate 5. Mr. Jang JunYoung 장준용 010-2838-4999, ~1:15 drive', lat: '37.4602', lng: '126.4407' },
    { date: '2026-04-06', time: '17:45', activity: 'Check into Airbnb', location: 'Seoul Seodaemun-gu Yeonhui-dong 413-53', notes: '', lat: '37.5684', lng: '126.9318' },
    { date: '2026-04-06', time: '18:30', activity: 'Sinseon Ox Bone Soup (dinner)', location: 'Seoul Mapo-gu Donggyo-dong 163-9 (Hongik Univ. Station)', notes: '~16 mins from Airbnb. Get T-money card', lat: '37.5562', lng: '126.9236' },

    // Hua Family — DAY 2: Tuesday Apr 7
    { date: '2026-04-07', time: '09:00', activity: 'Starfield Library', location: 'COEX Mall', notes: '', lat: '37.5118', lng: '127.0592' },
    { date: '2026-04-07', time: '10:00', activity: 'COEX Aquarium', location: 'COEX Mall', notes: 'Buy tickets ahead. Rose works 3-5pm', lat: '37.5132', lng: '127.0594' },
    { date: '2026-04-07', time: '12:00', activity: 'Rest / dessert — Cafe Knotted (donuts)', location: 'Near COEX', notes: '', lat: '37.5106', lng: '127.0602' },
    { date: '2026-04-07', time: '13:00', activity: 'Lunch — Samwon Garden or Sam\'s Korean BBQ', location: '', notes: '', lat: '37.5255', lng: '127.0372' },
    { date: '2026-04-07', time: '14:30', activity: 'Workshop By Baskin Robbins', location: 'Seoul Gangnam-gu Dogok-dong 907-54', notes: '15 min by taxi from COEX' },
    { date: '2026-04-07', time: '17:20', activity: 'Sungnyemun Gate (quick photo stop)', location: 'Sungnyemun', notes: 'Leave Seongsu at 4:30', lat: '37.5599', lng: '126.9753' },
    { date: '2026-04-07', time: '18:00', activity: 'Dinner — Seoryung', location: 'Seoul Station area', notes: '', lat: '37.5547', lng: '126.9706' },

    // Hua Family — DAY 3: Wednesday Apr 8
    { date: '2026-04-08', time: '10:00', activity: 'Seoul Children\'s Grand Park (zoo + playground)', location: 'Seoul Children\'s Grand Park', notes: 'Parks open 5am, zoo 10am. Rose works 10am-2pm and dinner' },
    { date: '2026-04-08', time: '13:30', activity: 'Seongsu — Lunch & explore', location: 'Seongsu-dong', notes: 'Jojo Kalguksu (online queue opens 10am), Pungjo seaweed, Damsot, HDD Pizza', lat: '37.5445', lng: '127.056' },
    { date: '2026-04-08', time: '14:00', activity: 'Seongsu snacks & shopping', location: 'Seongsu-dong', notes: 'Jayeondo/Beton (salt bread), Hanjungsun (fruit mochi), Sapporo beer stand, Onion, Daerim Chango', lat: '37.5445', lng: '127.056' },
    { date: '2026-04-08', time: '15:00', activity: 'Seongsu beauty & shopping', location: 'Seongsu-dong', notes: 'Jungsaemool 101, Amore, Olive Young, Tirtir, Nyunyu, New Balance, Blue Elephant, Point of View Stationery', lat: '37.5445', lng: '127.056' },
    { date: '2026-04-08', time: '16:00', activity: 'Seoul Forest', location: 'Seoul Forest', notes: '', lat: '37.5443', lng: '127.0374' },
    { date: '2026-04-08', time: '18:00', activity: 'Dinner — Mimiok', location: '', notes: '', lat: '37.5287', lng: '126.9692' },
    { date: '2026-04-08', time: '21:00', activity: 'Seian Spa', location: '2F, 252-15 Yeonnam-dong, Mapo-gu', notes: 'Oil / relaxation massage, 7am-10pm', lat: '37.5635', lng: '126.9231' },

    // Hua Family — DAY 4: Thursday Apr 9
    { date: '2026-04-09', time: '09:00', activity: 'Gyeongbokgung Palace', location: 'Gyeongbokgung', notes: '10:00 AM Guard Changing Ceremony. Rose has lunch with Berkeley friend, works 4:30pm-dinner', lat: '37.5796', lng: '126.977' },
    { date: '2026-04-09', time: '10:30', activity: 'Gwanghwamun → Cheonggyecheon → Bukchon Hanok Village stroll', location: 'Jongno-gu', notes: '', lat: '37.5826', lng: '126.9836' },
    { date: '2026-04-09', time: '12:30', activity: 'Lunch — Odarijip (Savoy Hotel branch)', location: 'Seoul Jung-gu 1(il)-ga 23-1', notes: 'https://naver.me/FetJenq2' },
    { date: '2026-04-09', time: '13:30', activity: 'Myeongdong Cathedral', location: 'Myeongdong', notes: '', lat: '37.5632', lng: '126.9873' },
    { date: '2026-04-09', time: '14:00', activity: 'Myeongdong shopping', location: 'Myeongdong', notes: 'Olive Young, Blue Elephant, Pharmacy beauty, Davich Optical, Daiso, Acorn Caricature', lat: '37.5632', lng: '126.9873' },
    { date: '2026-04-09', time: '18:00', activity: 'Gwangjang Market & Namdaemun', location: 'Gwangjang Market / Namdaemun', notes: '', lat: '37.57', lng: '126.999' },

    // Hua Family — DAY 5: Friday Apr 10
    { date: '2026-04-10', time: '11:00', activity: 'Check out of Airbnb', location: 'Yeonhui-dong Airbnb', notes: '', lat: '37.5684', lng: '126.9318' },
    { date: '2026-04-10', time: '13:30', activity: 'Arrive at airport', location: 'Incheon Airport', notes: '', lat: '37.4602', lng: '126.4407' },
    { date: '2026-04-10', time: '16:30', activity: 'Flight ICN → (arrive 18:25)', location: 'Incheon Airport', notes: '', lat: '37.4602', lng: '126.4407' },
  ],

  family4: [
    // DeAragon Family — Taipei: Mon 3/30 - Mon 4/6
    // Joining 100% of Hua plans in Taipei

    // Tuesday Mar 31
    { date: '2026-03-31', time: '04:05', activity: 'DeAragon Family arrival (UA 853)', location: 'Taoyuan Airport', notes: '' },
    { date: '2026-03-31', time: '05:00', activity: 'Check-in at Kimpton Da An Hotel', location: 'Kimpton Da An Hotel, Taipei', notes: 'Free bike rental, complimentary breakfast 7-10am', lat: '25.0416', lng: '121.5437' },
    { date: '2026-03-31', time: '', activity: 'Taoyuan??', location: '', notes: '' },
    { date: '2026-03-31', time: '11:30', activity: 'Chiao Hu Wonderland', location: '', notes: 'Hours: 11:30 AM – 6:00 PM', lat: '25.0617', lng: '121.3614' },

    // Wednesday Apr 1
    { date: '2026-04-01', time: '10:00', activity: 'Kuo Yuan Ye Pastry Museum DIY', location: 'Kuo Yuan Ye Pastry Museum', notes: 'DeAragons, Huas, Wongs bought tix', lat: '25.0919', lng: '121.5265' },
    { date: '2026-04-01', time: '13:00', activity: 'Taipei Children\'s Amusement Park', location: 'Taipei Children\'s Amusement Park', notes: '', lat: '25.0969', lng: '121.5146' },
    { date: '2026-04-01', time: '15:00', activity: 'Le Hair Salon?', location: '', notes: '' },
    { date: '2026-04-01', time: '18:00', activity: 'Dinner at Sunrise Buffet', location: 'Sunrise Buffet', notes: '' },

    // Thursday Apr 2
    { date: '2026-04-02', time: '', activity: 'Huashan 1914 Creative Park', location: 'Huashan 1914 Creative Park', notes: '', lat: '25.044', lng: '121.5294' },
    { date: '2026-04-02', time: '', activity: 'Taipei 101', location: 'Taipei 101', notes: '', lat: '25.0339', lng: '121.5644' },
    { date: '2026-04-02', time: '', activity: 'Keelung day trip', location: 'Keelung', notes: '' },

    // Friday Apr 3
    { date: '2026-04-03', time: '11:30', activity: 'Brunch at Mr. Tree Station Daan with Agnes/Millie', location: 'Mr. Tree Station, Daan', notes: '', lat: '25.0294', lng: '121.5473' },
    { date: '2026-04-03', time: '13:00', activity: 'Taipei Zoo', location: 'Taipei Zoo', notes: '', lat: '24.9983', lng: '121.581' },
    { date: '2026-04-03', time: '15:00', activity: 'Maokong Gondola', location: 'Maokong', notes: '', lat: '24.9983', lng: '121.5796' },

    // Saturday Apr 4 (Cousin day)
    { date: '2026-04-04', time: '', activity: 'Laser tag & BBQ', location: '', notes: '' },

    // Sunday Apr 5
    { date: '2026-04-05', time: '09:00', activity: 'Easter Mass (+ egg hunt)', location: '', notes: '' },
    { date: '2026-04-05', time: '14:00', activity: 'Yongkang Street & Chiang Kai-Shek Memorial', location: 'Yongkang / CKS Memorial Hall', notes: '', lat: '25.0346', lng: '121.5224' },
    { date: '2026-04-05', time: '20:30', activity: 'Dinner with Kus at Indulge Bistro', location: 'Indulge Bistro', notes: '', lat: '25.0418', lng: '121.5458' },

    // Monday Apr 6 (Taipei → Seoul)
    { date: '2026-04-06', time: '12:00', activity: 'Hotel check out', location: 'Kimpton Da An Hotel', notes: '', lat: '25.0416', lng: '121.5437' },
    { date: '2026-04-06', time: '12:55', activity: 'Flight OZ 712: TPE → ICN (arrive 4:30 PM)', location: 'Taoyuan → Incheon Airport', notes: '', lat: '37.4602', lng: '126.4407' },
    { date: '2026-04-06', time: '16:30', activity: 'Arrive at Airbnb', location: 'Seodaemun-gu, 187-53 Yeonhui-dong', notes: '', lat: '37.5684', lng: '126.9318' },

    // DeAragon Family — Seoul: Mon 4/6 - Sun 4/12

    // Tuesday Apr 7
    { date: '2026-04-07', time: '14:00', activity: 'Rose Work: Lotte Shopping CEO meeting', location: '', notes: '2:00 PM – 6:00 PM' },
    { date: '2026-04-07', time: '18:00', activity: 'Dinner (reservation confirmed)', location: '', notes: '' },

    // Wednesday Apr 8
    { date: '2026-04-08', time: '10:00', activity: 'Rose Work: Webinar shooting', location: '', notes: '10:00 AM – 11:00 AM' },
    { date: '2026-04-08', time: '14:00', activity: 'Rose Work: CJ CIO meeting', location: '', notes: '2:00 PM – 5:00 PM' },
    { date: '2026-04-08', time: '18:00', activity: 'Dinner (reservation confirmed)', location: '', notes: '' },

    // Thursday Apr 9
    { date: '2026-04-09', time: '11:30', activity: 'Rose Work: Lunch with Tom', location: '', notes: '' },
    { date: '2026-04-09', time: '15:00', activity: 'Rose Work: Retail & CPG Customers Meetup', location: '', notes: '3:00 PM – 8:00 PM' },

    // Sunday Apr 12
    { date: '2026-04-12', time: '16:30', activity: 'Flight KE 2119: GMP → KIX (arrive 6:25 PM)', location: 'Gimpo Airport → Kansai Airport', notes: '', lat: '37.5581', lng: '126.7906' },
  ],

  family2: [
    // Ku Family — Taipei: Fri 4/3 - Mon 4/6

    // DAY 1 — Friday Apr 3
    { date: '2026-04-03', time: '08:00', activity: 'Flight UA871: SFO → TPE (arrive 6:45 PM)', location: 'SFO → Taoyuan Airport', notes: '' },
    { date: '2026-04-03', time: '19:00', activity: 'Arrive at Airbnb', location: 'Taipei Airbnb', notes: '' },

    // DAY 2 — Saturday Apr 4
    { date: '2026-04-04', time: '20:00', activity: 'Wa-Shu?', location: '', notes: '' },
    { date: '2026-04-04', time: '21:00', activity: 'Cozy Taipei', location: '', notes: 'Rez: 2 adults' },

    // DAY 3 — Sunday Apr 5
    { date: '2026-04-05', time: '20:30', activity: 'Indulge Bistro', location: '', notes: 'Rez: 6 adults, 2 kids', lat: '25.0418', lng: '121.5458' },

    // DAY 4 — Monday Apr 6 (Taipei → Seoul)
    { date: '2026-04-06', time: '11:00', activity: 'Travel / Check-in Taoyuan Airport', location: 'Taoyuan Airport', notes: '' },
    { date: '2026-04-06', time: '13:00', activity: 'Flight Asiana OZ712: TPE → ICN', location: 'Taoyuan → Incheon Airport', notes: 'Arrive 4:30 PM', lat: '37.4602', lng: '126.4407' },
    { date: '2026-04-06', time: '16:30', activity: 'Arrive at Airbnb', location: 'Seoul Airbnb', notes: '' },

    // Ku Family — Seoul: Mon 4/6 - Sun 4/12

    // DAY 2 — Tuesday Apr 7
    { date: '2026-04-07', time: '09:00', activity: 'Seongsu-Dong / Seoul Forest (rent bikes, shopping, lunch)', location: 'Seongsu-dong / Seoul Forest', notes: '', lat: '37.5443', lng: '127.0374' },
    { date: '2026-04-07', time: '13:00', activity: 'Travel to Acupuncture', location: '', notes: '' },
    { date: '2026-04-07', time: '14:20', activity: 'Pat Acupuncture', location: '', notes: '2:20 PM – 3:20 PM' },
    { date: '2026-04-07', time: '18:00', activity: 'Dinner at Seoryung', location: 'Seoul Station', notes: 'Rez: 17', lat: '37.5547', lng: '126.9706' },

    // DAY 3 — Wednesday Apr 8
    { date: '2026-04-08', time: '09:00', activity: 'Bukchon Hanok Village / Gahoe-Dong Church (lunch)', location: 'Bukchon', notes: '', lat: '37.5826', lng: '126.9836' },
    { date: '2026-04-08', time: '13:30', activity: 'Insadong', location: 'Insadong', notes: '', lat: '37.5741', lng: '126.9854' },
    { date: '2026-04-08', time: '18:00', activity: 'Dinner at Mimiok', location: '', notes: 'Rez: 16', lat: '37.5287', lng: '126.9692' },

    // DAY 4 — Thursday Apr 9
    { date: '2026-04-09', time: '09:00', activity: 'Gyeongbokgung Palace (hanbok rental, changing of the guard, lunch)', location: 'Gyeongbokgung', notes: '', lat: '37.5796', lng: '126.977' },
    { date: '2026-04-09', time: '13:30', activity: 'Myeongdong Cathedral', location: 'Myeongdong', notes: '', lat: '37.5632', lng: '126.9873' },
    { date: '2026-04-09', time: '17:30', activity: 'Travel to Gwangjang Market', location: '', notes: '', lat: '37.57', lng: '126.999' },
    { date: '2026-04-09', time: '18:00', activity: 'Dinner at Gwangjang Market', location: 'Gwangjang Market', notes: '', lat: '37.57', lng: '126.999' },

    // DAY 5 — Friday Apr 10
    { date: '2026-04-10', time: '09:30', activity: 'Clean-up / Check-out Airbnb', location: 'Seoul Airbnb', notes: '' },
    { date: '2026-04-10', time: '11:00', activity: 'Saenamteo (St. Andrew Kim martyr site)', location: 'Saenamteo', notes: '' },
    { date: '2026-04-10', time: '13:00', activity: 'Travel to Acupuncture', location: '', notes: '' },
    { date: '2026-04-10', time: '14:00', activity: 'Pat Acupuncture', location: '', notes: '2:00 PM – 3:00 PM' },
    { date: '2026-04-10', time: '15:00', activity: 'Travel / Check-in to new Airbnb', location: 'Seoul Airbnb', notes: '' },

    // DAY 6 — Saturday Apr 11
    { date: '2026-04-11', time: '09:30', activity: 'Danggogae Catholic Martyrs\' Shrine', location: 'Danggogae', notes: '' },
    { date: '2026-04-11', time: '11:00', activity: 'Seosomun Shrine History Museum', location: 'Seosomun', notes: '' },

    // DAY 7 — Sunday Apr 12
    { date: '2026-04-12', time: '09:30', activity: 'Clean-up / Check-out Airbnb', location: 'Seoul Airbnb', notes: '' },
    { date: '2026-04-12', time: '12:30', activity: 'Travel to Incheon', location: '', notes: '' },
    { date: '2026-04-12', time: '14:00', activity: 'Check-in at Incheon Airport', location: 'Incheon Airport', notes: '', lat: '37.4602', lng: '126.4407' },
    { date: '2026-04-12', time: '16:00', activity: 'Flight Korean Air KE23', location: 'Incheon Airport', notes: '', lat: '37.4602', lng: '126.4407' },
  ],

  family3: [
    // Kim Family — Fri-Sat 4/3-4/4
    { date: '2026-04-03', time: '', activity: 'Flight SFO → ICN', location: 'SFO Airport', notes: 'Arrive 4/4 at 20:30', lat: '37.4602', lng: '126.4407' },
    { date: '2026-04-04', time: '20:30', activity: 'Arrive ICN — picked up by P\'s cousin & aunt', location: 'Incheon Airport', notes: '', lat: '37.4602', lng: '126.4407' },

    // Kim Family — Sun 4/5
    { date: '2026-04-05', time: '', activity: 'Easter Mass', location: '', notes: '' },
    { date: '2026-04-05', time: '', activity: 'Lunch with P\'s aunts, uncles, cousins', location: '', notes: '' },

    // Kim Family — Mon 4/6
    { date: '2026-04-06', time: '', activity: 'Travel Uiwang → Seoul city center', location: 'Uiwang → Seoul', notes: '', lat: '37.3447', lng: '126.9683' },
    { date: '2026-04-06', time: '', activity: 'Namsan Cable Car?', location: 'Namsan', notes: '', lat: '37.5564', lng: '126.9904' },
    { date: '2026-04-06', time: '', activity: 'Lunch with DK\'s aunts', location: '', notes: '' },
    { date: '2026-04-06', time: '', activity: 'Trick Eye Museum?', location: '', notes: '', lat: '37.5537', lng: '126.9215' },
    { date: '2026-04-06', time: '16:30', activity: 'Get to Airbnb', location: 'Seoul Airbnb', notes: 'Arrive ~16:30-17:00' },

    // Kim Family — Tue 4/7
    { date: '2026-04-07', time: '', activity: 'Seoul Forest (rent bikes)', location: 'Seoul Forest', notes: '', lat: '37.5443', lng: '127.0374' },
    { date: '2026-04-07', time: '', activity: 'Explore Seongsu', location: 'Seongsu-dong', notes: '', lat: '37.5445', lng: '127.056' },
    { date: '2026-04-07', time: '18:00', activity: 'Dinner with House Crew', location: '', notes: '' },
    { date: '2026-04-07', time: '20:00', activity: 'Hongjecheon Artificial Waterfall?', location: 'Hongjecheon', notes: '' },

    // Kim Family — Wed 4/8
    { date: '2026-04-08', time: '', activity: 'Bukchon Hanok Village', location: 'Bukchon', notes: '', lat: '37.5826', lng: '126.9836' },
    { date: '2026-04-08', time: '', activity: 'Insadong/Ikseondong (자개거울/노리개키링 만들기)', location: 'Insadong / Ikseondong', notes: 'Mother-of-pearl mirror / norigae keyring crafts', lat: '37.5741', lng: '126.9854' },
    { date: '2026-04-08', time: '', activity: 'Ssamzigil (1-2 hrs)', location: 'Ssamzigil, Insadong', notes: '', lat: '37.5741', lng: '126.9854' },
    { date: '2026-04-08', time: '', activity: 'Myeongdong Cathedral or Museum?', location: 'Myeongdong', notes: '', lat: '37.5632', lng: '126.9873' },
    { date: '2026-04-08', time: '18:00', activity: 'Dinner with House Crew', location: '', notes: '' },

    // Kim Family — Thu 4/9
    { date: '2026-04-09', time: '', activity: 'Gyeongbokgung Palace w/ hanbok rental', location: 'Gyeongbokgung', notes: '', lat: '37.5796', lng: '126.977' },
    { date: '2026-04-09', time: '', activity: 'Gwanghwamun', location: 'Gwanghwamun Square', notes: '', lat: '37.5758', lng: '126.9769' },
    { date: '2026-04-09', time: '', activity: 'Cheonggyecheon', location: 'Cheonggyecheon Stream', notes: '', lat: '37.5696', lng: '126.9784' },
    { date: '2026-04-09', time: '', activity: 'Myeongdong Cathedral or Museum?', location: 'Myeongdong', notes: '', lat: '37.5632', lng: '126.9873' },
    { date: '2026-04-09', time: '18:00', activity: 'Dinner with DK\'s aunt & cousins', location: '', notes: '' },

    // Kim Family — Fri 4/10
    { date: '2026-04-10', time: '11:00', activity: 'Check out of Airbnb', location: 'Seoul Airbnb', notes: '' },
    { date: '2026-04-10', time: '12:30', activity: 'Seoul → Gyeongju (with cousins)', location: 'Seoul → Gyeongju', notes: '', lat: '35.8392', lng: '129.213' },

    // Kim Family — Sat 4/11
    { date: '2026-04-11', time: '', activity: 'Explore Gyeongju', location: 'Gyeongju', notes: '', lat: '35.8392', lng: '129.213' },

    // Kim Family — Sun 4/12
    { date: '2026-04-12', time: '', activity: 'Travel Gyeongju → Busan', location: 'Gyeongju → Busan', notes: '', lat: '35.8392', lng: '129.213' },
    { date: '2026-04-12', time: '', activity: 'Lunch with DK\'s uncle', location: 'Busan', notes: '' },
    { date: '2026-04-12', time: '', activity: 'Check into Haeundae Westin Josun Busan', location: 'Haeundae Westin Josun Busan', notes: '', lat: '35.1554', lng: '129.153' },

    // Kim Family — Mon 4/13
    { date: '2026-04-13', time: '', activity: 'Blueline Capsule Train', location: 'Haeundae, Busan', notes: '', lat: '35.1595', lng: '129.1673' },
    { date: '2026-04-13', time: '', activity: 'Skyline Luge', location: 'Busan', notes: '', lat: '35.1883', lng: '129.2223' },
    { date: '2026-04-13', time: '', activity: 'Beach!', location: 'Haeundae Beach', notes: '', lat: '35.1554', lng: '129.153' },

    // Kim Family — Tue 4/14
    { date: '2026-04-14', time: '', activity: 'Gamcheon Cultural Village', location: 'Gamcheon, Busan', notes: '', lat: '35.0975', lng: '129.0097' },
    { date: '2026-04-14', time: '', activity: 'Jagalchi Market', location: 'Jagalchi, Busan', notes: '', lat: '35.0967', lng: '129.0306' },
    { date: '2026-04-14', time: '', activity: 'Arte Museum Busan', location: 'Busan', notes: '', lat: '35.0864', lng: '129.0664' },

    // Kim Family — Wed 4/15
    { date: '2026-04-15', time: '', activity: 'Travel Busan → Suwon', location: 'Busan → Suwon', notes: '' },
    { date: '2026-04-15', time: '', activity: 'Lunch with P\'s cousins from Japan', location: 'Suwon', notes: '' },
    { date: '2026-04-15', time: '', activity: 'Suwon Starfield?', location: 'Suwon Starfield', notes: '', lat: '37.2885', lng: '126.9912' },
    { date: '2026-04-15', time: '', activity: 'Travel Suwon → Seoul, check into Airbnb', location: 'Seoul Airbnb', notes: '' },

    // Kim Family — Thu 4/16
    { date: '2026-04-16', time: '', activity: 'Last day shopping & sightseeing', location: 'Seoul', notes: 'Whatever else we didn\'t get to do' },
    { date: '2026-04-16', time: '', activity: 'Cheongwadae Sarangchae', location: 'Cheongwadae', notes: '', lat: '37.5829', lng: '126.973' },

    // Kim Family — Fri 4/17
    { date: '2026-04-17', time: '', activity: 'Flight ICN → SFO', location: 'Incheon Airport', notes: '', lat: '37.4602', lng: '126.4407' },
  ],
}

export const SEED_TRIP_DATES = {
  start: '2026-03-30',
  end: '2026-04-17',
}
