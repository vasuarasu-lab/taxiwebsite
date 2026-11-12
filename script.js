/* =========================================================
   MANJAL TAXI – Tamil Nadu taxi booking
   script.js (Vanilla JavaScript, no dependencies)
   ---------------------------------------------------------
   1.  Business configuration  ← edit this first
   2.  Vehicles, trip types, pricing
   3.  Location dataset (38 districts + Puducherry)
   4.  Helpers (DOM, formatting, distance, fare)
   5.  Preloader
   6.  Header, navigation, active links
   7.  Scroll reveal & counters
   8.  Searchable location combobox
   9.  Vehicle cards & rate table
   10. Booking form (validation, summary, email)
   11. Fare calculator
   12. Popular routes
   13. Highlights carousel
   14. Contact form & WhatsApp
   15. Modals, toast, back-to-top
   16. Init
   ========================================================= */

'use strict';

/* ---------------------------------------------------------
   1. BUSINESS CONFIGURATION – change these values only here.
   They are applied automatically to every link and label
   marked with data-config / data-link in index.html.
   --------------------------------------------------------- */
const CONFIG = {
  businessName: 'Manjal Taxi',
  businessEmail: 'bookings@yourdomain.com',   // [INSERT BUSINESS EMAIL ADDRESS]
  phoneDisplay: '+91 98765 43210',            // shown on the page
  phoneDial: '+919876543210',                 // used in tel: links
  whatsappNumber: '919876543210',             // country code + number, digits only
  // Pricing rules
  minimumFare: 500,
  roadFactor: 1.25,      // straight-line km × this = approximate road km
  defaultGhatKm: 25,     // extra km for winding ghat roads to a hill station (see GHAT_EXTRA_KM)
  fareRoundTo: 10        // round estimated fares to the nearest ₹10
};

/* ---------------------------------------------------------
   2. VEHICLES & TRIP TYPES
   --------------------------------------------------------- */
const VEHICLES = [
  { key: 'hatchback', name: 'Hatchback', rate: 12, seats: 4, examples: 'Swift, i10',
    path: 'M8 36 L8 28 Q10 24 18 23 L34 22 L46 10 Q48 8 52 8 L82 8 Q88 8 90 14 L96 24 L108 27 Q112 28 112 32 L112 36 Z' },
  { key: 'sedan', name: 'Sedan', rate: 14, seats: 4, examples: 'Dzire, Etios',
    path: 'M4 36 L4 29 Q6 25 14 24 L32 23 L44 11 Q46 9 50 9 L76 9 Q81 9 84 13 L92 23 L110 26 Q115 27 115 32 L115 36 Z' },
  { key: 'suv', name: 'SUV', rate: 18, seats: 6, examples: 'Ertiga, XUV',
    path: 'M6 36 L6 22 Q6 16 12 15 L22 14 L30 6 Q32 4 36 4 L96 4 Q102 4 104 10 L108 18 Q114 19 114 26 L114 36 Z' },
  { key: 'innova', name: 'Innova', rate: 20, seats: 7, examples: 'Innova Crysta',
    path: 'M5 36 L5 24 Q6 18 13 17 L24 16 L36 6 Q38 4 42 4 L94 4 Q100 4 104 12 L107 19 L112 22 Q115 23 115 28 L115 36 Z' },
  { key: 'tempo', name: 'Tempo Traveller', rate: 25, seats: 12, examples: '12-seater',
    path: 'M4 36 L4 8 Q4 3 10 3 L94 3 Q100 3 104 10 L112 22 Q115 24 115 30 L115 36 Z' }
];

const TRIP_TYPES = {
  oneway:  'One Way',
  round:   'Round Trip',
  local:   'Local Rental',
  airport: 'Airport Transfer'
};

/* Highlights carousel content.
   These are service commitments, not customer reviews.
   When you collect genuine reviews, replace with { text, by } objects,
   e.g. { text: 'Driver was on time…', by: 'Priya, Coimbatore' }. */
const HIGHLIGHTS = [
  { text: 'See an estimated fare before you send your enquiry, worked out from the same per-km rates shown on this page.', by: 'Know the fare first' },
  { text: 'Every enquiry is followed by a phone call to confirm the car, the driver and the pickup point.', by: 'A real person confirms your trip' },
  { text: 'Choose from a hatchback for one, up to a 12-seater Tempo Traveller for the whole family.', by: 'The right car for the group' },
  { text: 'Airport runs, temple circuits, hill-station drives and district-to-district trips across Tamil Nadu.', by: 'One service for every kind of trip' }
];

/* ---------------------------------------------------------
   3. LOCATION DATASET
   Format per entry: [name, type, latitude, longitude, aliases?]
   Types: city | town | tourist | hill | rail | airport | bus
   To add a place, append a row to its district. Coordinates are
   approximate centre points (decimal degrees).
   --------------------------------------------------------- */
