// Comprehensive cascading location data: Country -> States -> Cities
export const LOCATION_DATA = {
  India: {
    code: 'IN',
    callingCode: '+91',
    states: {
      'Andaman and Nicobar Islands': [
        'Port Blair',
        'Havelock Island',
        'Neil Island (Shaheed Dweep)',
        'Diglipur',
        'Baratang Island',
        'Mayabunder',
        'Rangat',
        'Little Andaman',
        'Campbell Bay'
      ],
      'Goa': [
        'Panaji',
        'Margao',
        'Vasco da Gama',
        'Calangute',
        'Candolim',
        'Baga',
        'Anjuna',
        'Morjim',
        'Arambol',
        'Mapusa',
        'Ponda',
        'Palolem',
        'Agonda',
        'Canacona'
      ],
      'Karnataka': [
        'Bengaluru',
        'Mangaluru',
        'Udupi',
        'Karwar',
        'Murudeshwar (Netrani Hub)',
        'Gokarna',
        'Kundapura',
        'Mysuru',
        'Hubballi',
        'Belagavi',
        'Dharwad',
        'Shimoga',
        'Hassan'
      ],
      'Maharashtra': [
        'Mumbai',
        'Pune',
        'Navi Mumbai',
        'Thane',
        'Alibaug',
        'Malvan (Tarkarli Dive Hub)',
        'Tarkarli',
        'Ratnagiri',
        'Sindhudurg',
        'Nashik',
        'Nagpur',
        'Kolhapur',
        'Chhatrapati Sambhajinagar (Aurangabad)'
      ],
      'Tamil Nadu': [
        'Chennai',
        'Coimbatore',
        'Madurai',
        'Rameswaram',
        'Kanyakumari',
        'Tiruchirappalli',
        'Salem',
        'Thoothukudi (Tuticorin)',
        'Tirunelveli',
        'Vellore'
      ],
      'Kerala': [
        'Kochi',
        'Thiruvananthapuram',
        'Kovalam',
        'Varkala',
        'Kozhikode',
        'Alappuzha',
        'Kollam',
        'Kannur',
        'Munnar',
        'Wayanad',
        'Thrissur'
      ],
      'Lakshadweep': [
        'Kavaratti',
        'Agatti Island',
        'Bangaram Island',
        'Kadmat Island',
        'Minicoy Island',
        'Amini',
        'Andrott',
        'Kalpeni'
      ],
      'Gujarat': [
        'Ahmedabad',
        'Surat',
        'Vadodara',
        'Rajkot',
        'Dwarka',
        'Porbandar',
        'Somnath',
        'Bhavnagar',
        'Jamnagar',
        'Gandhinagar'
      ],
      'Delhi (NCR)': [
        'New Delhi',
        'Central Delhi',
        'South Delhi',
        'West Delhi',
        'North Delhi',
        'East Delhi',
        'Gurugram',
        'Noida',
        'Greater Noida',
        'Faridabad',
        'Ghaziabad'
      ],
      'Andhra Pradesh': [
        'Visakhapatnam',
        'Vijayawada',
        'Guntur',
        'Nellore',
        'Tirupati',
        'Kakinada',
        'Rajahmundry',
        'Kurnool'
      ],
      'West Bengal': [
        'Kolkata',
        'Howrah',
        'Digha',
        'Mandarmani',
        'Siliguri',
        'Darjeeling',
        'Haldia',
        'Asansol'
      ],
      'Odisha': [
        'Bhubaneswar',
        'Cuttack',
        'Puri',
        'Gopalpur',
        'Rourkela',
        'Sambalpur',
        'Balasore'
      ],
      'Rajasthan': [
        'Jaipur',
        'Udaipur',
        'Jodhpur',
        'Kota',
        'Bikaner',
        'Ajmer',
        'Jaisalmer',
        'Pushkar'
      ],
      'Uttar Pradesh': [
        'Lucknow',
        'Kanpur',
        'Varanasi',
        'Agra',
        'Prayagraj',
        'Meerut',
        'Noida',
        'Bareilly',
        'Aligarh'
      ],
      'Telangana': [
        'Hyderabad',
        'Secunderabad',
        'Warangal',
        'Nizamabad',
        'Karimnagar',
        'Khammam'
      ],
      'Punjab': [
        'Chandigarh',
        'Amritsar',
        'Ludhiana',
        'Jalandhar',
        'Patiala',
        'Bathinda'
      ],
      'Haryana': [
        'Gurugram',
        'Faridabad',
        'Panipat',
        'Ambala',
        'Karnal',
        'Rohtak',
        'Hisar'
      ],
      'Madhya Pradesh': [
        'Bhopal',
        'Indore',
        'Gwalior',
        'Jabalpur',
        'Ujjain',
        'Sagar'
      ],
      'Himachal Pradesh': [
        'Shimla',
        'Manali',
        'Dharamshala',
        'Kullu',
        'Spiti Valley',
        'Solan',
        'Mandi'
      ],
      'Uttarakhand': [
        'Dehradun',
        'Rishikesh',
        'Haridwar',
        'Nainital',
        'Mussoorie',
        'Haldwani',
        'Roorkee'
      ],
      'Puducherry': [
        'Puducherry City',
        'Auroville',
        'Karaikal',
        'Mahe',
        'Yanam'
      ],
      'Jammu and Kashmir': [
        'Srinagar',
        'Jammu',
        'Gulmarg',
        'Pahalgam',
        'Anantnag'
      ],
      'Ladakh': [
        'Leh',
        'Kargil',
        'Nubra Valley',
        'Zanskar'
      ],
      'Assam': [
        'Guwahati',
        'Silchar',
        'Dibrugarh',
        'Jorhat',
        'Tezpur'
      ],
      'Bihar': [
        'Patna',
        'Gaya',
        'Muzaffarpur',
        'Bhagalpur',
        'Darbhanga'
      ],
      'Chhattisgarh': [
        'Raipur',
        'Bilaspur',
        'Bhilai',
        'Durg',
        'Korba'
      ],
      'Jharkhand': [
        'Ranchi',
        'Jamshedpur',
        'Dhanbad',
        'Bokaro',
        'Deoghar'
      ],
      'Meghalaya': [
        'Shillong',
        'Cherrapunji',
        'Tura',
        'Dawki'
      ],
      'Sikkim': [
        'Gangtok',
        'Pelling',
        'Namchi',
        'Ravangla'
      ],
      'Chandigarh': [
        'Chandigarh'
      ],
      'Dadra and Nagar Haveli and Daman and Diu': [
        'Daman',
        'Diu',
        'Silvassa'
      ]
    }
  },
  Maldives: {
    code: 'MV',
    callingCode: '+960',
    states: {
      'Kaafu Atoll (Malé Region)': [
        'Malé',
        'Hulhumalé',
        'Maafushi',
        'Gulhi',
        'Guraidhoo',
        'Thulusdhoo'
      ],
      'Alif Alif Atoll (North Ari)': [
        'Rasdhoo',
        'Ukulhas',
        'Thoddoo',
        'Mathiveri',
        'Feridhoo'
      ],
      'Alif Dhaal Atoll (South Ari)': [
        'Dhigurah (Whale Shark Hub)',
        'Dhangethi',
        'Mahibadhoo',
        'Maamigili'
      ],
      'Baa Atoll (UNESCO Biosphere)': [
        'Dharavandhoo (Hanifaru Bay)',
        'Eydhafushi',
        'Kamadhoo',
        'Kendhoo',
        'Fulhadhoo'
      ],
      'Vaavu Atoll': [
        'Fulidhoo (Nurse Shark Hub)',
        'Thinadhoo',
        'Felidhoo',
        'Keyodhoo'
      ],
      'Lhaviyani Atoll': [
        'Naifaru',
        'Hinnavaru',
        'Kuredu'
      ],
      'Addu Atoll': [
        'Hithadhoo',
        'Maradhoo',
        'Feydhoo',
        'Gan'
      ]
    }
  },
  Thailand: {
    code: 'TH',
    callingCode: '+66',
    states: {
      'Surat Thani': [
        'Koh Tao (Diving Mecca)',
        'Koh Samui',
        'Koh Phangan'
      ],
      'Phuket': [
        'Phuket Town',
        'Patong',
        'Kata Beach',
        'Karon Beach',
        'Rawai Beach',
        'Chalong Pier'
      ],
      'Krabi': [
        'Ao Nang',
        'Koh Phi Phi',
        'Koh Lanta',
        'Railay Beach',
        'Krabi Town'
      ],
      'Phang Nga': [
        'Khao Lak (Similan Islands Departure)',
        'Similan Islands',
        'Surin Islands'
      ],
      'Bangkok': [
        'Bangkok Central',
        'Sukhumvit',
        'Silom',
        'Siam'
      ],
      'Chonburi': [
        'Pattaya',
        'Bang Saen',
        'Sattahip'
      ]
    }
  },
  Indonesia: {
    code: 'ID',
    callingCode: '+62',
    states: {
      'Bali': [
        'Sanur',
        'Nusa Penida (Manta Point)',
        'Nusa Lembongan',
        'Tulamben (USAT Liberty Wreck)',
        'Amed',
        'Padang Bai',
        'Seminyak',
        'Canggu',
        'Ubud'
      ],
      'East Nusa Tenggara': [
        'Labuan Bajo (Komodo Hub)',
        'Komodo National Park',
        'Alor Island',
        'Maumere'
      ],
      'West Papua': [
        'Raja Ampat (Misool)',
        'Waisai (Dampier Strait)',
        'Sorong'
      ],
      'North Sulawesi': [
        'Bunaken Island',
        'Manado',
        'Lembeh Strait (Muck Diving Capital)',
        'Bangka Island'
      ],
      'West Nusa Tenggara': [
        'Gili Trawangan',
        'Gili Air',
        'Gili Meno',
        'Lombok'
      ],
      'Jakarta': [
        'Central Jakarta',
        'South Jakarta',
        'North Jakarta'
      ]
    }
  },
  'United Arab Emirates': {
    code: 'AE',
    callingCode: '+971',
    states: {
      'Dubai': [
        'Downtown Dubai',
        'Dubai Marina',
        'Jumeirah',
        'Palm Jumeirah',
        'Deira',
        'Business Bay'
      ],
      'Abu Dhabi': [
        'Abu Dhabi City',
        'Yas Island',
        'Saadiyat Island',
        'Al Ain'
      ],
      'Fujairah': [
        'Fujairah City',
        'Dibba Al Fujairah',
        'Al Aqah (Top UAE Dive Hub)',
        'Snoopy Island'
      ],
      'Sharjah': [
        'Sharjah City',
        'Khor Fakkan (East Coast Dive Hub)'
      ],
      'Ras Al Khaimah': [
        'Ras Al Khaimah City',
        'Al Hamra Village'
      ]
    }
  },
  'United States': {
    code: 'US',
    callingCode: '+1',
    states: {
      'California': [
        'San Diego',
        'Los Angeles',
        'Monterey Bay',
        'Santa Barbara',
        'San Francisco',
        'Catalina Island'
      ],
      'Florida': [
        'Key West',
        'Key Largo (John Pennekamp)',
        'Miami',
        'Fort Lauderdale',
        'Orlando',
        'Tampa'
      ],
      'Hawaii': [
        'Honolulu (Oahu)',
        'Kailua-Kona (Big Island)',
        'Maui',
        'Kauai'
      ],
      'New York': [
        'New York City',
        'Brooklyn',
        'Queens',
        'Buffalo'
      ],
      'Texas': [
        'Austin',
        'Houston',
        'Dallas',
        'San Antonio'
      ],
      'Washington': [
        'Seattle',
        'Bellevue',
        'Tacoma'
      ]
    }
  },
  'United Kingdom': {
    code: 'GB',
    callingCode: '+44',
    states: {
      'England': [
        'London',
        'Manchester',
        'Birmingham',
        'Plymouth',
        'Cornwall',
        'Brighton',
        'Bristol'
      ],
      'Scotland': [
        'Edinburgh',
        'Glasgow',
        'Scapa Flow (Orkney Wrecks)',
        'Aberdeen'
      ],
      'Wales': [
        'Cardiff',
        'Swansea',
        'Pembrokeshire'
      ]
    }
  },
  Australia: {
    code: 'AU',
    callingCode: '+61',
    states: {
      'Queensland': [
        'Cairns (Great Barrier Reef Hub)',
        'Port Douglas',
        'Brisbane',
        'Gold Coast',
        'Whitsundays',
        'Townsville'
      ],
      'New South Wales': [
        'Sydney',
        'Byron Bay (Julian Rocks)',
        'Newcastle'
      ],
      'Western Australia': [
        'Exmouth (Ningaloo Reef)',
        'Perth',
        'Coral Bay',
        'Rottnest Island'
      ],
      'Victoria': [
        'Melbourne',
        'Geelong',
        'Mornington Peninsula'
      ]
    }
  },
  Singapore: {
    code: 'SG',
    callingCode: '+65',
    states: {
      'Singapore': [
        'Central Area',
        'Orchard / Tanglin',
        'Sentosa Island',
        'Marina Bay',
        'East Coast',
        'Jurong'
      ]
    }
  },
  Malaysia: {
    code: 'MY',
    callingCode: '+60',
    states: {
      'Sabah (Borneo)': [
        'Semporna (Sipadan Hub)',
        'Sipadan Island',
        'Mabul Island',
        'Kota Kinabalu',
        'Layang-Layang'
      ],
      'Terengganu': [
        'Perhentian Islands',
        'Redang Island',
        'Kuala Terengganu'
      ],
      'Pahang': [
        'Tioman Island',
        'Kuantan'
      ],
      'Kuala Lumpur': [
        'Kuala Lumpur City Centre',
        'Bangsar',
        'Mont Kiara'
      ]
    }
  },
  'Sri Lanka': {
    code: 'LK',
    callingCode: '+94',
    states: {
      'Southern Province': [
        'Galle',
        'Mirissa',
        'Unawatuna',
        'Hikkaduwa'
      ],
      'Eastern Province': [
        'Trincomalee',
        'Pigeon Island',
        'Batticaloa',
        'Arugam Bay'
      ],
      'Western Province': [
        'Colombo',
        'Negombo'
      ]
    }
  },
  Philippines: {
    code: 'PH',
    callingCode: '+63',
    states: {
      'Central Visayas': [
        'Cebu City',
        'Moalboal',
        'Malapascua (Thresher Sharks)',
        'Bohol (Panglao Island)'
      ],
      'Palawan': [
        'El Nido',
        'Coron (WWII Wrecks)',
        'Puerto Princesa',
        'Tubbataha Reef'
      ],
      'Metro Manila': [
        'Manila',
        'Makati',
        'BGC Taguig',
        'Quezon City'
      ]
    }
  },
  Egypt: {
    code: 'EG',
    callingCode: '+20',
    states: {
      'South Sinai': [
        'Sharm El Sheikh',
        'Dahab (Blue Hole)',
        'Ras Mohammed',
        'Nuweiba'
      ],
      'Red Sea Governorate': [
        'Hurghada',
        'El Gouna',
        'Marsa Alam'
      ],
      'Cairo': [
        'Cairo',
        'Giza'
      ]
    }
  },
  Libya: {
    code: 'LY',
    callingCode: '+218',
    states: {
      'Tripoli District': [
        'Tripoli',
        'Bab al-Bahr (Borj Bolila)',
        'Tajoura',
        'Janzour'
      ],
      'Benghazi District': [
        'Benghazi',
        'Al-Khadra'
      ],
      'Misrata District': [
        'Misrata',
        'Zliten'
      ]
    }
  }
}

export const COUNTRY_NAMES = Object.keys(LOCATION_DATA)
