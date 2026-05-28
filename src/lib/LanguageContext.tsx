import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'hi';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'BarberWallah',
    'nav.home': 'Home',
    'nav.login': 'Login',
    'nav.register': 'Register',
    'nav.tutorial': 'Tutorial',
    'nav.dashboard': 'Dashboard',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'common.waiting': 'Waiting',
    'common.served': 'Served',
    'common.avgWait': 'Avg Wait',
    'common.queueOpen': 'Queue Open',
    'common.queueClosed': 'Queue Closed',
    'common.accepting': 'Accepting New Customers',
    'common.addWalkIn': 'Add Walk-in Customer',
    'common.name': 'Customer Name',
    'common.phone': 'Phone (Optional)',
    'common.service': 'Select Service',
    'common.addToQueue': 'Add to Queue',
    'common.nowServing': 'Now Serving',
    'common.waitingList': 'Waiting List',
    'common.markDone': 'Mark Done',
    'common.startService': 'Start Service',
    'common.call': 'Call',
    'common.noShow': 'No Show',
    'common.token': 'Token',
    'common.estWait': 'Est. Wait',
    'common.min': 'min',
    'common.people': 'people',
    'common.peopleAhead': 'people ahead of you',
    'common.personAhead': 'person ahead of you',
    'common.yourTurn': 'It\'s your turn!',
    'common.serviceComplete': 'Service Complete',
    'common.shopNotFound': 'Shop not found',
    'common.connectionError': 'Connection error. Please try again.',
    'common.invalidPhone': 'Please enter a valid 10-digit mobile number',
    'common.joinFailed': 'Failed to join queue. Permission denied or connection error.',
    'common.waitingNow': 'Waiting now',
    'common.shopClosed': 'Shop is currently closed. Please check back later.',
    'common.yourName': 'Your Name',
    'common.mobileNumber': 'Mobile Number',
    'common.joining': 'Joining...',
    'common.alreadyJoined': 'Already joined? Find my token',
    'common.noAppNeeded': 'No app needed · No login required',
    'common.callWhenTurn': 'You\'ll receive a call when it\'s your turn',
    'common.tokenNotFound': 'Token not found',
    'common.yourToken': 'Your Token',
    'common.yourTurnTitle': 'Your Turn!',
    'common.pleaseComeToShop': 'Please come to the shop',
    'common.pleaseStayNearby': 'Please stay nearby',
    'common.done': 'Done!',
    'common.seeYouNextTime': 'See you next time!',
    'common.joinAgain': 'Join Again',
    'common.location': 'Location',
    'common.contact': 'Contact',
    'common.updatingLive': 'Updating live every 12 seconds',
    'loyalty.rewards': 'Loyalty Rewards',
    'loyalty.rewardEarned': 'Reward Earned!',
    'loyalty.askDiscount': 'Ask for {pct}% discount today',
    'loyalty.moreVisits': '{count} more visits to earn your reward',
    'common.cash': 'Cash',
    'common.noPhone': 'No Phone',
    'common.joinQueue': 'Join Queue',
    'common.maxCapacity': 'Max Waiting Capacity',
    'common.maxCapacityDesc': 'Set to 0 for unlimited capacity. This will be shown to customers.',
    'common.saveSettings': 'Save Settings',
    'common.waitingOccupancy': 'Waiting Room Occupancy',
    'common.seatsOccupied': 'seats occupied',
    'common.full': 'Waiting room is full',
    'nav.general': 'General',
    'settings.avgService': 'Average Service Time (min)',
    'settings.saveSuccess': 'Settings saved successfully!',
    'common.waitingInShop': 'Waiting in Shop? (Increases Occupancy)',
    'common.findToken': 'Find Token',
    'common.calculator': 'Salon Calculator',
    'common.open': 'Open',
    'common.closed': 'Closed',
    'common.servedToday': 'Served today',
    'common.queue': 'Queue',
    'common.earnings': 'Earnings',
    'common.customers': 'Customers',
    'common.noServing': 'No one being served right now',
    'common.calledArriving': 'Called / Arriving',
    'common.waitingCount': 'Waiting',
    'common.queueEmpty': 'Queue is empty — share your QR code!',
    'common.cashOnlyDesc': 'Cash customer / No phone (No loyalty tracking)',
    'nav.lossCalculator': 'Loss Calculator',
    'nav.aiInsights': 'AI Insights',
    'earnings.title': 'Earnings History',
    'earnings.date': 'Date',
    'earnings.customers': 'Customers',
    'earnings.revenue': 'Revenue',
    'earnings.empty': 'No earnings recorded yet',
    'loyalty.title': 'Customer Loyalty',
    'loyalty.visits': 'Visits',
    'loyalty.streak': 'Streak Progress',
    'loyalty.empty': 'No customers tracked yet',
    'tutorial.title': 'How It Works',
    'tutorial.subtitle': 'Everything works in 3 simple steps.',
    'tutorial.desc': 'No training needed. No complicated apps. Your customers scan a QR code. You tap one button. That\'s it.',
    'tutorial.customerJourney': 'Customer Journey',
    'tutorial.barberJourney': 'Barber Journey',
    'tutorial.customer.step1.title': 'Customer scans the QR code at your shop',
    'tutorial.customer.step1.desc': 'You print one QR code and stick it at your entrance — on the wall, the mirror, the door, anywhere visible. When a customer arrives and sees a queue, they scan the QR code with their phone camera. No app download. No account needed.',
    'tutorial.customer.step2.title': 'They enter their name, number, and service',
    'tutorial.customer.step2.desc': 'The page shows how many people are already waiting and their estimated wait time. Customer fills in their name, mobile number, and selects a service. They tap "Join Queue". Done.',
    'tutorial.customer.step3.title': 'They see their live position and go about their day',
    'tutorial.customer.step3.desc': 'After joining, the customer sees their token number, how many people are ahead, and the estimated wait time. They can leave the shop, have tea, run an errand — and come back when it\'s almost their turn.',
    'tutorial.customer.step4.title': 'They get a call — and arrive right on time',
    'tutorial.customer.step4.desc': 'When the barber marks the current customer as done, the system automatically calls the next customer with a recorded Hindi message. "Aapki baari aa gayi hai, kripya barber shop aa jaiye."',
    'tutorial.barber.step1.title': 'Open your dashboard — bookmark it on your phone',
    'tutorial.barber.step1.desc': 'BarberWallah gives you a special URL for your dashboard. Save it as a bookmark on your phone\'s home screen. Open it every morning. Enter your 4-digit PIN. Your dashboard opens showing who is waiting, who is being served, and today\'s stats.',
    'tutorial.barber.step2.title': 'Add walk-in customers with one tap',
    'tutorial.barber.step2.desc': 'Some customers won\'t scan the QR. No problem. Tap "+ Add walk-in customer", enter their name and service. They get added to the back of the queue automatically — same as everyone else, fair position.',
    'tutorial.barber.step3.title': 'Tap "Done" — the system handles everything else',
    'tutorial.barber.step3.desc': 'When you finish a customer, tap the big "Done" button. The system immediately marks them complete, calls the next customer, updates wait times, and adds to earnings.',
    'tutorial.barber.step4.title': 'Loyalty rewards show automatically',
    'tutorial.barber.step4.desc': 'When a regular customer hits their loyalty milestone, their card shows a golden "Loyalty Reward" badge. You see exactly what discount to give. No memory needed.',
    'tutorial.ready': 'Ready to grow your business?',
    'tutorial.join': 'Join salons using BarberWallah to manage their queues and increase customer satisfaction.',
    'calc.title': 'Salon Profit Calculator',
    'calc.revenue': 'Total Revenue',
    'calc.expenses': 'Total Expenses',
    'calc.rent': 'Rent',
    'calc.products': 'Products',
    'calc.electricity': 'Electricity',
    'calc.staff': 'Staff',
    'calc.other': 'Other',
    'calc.profit': 'Net Profit',
    'calc.calculate': 'Calculate Profit',
    'loss.title': 'Customer Loss Calculator',
    'loss.step1': 'Step 1 of 2',
    'loss.question': 'How many customers walk away each day?',
    'loss.desc': 'Enter the number who leave without a haircut because the queue looks too long.',
    'loss.avgPrice': 'Average Price per Customer',
    'loss.dailyLoss': 'Daily Customer Loss (0-250)',
    'loss.estRevenueLoss': 'Estimated Revenue Loss',
    'loss.weekly': 'Weekly Loss',
    'loss.monthly': 'Monthly Loss',
    'loss.yearly': 'Yearly Loss',
    'loss.recover': 'Recover This Loss Now',
    'loss.guess': 'Guess Our Software Price',
    'loss.discount': 'Permanent Discount Unlocked!',
    'loss.guessCorrect': 'Your guess is almost correct!',
    'loss.step2': 'Step 2 of 2',
    'loss.guessQuestion': 'What do you think this software costs?',
    'loss.guessDesc': 'Guess the price of our software that helps you recover {amount} per year. Guess correctly to win a permanent discount!',
    'loss.guessPlaceholder': 'Enter your guess',
    'loss.submit': 'Submit',
    'loss.maybeLater': 'Maybe Later',
    'home.hero.title': 'Your salon, always full.',
    'home.hero.subtitle': 'No more walk-aways. No more chaos. Just happy customers and growing revenue.',
    'home.stats.salons': 'Salons Researched',
    'home.stats.loss': 'Avg Yearly Loss',
    'home.stats.payback': 'Pays For Itself',
    'home.features.qr.title': 'Join via QR',
    'home.features.qr.desc': 'Customers scan a QR code at your entrance to join the queue. No app download required.',
    'home.features.status.title': 'Real-time Status',
    'home.features.status.desc': 'Customers see their position and estimated wait time live on their phones.',
    'home.features.earnings.title': 'Earnings Tracking',
    'home.features.earnings.desc': 'Track your daily revenue, customer count, and discounts automatically.',
    'home.features.loyalty.title': 'Loyalty Rewards',
    'home.features.loyalty.desc': 'Automated digital punch cards to keep your regulars coming back.'
  },
  hi: {
    'app.name': 'BarberWallah',
    'nav.home': 'होम',
    'nav.login': 'लॉगिन',
    'nav.register': 'पंजीकरण',
    'nav.tutorial': 'ट्यूटोरियल',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.settings': 'सेटिंग्स',
    'nav.logout': 'लॉगआउट',
    'common.waiting': 'प्रतीक्षा',
    'common.served': 'सेवा दी गई',
    'common.avgWait': 'औसत प्रतीक्षा',
    'common.queueOpen': 'कतार खुली है',
    'common.queueClosed': 'कतार बंद है',
    'common.accepting': 'नए ग्राहकों को स्वीकार करना',
    'common.addWalkIn': 'वॉक-इन ग्राहक जोड़ें',
    'common.name': 'ग्राहक का नाम',
    'common.phone': 'फ़ोन (वैकल्पिक)',
    'common.service': 'सेवा चुनें',
    'common.addToQueue': 'कतार में जोड़ें',
    'common.nowServing': 'अभी सेवा दे रहे हैं',
    'common.waitingList': 'प्रतीक्षा सूची',
    'common.markDone': 'हो गया',
    'common.startService': 'सेवा शुरू करें',
    'common.call': 'कॉल करें',
    'common.noShow': 'नहीं आए',
    'common.token': 'टोकन',
    'common.estWait': 'अनुमानित प्रतीक्षा',
    'common.min': 'मिनट',
    'common.people': 'लोग',
    'common.peopleAhead': 'लोग आपसे आगे हैं',
    'common.personAhead': 'व्यक्ति आपसे आगे है',
    'common.yourTurn': 'आपकी बारी है!',
    'common.serviceComplete': 'सेवा पूरी हुई',
    'common.shopNotFound': 'दुकान नहीं मिली',
    'common.connectionError': 'कनेक्शन त्रुटि। कृपया पुनः प्रयास करें।',
    'common.invalidPhone': 'कृपया एक मान्य 10-अंकीय मोबाइल नंबर दर्ज करें',
    'common.joinFailed': 'कतार में शामिल होने में विफल। अनुमति अस्वीकृत या कनेक्शन त्रुटि।',
    'common.waitingNow': 'अभी प्रतीक्षा कर रहे हैं',
    'common.shopClosed': 'दुकान अभी बंद है। कृपया बाद में पुनः प्रयास करें।',
    'common.yourName': 'आपका नाम',
    'common.mobileNumber': 'मोबाइल नंबर',
    'common.joining': 'शामिल हो रहे हैं...',
    'common.alreadyJoined': 'पहले से शामिल हैं? मेरा टोकन खोजें',
    'common.noAppNeeded': 'किसी ऐप की आवश्यकता नहीं · लॉगिन की आवश्यकता नहीं',
    'common.callWhenTurn': 'आपकी बारी आने पर आपको कॉल प्राप्त होगी',
    'common.tokenNotFound': 'टोकन नहीं मिला',
    'common.yourToken': 'आपका टोकन',
    'common.yourTurnTitle': 'आपकी बारी!',
    'common.pleaseComeToShop': 'कृपया दुकान पर आएं',
    'common.pleaseStayNearby': 'कृपया पास ही रहें',
    'common.done': 'हो गया!',
    'common.seeYouNextTime': 'अगली बार मिलते हैं!',
    'common.joinAgain': 'फिर से शामिल हों',
    'common.location': 'स्थान',
    'common.contact': 'संपर्क',
    'common.updatingLive': 'हर 12 सेकंड में लाइव अपडेट हो रहा है',
    'loyalty.rewards': 'वफादारी पुरस्कार',
    'loyalty.rewardEarned': 'पुरस्कार मिला!',
    'loyalty.askDiscount': 'आज {pct}% छूट मांगें',
    'loyalty.moreVisits': 'अपना पुरस्कार पाने के लिए {count} और विज़िट',
    'common.cash': 'नकद',
    'common.noPhone': 'कोई फोन नहीं',
    'common.joinQueue': 'कतार में शामिल हों',
    'common.maxCapacity': 'अधिकतम प्रतीक्षा क्षमता',
    'common.maxCapacityDesc': 'असीमित क्षमता के लिए 0 पर सेट करें। यह ग्राहकों को दिखाया जाएगा।',
    'common.saveSettings': 'सेटिंग्स सहेजें',
    'common.waitingOccupancy': 'प्रतीक्षा कक्ष अधिभोग',
    'common.seatsOccupied': 'सीटें भरी हुई हैं',
    'common.full': 'प्रतीक्षा कक्ष भरा हुआ है',
    'nav.general': 'सामान्य',
    'settings.avgService': 'औसत सेवा समय (मिनट)',
    'settings.saveSuccess': 'सेटिंग्स सफलतापूर्वक सहेजी गईं!',
    'common.waitingInShop': 'क्या आप दुकान में इंतज़ार कर रहे हैं? (इससे रिक्तता बढ़ेगी)',
    'common.findToken': 'टोकन खोजें',
    'common.calculator': 'सैलून कैलकुलेटर',
    'common.open': 'खुला है',
    'common.closed': 'बंद है',
    'common.servedToday': 'आज सेवा दी गई',
    'common.queue': 'कतार',
    'common.earnings': 'कमाई',
    'common.customers': 'ग्राहक',
    'common.noServing': 'अभी कोई सेवा नहीं ले रहा है',
    'common.calledArriving': 'बुलाया गया / आ रहे हैं',
    'common.waitingCount': 'प्रतीक्षा',
    'common.queueEmpty': 'कतार खाली है — अपना QR कोड साझा करें!',
    'common.cashOnlyDesc': 'नकद ग्राहक / कोई फोन नहीं (कोई वफादारी ट्रैकिंग नहीं)',
    'nav.lossCalculator': 'हानि कैलकुलेटर',
    'nav.aiInsights': 'AI अंतर्दृष्टि',
    'earnings.title': 'कमाई का इतिहास',
    'earnings.date': 'तारीख',
    'earnings.customers': 'ग्राहक',
    'earnings.revenue': 'राजस्व',
    'earnings.empty': 'अभी तक कोई कमाई दर्ज नहीं की गई है',
    'loyalty.title': 'ग्राहक वफादारी',
    'loyalty.visits': 'विज़िट',
    'loyalty.streak': 'प्रगति',
    'loyalty.empty': 'अभी तक कोई ग्राहक ट्रैक नहीं किया गया है',
    'tutorial.title': 'यह कैसे काम करता है',
    'tutorial.subtitle': 'बस 3 आसान steps में सब कुछ होता है।',
    'tutorial.desc': 'कोई training नहीं चाहिए। कोई complicated app नहीं। Customer QR scan करता है। आप एक button दबाते हैं। बस।',
    'tutorial.customerJourney': 'Customer का सफर',
    'tutorial.barberJourney': 'Barber का काम',
    'tutorial.customer.step1.title': 'Customer दुकान पर QR Code scan करता है',
    'tutorial.customer.step1.desc': 'आप एक QR Code print करके दुकान के entrance पर लगाएं। जब customer आता है और queue देखता है, तो वो अपने phone के camera से QR scan करता है। कोई app download नहीं, कोई account नहीं।',
    'tutorial.customer.step2.title': 'नाम, नंबर और service भरते हैं — 30 seconds में',
    'tutorial.customer.step2.desc': 'Page पर दिखता है — अभी कितने लोग पहले से queue में हैं और कितना इंतज़ार करना पड़ेगा। Customer अपना नाम, mobile number, और service चुनता है। "Queue Join करें" button दबाते हैं।',
    'tutorial.customer.step3.title': 'Live position देखते हैं — और आराम से रहते हैं',
    'tutorial.customer.step3.desc': 'Queue join करने के बाद customer को दिखता है — उनका token number, कितने लोग आगे हैं, और कितनी देर का इंतज़ार। वो दुकान छोड़ सकते हैं, चाय पी सकते हैं — और जब बारी आने वाली हो, वापस आ जाएं।',
    'tutorial.customer.step4.title': 'Call आता है — और customer बिल्कुल सही time पर आता है',
    'tutorial.customer.step4.desc': 'जब barber "Done" दबाते हैं, system अगले customer को automatically call करता है। "Aapki baari aa gayi hai, kripya barber shop aa jaiye."',
    'tutorial.barber.step1.title': 'Dashboard खोलें — phone पर bookmark बनाएं',
    'tutorial.barber.step1.desc': 'BarberWallah आपको एक special link देता है आपके dashboard के लिए। उसे अपने phone की home screen पर bookmark करें। हर सुबह खोलें। 4-digit PIN डालें। आपका dashboard खुलेगा।',
    'tutorial.barber.step2.title': 'Walk-in customers को एक tap में जोड़ें',
    'tutorial.barber.step2.desc': 'कुछ customers QR scan नहीं करेंगे। कोई बात नहीं। "+ Walk-in customer जोड़ें" tap करें, नाम और service डालें। वो automatically queue के पीछे जुड़ जाते हैं।',
    'tutorial.barber.step3.title': '"Done" tap करें — बाकी सब system करता है',
    'tutorial.barber.step3.desc': 'जब एक customer का काम खत्म हो, उनके card पर बड़ा "Done" button दबाएं। System तुरंत उन्हें complete mark करता है और अगले को call करता है।',
    'tutorial.barber.step4.title': 'Loyalty reward automatic दिखता है',
    'tutorial.barber.step4.desc': 'जब कोई regular customer अपनी loyalty milestone पर पहुँचता है, उनके card पर सुनहरा "Loyalty Reward" badge दिखता है। आपको याद रखने की ज़रूरत नहीं।',
    'tutorial.ready': 'क्या आप अपने व्यवसाय को बढ़ाने के लिए तैयार हैं?',
    'tutorial.join': 'BarberWallah का उपयोग करने वाले सैलून में शामिल हों और अपने कतारों का प्रबंधन करें और ग्राहकों की संतुष्टि बढ़ाएं।',
    'calc.title': 'सैलून लाभ कैलकुलेटर',
    'calc.revenue': 'कुल राजस्व',
    'calc.expenses': 'कुल खर्च',
    'calc.rent': 'किराया',
    'calc.products': 'उत्पाद',
    'calc.electricity': 'बिजली',
    'calc.staff': 'कर्मचारी',
    'calc.other': 'अन्य',
    'calc.profit': 'शुद्ध लाभ',
    'calc.calculate': 'लाभ की गणना करें',
    'loss.title': 'ग्राहक हानि कैलकुलेटर',
    'loss.step1': 'चरण 1 का 2',
    'loss.question': 'हर दिन कितने ग्राहक वापस चले जाते हैं?',
    'loss.desc': 'उन लोगों की संख्या दर्ज करें जो बाल कटवाए बिना चले जाते हैं क्योंकि कतार बहुत लंबी लगती है।',
    'loss.avgPrice': 'प्रति ग्राहक औसत मूल्य',
    'loss.dailyLoss': 'दैनिक ग्राहक हानि (0-250)',
    'loss.estRevenueLoss': 'अनुमानित राजस्व हानि',
    'loss.weekly': 'साप्ताहिक हानि',
    'loss.monthly': 'मासिक हानि',
    'loss.yearly': 'वार्षिक हानि',
    'loss.recover': 'इस हानि को अभी ठीक करें',
    'loss.guess': 'हमारे सॉफ्टवेयर की कीमत का अनुमान लगाएं',
    'loss.discount': 'स्थायी छूट अनलॉक!',
    'loss.guessCorrect': 'आपका अनुमान लगभग सही है!',
    'loss.step2': 'चरण 2 का 2',
    'loss.guessQuestion': 'आपको क्या लगता है कि इस सॉफ्टवेयर की कीमत क्या है?',
    'loss.guessDesc': 'हमारे सॉफ्टवेयर की कीमत का अनुमान लगाएं जो आपको प्रति वर्ष {amount} रिकवर करने में मदद करता है। स्थायी छूट जीतने के लिए सही अनुमान लगाएं!',
    'loss.guessPlaceholder': 'अपना अनुमान दर्ज करें',
    'loss.submit': 'सबमिट करें',
    'loss.maybeLater': 'शायद बाद में',
    'home.hero.title': 'आपका सैलून, हमेशा भरा हुआ।',
    'home.hero.subtitle': 'कोई और वॉक-अवे नहीं। कोई और अराजकता नहीं। बस खुश ग्राहक और बढ़ता राजस्व।',
    'home.stats.salons': 'सैलून शोध किया',
    'home.stats.loss': 'औसत वार्षिक हानि',
    'home.stats.payback': 'अपने आप भुगतान करता है',
    'home.features.qr.title': 'QR के माध्यम से जुड़ें',
    'home.features.qr.desc': 'ग्राहक कतार में शामिल होने के लिए आपके प्रवेश द्वार पर एक QR कोड स्कैन करते हैं। किसी ऐप डाउनलोड की आवश्यकता नहीं है।',
    'home.features.status.title': 'वास्तविक समय स्थिति',
    'home.features.status.desc': 'ग्राहक अपने फोन पर अपनी स्थिति और अनुमानित प्रतीक्षा समय लाइव देखते हैं।',
    'home.features.earnings.title': 'कमाई ट्रैकिंग',
    'home.features.earnings.desc': 'अपने दैनिक राजस्व, ग्राहकों की संख्या और छूट को स्वचालित रूप से ट्रैक करें।',
    'home.features.loyalty.title': 'वफादारी पुरस्कार',
    'home.features.loyalty.desc': 'अपने नियमित ग्राहकों को वापस लाने के लिए स्वचालित डिजिटल पंच कार्ड।'
  }
};