const DISTRICTS = {
  'Ariyalur': [
    ['Ariyalur', 'city', 11.1401, 79.0786],
    ['Jayankondam', 'town', 11.2120, 79.3640],
    ['Sendurai', 'town', 11.2537, 79.1756],
    ['Gangaikonda Cholapuram', 'tourist', 11.2063, 79.4486],
    ['Ariyalur Railway Station', 'rail', 11.1370, 79.0750]
  ],
  'Chengalpattu': [
    ['Chengalpattu', 'city', 12.6921, 79.9707],
    ['Tambaram', 'city', 12.9249, 80.1000],
    ['Guduvanchery', 'town', 12.8455, 80.0606],
    ['Kelambakkam', 'town', 12.7869, 80.2196],
    ['Madurantakam', 'town', 12.5106, 79.8854],
    ['Mahabalipuram', 'tourist', 12.6208, 80.1945, 'Mamallapuram'],
    ['Vedanthangal Bird Sanctuary', 'tourist', 12.5450, 79.8560],
    ['Chengalpattu Junction', 'rail', 12.6936, 79.9771],
    ['Tambaram Railway Station', 'rail', 12.9246, 80.1179],
    ['Kilambakkam Bus Terminus', 'bus', 12.8705, 80.0817, 'KCBT']
  ],
  'Chennai': [
    ['Chennai City Centre', 'city', 13.0827, 80.2707, 'Madras'],
    ['T. Nagar', 'town', 13.0418, 80.2341, 'Thyagaraya Nagar'],
    ['Anna Nagar', 'town', 13.0850, 80.2101],
    ['Adyar', 'town', 13.0012, 80.2565],
    ['Velachery', 'town', 12.9815, 80.2180],
    ['Guindy', 'town', 13.0067, 80.2206],
    ['Mylapore', 'town', 13.0339, 80.2619],
    ['Marina Beach', 'tourist', 13.0500, 80.2824],
    ['Chennai Central Railway Station', 'rail', 13.0827, 80.2757, 'MGR Central'],
    ['Chennai Egmore Railway Station', 'rail', 13.0780, 80.2610],
    ['Chennai International Airport', 'airport', 12.9941, 80.1709, 'Meenambakkam MAA'],
    ['Koyambedu Bus Terminus (CMBT)', 'bus', 13.0694, 80.1948, 'CMBT']
  ],
  'Coimbatore': [
    ['Coimbatore', 'city', 11.0168, 76.9558, 'Kovai'],
    ['Pollachi', 'town', 10.6609, 77.0048],
    ['Mettupalayam', 'town', 11.2990, 76.9346],
    ['Valparai', 'hill', 10.3270, 76.9554],
    ['Isha Yoga Centre', 'tourist', 10.9746, 76.7357, 'Adiyogi Velliangiri'],
    ['Marudhamalai Temple', 'tourist', 11.0461, 76.8521],
    ['Coimbatore Junction', 'rail', 10.9965, 76.9670],
    ['Coimbatore International Airport', 'airport', 11.0300, 77.0434, 'CJB Peelamedu'],
    ['Gandhipuram Bus Stand', 'bus', 11.0183, 76.9674]
  ],
  'Cuddalore': [
    ['Cuddalore', 'city', 11.7480, 79.7714],
    ['Chidambaram', 'tourist', 11.3993, 79.6936, 'Nataraja Temple'],
    ['Neyveli', 'town', 11.5432, 79.4768],
    ['Virudhachalam', 'town', 11.5196, 79.3253],
    ['Panruti', 'town', 11.7766, 79.5524],
    ['Pichavaram Mangrove Forest', 'tourist', 11.4290, 79.7820],
    ['Cuddalore Port Junction', 'rail', 11.7206, 79.7647]
  ],
  'Dharmapuri': [
    ['Dharmapuri', 'city', 12.1211, 78.1582],
    ['Harur', 'town', 12.0520, 78.4822],
    ['Palacode', 'town', 12.3045, 78.0718],
    ['Hogenakkal Falls', 'tourist', 12.1172, 77.7766],
    ['Dharmapuri Railway Station', 'rail', 12.1310, 78.1600]
  ],
  'Dindigul': [
    ['Dindigul', 'city', 10.3673, 77.9803],
    ['Kodaikanal', 'hill', 10.2381, 77.4892, 'Kodai'],
    ['Palani', 'tourist', 10.4500, 77.5200, 'Pazhani Murugan Temple'],
    ['Oddanchatram', 'town', 10.4867, 77.7514],
    ['Batlagundu', 'town', 10.1636, 77.7586],
    ['Dindigul Junction', 'rail', 10.3620, 77.9750]
  ],
  'Erode': [
    ['Erode', 'city', 11.3410, 77.7172],
    ['Bhavani', 'town', 11.4448, 77.6823],
    ['Gobichettipalayam', 'town', 11.4550, 77.4420, 'Gobi'],
    ['Sathyamangalam', 'town', 11.5049, 77.2384],
    ['Perundurai', 'town', 11.2755, 77.5873],
    ['Kodiveri Dam', 'tourist', 11.4766, 77.3013],
    ['Erode Junction', 'rail', 11.3283, 77.7067]
  ],
  'Kallakurichi': [
    ['Kallakurichi', 'city', 11.7380, 78.9590],
    ['Ulundurpet', 'town', 11.6926, 79.2876],
    ['Tirukoilur', 'town', 11.9670, 79.2020],
    ['Sankarapuram', 'town', 11.8880, 78.9150],
    ['Chinnasalem', 'town', 11.6340, 78.8730],
    ['Kalvarayan Hills', 'hill', 11.8500, 78.7800]
  ],
  'Kancheepuram': [
    ['Kanchipuram', 'city', 12.8342, 79.7036, 'Kancheepuram Kanchi'],
    ['Sriperumbudur', 'town', 12.9675, 79.9419],
    ['Oragadam', 'town', 12.8360, 79.9560],
    ['Walajabad', 'town', 12.7900, 79.8230],
    ['Uthiramerur', 'town', 12.6150, 79.7550],
    ['Kailasanathar Temple', 'tourist', 12.8423, 79.6918],
    ['Kanchipuram Railway Station', 'rail', 12.8380, 79.7090]
  ],
  'Kanniyakumari': [
    ['Kanyakumari', 'tourist', 8.0883, 77.5385, 'Kanniyakumari Cape Comorin Vivekananda Rock'],
    ['Nagercoil', 'city', 8.1833, 77.4119],
    ['Marthandam', 'town', 8.3080, 77.2210],
    ['Colachel', 'town', 8.1780, 77.2580],
    ['Padmanabhapuram Palace', 'tourist', 8.2500, 77.3260],
    ['Thiruparappu Falls', 'tourist', 8.3890, 77.2570],
    ['Nagercoil Junction', 'rail', 8.1890, 77.4430],
    ['Kanyakumari Railway Station', 'rail', 8.0860, 77.5420]
  ],
  'Karur': [
    ['Karur', 'city', 10.9601, 78.0766],
    ['Kulithalai', 'town', 10.9360, 78.4210],
    ['Aravakurichi', 'town', 10.7760, 77.9070],
    ['Pugalur', 'town', 11.0670, 77.9910],
    ['Karur Junction', 'rail', 10.9550, 78.0820]
  ],
  'Krishnagiri': [
    ['Krishnagiri', 'city', 12.5186, 78.2137],
    ['Hosur', 'city', 12.7409, 77.8253],
    ['Denkanikottai', 'town', 12.5300, 77.7700],
    ['Uthangarai', 'town', 12.2640, 78.5350],
    ['Krishnagiri Dam', 'tourist', 12.4740, 78.1800],
    ['Hosur Railway Station', 'rail', 12.7390, 77.8320]
  ],
  'Madurai': [
    ['Madurai', 'city', 9.9252, 78.1198],
    ['Melur', 'town', 10.0320, 78.3380],
    ['Thirumangalam', 'town', 9.8220, 77.9860],
    ['Usilampatti', 'town', 9.9650, 77.7880],
    ['Meenakshi Amman Temple', 'tourist', 9.9195, 78.1193],
    ['Alagar Kovil', 'tourist', 10.0720, 78.2140],
    ['Madurai Junction', 'rail', 9.9195, 78.1097],
    ['Madurai Airport', 'airport', 9.8345, 78.0934, 'IXM'],
    ['Mattuthavani Bus Stand', 'bus', 9.9440, 78.1570, 'MGR Bus Stand']
  ],
  'Mayiladuthurai': [
    ['Mayiladuthurai', 'city', 11.1018, 79.6522, 'Mayavaram'],
    ['Sirkazhi', 'town', 11.2380, 79.7360],
    ['Vaitheeswaran Koil', 'tourist', 11.1950, 79.7110],
    ['Tharangambadi', 'tourist', 11.0270, 79.8540, 'Tranquebar'],
    ['Poompuhar', 'tourist', 11.1430, 79.8550],
    ['Mayiladuthurai Junction', 'rail', 11.1030, 79.6580]
  ],
  'Nagapattinam': [
    ['Nagapattinam', 'city', 10.7672, 79.8449],
    ['Velankanni', 'tourist', 10.6800, 79.8510, 'Vailankanni'],
    ['Nagore', 'tourist', 10.8220, 79.8380, 'Nagore Dargah'],
    ['Vedaranyam', 'town', 10.3730, 79.8510],
    ['Kodiakkarai (Point Calimere)', 'tourist', 10.2950, 79.8550],
    ['Nagapattinam Railway Station', 'rail', 10.7660, 79.8380]
  ],
  'Namakkal': [
    ['Namakkal', 'city', 11.2189, 78.1674],
    ['Tiruchengode', 'town', 11.3800, 77.8940],
    ['Rasipuram', 'town', 11.4600, 78.1840],
    ['Paramathi Velur', 'town', 11.1050, 78.0050],
    ['Kolli Hills', 'hill', 11.2480, 78.3380, 'Kollimalai'],
    ['Namakkal Railway Station', 'rail', 11.2280, 78.1650]
  ],
  'Nilgiris': [
    ['Ooty (Udhagamandalam)', 'hill', 11.4102, 76.6950, 'Ooty Udhagamandalam Ootacamund'],
    ['Coonoor', 'hill', 11.3530, 76.7959],
    ['Kotagiri', 'hill', 11.4210, 76.8610],
    ['Gudalur', 'hill', 11.5030, 76.4910],
    ['Doddabetta Peak', 'hill', 11.4020, 76.7360],
    ['Pykara', 'hill', 11.4550, 76.6020],
    ['Mudumalai Tiger Reserve', 'hill', 11.5660, 76.5340],
    ['Udhagamandalam Railway Station', 'rail', 11.4040, 76.6980, 'Ooty station']
  ],
  'Perambalur': [
    ['Perambalur', 'city', 11.2342, 78.8807],
    ['Kunnam', 'town', 11.3140, 79.0420],
    ['Veppanthattai', 'town', 11.3170, 78.8180],
    ['Siruvachur Madhura Kaliamman Temple', 'tourist', 11.1760, 78.8400],
    ['Ranjankudi Fort', 'tourist', 11.3440, 78.9080]
  ],
  'Pudukkottai': [
    ['Pudukkottai', 'city', 10.3833, 78.8001],
    ['Aranthangi', 'town', 10.1700, 78.9900],
    ['Viralimalai', 'town', 10.6020, 78.5470],
    ['Avudaiyarkoil', 'town', 10.0750, 79.0430],
    ['Sittannavasal', 'tourist', 10.4580, 78.7250],
    ['Thirumayam Fort', 'tourist', 10.2470, 78.7520],
    ['Pudukkottai Railway Station', 'rail', 10.3800, 78.8130]
  ],
  'Ramanathapuram': [
    ['Ramanathapuram', 'city', 9.3639, 78.8395, 'Ramnad'],
    ['Rameswaram', 'tourist', 9.2876, 79.3129, 'Ramanathaswamy Temple'],
    ['Dhanushkodi', 'tourist', 9.1770, 79.4180],
    ['Pamban Bridge', 'tourist', 9.2820, 79.2030],
    ['Paramakudi', 'town', 9.5430, 78.5910],
    ['Kilakarai', 'town', 9.2320, 78.7840],
    ['Rameswaram Railway Station', 'rail', 9.2870, 79.3070]
  ],
  'Ranipet': [
    ['Ranipet', 'city', 12.9480, 79.3190],
    ['Arcot', 'town', 12.9050, 79.3190],
    ['Walajapet', 'town', 12.9250, 79.3660],
    ['Arakkonam', 'town', 13.0840, 79.6700],
    ['Sholinghur', 'tourist', 13.1140, 79.4210, 'Sholingur Narasimha Temple'],
    ['Arakkonam Junction', 'rail', 13.0790, 79.6670]
  ],
  'Salem': [
    ['Salem', 'city', 11.6643, 78.1460],
    ['Mettur', 'town', 11.7860, 77.8010, 'Mettur Dam'],
    ['Attur', 'town', 11.5940, 78.6010],
    ['Omalur', 'town', 11.7440, 78.0460],
    ['Yercaud', 'hill', 11.7753, 78.2093],
    ['Salem Junction', 'rail', 11.6720, 78.1180],
    ['Salem Airport', 'airport', 11.7830, 78.0656, 'Kamalapuram SXV'],
    ['Salem New Bus Stand', 'bus', 11.6720, 78.1400]
  ],
  'Sivaganga': [
    ['Sivaganga', 'city', 9.8433, 78.4809],
    ['Karaikudi', 'city', 10.0700, 78.7800],
    ['Devakottai', 'town', 9.9470, 78.8230],
    ['Kalayarkoil', 'town', 9.8460, 78.6330],
    ['Chettinad (Kanadukathan)', 'tourist', 10.1600, 78.7800, 'Chettinad'],
    ['Pillayarpatti', 'tourist', 10.1190, 78.6790],
    ['Karaikudi Junction', 'rail', 10.0750, 78.7830]
  ],
  'Tenkasi': [
    ['Tenkasi', 'city', 8.9590, 77.3152],
    ['Courtallam', 'tourist', 8.9340, 77.2780, 'Kutralam Falls'],
    ['Sankarankovil', 'town', 9.1710, 77.5430],
    ['Kadayanallur', 'town', 9.0740, 77.3410],
    ['Puliyangudi', 'town', 9.1730, 77.3950],
    ['Shencottai', 'town', 8.9730, 77.2460, 'Sengottai'],
    ['Tenkasi Junction', 'rail', 8.9550, 77.3130]
  ],
  'Thanjavur': [
    ['Thanjavur', 'city', 10.7870, 79.1378, 'Tanjore'],
    ['Kumbakonam', 'city', 10.9617, 79.3881],
    ['Pattukkottai', 'town', 10.4230, 79.3190],
    ['Swamimalai', 'tourist', 10.9570, 79.3260],
    ['Darasuram Airavatesvara Temple', 'tourist', 10.9480, 79.3560],
    ['Brihadeeswarar Temple', 'tourist', 10.7828, 79.1318, 'Big Temple'],
    ['Thanjavur Junction', 'rail', 10.7820, 79.1340],
    ['Kumbakonam Railway Station', 'rail', 10.9690, 79.3940]
  ],
  'Theni': [
    ['Theni', 'city', 10.0104, 77.4768],
    ['Bodinayakanur', 'town', 10.0110, 77.3510, 'Bodi'],
    ['Cumbum', 'town', 9.7380, 77.2820, 'Kambam'],
    ['Periyakulam', 'town', 10.1200, 77.5470],
    ['Andipatti', 'town', 9.9970, 77.6210],
    ['Vaigai Dam', 'tourist', 10.0530, 77.5850],
    ['Suruli Falls', 'tourist', 9.6420, 77.3010],
    ['Meghamalai', 'hill', 9.6800, 77.4000]
  ],
  'Thoothukudi': [
    ['Thoothukudi', 'city', 8.7642, 78.1348, 'Tuticorin'],
    ['Tiruchendur', 'tourist', 8.4960, 78.1250, 'Tiruchendur Murugan Temple'],
    ['Kovilpatti', 'town', 9.1720, 77.8710],
    ['Kayalpattinam', 'town', 8.5700, 78.1180],
    ['Ettayapuram', 'town', 9.1470, 78.0060],
    ['Thoothukudi Railway Station', 'rail', 8.8030, 78.1450, 'Tuticorin station'],
    ['Thoothukudi Airport', 'airport', 8.7230, 78.0260, 'Tuticorin Vagaikulam TCR']
  ],
  'Tiruchirappalli': [
    ['Tiruchirappalli', 'city', 10.7905, 78.7047, 'Trichy Tiruchi'],
    ['Srirangam', 'tourist', 10.8620, 78.6930, 'Ranganathaswamy Temple'],
    ['Rockfort Temple', 'tourist', 10.8280, 78.6970, 'Malaikottai'],
    ['Manapparai', 'town', 10.6060, 78.4240],
    ['Thuraiyur', 'town', 11.1440, 78.5990],
    ['Lalgudi', 'town', 10.8740, 78.8180],
    ['Tiruchirappalli Junction', 'rail', 10.7970, 78.6850, 'Trichy Junction'],
    ['Tiruchirappalli International Airport', 'airport', 10.7654, 78.7097, 'Trichy Airport TRZ'],
    ['Trichy Central Bus Stand', 'bus', 10.7980, 78.6800],
    ['Chathiram Bus Stand', 'bus', 10.8310, 78.6930]
  ],
  'Tirunelveli': [
    ['Tirunelveli', 'city', 8.7139, 77.7567, 'Nellai'],
    ['Ambasamudram', 'town', 8.7050, 77.4520],
    ['Valliyur', 'town', 8.3850, 77.6100],
    ['Nanguneri', 'town', 8.4910, 77.6560],
    ['Nellaiappar Temple', 'tourist', 8.7286, 77.6874],
    ['Papanasam', 'tourist', 8.7130, 77.3700],
    ['Manimuthar Falls', 'tourist', 8.6220, 77.4200],
    ['Tirunelveli Junction', 'rail', 8.7290, 77.7080]
  ],
  'Tirupathur': [
    ['Tirupathur', 'city', 12.4960, 78.5730],
    ['Vaniyambadi', 'town', 12.6820, 78.6200],
    ['Ambur', 'town', 12.7910, 78.7160],
    ['Natrampalli', 'town', 12.5850, 78.5100],
    ['Yelagiri Hills', 'hill', 12.5780, 78.6400, 'Yelagiri'],
    ['Jolarpettai Junction', 'rail', 12.5650, 78.5770]
  ],
  'Tiruppur': [
    ['Tiruppur', 'city', 11.1085, 77.3411, 'Tirupur'],
    ['Avinashi', 'town', 11.1920, 77.2690],
    ['Palladam', 'town', 10.9910, 77.2840],
    ['Dharapuram', 'town', 10.7380, 77.5310],
    ['Udumalaipettai', 'town', 10.5850, 77.2470, 'Udumalpet'],
    ['Kangeyam', 'town', 11.0060, 77.5620],
    ['Thirumoorthy Falls', 'tourist', 10.4580, 77.1640],
    ['Amaravathi Dam', 'tourist', 10.4100, 77.2600],
    ['Tiruppur Railway Station', 'rail', 11.1080, 77.3410]
  ],
  'Tiruvallur': [
    ['Tiruvallur', 'city', 13.1439, 79.9081, 'Thiruvallur'],
    ['Avadi', 'city', 13.1147, 80.1098],
    ['Poonamallee', 'town', 13.0480, 80.0940],
    ['Ponneri', 'town', 13.3380, 80.1950],
    ['Gummidipoondi', 'town', 13.4070, 80.1100],
    ['Tiruttani', 'tourist', 13.1750, 79.6160, 'Thiruthani Murugan Temple'],
    ['Pulicat', 'tourist', 13.4170, 80.3170, 'Pazhaverkadu'],
    ['Tiruvallur Railway Station', 'rail', 13.1440, 79.9110]
  ],
  'Tiruvannamalai': [
    ['Tiruvannamalai', 'city', 12.2253, 79.0747, 'Thiruvannamalai'],
    ['Annamalaiyar Temple', 'tourist', 12.2310, 79.0680, 'Arunachaleswarar'],
    ['Ramana Maharshi Ashram', 'tourist', 12.2228, 79.0616],
    ['Arani', 'town', 12.6680, 79.2850],
    ['Cheyyar', 'town', 12.6620, 79.5430],
    ['Polur', 'town', 12.5110, 79.1250],
    ['Vandavasi', 'town', 12.5040, 79.6200],
    ['Jawadhu Hills', 'hill', 12.5800, 78.8700],
    ['Tiruvannamalai Railway Station', 'rail', 12.2310, 79.0790]
  ],
  'Tiruvarur': [
    ['Tiruvarur', 'city', 10.7724, 79.6368, 'Thiruvarur'],
    ['Mannargudi', 'town', 10.6650, 79.4510],
    ['Thiruthuraipoondi', 'town', 10.5300, 79.6370],
    ['Muthupet', 'town', 10.3980, 79.4940],
    ['Koothanallur', 'town', 10.7210, 79.5160],
    ['Thyagaraja Temple', 'tourist', 10.7740, 79.6350],
    ['Tiruvarur Junction', 'rail', 10.7720, 79.6420]
  ],
  'Vellore': [
    ['Vellore', 'city', 12.9165, 79.1325],
    ['Gudiyatham', 'town', 12.9440, 78.8720],
    ['Pernambut', 'town', 12.9390, 78.7170],
    ['Vellore Fort', 'tourist', 12.9210, 79.1290],
    ['Sripuram Golden Temple', 'tourist', 12.8730, 79.0890],
    ['CMC Hospital Vellore', 'town', 12.9250, 79.1350, 'Christian Medical College'],
    ['Katpadi Junction', 'rail', 12.9700, 79.1450]
  ],
  'Viluppuram': [
    ['Viluppuram', 'city', 11.9401, 79.4861, 'Villupuram'],
    ['Tindivanam', 'town', 12.2340, 79.6550],
    ['Marakkanam', 'town', 12.1920, 79.9460],
    ['Gingee Fort', 'tourist', 12.2560, 79.4040, 'Senji'],
    ['Auroville', 'tourist', 12.0070, 79.8100],
    ['Viluppuram Junction', 'rail', 11.9420, 79.4900]
  ],
  'Virudhunagar': [
    ['Virudhunagar', 'city', 9.5851, 77.9624],
    ['Sivakasi', 'city', 9.4533, 77.8024],
    ['Rajapalayam', 'city', 9.4510, 77.5560],
    ['Srivilliputhur', 'tourist', 9.5120, 77.6330, 'Andal Temple'],
    ['Aruppukottai', 'town', 9.5090, 78.0960],
    ['Sattur', 'town', 9.3550, 77.9240],
    ['Virudhunagar Junction', 'rail', 9.5810, 77.9600],
    ['Rajapalayam Railway Station', 'rail', 9.4530, 77.5530]
  ]
};

