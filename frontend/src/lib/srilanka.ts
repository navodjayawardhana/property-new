export const SL_PROVINCES = [
  'Western', 'Central', 'Southern', 'Northern',
  'Eastern', 'North Western', 'North Central', 'Uva', 'Sabaragamuwa',
] as const;

export type SLProvince = typeof SL_PROVINCES[number];

export const SL_DISTRICTS: Record<SLProvince, string[]> = {
  'Western':       ['Colombo', 'Gampaha', 'Kalutara'],
  'Central':       ['Kandy', 'Matale', 'Nuwara Eliya'],
  'Southern':      ['Galle', 'Matara', 'Hambantota'],
  'Northern':      ['Jaffna', 'Kilinochchi', 'Mannar', 'Mullaitivu', 'Vavuniya'],
  'Eastern':       ['Ampara', 'Batticaloa', 'Trincomalee'],
  'North Western': ['Kurunegala', 'Puttalam'],
  'North Central': ['Anuradhapura', 'Polonnaruwa'],
  'Uva':           ['Badulla', 'Monaragala'],
  'Sabaragamuwa':  ['Kegalle', 'Ratnapura'],
};

export const SL_CITIES: Record<string, string[]> = {
  'Colombo':       ['Colombo 01','Colombo 02','Colombo 03','Colombo 04','Colombo 05','Colombo 06','Colombo 07','Colombo 08','Colombo 09','Colombo 10','Colombo 11','Colombo 12','Colombo 13','Colombo 14','Colombo 15','Dehiwala','Mount Lavinia','Moratuwa','Sri Jayawardenepura Kotte','Maharagama','Nugegoda','Piliyandala','Homagama','Kesbewa','Boralesgamuwa'],
  'Gampaha':       ['Negombo','Gampaha','Minuwangoda','Veyangoda','Kadawatha','Kelaniya','Ja-Ela','Ragama','Wattala','Biyagama','Dompe','Divulapitiya','Mirigama','Katana','Mahara','Seeduwa','Ekala'],
  'Kalutara':      ['Kalutara','Panadura','Horana','Beruwala','Aluthgama','Bandaragama','Bulathsinhala','Matugama','Agalawatta','Dodangoda','Ingiriya'],
  'Kandy':         ['Kandy','Peradeniya','Gampola','Nawalapitiya','Katugastota','Kundasale','Wattegama','Teldeniya','Akurana','Kadugannawa','Harispattuwa','Poojapitiya','Ududumbara'],
  'Matale':        ['Matale','Dambulla','Sigiriya','Rattota','Ukuwela','Pallepola','Naula','Galewela','Wilgamuwa','Yatawatta'],
  'Nuwara Eliya':  ['Nuwara Eliya','Hatton','Talawakele','Ginigathhena','Kotagala','Ragala','Kandapola','Maskeliya','Bogawantalawa'],
  'Galle':         ['Galle','Hikkaduwa','Ambalangoda','Elpitiya','Karandeniya','Balapitiya','Baddegama','Bentota','Unawatuna','Habaraduwa','Pitigala'],
  'Matara':        ['Matara','Weligama','Mirissa','Akuressa','Hakmana','Dikwella','Deniyaya','Kamburupitiya','Morawaka','Devinuwara','Gandara'],
  'Hambantota':    ['Hambantota','Tangalle','Ambalantota','Tissamaharama','Beliatta','Weeraketiya','Angunakolapelessa','Lunugamvehera','Kataragama'],
  'Jaffna':        ['Jaffna','Chavakachcheri','Point Pedro','Nallur','Kopay','Chunnakam','Manipay','Karainagar','Chankanai','Sandilipay','Uduvil'],
  'Kilinochchi':   ['Kilinochchi','Paranthan','Pooneryn','Mulankavil'],
  'Mannar':        ['Mannar','Murunkan','Nanattan','Adampan','Madhu'],
  'Mullaitivu':    ['Mullaitivu','Oddusuddan','Puthukkudiyiruppu','Maritimepattu'],
  'Vavuniya':      ['Vavuniya','Cheddikulam','Nedunkeni','Vavuniya South'],
  'Ampara':        ['Ampara','Kalmunai','Sammanthurai','Pottuvil','Mahaoya','Akkaraipattu','Uhana','Sainthamaruthu','Addalaichenai'],
  'Batticaloa':    ['Batticaloa','Kattankudy','Eravur','Valaichenai','Kaluwanchikudy','Oddamavadi','Vakarai'],
  'Trincomalee':   ['Trincomalee','Kinniya','Muttur','Kantale','Seruwila','Kuchchaveli','Thampalakamam'],
  'Kurunegala':    ['Kurunegala','Kuliyapitiya','Nikaweratiya','Maho','Pannala','Galgamuwa','Narammala','Ibbagamuwa','Polgahawela','Bingiriya','Wariyapola','Melsiripura'],
  'Puttalam':      ['Puttalam','Chilaw','Wennappuwa','Marawila','Nattandiya','Dankotuwa','Anamaduwa','Bangadeniya','Mundalama'],
  'Anuradhapura':  ['Anuradhapura','Kekirawa','Tambuttegama','Medawachchiya','Galenbindunuwewa','Kahatagasdigiliya','Mihintale','Nochchiyagama','Horowpathana','Eppawala'],
  'Polonnaruwa':   ['Polonnaruwa','Hingurakgoda','Medirigiriya','Dimbulagala','Lankapura','Welikanda','Thamankaduwa'],
  'Badulla':       ['Badulla','Bandarawela','Haputale','Welimada','Ella','Diyatalawa','Mahiyanganaya','Passara','Uva Paranagama','Haldummulla'],
  'Monaragala':    ['Monaragala','Bibile','Wellawaya','Buttala','Siyambalanduwa','Medagama','Bibila'],
  'Kegalle':       ['Kegalle','Mawanella','Warakapola','Rambukkana','Galigamuwa','Aranayake','Yatiyantota','Deraniyagala','Ruwanwella'],
  'Ratnapura':     ['Ratnapura','Balangoda','Embilipitiya','Pelmadulla','Eheliyagoda','Kuruwita','Kahawatta','Godakawela','Imbulpe','Nivithigala','Ayagama'],
};