export function isUserInIndia(): boolean {
  try {
    // 1. Check browser timezone (India has Asia/Kolkata or Asia/Calcutta)
    const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (timezone) {
      const tzLower = timezone.toLowerCase();
      if (tzLower.includes('kolkata') || tzLower.includes('calcutta') || tzLower.includes('india')) {
        return true;
      }
    }
    
    // 2. Check timezone offset (India is GMT+5:30, i.e., -330 mins)
    const offset = new Date().getTimezoneOffset();
    if (offset === -330) {
      return true;
    }

    // 3. Check browser language settings (EN-IN, HI, HI-IN)
    const languages = navigator.languages || [navigator.language || ''];
    for (const lang of languages) {
      const l = lang.toLowerCase();
      if (l.includes('-in') || l.startsWith('hi')) {
        return true;
      }
    }

    return false;
  } catch (e) {
    return false;
  }
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageInternal] = useState<Language>(() => {
    if (!isUserInIndia()) {
      return 'en';
    }
    return (localStorage.getItem('language') as Language) || 'en';
  });

  const setLanguage = (lang: Language) => {
    if (!isUserInIndia()) {
      setLanguageInternal('en');
    } else {
      setLanguageInternal(lang);
    }
  };

  useEffect(() => {
    if (!isUserInIndia() && language !== 'en') {
      setLanguageInternal('en');
    }
  }, [language]);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