/* Nearby places outside Tamil Nadu that customers commonly travel to.
   Kept separate so the district count stays accurate. */
const NEARBY = {
  'Puducherry': [
    ['Puducherry', 'city', 11.9416, 79.8083, 'Pondicherry Pondy'],
    ['Karaikal', 'town', 10.9254, 79.8380],
    ['Puducherry Railway Station', 'rail', 11.9330, 79.8290, 'Pondicherry station']
  ]
};

/* Extra road km added when one end of a trip is a hill station.
   Ghat roads wind far more than the 1.25 multiplier allows for.
   Hill locations not listed here use CONFIG.defaultGhatKm. */
const GHAT_EXTRA_KM = {
  'Ooty (Udhagamandalam)': 30, 'Udhagamandalam Railway Station': 30, 'Coonoor': 20, 'Kotagiri': 25,
  'Gudalur': 35, 'Doddabetta Peak': 30, 'Pykara': 35, 'Mudumalai Tiger Reserve': 35,
  'Kodaikanal': 40, 'Valparai': 35, 'Yercaud': 15, 'Yelagiri Hills': 10, 'Kolli Hills': 25,
  'Meghamalai': 30, 'Kalvarayan Hills': 20, 'Jawadhu Hills': 20
};

const TYPE_LABELS = {
  city: 'City', town: 'Town', tourist: 'Tourist spot', hill: 'Hill station',
  rail: 'Railway station', airport: 'Airport', bus: 'Bus terminus'
};

/* Small icon per location type, used in the dropdown */
const TYPE_ICONS = {
  city: '<path d="M4 21V9h6v12M10 21V4h8v17M2 21h20"/>',
  town: '<path d="M3 21V11l6-5 6 5v10M15 21v-6h6v6M2 21h20"/>',
  tourist: '<path d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z"/>',
  hill: '<path d="M2 20l7-11 4 6 3-4 6 9z"/>',
  rail: '<rect x="6" y="3" width="12" height="13" rx="3"/><path d="M6 11h12M9 20l-2 2M15 20l2 2M9 16v4M15 16v4"/>',
  airport: '<path d="M3 14l18-7c1.5-.5 2 1 1 1.6L15 13l-2 7-2 .5.5-6-4.5 1.5-1.5 2.5-1.5.5.5-3.5z"/>',
  bus: '<rect x="4" y="3" width="16" height="15" rx="3"/><path d="M4 11h16M7 21v-3M17 21v-3"/>',
  custom: '<path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z"/><path d="M12 7v5M9.5 9.5h5"/>'
};

/* Build one flat, searchable list with stable IDs like "madurai--madurai-junction" */
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function buildLocations() {
  const list = [];
  const addGroup = (group, isNearby) => {
    Object.entries(group).forEach(([district, rows]) => {
      rows.forEach(([name, type, lat, lng, aliases = '']) => {
        list.push({
          id: `${slug(district)}--${slug(name)}`,
          name, district, type, lat, lng,
          hill: type === 'hill' || GHAT_EXTRA_KM[name] !== undefined,
          ghatKm: GHAT_EXTRA_KM[name] ?? (type === 'hill' ? CONFIG.defaultGhatKm : 0),
          nameLC: name.toLowerCase(),
          aliasLC: aliases.toLowerCase(),
          nearby: isNearby,
          label: `${name}, ${district}`,
          search: `${name} ${district} ${aliases} ${TYPE_LABELS[type]}`.toLowerCase()
        });
      });
    });
  };
  addGroup(DISTRICTS, false);
  addGroup(NEARBY, true);
  return list;
}

const LOCATIONS = buildLocations();
const LOCATION_BY_ID = new Map(LOCATIONS.map((l) => [l.id, l]));

/* ---------------------------------------------------------
   4. HELPERS
   --------------------------------------------------------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const prefersReducedMotion = () =>
  typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const inr = (n) => '₹' + Math.round(n).toLocaleString('en-IN');

const escapeHTML = (s) => String(s).replace(/[&<>"']/g, (c) =>
  ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const getVehicle = (key) => VEHICLES.find((v) => v.key === key) || VEHICLES[1];

/** Haversine: straight-line distance in km between two lat/lng points */
function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Estimate a trip.
 * @param {object|null} from  location object (or null for custom text)
 * @param {object|null} to    location object (or null for custom text)
 * @param {string} vehicleKey
 * @param {string} tripType   oneway | round | local | airport
 * @returns {{known:boolean, oneWayKm?:number, km?:number, fare?:number, rate:number, minApplied?:boolean}}
 */
function estimateTrip(from, to, vehicleKey, tripType) {
  const vehicle = getVehicle(vehicleKey);
  if (!from || !to) return { known: false, rate: vehicle.rate };

  const straight = haversineKm(from, to);
  let roadKm;
  if (from.hill && to.hill && from.district === to.district) {
    roadKm = straight * 2;                                   // short hops within the same hills
  } else {
    roadKm = straight * CONFIG.roadFactor + from.ghatKm + to.ghatKm;
  }
  const oneWayKm = Math.max(1, Math.round(roadKm));
  const km = tripType === 'round' ? oneWayKm * 2 : oneWayKm;
  const raw = km * vehicle.rate;
  const rounded = Math.ceil(raw / CONFIG.fareRoundTo) * CONFIG.fareRoundTo;
  const fare = Math.max(CONFIG.minimumFare, rounded);

  return { known: true, oneWayKm, km, fare, rate: vehicle.rate, minApplied: fare === CONFIG.minimumFare && rounded < CONFIG.minimumFare };
}

/** Count a number up inside an element */
function animateNumber(el, to, { prefix = '', suffix = '', duration = 900, format = (n) => Math.round(n).toLocaleString('en-IN') } = {}) {
  if (!el) return;
  if (prefersReducedMotion() || typeof requestAnimationFrame !== 'function') {
    el.textContent = prefix + format(to) + suffix;
    return;
  }
  const from = Number(el.dataset.current || 0);
  const start = performance.now();
  cancelAnimationFrame(el._raf);
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = prefix + format(from + (to - from) * eased) + suffix;
    if (t < 1) el._raf = requestAnimationFrame(tick);
    else el.dataset.current = to;
  };
  el._raf = requestAnimationFrame(tick);
}

function scrollToEl(el) {
  if (!el) return;
  if (typeof el.scrollIntoView === 'function') {
    el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' });
  }
}

/* ---------------------------------------------------------
   5. PRELOADER
   --------------------------------------------------------- */
function initPreloader() {
  const pre = $('#preloader');
  if (!pre) return;
  const hide = () => pre.classList.add('is-done');
  window.addEventListener('load', () => setTimeout(hide, 300));
  setTimeout(hide, 2500); // safety net on slow networks
}

/* ---------------------------------------------------------
   6. HEADER & NAVIGATION
   --------------------------------------------------------- */
function initNav() {
  const header = $('#site-header');
  const toggle = $('#nav-toggle');
  const menu = $('#nav-menu');
  if (!header || !toggle || !menu) return;

  const backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    menu.classList.toggle('is-open', open);
    backdrop.classList.toggle('is-visible', open);
    document.body.classList.toggle('is-locked', open);
  };

  toggle.addEventListener('click', () => setOpen(toggle.getAttribute('aria-expanded') !== 'true'));
  backdrop.addEventListener('click', () => setOpen(false));
  menu.addEventListener('click', (e) => { if (e.target.closest('a')) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
  window.addEventListener('resize', () => { if (window.innerWidth > 980) setOpen(false); });

  // Shadow on scroll + back-to-top visibility
  const toTop = $('#to-top');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 10);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Highlight the nav link for the section in view
  const links = $$('.nav__link');
  const sections = $$('main section[id]'); // all sections, so non-menu ones clear the highlight
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          links.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + entry.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
  }
}

/* ---------------------------------------------------------
   7. SCROLL REVEAL & COUNTERS
   --------------------------------------------------------- */
function initReveal() {
  // Stagger children of [data-stagger]
  $$('[data-stagger]').forEach((group) => {
    $$('.reveal', group).forEach((el, i) => el.style.setProperty('--d', i % 8));
  });

  const items = $$('.reveal');
  if (!('IntersectionObserver' in window) || prefersReducedMotion()) {
    document.documentElement.classList.add('no-io');
    items.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  items.forEach((el) => io.observe(el));
}

function initCounters() {
  // Real values taken from this site's own data
  const values = {
    districts: Object.keys(DISTRICTS).length,
    locations: LOCATIONS.length,
    vehicles: VEHICLES.length,
    hours: 24
  };
  const counters = $$('.counter');
  const run = (el) => animateNumber(el, values[el.dataset.stat] || 0, { suffix: el.dataset.suffix || '', duration: 1600 });

  if (!('IntersectionObserver' in window)) { counters.forEach(run); return; }
  const io = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) { run(entry.target); obs.unobserve(entry.target); }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => io.observe(el));
}

/* ---------------------------------------------------------
   8. SEARCHABLE LOCATION COMBOBOX
   Live search over LOCATIONS, keyboard navigation, and a
   "Use this location" option for places not in the list.
   --------------------------------------------------------- */
class LocationCombo {
  constructor(root, { onChange } = {}) {
    this.root = root;
    this.input = $('input', root);
    this.list = $('.combo__list', root);
    this.clearBtn = $('.combo__clear', root);
    this.onChange = onChange || (() => {});
    this.selected = null;   // location object from dataset
    this.custom = '';       // free text when not in dataset
    this.options = [];
    this.active = -1;
    this.bind();
  }

  bind() {
    this.input.addEventListener('input', () => {
      // Typing invalidates a previous dataset selection
      this.selected = null;
      this.custom = '';
      this.root.classList.toggle('has-value', this.input.value.length > 0);
      this.render(this.input.value);
      this.open();
      this.onChange(this);
    });
    this.input.addEventListener('focus', () => { this.render(this.input.value); this.open(); });
    this.input.addEventListener('keydown', (e) => this.onKey(e));
    this.input.addEventListener('blur', () => setTimeout(() => this.commitTyped(), 150));
    this.list.addEventListener('mousedown', (e) => e.preventDefault()); // keep focus while clicking
    this.list.addEventListener('click', (e) => {
      const li = e.target.closest('.combo__option');
      if (li) this.choose(Number(li.dataset.index));
    });
    this.clearBtn.addEventListener('click', () => { this.clear(); this.input.focus(); });
    document.addEventListener('click', (e) => { if (!this.root.contains(e.target)) this.close(); });
  }

  /** Rank matches: name starts-with first, then cities/major hubs, then the rest */
  search(q) {
    const query = q.trim().toLowerCase();
    if (!query) {
      // Default suggestions: district headquarters and airports
      return LOCATIONS.filter((l) => l.type === 'city' || l.type === 'airport').slice(0, 40);
    }
    const tokens = query.split(/\s+/);
    const typeRank = { city: 0, airport: 1, rail: 2, tourist: 3, hill: 3, bus: 4, town: 5 };
    return LOCATIONS
      .filter((l) => tokens.every((t) => l.search.includes(t)))
      .map((l) => {
        const n = l.nameLC;
        const aliasHit = l.aliasLC.split(/\s+/).some((a) => a.startsWith(tokens[0]));
        const nameScore = n.startsWith(query) ? 0 : aliasHit ? 3 : n.includes(query) ? 10 : 20;
        const score = nameScore + typeRank[l.type];
        return { l, score };
      })
      .sort((a, b) => a.score - b.score || a.l.name.localeCompare(b.l.name))
      .slice(0, 40)
      .map((x) => x.l);
  }

  highlight(text, q) {
    const safe = escapeHTML(text);
    const query = q.trim();
    if (!query) return safe;
    const i = text.toLowerCase().indexOf(query.toLowerCase());
    if (i < 0) return safe;
    return escapeHTML(text.slice(0, i)) + '<mark>' + escapeHTML(text.slice(i, i + query.length)) + '</mark>' + escapeHTML(text.slice(i + query.length));
  }

  render(q) {
    const results = this.search(q);
    const typed = q.trim();
    const exact = results.some((l) => l.name.toLowerCase() === typed.toLowerCase());
    this.options = results.map((l) => ({ kind: 'loc', loc: l }));
    if (typed.length >= 2 && !exact) this.options.push({ kind: 'custom', text: typed });

    const icon = (type) => `<span class="combo__badge"><svg viewBox="0 0 24 24">${TYPE_ICONS[type]}</svg></span>`;

    if (!this.options.length) {
      this.list.innerHTML = '<li class="combo__empty">Start typing a city, station or airport</li>';
    } else {
      this.list.innerHTML = this.options.map((o, i) => {
        const id = `${this.list.id}-opt-${i}`;
        if (o.kind === 'custom') {
          return `<li class="combo__option combo__option--custom" id="${id}" role="option" aria-selected="false" data-index="${i}">
            ${icon('custom')}<span><strong>Use “${escapeHTML(o.text)}”</strong><small>Not in our list? We’ll confirm the distance by phone.</small></span></li>`;
        }
        const l = o.loc;
        const where = l.nearby ? `${l.district} (outside Tamil Nadu)` : `${l.district} district`;
        return `<li class="combo__option" id="${id}" role="option" aria-selected="false" data-index="${i}">
          ${icon(l.type)}<span><strong>${this.highlight(l.name, q)}</strong><small>${escapeHTML(where)}, ${TYPE_LABELS[l.type]}</small></span></li>`;
      }).join('');
    }
    this.active = -1;
    this.input.removeAttribute('aria-activedescendant');
  }

  open() { this.root.classList.add('is-open'); this.input.setAttribute('aria-expanded', 'true'); }
  close() { this.root.classList.remove('is-open'); this.input.setAttribute('aria-expanded', 'false'); }

  setActive(i) {
    const items = $$('.combo__option', this.list);
    if (!items.length) return;
    this.active = (i + items.length) % items.length;
    items.forEach((el, idx) => el.setAttribute('aria-selected', String(idx === this.active)));
    const el = items[this.active];
    this.input.setAttribute('aria-activedescendant', el.id);
    if (typeof el.scrollIntoView === 'function') el.scrollIntoView({ block: 'nearest' });
  }

  onKey(e) {
    const isOpen = this.root.classList.contains('is-open');
    if (e.key === 'ArrowDown') { e.preventDefault(); if (!isOpen) { this.render(this.input.value); this.open(); } this.setActive(this.active + 1); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); this.setActive(this.active - 1); }
    else if (e.key === 'Enter') {
      if (isOpen && this.active >= 0) { e.preventDefault(); this.choose(this.active); }
      else if (isOpen && this.options.length) { e.preventDefault(); this.choose(0); }
    }
    else if (e.key === 'Escape') { this.close(); }
    else if (e.key === 'Tab') { this.commitTyped(); this.close(); }
  }

  choose(i) {
    const o = this.options[i];
    if (!o) return;
    if (o.kind === 'loc') this.setLocation(o.loc);
    else this.setCustom(o.text);
    this.close();
  }

  setLocation(loc) {
    this.selected = loc;
    this.custom = '';
    this.input.value = loc.label;
    this.root.classList.add('has-value');
    this.clearError();
    this.onChange(this);
  }

  setById(id) {
    const loc = LOCATION_BY_ID.get(id);
    if (loc) this.setLocation(loc);
  }

  setCustom(text) {
    this.selected = null;
    this.custom = text.trim();
    this.input.value = this.custom;
    this.root.classList.toggle('has-value', !!this.custom);
    this.clearError();
    this.onChange(this);
  }

  /** On blur: exact match → dataset location, otherwise keep as custom text */
  commitTyped() {
    if (this.selected) return;
    const typed = this.input.value.trim();
    if (!typed) { this.custom = ''; this.onChange(this); return; }
    const t = typed.toLowerCase();
    const match = LOCATIONS.find((l) => l.label.toLowerCase() === t || l.name.toLowerCase() === t);
    if (match) this.setLocation(match);
    else if (this.custom !== typed) this.setCustom(typed);
    this.close();
  }

  clear() {
    this.selected = null;
    this.custom = '';
    this.input.value = '';
    this.root.classList.remove('has-value');
    this.onChange(this);
  }

  /** Human-readable value for summaries and emails */
  get text() { return this.selected ? this.selected.label : this.custom; }
  get hasValue() { return !!(this.selected || this.custom); }

  setError(msg) { this.root.classList.add('has-error'); $('.field__error', this.root).textContent = msg; }
  clearError() { this.root.classList.remove('has-error'); $('.field__error', this.root).textContent = ''; }
}

/* ---------------------------------------------------------
   9. VEHICLE CARDS & RATE TABLE
   --------------------------------------------------------- */
function vehicleSVG(v) {
  return `<svg viewBox="0 0 120 46" aria-hidden="true"><path d="${v.path}" fill="currentColor"/>
    <circle cx="28" cy="37" r="7.5" fill="#111111"/><circle cx="28" cy="37" r="3" fill="#FFFFFF"/>
    <circle cx="92" cy="37" r="7.5" fill="#111111"/><circle cx="92" cy="37" r="3" fill="#FFFFFF"/></svg>`;
}

function renderVehicles() {
  const wrap = $('#vehicle-options');
  if (wrap) {
    wrap.innerHTML = VEHICLES.map((v) => `
      <label class="vehicle">
        <input type="radio" name="vehicle" value="${v.key}" ${v.key === 'sedan' ? 'checked' : ''}>
        <span class="vehicle__card">
          ${vehicleSVG(v)}
          <span class="vehicle__name">${v.name}</span>
          <span class="vehicle__meta">Up to ${v.seats} passengers<br>${v.examples}</span>
          <span class="vehicle__rate">₹${v.rate}/km</span>
        </span>
      </label>`).join('');
  }

  const select = $('#c-vehicle');
  if (select) {
    select.innerHTML = VEHICLES.map((v) => `<option value="${v.key}">${v.name} (₹${v.rate}/km)</option>`).join('');
    select.value = 'sedan';
  }

  const tbody = $('#rate-table-body');
  if (tbody) {
    tbody.innerHTML = VEHICLES.map((v) => `<tr><td>${v.name}</td><td>${v.seats}</td><td>₹${v.rate} / km</td></tr>`).join('');
  }
  const minLabel = $('#min-fare-label');
  if (minLabel) minLabel.textContent = inr(CONFIG.minimumFare);
}

/* ---------------------------------------------------------
   10. BOOKING FORM
   --------------------------------------------------------- */
const Booking = {
  form: null,
  pickup: null,
  drop: null,
  lastEmail: null, // { mailto, text }

  init() {
    this.form = $('#booking-form');
    if (!this.form) return;

    this.pickup = new LocationCombo($('#b-pickup').closest('[data-combo]'), { onChange: () => this.updateSummary() });
    this.drop = new LocationCombo($('#b-drop').closest('[data-combo]'), { onChange: () => this.updateSummary() });

    // Date: no past dates
    const date = $('#b-date');
    const today = new Date();
    const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    date.min = iso(today);
    date.value = iso(today);

    this.form.addEventListener('change', () => this.updateSummary());
    this.form.addEventListener('input', (e) => {
      const field = e.target.closest('.field');
      if (field && field.classList.contains('has-error') && !field.matches('[data-combo]')) this.clearFieldError(e.target);
    });
    this.form.addEventListener('submit', (e) => { e.preventDefault(); this.submit(); });

    this.updateSummary();
  },

  get tripType() { return ($('input[name="tripType"]:checked', this.form) || {}).value || 'oneway'; },
  get vehicleKey() { return ($('input[name="vehicle"]:checked', this.form) || {}).value || 'sedan'; },

  setTripType(value) {
    const r = $(`input[name="tripType"][value="${value}"]`, this.form);
    if (r) { r.checked = true; this.updateSummary(); }
  },
  setVehicle(value) {
    const r = $(`input[name="vehicle"][value="${value}"]`, this.form);
    if (r) { r.checked = true; this.updateSummary(); }
  },

  estimate() {
    return estimateTrip(this.pickup.selected, this.drop.selected, this.vehicleKey, this.tripType);
  },

  /** Live trip summary in the side panel */
  updateSummary() {
    if (!this.pickup) return;
    const vehicle = getVehicle(this.vehicleKey);
    const est = this.estimate();

    $('#sum-pickup').textContent = this.pickup.text || 'Choose pickup';
    $('#sum-drop').textContent = this.drop.text || 'Choose drop';
    $('#sum-trip').textContent = TRIP_TYPES[this.tripType];
    $('#sum-vehicle').textContent = vehicle.name;
    $('#sum-rate').textContent = `₹${vehicle.rate}`;

    const totalEl = $('#sum-total');
    const note = $('#sum-note');
    if (est.known) {
      $('#sum-distance').textContent = this.tripType === 'round'
        ? `${est.km} km (${est.oneWayKm} km each way)`
        : `${est.km} km`;
      animateNumber(totalEl, est.fare, { prefix: '₹' });
      totalEl.classList.remove('is-updated'); void totalEl.offsetWidth; totalEl.classList.add('is-updated');
      note.textContent = est.minApplied
        ? `Minimum fare of ${inr(CONFIG.minimumFare)} applies. Approximate road-distance estimate, not live navigation distance.`
        : 'Approximate road-distance estimate, not live navigation distance.';
    } else {
      $('#sum-distance').textContent = (this.pickup.hasValue && this.drop.hasValue) ? 'To be confirmed' : '–';
      totalEl.textContent = (this.pickup.hasValue && this.drop.hasValue) ? 'On call' : '–';
      totalEl.dataset.current = 0;
      note.textContent = (this.pickup.hasValue && this.drop.hasValue)
        ? 'One of your locations isn’t in our list, so we’ll confirm the distance and fare when we call you.'
        : 'Approximate road-distance estimate, not live navigation distance.';
    }

    // Passenger limit follows the chosen vehicle
    const pax = $('#b-passengers');
    pax.max = vehicle.seats;
  },

  setFieldError(input, msg) {
    const field = input.closest('.field');
    field.classList.add('has-error');
    $('.field__error', field).textContent = msg;
  },
  clearFieldError(input) {
    const field = input.closest('.field');
    field.classList.remove('has-error');
    $('.field__error', field).textContent = '';
  },

  /** Returns the first invalid element, or null */
  validate() {
    let firstBad = null;
    const fail = (el, msg) => { this.setFieldError(el, msg); if (!firstBad) firstBad = el; };

    const name = $('#b-name');
    const mobile = $('#b-mobile');
    const email = $('#b-email');
    const date = $('#b-date');
    const time = $('#b-time');
    const pax = $('#b-passengers');
    [name, mobile, email, date, time, pax].forEach((el) => this.clearFieldError(el));
    this.pickup.clearError(); this.drop.clearError();
    $('#vehicle-error').textContent = '';

    if (name.value.trim().length < 2) fail(name, 'Enter your name.');

    if (!isValidIndianMobile(mobile.value)) fail(mobile, 'Enter a 10-digit mobile number starting with 6, 7, 8 or 9.');

    if (email.value.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) fail(email, 'Enter a valid email address, or leave it empty.');

    this.pickup.commitTyped(); this.drop.commitTyped();
    if (!this.pickup.hasValue) { this.pickup.setError('Choose or type a pickup location.'); if (!firstBad) firstBad = this.pickup.input; }
    if (!this.drop.hasValue) { this.drop.setError('Choose or type a drop location.'); if (!firstBad) firstBad = this.drop.input; }
    if (this.pickup.hasValue && this.drop.hasValue && this.tripType !== 'local' &&
        this.pickup.text.toLowerCase() === this.drop.text.toLowerCase()) {
      this.drop.setError('Drop is the same as pickup. For trips within one city, choose Local Rental.');
      if (!firstBad) firstBad = this.drop.input;
    }

    // Date and time must be in the future (at least 30 minutes from now)
    if (!date.value) fail(date, 'Choose a pickup date.');
    if (!time.value) fail(time, 'Choose a pickup time.');
    if (date.value && time.value) {
      const when = new Date(`${date.value}T${time.value}`);
      const soonest = new Date(Date.now() + 30 * 60 * 1000);
      if (isNaN(when.getTime())) fail(date, 'Enter a valid date.');
      else if (when < soonest) fail(time, 'Pickup time must be at least 30 minutes from now.');
    } else if (date.value && date.value < date.min) {
      fail(date, 'Pickup date can’t be in the past.');
    }

    const vehicle = getVehicle(this.vehicleKey);
    const n = Number(pax.value);
    if (!Number.isInteger(n) || n < 1) fail(pax, 'Enter the number of passengers.');
    else if (n > vehicle.seats) {
      const fit = VEHICLES.find((v) => v.seats >= n);
      fail(pax, fit
        ? `${/^[aeiou]/i.test(vehicle.name) ? 'An' : 'A'} ${vehicle.name} seats up to ${vehicle.seats}. Choose ${fit.name} or larger for ${n} passengers.`
        : `Our largest vehicle seats ${VEHICLES[VEHICLES.length - 1].seats}. Call us to arrange more than one car.`);
    }

    return firstBad;
  },

  buildEmail() {
    const v = getVehicle(this.vehicleKey);
    const est = this.estimate();
    const val = (id) => $(id).value.trim();
    const dateStr = new Date(`${val('#b-date')}T00:00`).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });

    const distance = est.known
      ? (this.tripType === 'round' ? `approx. ${est.km} km (${est.oneWayKm} km each way)` : `approx. ${est.km} km`)
      : 'To be confirmed by your team';
    const fare = est.known ? `approx. ${inr(est.fare)} (${v.name} at ₹${v.rate}/km)` : 'To be confirmed by your team';

    const subject = `New Taxi Booking Request – ${this.pickup.text} to ${this.drop.text}`;
    const lines = [
      `Hello ${CONFIG.businessName},`,
      '',
      'I would like to book a taxi. My trip details are below.',
      '',
      `Customer Name: ${val('#b-name')}`,
      `Mobile Number: ${val('#b-mobile')}`,
      `Email Address: ${val('#b-email') || 'Not provided'}`,
      '',
      `Pickup Location: ${this.pickup.text}`,
      `Drop Location: ${this.drop.text}`,
      `Travel Date: ${dateStr}`,
      `Travel Time: ${val('#b-time')}`,
      `Trip Type: ${TRIP_TYPES[this.tripType]}`,
      `Vehicle Type: ${v.name}`,
      `Passengers: ${val('#b-passengers')}`,
      '',
      `Estimated Distance: ${distance}`,
      `Estimated Fare: ${fare}`,
      '',
      `Additional Requirements: ${val('#b-notes') || 'None'}`,
      '',
      'Note: the fare above is an approximate website estimate. Please call me to confirm the final fare and booking.',
      '',
      'Thank you.'
    ];
    const body = lines.join('\n');
    const mailto = `mailto:${CONFIG.businessEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    return { mailto, subject, body, text: `${subject}\n\n${body}` };
  },

  submit() {
    const bad = this.validate();
    if (bad) {
      toast('Please fix the highlighted fields.', true);
      bad.focus({ preventScroll: true });
      const field = bad.closest('.field') || bad;
      if (typeof field.scrollIntoView === 'function') field.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
      return;
    }
    this.updateSummary();
    this.lastEmail = this.buildEmail();
    openMailto(this.lastEmail.mailto);
    // Show the "ready to send" message – not a confirmation
    setTimeout(() => Modal.open('booking'), 400);
  }
};

function isValidIndianMobile(raw) {
  const digits = String(raw).replace(/[\s\-()]/g, '').replace(/^(\+91|0091|91(?=\d{10}$)|0(?=\d{10}$))/, '');
  return /^[6-9]\d{9}$/.test(digits);
}

function openMailto(href) {
  // Using location.href keeps the page open in all browsers when a mail app handles the link
  window.location.href = href;
}

/* ---------------------------------------------------------
   11. FARE CALCULATOR
   --------------------------------------------------------- */
const Calculator = {
  pickup: null,
  drop: null,
  last: null,

  init() {
    const form = $('#calc-form');
    if (!form) return;
    this.pickup = new LocationCombo($('#c-pickup').closest('[data-combo]'));
    this.drop = new LocationCombo($('#c-drop').closest('[data-combo]'));
    form.addEventListener('submit', (e) => { e.preventDefault(); this.calculate(); });
    $('#c-vehicle').addEventListener('change', () => { if (this.last) this.calculate(); });
    $('#c-trip').addEventListener('change', () => { if (this.last) this.calculate(); });
    $('#calc-book').addEventListener('click', () => this.sendToBooking());
  },

  calculate() {
    this.pickup.commitTyped(); this.drop.commitTyped();
    this.pickup.clearError(); this.drop.clearError();
    let ok = true;
    if (!this.pickup.selected) { this.pickup.setError(this.pickup.hasValue ? 'Pick a location from the list to get an estimate.' : 'Choose a pickup location.'); ok = false; }
    if (!this.drop.selected) { this.drop.setError(this.drop.hasValue ? 'Pick a location from the list to get an estimate.' : 'Choose a drop location.'); ok = false; }
    if (ok && this.pickup.selected.id === this.drop.selected.id) { this.drop.setError('Drop is the same as pickup.'); ok = false; }
    if (!ok) return;

    const vehicleKey = $('#c-vehicle').value;
    const trip = $('#c-trip').value;
    const v = getVehicle(vehicleKey);
    const est = estimateTrip(this.pickup.selected, this.drop.selected, vehicleKey, trip);
    this.last = { vehicleKey, trip };

    const result = $('#calc-result');
    const firstShow = result.hidden;
    result.hidden = false;
    if (firstShow) { result.style.animation = 'none'; void result.offsetWidth; result.style.animation = ''; }

    $('#r-pickup').textContent = this.pickup.selected.label;
    $('#r-drop').textContent = this.drop.selected.label;
    $('#r-distance').textContent = trip === 'round' ? `${est.km} km (round trip)` : `${est.km} km`;
    $('#r-vehicle').textContent = v.name;
    $('#r-rate').textContent = `₹${v.rate}`;
    animateNumber($('#r-total'), est.fare, { prefix: '₹', duration: 1100 });
  },

  sendToBooking() {
    if (!this.pickup.selected || !this.drop.selected) return;
    Booking.pickup.setLocation(this.pickup.selected);
    Booking.drop.setLocation(this.drop.selected);
    Booking.setVehicle($('#c-vehicle').value);
    Booking.setTripType($('#c-trip').value);
    scrollToEl($('#book'));
    toast('Route added to the booking form. Add your details to finish.');
    setTimeout(() => $('#b-name').focus({ preventScroll: true }), 700);
  }
};

/* ---------------------------------------------------------
   12. POPULAR ROUTES
   --------------------------------------------------------- */
function initRoutes() {
  const cards = $$('.route');
  cards.forEach((card) => {
    const from = LOCATION_BY_ID.get(card.dataset.from);
    const to = LOCATION_BY_ID.get(card.dataset.to);
    if (!from || !to) { card.hidden = true; console.warn('Route location missing:', card.dataset.from, card.dataset.to); return; }

    const est = estimateTrip(from, to, 'hatchback', 'oneway');
    const kmEl = $('.route__km', card);
    const fareEl = $('.route__fare', card);
    kmEl.textContent = `~${est.km} km`;
    fareEl.textContent = `From ${inr(est.fare)}`;
    card.setAttribute('aria-label', `${from.name} to ${to.name}, about ${est.km} km, from ${inr(est.fare)}. Fill booking form`);

    card.addEventListener('click', () => {
      Booking.pickup.setLocation(from);
      Booking.drop.setLocation(to);
      Booking.setTripType('oneway');
      card.classList.remove('is-picked'); void card.offsetWidth; card.classList.add('is-picked');
      scrollToEl($('#book'));
      toast(`${from.name} to ${to.name} added. Choose your vehicle and add your details.`);
    });
  });

  // Count the km figures up when the routes section appears
  if ('IntersectionObserver' in window && !prefersReducedMotion()) {
    const io = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const kmEl = $('.route__km', entry.target);
        const n = parseInt(kmEl.textContent.replace(/\D/g, ''), 10);
        if (n) animateNumber(kmEl, n, { prefix: '~', suffix: ' km', duration: 1200 });
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.4 });
    cards.forEach((c) => io.observe(c));
  }
}

/* Service card links pre-select trip type or vehicle */
function initServiceLinks() {
  $$('.service__link').forEach((a) => {
    a.addEventListener('click', () => {
      if (a.dataset.trip) Booking.setTripType(a.dataset.trip);
      if (a.dataset.vehicle) Booking.setVehicle(a.dataset.vehicle);
    });
  });
}

/* ---------------------------------------------------------
   13. HIGHLIGHTS CAROUSEL
   --------------------------------------------------------- */
function initCarousel() {
  const root = $('#highlights');
  if (!root || !HIGHLIGHTS.length) return;
  const track = $('.carousel__track', root);
  const dots = $('.carousel__dots', root);

  track.innerHTML = HIGHLIGHTS.map((h, i) => `
    <figure class="slide" role="group" aria-roledescription="slide" aria-label="${i + 1} of ${HIGHLIGHTS.length}">
      <span class="slide__mark" aria-hidden="true">“</span>
      <div><blockquote class="slide__text">${escapeHTML(h.text)}</blockquote><figcaption class="slide__by">${escapeHTML(h.by)}</figcaption></div>
    </figure>`).join('');
  dots.innerHTML = HIGHLIGHTS.map((_, i) => `<button type="button" class="carousel__dot" role="tab" aria-label="Slide ${i + 1}" aria-selected="${i === 0}"></button>`).join('');

  let index = 0;
  let timer = null;
  const go = (i) => {
    index = (i + HIGHLIGHTS.length) % HIGHLIGHTS.length;
    track.style.transform = `translateX(-${index * 100}%)`;
    $$('.carousel__dot', dots).forEach((d, k) => d.setAttribute('aria-selected', String(k === index)));
  };
  const start = () => { if (!prefersReducedMotion()) { stop(); timer = setInterval(() => go(index + 1), 5500); } };
  const stop = () => clearInterval(timer);

  $$('.carousel__btn', root).forEach((b) => b.addEventListener('click', () => { go(index + Number(b.dataset.dir)); start(); }));
  $$('.carousel__dot', dots).forEach((d, k) => d.addEventListener('click', () => { go(k); start(); }));
  root.addEventListener('mouseenter', stop);
  root.addEventListener('mouseleave', start);
  root.addEventListener('focusin', stop);
  root.addEventListener('focusout', start);

  // Swipe on touch screens
  let x0 = null;
  track.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; stop(); }, { passive: true });
  track.addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
    x0 = null; start();
  });

  start();
}

/* ---------------------------------------------------------
   14. CONTACT FORM, WHATSAPP & CONFIG BINDING
   --------------------------------------------------------- */
const whatsappURL = (text) => `https://wa.me/${CONFIG.whatsappNumber}${text ? '?text=' + encodeURIComponent(text) : ''}`;

function applyConfig() {
  $$('[data-config="businessName"]').forEach((el) => { el.textContent = CONFIG.businessName; });
  $$('[data-config="email"]').forEach((el) => { el.textContent = CONFIG.businessEmail; });
  $$('[data-config="phoneDisplay"]').forEach((el) => { el.textContent = CONFIG.phoneDisplay; });
  $$('[data-link="email"]').forEach((a) => { a.href = `mailto:${CONFIG.businessEmail}`; });
  $$('[data-link="phone"]').forEach((a) => { a.href = `tel:${CONFIG.phoneDial}`; });
  $$('[data-link="whatsapp"]').forEach((a) => {
    a.href = whatsappURL(`Hi ${CONFIG.businessName}, I'd like to enquire about a taxi.`);
  });
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
}

function initContact() {
  const form = $('#contact-form');
  if (!form) return;
  const name = $('#ct-name');
  const phone = $('#ct-phone');
  const msg = $('#ct-msg');

  const setErr = (el, text) => {
    const f = el.closest('.field');
    f.classList.toggle('has-error', !!text);
    $('.field__error', f).textContent = text || '';
  };
  const validate = () => {
    let ok = true;
    setErr(name, ''); setErr(phone, ''); setErr(msg, '');
    if (name.value.trim().length < 2) { setErr(name, 'Enter your name.'); ok = false; }
    if (!isValidIndianMobile(phone.value)) { setErr(phone, 'Enter a 10-digit mobile number.'); ok = false; }
    if (msg.value.trim().length < 5) { setErr(msg, 'Write a short message.'); ok = false; }
    if (!ok) toast('Please fix the highlighted fields.', true);
    return ok;
  };
  const text = () => `Name: ${name.value.trim()}\nMobile: ${phone.value.trim()}\n\n${msg.value.trim()}`;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validate()) return;
    const subject = `Website enquiry from ${name.value.trim()}`;
    openMailto(`mailto:${CONFIG.businessEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(text())}`);
    toast('Your email is ready. Press send in your email app to reach us.');
  });

  $('#contact-wa').addEventListener('click', () => {
    if (!validate()) return;
    window.open(whatsappURL(text()), '_blank', 'noopener');
  });
}

/* ---------------------------------------------------------
   15. MODALS, TOAST, BACK-TO-TOP
   --------------------------------------------------------- */
const Modal = {
  lastFocus: null,
  open(name) {
    const m = $(`#modal-${name}`);
    if (!m) return;
    this.lastFocus = document.activeElement;
    m.hidden = false;
    document.body.classList.add('is-locked');
    requestAnimationFrame(() => {
      m.classList.add('is-open');
      const first = $('button, [href]', $('.modal__panel', m));
      if (first) first.focus();
    });
  },
  close(m) {
    if (!m || m.hidden) return;
    m.classList.remove('is-open');
    document.body.classList.remove('is-locked');
    setTimeout(() => { m.hidden = true; }, prefersReducedMotion() ? 0 : 350);
    if (this.lastFocus && typeof this.lastFocus.focus === 'function') this.lastFocus.focus({ preventScroll: true });
  },
  init() {
    $$('[data-open-modal]').forEach((b) => b.addEventListener('click', () => this.open(b.dataset.openModal)));
    $$('.modal').forEach((m) => {
      $$('[data-close-modal]', m).forEach((c) => c.addEventListener('click', () => this.close(m)));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key !== 'Escape') return;
      $$('.modal').forEach((m) => this.close(m));
    });

    // Booking modal actions
    const retry = $('#mb-retry');
    const copy = $('#mb-copy');
    const wa = $('#mb-wa');
    if (retry) retry.addEventListener('click', () => { if (Booking.lastEmail) openMailto(Booking.lastEmail.mailto); });
    if (copy) copy.addEventListener('click', async () => {
      if (!Booking.lastEmail) return;
      const ok = await copyText(Booking.lastEmail.text);
      toast(ok ? 'Booking details copied. Paste them into an email or message.' : 'Copy didn’t work. Please select and copy the details manually.', !ok);
    });
    if (wa) wa.addEventListener('click', () => {
      if (Booking.lastEmail) window.open(whatsappURL(Booking.lastEmail.text), '_blank', 'noopener');
    });
  }
};

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (_) { /* fall through */ }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try { ok = document.execCommand('copy'); } catch (_) { ok = false; }
  ta.remove();
  return ok;
}

let toastTimer = null;
function toast(message, isError = false) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.toggle('toast--error', isError);
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), 4200);
}

function initToTop() {
  const btn = $('#to-top');
  if (btn) btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? 'auto' : 'smooth' }));
}

/* ---------------------------------------------------------
   16. INIT
   --------------------------------------------------------- */
function init() {
  applyConfig();
  initPreloader();
  initNav();
  renderVehicles();
  Booking.init();
  Calculator.init();
  initRoutes();
  initServiceLinks();
  initCarousel();
  initContact();
  Modal.init();
  initToTop();
  initReveal();
  initCounters();
}

if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
