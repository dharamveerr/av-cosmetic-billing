/* AV Cosmetics & Bangle Store - billing app. Plain JavaScript, no libraries. Data is saved in a Supabase cloud database. */
(function(){
var KEY='shopbill-v1',LKEY='shopbill-lang';
var $=function(s,r){return (r||document).querySelector(s)};
var esc=function(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})};
var money=function(n){return '₹'+(Math.round(n*100)/100).toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})};
var r2=function(n){return Math.round(n*100)/100};
/* Customer names: first letter of every word capital, the rest small (Dharamveer Gupta), whatever way it was typed */
var titleCase=function(s){return String(s==null?'':s).trim().replace(/\s+/g,' ').toLowerCase().replace(/(^|[\s\-'\u2019.])(\p{L})/gu,function(m,a,b){return a+b.toUpperCase()})};
var uid=function(){return Math.random().toString(36).slice(2,8)+Date.now().toString(36).slice(-4)};
function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function nowTime(){var d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')}

/* ---------- language ---------- */
var HI={
'AV Cosmetics & Bangle Store':'एवी कॉस्मेटिक्स और बैंगल स्टोर','Billing Desk':'बिलिंग डेस्क',
'New bill':'नया बिल','Bill history':'बिल इतिहास','Items':'सामान','Customers':'ग्राहक','Reports':'रिपोर्ट','Backup':'बैकअप',
'Example data loaded.':'नमूना डेटा लोड है।',
'The items and customers below are samples. Edit them in Items and Customers, or clear all examples in Backup.':'नीचे दिए सामान और ग्राहक नमूने हैं। इन्हें सामान और ग्राहक टैब में बदलें, या बैकअप टैब से सभी नमूने हटाएँ।',
'Search items by name':'नाम से सामान खोजें','All':'सभी','out of stock':'स्टॉक खत्म','left':'बचे',
'No items match. Add items in the Items tab.':'कोई सामान नहीं मिला। सामान टैब में सामान जोड़ें।',
'Current bill':'वर्तमान बिल','Customer':'ग्राहक','Walk-in customer':'सामान्य ग्राहक','+ New customer…':'+ नया ग्राहक…',
'Name':'नाम','Customer name':'ग्राहक का नाम','Phone':'फ़ोन','Phone number':'फ़ोन नंबर',
'Decrease':'घटाएँ','Increase':'बढ़ाएँ','Quantity':'मात्रा','Remove':'हटाएँ',
'Tap an item to add it to the bill.':'बिल में जोड़ने के लिए सामान पर टैप करें।',
'Discount':'छूट','Flat ₹':'सीधी ₹','Percent %':'प्रतिशत %','Amount':'राशि','Payment':'भुगतान',
'cash':'नकद','UPI':'UPI','card':'कार्ड','other':'अन्य','Notes':'टिप्पणी','Optional':'वैकल्पिक',
'Who is this bill for?':'यह बिल किसके लिए है?','Search customer by name or phone':'नाम या फ़ोन से ग्राहक खोजें','No customers match.':'कोई ग्राहक नहीं मिला।',
'+ New customer':'+ नया ग्राहक','Continue':'आगे बढ़ें','Cancel':'रद्द करें','Bill for':'बिल किसका','Change':'बदलें','More options':'और विकल्प','Fewer options':'कम विकल्प','Add GST':'जीएसटी जोड़ें',
'GST is added at each item\'s rate.':'हर सामान की अपनी दर से जीएसटी जुड़ेगा।',
'Pending':'बकाया','Paid':'जमा','Quantity sold':'बिकी मात्रा','Pending today':'आज का बकाया','Yesterday':'कल','Last 7 days':'पिछले 7 दिन','This month':'इस महीने','All time':'सारा समय','All customers':'सभी ग्राहक','All payment modes':'सभी भुगतान तरीके','Min total':'कम से कम कुल','Max total':'ज़्यादा से ज़्यादा कुल','Sort by':'क्रम','Newest first':'नया पहले','Oldest first':'पुराना पहले',
'Total: high to low':'कुल: ज़्यादा से कम','Total: low to high':'कुल: कम से ज़्यादा','Due: high to low':'बाकी: ज़्यादा से कम','Due: low to high':'बाकी: कम से ज़्यादा','Paid: high to low':'जमा: ज़्यादा से कम','Paid: low to high':'जमा: कम से ज़्यादा','Customer A to Z':'ग्राहक A से Z','Customer Z to A':'ग्राहक Z से A','Bill number: low to high':'बिल नंबर: कम से ज़्यादा','Bill number: high to low':'बिल नंबर: ज़्यादा से कम','Bin':'बिन','Moved to Bin':'बिन में डाला गया','Restored':'वापस आ गया','Delete forever':'हमेशा के लिए हटाएँ','Deleted on':'हटाने की तारीख','Days left':'बचे दिन','Type':'प्रकार','Deleted for good':'हमेशा के लिए हटा दिया','Delete customer':'ग्राहक हटाएँ',
'Deleted items, customers and categories stay here for 30 days. You can restore them until then. After 30 days they are deleted for good.':'हटाए गए सामान, ग्राहक और श्रेणियाँ यहाँ 30 दिन रहते हैं। तब तक आप उन्हें वापस ला सकते हैं। 30 दिन बाद वे हमेशा के लिए हट जाते हैं।','Bills are never deleted. Use Cancel bill to cancel one.':'बिल कभी नहीं हटाए जाते। बिल रद्द करने के लिए "बिल रद्द करें" दबाएँ।','The Bin is empty.':'बिन खाली है।',
'This customer still owes':'इस ग्राहक का बकाया है','Collect the payment first.':'पहले भुगतान ले लें।','Please check the bill. It is saved only when you press Confirm & save.':'कृपया बिल जाँच लें। "पक्का करें और सहेजें" दबाने पर ही यह सहेजा जाएगा।','edited':'बदला हुआ','By invoice':'बिल-वार','By date':'तारीख-वार','Time':'समय','Balance after':'इसके बाद बाकी','Total received':'कुल प्राप्त','No payments found.':'कोई भुगतान नहीं मिला।','Share PDF':'PDF शेयर करें','Download PDF':'PDF डाउनलोड करें','PDF downloaded. Attach it in WhatsApp.':'PDF डाउनलोड हो गया। इसे WhatsApp में जोड़ें।','PDF could not be created':'PDF नहीं बन सका',
'Review bill':'बिल जाँचें','Please check the bill before saving.':'सहेजने से पहले बिल जाँच लें।','Back':'वापस','Confirm & save':'पक्का करें और सहेजें',
'Import items from Excel':'Excel से सामान जोड़ें','Save your Excel sheet as CSV using the columns in the sample. Name and one price are needed. Then choose the file here.':'अपनी Excel शीट को नमूने के कॉलम के साथ CSV के रूप में सहेजें। नाम और एक कीमत ज़रूरी हैं। फिर फ़ाइल यहाँ चुनें।',
'Import items':'सामान जोड़ें','no price':'कीमत नहीं है','item already exists':'सामान पहले से है','Manual unit needs the unit name and pieces':'मैनुअल इकाई के लिए इकाई का नाम और पीस चाहिए','Manual (own unit)':'मैनुअल (अपनी इकाई)','Unit name':'इकाई का नाम','Pieces in one unit':'एक इकाई में पीस','Price per unit (\u20B9)':'प्रति इकाई कीमत (\u20B9)','e.g. Set':'जैसे सेट',
'Enter the unit name and how many pieces it holds':'इकाई का नाम और उसमें कितने पीस हैं, लिखें','Only the unit name is needed. Pieces and price are optional. Example: Set, 6 pieces, \u20B9300 shows as "2 Set (12 pcs)" on a bill.':'सिर्फ़ इकाई का नाम ज़रूरी है। पीस और कीमत वैकल्पिक हैं। उदाहरण: सेट, 6 पीस, \u20B9300 बिल में "2 सेट (12 पीस)" दिखेगा।','Enter the unit name':'इकाई का नाम लिखें','Manual unit needs the unit name':'मैनुअल इकाई के लिए इकाई का नाम चाहिए','Import customers from Excel':'Excel से ग्राहक जोड़ें','Save your Excel sheet as CSV, with the columns Name, Mobile Number and Address. Then choose the file here.':'अपनी Excel शीट को CSV के रूप में सहेजें, जिसमें Name, Mobile Number और Address कॉलम हों। फिर फ़ाइल यहाँ चुनें।',
'Download sample CSV':'नमूना CSV डाउनलोड करें','Import customers':'ग्राहक जोड़ें','Or paste the rows here':'या पंक्तियाँ यहाँ पेस्ट करें','Row':'पंक्ति','no name':'नाम नहीं है','mobile number must be 10 digits':'मोबाइल नंबर 10 अंकों का होना चाहिए','mobile number already exists':'मोबाइल नंबर पहले से है',
'Choose a CSV file or paste the rows first':'पहले CSV फ़ाइल चुनें या पंक्तियाँ पेस्ट करें','Added':'जोड़े गए','Skipped':'छोड़े गए','Switch to light mode':'लाइट मोड चालू करें','Switch to dark mode':'डार्क मोड चालू करें','Sign in':'साइन इन','Sign out':'साइन आउट','Email':'ईमेल','Password':'पासवर्ड','Wrong email or password':'ईमेल या पासवर्ड गलत है','Could not connect. Check your internet.':'कनेक्ट नहीं हो सका। इंटरनेट जाँचें।',
'Only people added by the shop owner can sign in.':'सिर्फ़ दुकान मालिक द्वारा जोड़े गए लोग ही साइन इन कर सकते हैं।','Loading\u2026':'लोड हो रहा है\u2026','Try again':'फिर कोशिश करें','Could not save. Check your internet and try again.':'सहेजा नहीं जा सका। इंटरनेट जाँचकर फिर कोशिश करें।',
'This number is already used by another customer':'यह नंबर किसी और ग्राहक का है','Data found on this phone.':'इस फ़ोन पर डेटा मिला।','Import it into the cloud database once, so every phone can see it.':'इसे एक बार क्लाउड डेटाबेस में जोड़ें, ताकि हर फ़ोन पर दिखे।',
'Import into cloud':'क्लाउड में जोड़ें','Imported':'जोड़ा गया','Add this backup to the database?':'यह बैकअप डेटाबेस में जोड़ें?','Refresh data':'डेटा ताज़ा करें','Data refreshed':'डेटा ताज़ा हुआ',
'Restoring adds the backup to the database. Items, customers and bills that already exist are skipped.':'बैकअप वापस लाने पर वह डेटाबेस में जुड़ता है। जो सामान, ग्राहक और बिल पहले से हैं उन्हें छोड़ दिया जाता है।',
'Your data is saved in the cloud database. Everyone you add as a user can sign in and see it. The backup contains customer phone numbers, so keep it private.':'आपका डेटा क्लाउड डेटाबेस में सहेजा जाता है। जिन्हें आप जोड़ेंगे वे साइन इन करके इसे देख सकेंगे। बैकअप में ग्राहकों के फ़ोन नंबर हैं, इसे निजी रखें।',
'Pick a saved backup file, or paste the backup text below. The backup is added to the database.':'सहेजी हुई बैकअप फ़ाइल चुनें, या नीचे बैकअप टेक्स्ट पेस्ट करें। बैकअप डेटाबेस में जुड़ जाएगा।','View bill':'बिल देखें','Enter amount':'राशि लिखें','Amount received now (\u20B9)':'अभी प्राप्त राशि (\u20B9)','Enter the amount received first.':'पहले प्राप्त राशि लिखें।','More than the balance due':'बाकी रकम से ज़्यादा',
'If the customer will pay the rest later, leave it. The balance stays in Pending until you record the payment.':'अगर ग्राहक बाकी रकम बाद में देगा तो कुछ न करें। भुगतान दर्ज करने तक यह बकाया में रहेगा।','10-digit number':'10 अंक का नंबर','Phone number must be 10 digits':'फ़ोन नंबर 10 अंकों का होना चाहिए','This number already belongs to':'यह नंबर पहले से इनका है','Skin Care':'त्वचा की देखभाल','Hair Accessories':'हेयर एक्सेसरीज़','Jewellery':'ज्वैलरी','Bindi & Sindoor':'बिंदी और सिंदूर','Mehndi':'मेहंदी','Perfume':'परफ्यूम','Other':'अन्य',
'In stock':'स्टॉक में','Low stock':'कम स्टॉक','Out of stock':'स्टॉक खत्म','Categories':'श्रेणियाँ','Add category':'श्रेणी जोड़ें','New category name':'नई श्रेणी का नाम','Choose a category':'श्रेणी चुनें',
'+ Add new category\u2026':'+ नई श्रेणी जोड़ें\u2026','Category added':'श्रेणी जुड़ गई','No items in this view.':'इस फ़िल्टर में कोई सामान नहीं।','Only':'सिर्फ़','in stock':'स्टॉक में',
'Balance after this payment':'इस भुगतान के बाद बाकी','Full balance':'पूरा बाकी','Amount is more than the balance due':'राशि बाकी रकम से ज़्यादा है','Part paid':'आंशिक जमा','Receive':'भुगतान लें',
'The balance will be added to the pending list.':'बाकी रकम बकाया सूची में जुड़ जाएगी।','You can record this balance in several parts. Each part is saved with its date.':'यह बाकी रकम कई बार में दर्ज कर सकते हैं। हर किस्त तारीख के साथ सहेजी जाती है।','pc':'पीस','pcs':'पीस','dozen':'दर्जन','Piece':'पीस','Dozen (12 pcs)':'दर्जन (12 पीस)','Unit':'इकाई',
'Price per piece (\u20B9)':'कीमत प्रति पीस (\u20B9)','Price per dozen (\u20B9)':'कीमत प्रति दर्जन (\u20B9)','Sold by default in':'आमतौर पर बिकता है','Stock (pieces)':'स्टॉक (पीस)','Pieces sold':'बिके पीस',
'1 dozen = 12 pieces. Fill one price and the other is worked out. Fill both to set a special dozen price.':'1 दर्जन = 12 पीस। एक कीमत भरें, दूसरी अपने आप निकल जाएगी। दर्जन का अलग भाव रखना हो तो दोनों भरें।','Paid':'जमा','Paid now':'अभी जमा','Balance left':'बाकी रकम','Full':'पूरा','Balance due':'बाकी','Due':'बाकी','Unpaid':'बाकी','Payments':'भुगतान विवरण','Amount received':'प्राप्त राशि',
'Record payment':'भुगतान दर्ज करें','Receive payment':'भुगतान लें','Applied to the oldest unpaid bills first.':'सबसे पुराने बकाया बिलों में पहले जुड़ेगा।','Account':'खाता','Total pending':'कुल बकाया',
'Customers with pending':'बकाया वाले ग्राहक','Pending bills':'बकाया बिल','Invoice':'बिल नंबर','Oldest':'सबसे पुराना','Pending invoices':'बकाया बिल सूची','Pending by customer':'ग्राहक-वार बकाया',
'No pending amounts. Every bill is fully paid.':'कोई बकाया नहीं। सभी बिल पूरे चुकाए गए हैं।','Choose a customer to keep a pending amount':'बकाया रखने के लिए ग्राहक चुनें',
'Enter a valid amount':'सही राशि लिखें','Payment recorded':'भुगतान दर्ज हुआ','Collected':'वसूली',
'Cosmetics':'कॉस्मेटिक्स','Bangles':'चूड़ियाँ','Name (English)':'नाम (अंग्रेज़ी)','Name (Hindi)':'नाम (हिन्दी)','Enter the item name':'सामान का नाम लिखें',
'Type the name in English. In Hindi mode it is written in Hindi automatically. Fill the Hindi name only to correct the spelling.':'नाम अंग्रेज़ी में लिखें। हिन्दी मोड में वह अपने आप हिन्दी में दिखेगा। स्पेलिंग सुधारनी हो तभी हिन्दी नाम भरें।',
'Subtotal':'उप-योग','GST':'जीएसटी','Total':'कुल','Save bill':'बिल सहेजें','Clear':'साफ़ करें',
'Enter the customer name':'ग्राहक का नाम लिखें','Saved':'सहेजा गया',
'Tax invoice / cash memo':'कर चालान / कैश मेमो','Bill':'बिल','CANCELLED':'रद्द','Paid by':'भुगतान','Thank you, visit again':'धन्यवाद, फिर पधारें','TOTAL':'कुल',
'Cancelled':'रद्द','cancelled':'रद्द हुआ','Close':'बंद करें','Copy as text':'टेक्स्ट कॉपी करें','Cancel bill':'बिल रद्द करें',
'Tap again to cancel':'रद्द करने के लिए फिर टैप करें','Bill copied':'बिल कॉपी हुआ','Copied':'कॉपी हुआ',
'Send the copied text on WhatsApp, or paste it into a printing app for your thermal printer.':'कॉपी किया टेक्स्ट WhatsApp पर भेजें, या थर्मल प्रिंटर के प्रिंटिंग ऐप में पेस्ट करें।',
'Select the text and copy it':'टेक्स्ट चुनकर कॉपी करें',
'Search':'खोजें','Customer name, phone or bill number':'ग्राहक का नाम, फ़ोन या बिल नंबर','From':'से','To':'तक','Date':'तारीख','View':'देखें',
'No bills match this search.':'इस खोज से कोई बिल नहीं मिला।',
'No bills yet. Save a bill from the New bill tab and it will appear here.':'अभी कोई बिल नहीं है। नया बिल टैब से बिल सहेजें, वह यहाँ दिखेगा।',
'Item master':'सामान सूची','Item':'सामान','Category':'श्रेणी','Price':'कीमत','Stock':'स्टॉक','Edit':'बदलें','Delete':'हटाएँ',
'No items yet. Add the first one using the form.':'अभी कोई सामान नहीं है। फ़ॉर्म से पहला सामान जोड़ें।',
'Add item':'सामान जोड़ें','e.g. Eyeliner':'जैसे आईलाइनर','Cosmetics, Bangles…':'कॉस्मेटिक्स, चूड़ियाँ…',
'Price (₹)':'कीमत (₹)','GST rate %':'जीएसटी दर %','HSN code':'HSN कोड','Cancel edit':'बदलाव रद्द करें','Save changes':'बदलाव सहेजें','Edit item':'सामान बदलें',
'Changing a price here never changes old bills. They keep the price they were billed at.':'यहाँ कीमत बदलने से पुराने बिल नहीं बदलते। वे उसी कीमत पर रहते हैं जिस पर बने थे।',
'Enter a valid price':'सही कीमत लिखें','Item updated':'सामान अपडेट हुआ','Item added':'सामान जुड़ गया','Sure?':'पक्का?','Item deleted':'सामान हटाया गया',
'Bills':'बिल','Spent':'खर्च','Address':'पता','Add customer':'ग्राहक जोड़ें','Edit customer':'ग्राहक बदलें','Customer updated':'ग्राहक अपडेट हुआ','Customer added':'ग्राहक जुड़ गया',
'No customers yet. They are added when you bill a new customer.':'अभी कोई ग्राहक नहीं है। नए ग्राहक का बिल बनाने पर वे जुड़ जाते हैं।',
'Past bills keep the name they were saved with, even if you edit the customer later.':'ग्राहक को बाद में बदलने पर भी पुराने बिल में वही नाम रहता है जिससे वे सहेजे गए थे।',
'Today':'आज','Sales':'बिक्री','Daily sales':'दैनिक बिक्री','Monthly sales':'मासिक बिक्री','Month':'महीना','Item-wise sales':'सामान-वार बिक्री','Qty sold':'बिकी मात्रा',
'At closing, check the cash and UPI figures against your drawer and your UPI app.':'दुकान बंद करते समय नकद और UPI के आँकड़े अपने गल्ले और UPI ऐप से मिलाएँ।',
'Nothing to show yet. Save a bill and the figures appear here.':'अभी दिखाने को कुछ नहीं है। बिल सहेजें, आँकड़े यहाँ दिखेंगे।',
'Cancelled bills are left out of every figure.':'रद्द बिल किसी भी आँकड़े में शामिल नहीं हैं।',
'Back up':'बैकअप लें','Copy all items, customers and bills as one block of text. Paste it into a note or a file and keep it in Google Drive or on a computer. Do this at least once a week.':'सारा सामान, ग्राहक और बिल एक टेक्स्ट के रूप में कॉपी करें। इसे नोट या फ़ाइल में पेस्ट करके Google Drive या कंप्यूटर पर रखें। हफ़्ते में कम से कम एक बार करें।',
'Copy backup':'बैकअप कॉपी करें','Show backup text':'बैकअप टेक्स्ट दिखाएँ','Backup copied':'बैकअप कॉपी हुआ',
'Your data is saved in this browser only. Clearing browser data or resetting the phone erases it. The backup contains customer phone numbers, so keep it private.':'आपका डेटा सिर्फ़ इसी ब्राउज़र में सहेजा गया है। ब्राउज़र डेटा साफ़ करने या फ़ोन रीसेट करने पर यह मिट जाएगा। बैकअप में ग्राहकों के फ़ोन नंबर हैं, इसे निजी रखें।',
'Restore':'वापस लाएँ','Pick a saved backup file, or paste the backup text below. This replaces everything now in the app.':'सहेजी हुई बैकअप फ़ाइल चुनें, या नीचे बैकअप टेक्स्ट पेस्ट करें। इससे ऐप का मौजूदा सारा डेटा बदल जाएगा।',
'Paste backup text here':'बैकअप टेक्स्ट यहाँ पेस्ट करें','Restore from text':'टेक्स्ट से वापस लाएँ','Replace all data?':'सारा डेटा बदलें?',
'Backup restored':'बैकअप वापस आ गया','That text is not a valid backup':'यह टेक्स्ट सही बैकअप नहीं है',
'Clear example data':'नमूना डेटा हटाएँ','Remove sample data?':'नमूना डेटा हटाएँ?','Sample data removed':'नमूना डेटा हटा दिया',
'Clear example data removes the sample items and customers and keeps your own bills.':'नमूना डेटा हटाने से नमूना सामान और ग्राहक हट जाते हैं, आपके अपने बिल बने रहते हैं।'
};
var lang='en';
try{var sl=localStorage.getItem(LKEY);if(sl==='hi'||sl==='en')lang=sl}catch(e){}
function t(k){return lang==='hi'&&HI[k]?HI[k]:k}
var HN={'Matte Lipstick':'मैट लिपस्टिक','Kajal Pencil':'काजल पेंसिल','Compact Powder':'कॉम्पैक्ट पाउडर','Nail Polish':'नेल पॉलिश','Face Cream 50g':'फेस क्रीम 50 ग्राम',
'Glass Bangles (set of 12)':'काँच की चूड़ियाँ (12 का सेट)','Silk Thread Bangles (pair)':'सिल्क थ्रेड चूड़ियाँ (जोड़ी)','Kundan Bangle':'कुंदन कंगन','Lac Bangles (set of 6)':'लाख की चूड़ियाँ (6 का सेट)',
'Priya Sharma':'प्रिया शर्मा','Anita Verma':'अनीता वर्मा','Walk-in customer':'सामान्य ग्राहक'};
/* Automatic English to Hindi writing: common shop words first, then a phonetic fallback. */
var HW={lipstick:'लिपस्टिक',matte:'मैट',kajal:'काजल',pencil:'पेंसिल',compact:'कॉम्पैक्ट',powder:'पाउडर',nail:'नेल',polish:'पॉलिश',face:'फेस',cream:'क्रीम',glass:'काँच',
bangle:'चूड़ी',bangles:'चूड़ियाँ',silk:'सिल्क',thread:'थ्रेड',kundan:'कुंदन',lac:'लाख',eyeliner:'आईलाइनर',eyeshadow:'आईशैडो',mascara:'मस्कारा',foundation:'फाउंडेशन',concealer:'कंसीलर',
blush:'ब्लश',highlighter:'हाइलाइटर',primer:'प्राइमर',serum:'सीरम',lotion:'लोशन',shampoo:'शैम्पू',conditioner:'कंडीशनर',soap:'साबुन',oil:'तेल',hair:'हेयर',gel:'जेल',spray:'स्प्रे',
perfume:'परफ्यूम',deodorant:'डियोडरेंट',body:'बॉडी',wash:'वॉश',scrub:'स्क्रब',mask:'मास्क',sunscreen:'सनस्क्रीन',moisturizer:'मॉइस्चराइज़र',moisturiser:'मॉइस्चराइज़र',toner:'टोनर',
cleanser:'क्लेंज़र',remover:'रिमूवर',brush:'ब्रश',sponge:'स्पंज',mirror:'आईना',comb:'कंघी',clip:'क्लिप',band:'बैंड',ring:'अंगूठी',rings:'अंगूठियाँ',earring:'बाली',earrings:'बालियाँ',
necklace:'नेकलेस',bindi:'बिंदी',sindoor:'सिंदूर',mehndi:'मेहंदी',henna:'मेहंदी',kumkum:'कुमकुम',alta:'आलता',chain:'चेन',bracelet:'ब्रेसलेट',metal:'मेटल',gold:'गोल्ड',golden:'सुनहरी',
silver:'सिल्वर',red:'लाल',green:'हरी',blue:'नीली',black:'काली',white:'सफ़ेद',pink:'गुलाबी',yellow:'पीली',small:'छोटा',medium:'मीडियम',large:'बड़ा',big:'बड़ा',set:'सेट',pair:'जोड़ी',pack:'पैक',
box:'डिब्बा',pcs:'पीस',piece:'पीस',pieces:'पीस',of:'का',and:'और',for:'के लिए',with:'के साथ',g:'ग्राम',gm:'ग्राम',ml:'मि.ली.',kg:'किलो',designer:'डिज़ाइनर',bridal:'ब्राइडल',party:'पार्टी',
fancy:'फ़ैंसी',plain:'सादा',stone:'स्टोन',pearl:'मोती',moti:'मोती',kada:'कड़ा',churi:'चूड़ी',chudi:'चूड़ी',kangan:'कंगन',gloss:'ग्लॉस',lip:'लिप',balm:'बाम',eye:'आई',liner:'लाइनर',shadow:'शैडो',
cosmetics:'कॉस्मेटिक्स',cosmetic:'कॉस्मेटिक',jewellery:'ज्वैलरी',jewelry:'ज्वैलरी',accessories:'एक्सेसरीज़',hairband:'हेयरबैंड',scrunchie:'स्क्रंची',bag:'बैग',purse:'पर्स',
priya:'प्रिया',anita:'अनीता',sharma:'शर्मा',verma:'वर्मा',gupta:'गुप्ता',singh:'सिंह',kumar:'कुमार',kumari:'कुमारी',devi:'देवी',rani:'रानी',pooja:'पूजा',puja:'पूजा',neha:'नेहा',sunita:'सुनीता',
sunil:'सुनील',ravi:'रवि',rahul:'राहुल',amit:'अमित',ramesh:'रमेश',suresh:'सुरेश',geeta:'गीता',seema:'सीमा',meena:'मीना',rekha:'रेखा',kavita:'कविता',sita:'सीता',radha:'राधा',ritu:'रितु',
jyoti:'ज्योति',sapna:'सपना',shweta:'श्वेता',mohan:'मोहन',lal:'लाल',jain:'जैन',agarwal:'अग्रवाल',yadav:'यादव',mishra:'मिश्रा',pandey:'पांडे',tiwari:'तिवारी',khan:'ख़ान',ali:'अली',
fatima:'फ़ातिमा',sana:'सना',nisha:'निशा',kiran:'किरण',manju:'मंजू',sushma:'सुषमा',madhu:'मधु',mamta:'ममता',anju:'अंजू',asha:'आशा',usha:'उषा',poonam:'पूनम',sonia:'सोनिया',sonam:'सोनम',cone:'कोन',packet:'पैकेट',patel:'पटेल',rao:'राव',anarkali:'अनारकली',mehta:'मेहता',shah:'शाह',reddy:'रेड्डी',nair:'नायर',iyer:'अय्यर',joshi:'जोशी',chauhan:'चौहान',thakur:'ठाकुर',
saxena:'सक्सेना',bansal:'बंसल',goel:'गोयल',garg:'गर्ग',kapoor:'कपूर',malhotra:'मल्होत्रा',arora:'अरोड़ा',chopra:'चोपड़ा',bhatia:'भाटिया',sethi:'सेठी',kit:'किट',stick:'स्टिक',cleaner:'क्लीनर',
tikka:'टीका',maang:'मांग',payal:'पायल',anklet:'पायल',nose:'नाक',pin:'पिन',pins:'पिन',hairpin:'हेयरपिन',clutcher:'क्लचर',clutch:'क्लच',duo:'ड्यूओ',combo:'कॉम्बो',offer:'ऑफ़र'};
var CONS=[['chh','छ'],['ksh','क्ष'],['kh','ख'],['gh','घ'],['ch','च'],['jh','झ'],['th','थ'],['dh','ध'],['ph','फ'],['bh','भ'],['sh','श'],['k','क'],['g','ग'],['c','क'],['j','ज'],['t','त'],['d','द'],['p','प'],['b','ब'],['n','न'],['m','म'],['y','य'],['r','र'],['l','ल'],['v','व'],['w','व'],['s','स'],['h','ह'],['f','फ'],['z','ज'],['q','क'],['x','क्स']];
var VOW=[['aa','आ','ा'],['ee','ई','ी'],['oo','ऊ','ू'],['ai','ऐ','ै'],['au','औ','ौ'],['ou','औ','ौ'],['a','अ',''],['i','इ','ि'],['u','उ','ु'],['e','ए','े'],['o','ओ','ो']];
function phon(w){
  if(w.length>3&&/[^aeiou]e$/.test(w)&&/[aeiou]/.test(w.slice(0,-1)))w=w.slice(0,-1);
  var i=0,toks=[],j,m,last='',out='';
  while(i<w.length){
    m=null;
    for(j=0;j<VOW.length;j++)if(w.substr(i,VOW[j][0].length)===VOW[j][0]){m=['v',VOW[j]];i+=VOW[j][0].length;last='';break}
    if(!m)for(j=0;j<CONS.length;j++)if(w.substr(i,CONS[j][0].length)===CONS[j][0]){
      var key=CONS[j][0],val=CONS[j][1];if(key==='c'&&'eiy'.indexOf(w[i+1]||'')>-1)val='स';
      i+=key.length;if(key===last){m=['s']}else{m=['c',val];last=key}break}
    if(!m){toks.push(['x',w[i]]);i++;last='';continue}
    if(m[0]!=='s')toks.push(m);
  }
  var prevC=false;
  toks.forEach(function(tk,n){
    if(tk[0]==='c'){if(prevC)out+='्';out+=tk[1];prevC=true}
    else if(tk[0]==='v'){var v=tk[1];if(prevC)out+=(v[0]==='a'&&n===toks.length-1)?'ा':v[2];else out+=v[1];prevC=false}
    else{out+=tk[1];prevC=false}
  });
  return out;
}
var trCache={};
function tr(s){
  s=String(s==null?'':s);if(trCache[s]!=null)return trCache[s];
  return (trCache[s]=s.replace(/[A-Za-z]+/g,function(w){var l=w.toLowerCase();return HW[l]||phon(l)}));
}
function hn(o,k,h){k=k||'name';h=h||'nameHi';return o[h]||HN[o[k]]||tr(o[k])}
function nm(o,k,h){k=k||'name';return lang==='hi'?hn(o,k,h):o[k]}
function tc(c){return lang==='hi'?(HI[c]||tr(c)):c}

/* ---------- data: Supabase cloud database (plain fetch, no library) ---------- */
var DEFAULT_CATS=['Cosmetics','Bangles','Skin Care','Hair Accessories','Jewellery','Bindi & Sindoor','Mehndi','Perfume','Other'];
var db={items:[],clients:[],bills:[],categories:[],bin:[]};
var legacy=null;
function migrate(){
  db.items.forEach(function(i){if(!i.nameHi&&HN[i.name])i.nameHi=HN[i.name]});
  db.clients.forEach(function(c){if(!c.nameHi&&HN[c.name])c.nameHi=HN[c.name]});
}
function save(){}  /* every change is sent to the database as it happens */

var CFG=window.AV_CONFIG||{},AKEY='shopbill-auth',auth=null;
try{auth=JSON.parse(localStorage.getItem(AKEY))}catch(e){}
function setAuth(a){auth=a;try{if(a)localStorage.setItem(AKEY,JSON.stringify(a));else localStorage.removeItem(AKEY)}catch(e){}}
function sessionFrom(j,email){return {access_token:j.access_token,refresh_token:j.refresh_token,expires_at:Math.floor(Date.now()/1000)+(j.expires_in||3600),email:(j.user&&j.user.email)||email||''}}
function authFetch(grant,body){
  return fetch(CFG.url+'/auth/v1/token?grant_type='+grant,{method:'POST',headers:{apikey:CFG.key,'Content-Type':'application/json'},body:JSON.stringify(body)})
    .then(function(r){return r.json().then(function(j){if(!r.ok)throw new Error(j.error_description||j.msg||j.message||'Sign in failed');return j})});
}
function signIn(email,pw){return authFetch('password',{email:email,password:pw}).then(function(j){setAuth(sessionFrom(j,email))})}
function getToken(){
  if(!auth)return Promise.reject(new Error('not-signed-in'));
  if(auth.expires_at-60>Date.now()/1000)return Promise.resolve(auth.access_token);
  return authFetch('refresh_token',{refresh_token:auth.refresh_token}).then(function(j){setAuth(sessionFrom(j,auth.email));return auth.access_token},function(){setAuth(null);throw new Error('not-signed-in')});
}
function rest(method,path,body,prefer){
  return getToken().then(function(tok){
    var h={apikey:CFG.key,Authorization:'Bearer '+tok,'Content-Type':'application/json'};if(prefer)h.Prefer=prefer;
    return fetch(CFG.url+path,{method:method,headers:h,body:body==null?undefined:JSON.stringify(body)});
  }).then(function(r){
    return r.text().then(function(tx){
      var j=null;try{j=tx?JSON.parse(tx):null}catch(e){}
      if(!r.ok){if(r.status===401){setAuth(null);throw new Error('not-signed-in')}throw new Error((j&&(j.message||j.error_description))||('Error '+r.status))}
      return j;
    });
  });
}
function upsert(table,row,key){return rest('POST','/rest/v1/'+table+'?on_conflict='+(key||'id'),row,'resolution=merge-duplicates,return=minimal')}
function del(table,col,val){return rest('DELETE','/rest/v1/'+table+'?'+col+'=eq.'+encodeURIComponent(val),null,'return=minimal')}
/* Bin: deleting only marks a row with a date; it can be restored for 30 days */
function binSet(table,col,val,at){return rest('PATCH','/rest/v1/'+table+'?'+col+'=eq.'+encodeURIComponent(val),{deleted_at:at},'return=minimal')}
function binDays(e){return Math.ceil((new Date(e.at).getTime()+30*86400000-Date.now())/86400000)}
function toBin(type,id,name,data){db.bin.push({type:type,id:id,name:name,at:new Date().toISOString(),data:data})}
function unbinCat(n){db.bin=db.bin.filter(function(e){return !(e.type==='category'&&e.id===n)})}
function rpc(fn,args){return rest('POST','/rest/v1/rpc/'+fn,args)}
function fetchAll(table,order){
  var out=[],step=1000;
  function page(from){return rest('GET','/rest/v1/'+table+'?select=*&order='+order+'&limit='+step+'&offset='+from).then(function(rows){out=out.concat(rows);return rows.length===step?page(from+step):out})}
  return page(0);
}
function rowItem(r){return {id:r.id,name:r.name,nameHi:r.name_hi||'',category:r.category||'',price:+r.price,dozenPrice:r.dozen_price==null?'':+r.dozen_price,unit:r.unit||'pc',unitName:r.unit_name||'',unitQty:r.unit_qty||1,unitPrice:r.unit_price==null?'':+r.unit_price,gst:+r.gst||0,hsn:r.hsn||'',stock:r.stock==null?'':r.stock,active:r.active!==false}}
function itemRow(i,skipStock){
  var o={id:i.id,name:i.name,name_hi:i.nameHi||'',category:i.category||'',price:i.price,dozen_price:(i.dozenPrice===''||i.dozenPrice==null)?null:i.dozenPrice,unit:i.unit||'pc',unit_name:i.unitName||'',unit_qty:i.unitQty||1,unit_price:(i.unitPrice===''||i.unitPrice==null)?null:i.unitPrice,gst:i.gst||0,hsn:i.hsn||'',active:i.active!==false};
  if(!skipStock)o.stock=(i.stock===''||i.stock==null)?null:i.stock;
  return o;
}
function rowClient(r){return {id:r.id,name:titleCase(r.name),nameHi:r.name_hi||'',phone:r.phone||'',address:r.address||'',created:(r.created_at||'').slice(0,10)}}
function clientRow(c){return {id:c.id,name:c.name,name_hi:c.nameHi||'',phone:c.phone||'',address:c.address||''}}
function rowPay(r){return {id:r.id,date:r.date,time:r.time,amount:+r.amount,mode:r.mode}}
function rowBill(r,pays){return {id:r.id,no:r.no,date:r.date,time:r.time,clientId:r.client_id,clientName:r.client_id?titleCase(r.client_name):r.client_name,clientNameHi:r.client_name_hi||'',clientPhone:r.client_phone||'',lines:r.lines||[],subtotal:+r.subtotal,discount:+r.discount,tax:+r.tax,total:+r.total,pay:r.pay,notes:r.notes||'',status:r.status,payments:pays||[]}}
function loadAll(){
  return Promise.all([fetchAll('items','name.asc'),fetchAll('categories','name.asc'),fetchAll('clients','name.asc'),fetchAll('bills','created_at.asc'),fetchAll('payments','created_at.asc')]).then(function(a){
    var pays={};a[4].forEach(function(p){(pays[p.bill_id]=pays[p.bill_id]||[]).push(rowPay(p))});
    db.items=[];db.categories=[];db.clients=[];db.bin=[];
    a[0].forEach(function(r){var o=rowItem(r);if(r.deleted_at)db.bin.push({type:'item',id:r.id,name:o.name,at:r.deleted_at,data:o});else db.items.push(o)});
    a[1].forEach(function(c){if(c.deleted_at)db.bin.push({type:'category',id:c.name,name:c.name,at:c.deleted_at});else db.categories.push(c.name)});
    a[2].forEach(function(r){var o=rowClient(r);if(r.deleted_at)db.bin.push({type:'client',id:r.id,name:o.name,at:r.deleted_at,data:o});else db.clients.push(o)});
    db.bills=a[3].map(function(b){return rowBill(b,pays[b.id])});
    migrate();
    if(!db.categories.length&&!db.items.length&&!db.bin.length){
      db.categories=DEFAULT_CATS.slice();
      return rest('POST','/rest/v1/categories?on_conflict=name',DEFAULT_CATS.map(function(n){return {name:n}}),'resolution=merge-duplicates,return=minimal').catch(function(){});
    }
  });
}
function fail(e){
  if(e&&e.message==='not-signed-in'){showLogin();return}
  var m=e&&e.message?e.message:'';
  if(/clients_phone_uq|duplicate key/i.test(m)){toast(t('This number is already used by another customer'));return}
  if(/More than the balance due/i.test(m)){toast(t('More than the balance due'));return}
  toast(t('Could not save. Check your internet and try again.'));
}
function guard(btn,fn){
  if(btn&&btn.dataset.busy)return;
  if(btn){btn.dataset.busy='1';btn.disabled=true}
  var done=function(){if(btn&&btn.isConnected){delete btn.dataset.busy;btn.disabled=false}};
  var p;try{p=fn()}catch(e){done();throw e}
  return Promise.resolve(p).then(done,function(e){done();throw e});
}

/* ---------- sign in, sign out, refresh ---------- */
function showLogin(msg){
  document.body.classList.add('out');
  setMenu(false);syncChrome();
  db={items:[],clients:[],bills:[],categories:[],bin:[]};
  $('#ttl').innerHTML=esc(t('AV Cosmetics & Bangle Store'))+' <span class="muted" style="font-weight:400;font-size:13px">&nbsp;'+esc(t('Billing Desk'))+'</span>';
  $('#view').innerHTML='<form class="panel stack" id="lf" style="max-width:420px;margin:24px auto"><h2>'+esc(t('Sign in'))+'</h2>'+
    '<label>'+esc(t('Email'))+'<input id="lem" type="email" autocomplete="username" inputmode="email" required></label>'+
    '<label>'+esc(t('Password'))+'<input id="lpw" type="password" autocomplete="current-password" required></label>'+
    '<div class="note warn" id="lmsg"'+(msg?'':' hidden')+'>'+esc(msg||'')+'</div>'+
    '<button class="primary" type="submit" id="lgo">'+esc(t('Sign in'))+'</button>'+
    '<p class="note">'+esc(t('Only people added by the shop owner can sign in.'))+'</p></form>';
  $('#lf').onsubmit=function(e){
    e.preventDefault();
    var go=$('#lgo'),em=$('#lem').value.trim(),pw=$('#lpw').value;
    guard(go,function(){
      return signIn(em,pw).then(startApp).catch(function(err){
        var m=$('#lmsg');if(!m)return;
        m.textContent=/network|fetch/i.test(err.message)?t('Could not connect. Check your internet.'):t('Wrong email or password');m.hidden=false;
      });
    });
  };
}
function signOut(){
  var tk=auth&&auth.access_token;
  if(tk)fetch(CFG.url+'/auth/v1/logout',{method:'POST',headers:{apikey:CFG.key,Authorization:'Bearer '+tk}}).catch(function(){});
  setAuth(null);cur&&newBill();showLogin();
}
function startApp(){
  $('#view').innerHTML='<p class="muted" style="text-align:center;margin-top:40px">'+esc(t('Loading…'))+'</p>';
  return loadAll().then(function(){
    document.body.classList.remove('out');
    detectLegacy();render();labelTables();
    rpc('purge_bin',{}).catch(function(){});
  },function(e){
    if(e&&e.message==='not-signed-in'){showLogin();return}
    $('#view').innerHTML='<div class="panel stack" style="max-width:420px;margin:24px auto"><p>'+esc(t('Could not connect. Check your internet.'))+'</p><button class="primary" id="retry">'+esc(t('Try again'))+'</button></div>';
    $('#retry').onclick=startApp;
  });
}
function softRefresh(){
  if(!auth||document.hidden||!$('#modal').hidden)return;
  var ae=document.activeElement;if(ae&&/^(INPUT|SELECT|TEXTAREA)$/.test(ae.tagName))return;
  if(route()==='billing'&&cur&&(cur.lines.length||cur.addNew))return;
  loadAll().then(render,function(){});
}
setInterval(softRefresh,120000);
document.addEventListener('visibilitychange',function(){if(!document.hidden)softRefresh()});

/* data saved on this phone by the older offline version */
function detectLegacy(){
  legacy=null;
  try{
    var ls=JSON.parse(localStorage.getItem(KEY));
    if(ls&&Array.isArray(ls.bills)&&Array.isArray(ls.items)&&(ls.bills.length||!ls.example))legacy=ls;
  }catch(e){}
}
function legacyBanner(){
  if(!legacy)return '';
  return '<div class="banner"><b>'+esc(t('Data found on this phone.'))+'</b> '+esc(t('Import it into the cloud database once, so every phone can see it.'))+' <button class="small primary" id="imp">'+esc(t('Import into cloud'))+'</button></div>';
}
function importLegacy(btn){
  guard(btn,function(){
    return rpc('import_backup',{d:legacy}).then(function(r){
      try{localStorage.setItem(KEY+'-imported',localStorage.getItem(KEY));localStorage.removeItem(KEY)}catch(e){}
      legacy=null;return loadAll().then(function(){toast(t('Imported')+': '+r.bills+' '+t('Bills')+', '+r.items+' '+t('Items')+', '+r.clients+' '+t('Customers'));render()});
    }).catch(fail);
  });
}

var toastT;
function toast(m){var x=$('#toast');x.textContent=m;x.hidden=false;clearTimeout(toastT);toastT=setTimeout(function(){x.hidden=true},2200)}
function copy(text,done){
  function fb(){var ta=document.createElement('textarea');ta.value=text;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');toast(done||t('Copied'))}catch(e){toast(t('Select the text and copy it'))}ta.remove()}
  try{navigator.clipboard.writeText(text).then(function(){toast(done||t('Copied'))},fb)}catch(e){fb()}
}
function twice(btn,label,fn){
  if(btn.dataset.armed){fn();return}
  var old=btn.textContent;btn.dataset.armed='1';btn.classList.add('armed');btn.textContent=label;
  setTimeout(function(){if(btn.isConnected){delete btn.dataset.armed;btn.classList.remove('armed');btn.textContent=old}},3000);
}
var itemById=function(id){return db.items.find(function(i){return i.id===id})};
var clientById=function(id){return db.clients.find(function(c){return c.id===id})};

/* ---------- billing state ---------- */
var cur,filterCat='All',filterQty='All',query='',openBill=null,openLedger=null,openBack=null;
function newBill(){cur={step:'client',addNew:false,more:false,gstOn:false,paidStr:'',lines:[],clientSel:null,dtype:'flat',dval:0,pay:'cash',notes:''}}
newBill();
function paidNow(c){var v=String(cur.paidStr||'').trim();if(v==='')return c.total;return Math.min(c.total,Math.max(0,r2(parseFloat(v)||0)))}
function calc(b){
  var sub=0,rawTax=0;
  b.lines.forEach(function(l){var x=l.price*l.qty;sub+=x;rawTax+=x*(l.gst||0)/100});
  var disc=b.dtype==='pct'?sub*Math.min(100,Math.max(0,b.dval))/100:Math.min(sub,Math.max(0,b.dval));
  var ratio=sub>0?(sub-disc)/sub:0;
  var tax=b.gstOn?rawTax*ratio:0;
  return {sub:r2(sub),disc:r2(disc),tax:r2(tax),total:r2(sub-disc+tax)};
}

/* ---------- views ---------- */
var tabs=[['billing','New bill'],['bills','Bill history'],['payments','Payments'],['pending','Pending'],['items','Items'],['clients','Customers'],['reports','Reports'],['bin','Bin'],['backup','Backup']];
function route(){var h=location.hash.replace('#','');return tabs.some(function(x){return x[0]===h})?h:'billing'}
function render(){
  if(!auth){showLogin();return}
  var r=route();
  if(r==='bills'&&lastRoute!=='bills'&&!hist.keep)hist=defaultHist();
  if(r==='bills')hist.keep=false;
  if(r==='payments'&&lastRoute!=='payments')payF=defaultPay();
  lastRoute=r;
  document.documentElement.lang=lang==='hi'?'hi':'en';
  $('#ttl').innerHTML=esc(t('AV Cosmetics & Bangle Store'))+' <span class="muted" style="font-weight:400;font-size:13px">&nbsp;'+esc(t('Billing Desk'))+'</span>';
  $('#l-en').className=lang==='en'?'on':'';$('#l-hi').className=lang==='hi'?'on':'';
  $('#nav').innerHTML=tabs.map(function(x){return '<a href="#'+x[0]+'" class="'+(x[0]===r?'on':'')+'">'+esc(t(x[1]))+'</a>'}).join('');
  syncChrome();
  var v=$('#view');
  v.innerHTML=legacyBanner();
  var imb=$('#imp');if(imb)imb.onclick=function(){importLegacy(imb)};
  var box=document.createElement('div');v.appendChild(box);
  ({billing:viewBilling,bills:viewBills,payments:viewPayments,pending:viewPending,items:viewItems,clients:viewClients,reports:viewReports,bin:viewBin,backup:viewBackup})[r](box);
}
window.addEventListener('hashchange',function(){if(route()==='billing'&&!cur.lines.length)cur.step='client';render()});
function setMenu(open){$('#nav').classList.toggle('open',open);$('#scrim').hidden=!open;$('#menuBtn').setAttribute('aria-expanded',open?'true':'false')}
$('#menuBtn').onclick=function(){setMenu(!$('#nav').classList.contains('open'))};
$('#scrim').onclick=function(){setMenu(false)};
function effTheme(){var a=document.documentElement.getAttribute('data-theme');if(a==='dark'||a==='light')return a;return window.matchMedia&&window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}
function syncChrome(){
  var th=effTheme(),tb=$('#themeBtn'),so=$('#signoutBtn');
  so.textContent=t('Sign out');
  tb.textContent=th==='dark'?'\u2600\uFE0E':'\u263E';
  tb.title=tb.ariaLabel=t(th==='dark'?'Switch to light mode':'Switch to dark mode');
  tb.setAttribute('aria-label',tb.title);
}
$('#themeBtn').onclick=function(){var n=effTheme()==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',n);try{localStorage.setItem('shopbill-theme',n)}catch(e){}syncChrome()};
$('#signoutBtn').onclick=function(){signOut()};
$('#nav').addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false)});
$('#nav').addEventListener('click',function(e){var a=e.target.closest('a');if(a&&a.getAttribute('href')==='#billing'&&route()==='billing'&&!cur.lines.length){cur.step='client';render()}});
function setLang(l){
  lang=l;try{localStorage.setItem(LKEY,l)}catch(e){}
  render();if(!$('#modal').hidden){if(openBill)showBill(openBill,openBack);else if(openLedger)showLedger(openLedger)}
}
$('#l-en').onclick=function(){setLang('en')};$('#l-hi').onclick=function(){setLang('hi')};

/* Billing: step 1 choose the client, step 2 pick items and quantities. Discount, GST, payment and notes sit under "More options". */
var cq='',cartVisible=true,billIO=null;
function cleanPhone(v){var d=String(v||'').replace(/\D/g,'');if(d.length===12&&d.indexOf('91')===0)d=d.slice(2);else if(d.length===11&&d[0]==='0')d=d.slice(1);return d.slice(0,10)}
function phoneErr(v){return !!v&&v.length!==10}
function phoneInput(id,errId){
  var el=$(id),er=$(errId);if(!el)return;
  el.oninput=function(){this.value=cleanPhone(this.value);er.hidden=true};
  el.onblur=function(){er.hidden=!phoneErr(this.value)};
}
function stockWarn(l){
  var it=itemById(l.id);if(!it||it.stock===''||it.stock==null)return '';
  return l.qty*(l.factor||1)>it.stock?'<div class="note warn">'+esc(t('Only'))+' '+it.stock+' '+esc(t('pcs'))+' '+esc(t('in stock'))+'</div>':'';
}
/* "Quantity categories": how an item is sold by default (Piece, Dozen, or its own unit such as Set) */
function qKind(i){var u=du(i);return u==='custom'?'c:'+i.unitName:u}
function qLabel(k){return k==='pc'?t('Piece'):k==='doz'?(lang==='hi'?t('dozen'):'Dozen'):uLabel(k.slice(2))}
function qKinds(items){
  var seen={},out=[];items.forEach(function(i){var k=qKind(i);if(!seen[k]){seen[k]=1;out.push(k)}});
  var rank=function(k){return k==='pc'?0:k==='doz'?1:2};
  return out.sort(function(a,b){return rank(a)-rank(b)||(a<b?-1:1)});
}
function qChipsHtml(items,active,attr){
  var kinds=qKinds(items);if(kinds.length<2)return '';
  return ['All'].concat(kinds).map(function(k){return '<button class="chip'+(k===active?' on':'')+'" '+attr+'="'+esc(k)+'">'+esc(k==='All'?t('All'):qLabel(k))+'</button>'}).join('');
}
function priceEdited(l){var it=itemById(l.id);return !!it&&Math.abs(l.price-unitPrice(it,l.unit||'pc'))>0.004}
function dozOpt(l){
  var it=itemById(l.id);if(it&&du(it)==='custom'&&l.unit!=='doz')return '';
  return '<option value="doz"'+(l.unit==='doz'?' selected':'')+'>'+esc(t('Dozen (12 pcs)'))+'</option>';
}
function priceCell(i){
  var pcs=i.unitQty>1?' ('+i.unitQty+' '+esc(t('pcs'))+')':'';
  if(du(i)==='custom')return money(customPrice(i))+' / '+esc(uLabel(i.unitName))+pcs+'<div class="note">'+money(i.price)+' / '+esc(t('pc'))+'</div>';
  return money(i.price)+' / '+esc(t('pc'))+'<div class="note">'+money(dozPrice(i))+' / '+esc(t('dozen'))+'</div>'+(hasCustom(i)?'<div class="note">'+money(customPrice(i))+' / '+esc(uLabel(i.unitName))+pcs+'</div>':'');
}
function dozPrice(i){return i.dozenPrice!==''&&i.dozenPrice!=null?i.dozenPrice:r2(i.price*12)}
function hasCustom(i){return !!(i&&i.unitName)}
function customPrice(i){return i.unitPrice!==''&&i.unitPrice!=null?i.unitPrice:r2(i.price*(i.unitQty||1))}
function du(i){return (i.unit==='custom'&&!hasCustom(i))?'pc':(i.unit||'pc')}
function unitPrice(i,u){return u==='doz'?dozPrice(i):u==='custom'?customPrice(i):i.price}
function unitFactor(i,u){return u==='doz'?12:u==='custom'?(i.unitQty||1):1}
function uLabel(n){return lang==='hi'?tr(n):n}
function unitName(u,q,o){return u==='doz'?t('dozen'):u==='custom'?uLabel((o&&o.unitName)||'unit'):(q===1?t('pc'):t('pcs'))}
function customOpt(l){
  var it=itemById(l.id),nmn=hasCustom(it)?it.unitName:(l.unit==='custom'?l.unitName:''),q=hasCustom(it)?it.unitQty:(l.unit==='custom'?l.factor:0);
  return nmn?'<option value="custom"'+(l.unit==='custom'?' selected':'')+'>'+esc(uLabel(nmn))+(q>1?' ('+q+' '+esc(t('pcs'))+')':'')+'</option>':'';
}
function qtyLabel(l){var u=l.unit||'pc',f=l.factor||1;return l.qty+' '+unitName(u,l.qty,l)+(f>1?' ('+(l.qty*f)+' '+t('pcs')+')':'')}
function clientLabel(){
  var c=cur.clientSel&&cur.clientSel!=='walkin'?clientById(cur.clientSel):null;
  return c?nm(c):nm({name:'Walk-in customer'});
}
function viewBilling(box){
  if(cur.step==='client'){drawClientStep(box);return}
  box.innerHTML='<div class="stack"><div class="panel row" style="justify-content:space-between"><div><span class="muted">'+esc(t('Bill for'))+':</span> <b>'+esc(clientLabel())+'</b></div><button class="small" id="chg">'+esc(t('Change'))+'</button></div>'+
  '<div class="cols"><div class="panel stack"><input id="q" placeholder="'+esc(t('Search items by name'))+'" value="'+esc(query)+'" aria-label="'+esc(t('Search items by name'))+'"><div class="chips" id="cats"></div><div class="chips" id="qcats"></div><div class="grid" id="grid"></div></div>'+
  '<div class="panel stack" id="billpanel"></div></div></div><div class="cartbar" id="cartbar" hidden></div>';
  $('#chg').onclick=function(){cur.step='client';render()};
  $('#q').addEventListener('input',function(e){query=e.target.value;drawGrid()});
  drawGrid();drawBill();
  if(billIO)billIO.disconnect();
  if('IntersectionObserver' in window){
    cartVisible=true;
    billIO=new IntersectionObserver(function(en){cartVisible=!en[0].isIntersecting;var cb=$('#cartbar');if(cb)cb.hidden=!cur.lines.length||!cartVisible},{rootMargin:'0px 0px -90px 0px'});
    billIO.observe($('#billpanel'));
  }
}
function drawClientStep(box){
  box.innerHTML='<div class="panel stack" style="max-width:640px;margin:0 auto"><h2>'+esc(t('Who is this bill for?'))+'</h2>'+
  '<input id="cq" placeholder="'+esc(t('Search customer by name or phone'))+'" value="'+esc(cq)+'" aria-label="'+esc(t('Search customer by name or phone'))+'">'+
  '<div class="stack" id="clist" style="gap:6px"></div><div id="newc"></div></div>';
  $('#cq').addEventListener('input',function(e){cq=e.target.value;drawClist()});
  drawClist();drawNew();
}
function drawClist(){
  var q=cq.trim().toLowerCase();
  var list=db.clients.filter(function(c){return !q||(c.name+' '+hn(c)+' '+c.phone).toLowerCase().indexOf(q)>-1});
  var h='<button class="tile" data-pick="walkin"><b>'+esc(nm({name:'Walk-in customer'}))+'</b></button>'+
    list.map(function(c){return '<button class="tile" data-pick="'+c.id+'"><b>'+esc(nm(c))+'</b>'+(c.phone?'<span>'+esc(c.phone)+'</span>':'')+'</button>'}).join('');
  if(q&&!list.length)h+='<p class="muted">'+esc(t('No customers match.'))+'</p>';
  $('#clist').innerHTML=h;
  $('#clist').onclick=function(e){var b=e.target.closest('[data-pick]');if(b){cur.clientSel=b.dataset.pick;cur.step='items';render()}};
}
function drawNew(){
  var n=$('#newc');
  if(!cur.addNew){n.innerHTML='<button id="addnew">'+esc(t('+ New customer'))+'</button>';$('#addnew').onclick=function(){cur.addNew=true;drawNew()};return}
  n.innerHTML='<form class="stack" id="nf" style="border-top:1px solid var(--line);padding-top:12px"><div class="row"><label class="grow">'+esc(t('Name'))+'<input id="nn" placeholder="'+esc(t('Customer name'))+'"></label>'+
  '<label class="grow">'+esc(t('Phone'))+'<input id="np" inputmode="numeric" autocomplete="off" placeholder="'+esc(t('10-digit number'))+'"><span class="note warn" id="nperr" hidden>'+esc(t('Phone number must be 10 digits'))+'</span></label></div>'+
  '<div class="row"><button class="primary" type="submit">'+esc(t('Continue'))+'</button><button type="button" id="nc">'+esc(t('Cancel'))+'</button></div></form>';
  $('#nn').focus();
  $('#nn').onblur=function(){this.value=titleCase(this.value)};
  phoneInput('#np','#nperr');
  $('#nc').onclick=function(){cur.addNew=false;drawNew()};
  $('#nf').onsubmit=function(e){
    e.preventDefault();
    var name=titleCase($('#nn').value);if(!name){toast(t('Enter the customer name'));return}
    var ph=cleanPhone($('#np').value);
    if(phoneErr(ph)){$('#nperr').hidden=false;$('#np').focus();toast(t('Phone number must be 10 digits'));return}
    var ex=ph&&db.clients.find(function(c){return c.phone===ph}),id;
    if(ex){cur.clientSel=ex.id;cur.step='items';cur.addNew=false;render();return}
    var c={id:uid(),name:name,phone:ph,address:'',created:today()};
    guard($('#nf button[type=submit]'),function(){return upsert('clients',clientRow(c)).then(function(){db.clients.push(c);cur.clientSel=c.id;cur.step='items';cur.addNew=false;render()}).catch(fail)});
  };
}
function drawGrid(){
  var cats=['All'].concat(Array.from(new Set(db.items.filter(function(i){return i.active}).map(function(i){return i.category}))));
  $('#cats').innerHTML=cats.map(function(c){return '<button class="chip'+(c===filterCat?' on':'')+'" data-cat="'+esc(c)+'">'+esc(tc(c))+'</button>'}).join('');
  $('#cats').onclick=function(e){var b=e.target.closest('[data-cat]');if(b){filterCat=b.dataset.cat;drawGrid()}};
  var act=db.items.filter(function(i){return i.active});
  if(filterQty!=='All'&&!act.some(function(i){return qKind(i)===filterQty}))filterQty='All';
  $('#qcats').innerHTML=qChipsHtml(act,filterQty,'data-qty');
  $('#qcats').onclick=function(e){var b=e.target.closest('[data-qty]');if(b){filterQty=b.dataset.qty;drawGrid()}};
  var q=query.trim().toLowerCase();
  var list=db.items.filter(function(i){return i.active&&(filterCat==='All'||i.category===filterCat)&&(filterQty==='All'||qKind(i)===filterQty)&&(!q||(i.name+' '+hn(i)).toLowerCase().indexOf(q)>-1)});
  $('#grid').innerHTML=list.length?list.map(function(i){
    var has=i.stock!==''&&i.stock!=null,out=has&&i.stock<=0;
    return '<button class="tile'+(out?' out':'')+'" data-add="'+i.id+'"><b>'+esc(nm(i))+'</b><span>'+esc(tc(i.category))+(has?' · '+(out?esc(t('out of stock')):i.stock+' '+esc(t('pcs'))+' '+esc(t('left'))):'')+'</span><span class="price">'+money(unitPrice(i,du(i)))+' / '+esc(unitName(du(i),1,i))+'</span></button>';
  }).join(''):'<p class="muted">'+esc(t('No items match. Add items in the Items tab.'))+'</p>';
  $('#grid').onclick=function(e){var b=e.target.closest('[data-add]');if(b)addLine(b.dataset.add)};
}
function addLine(id){
  var it=itemById(id),l=cur.lines.find(function(x){return x.id===id});
  var u0=du(it);cur.paidStr='';if(l)l.qty++;else cur.lines.push({id:id,name:it.name,nameHi:it.nameHi||HN[it.name]||'',price:unitPrice(it,u0),unit:u0,unitName:u0==='custom'?it.unitName:'',factor:unitFactor(it,u0),gst:it.gst||0,qty:1});
  drawBill();
}
function drawBill(){
  var p=$('#billpanel');if(!p)return;
  var c=calc(cur),left=r2(c.total-paidNow(c)),showBreak=c.disc>0||(cur.gstOn&&c.tax>0);
  var lines=cur.lines.length?cur.lines.map(function(l,i){return '<div class="line"><div style="min-width:0"><b>'+esc(nm(l))+'</b><div class="note">\u20B9<input class="priceinp" data-price="'+i+'" inputmode="decimal" value="'+l.price+'" aria-label="'+esc(t('Price'))+'"> / '+esc(unitName(l.unit||'pc',1,l))+((l.factor||1)>1?' · '+l.qty+' × '+(l.factor||1)+' = '+(l.qty*(l.factor||1))+' '+esc(t('pcs')):'')+(priceEdited(l)?' <span class="warn">('+esc(t('edited'))+')</span>':'')+(cur.gstOn&&l.gst?' + '+l.gst+'% '+esc(t('GST')):'')+'</div><select class="unitsel" data-unit="'+i+'" aria-label="'+esc(t('Unit'))+'"><option value="pc"'+((l.unit||'pc')==='pc'?' selected':'')+'>'+esc(t('Piece'))+'</option>'+dozOpt(l)+customOpt(l)+'</select>'+stockWarn(l)+'</div>'+
    '<div class="qty"><button class="small" data-dec="'+i+'" aria-label="'+esc(t('Decrease'))+'">−</button><input data-qty="'+i+'" inputmode="numeric" value="'+l.qty+'" aria-label="'+esc(t('Quantity'))+'"><button class="small" data-inc="'+i+'" aria-label="'+esc(t('Increase'))+'">+</button></div>'+
    '<div class="num">'+money(l.price*l.qty)+'</div><button class="small" data-rm="'+i+'" aria-label="'+esc(t('Remove'))+'">✕</button></div>'}).join(''):'<p class="muted">'+esc(t('Tap an item to add it to the bill.'))+'</p>';
  var more=cur.more?'<div class="stack" style="border-top:1px solid var(--line);padding-top:12px">'+
    '<div class="row"><label class="grow">'+esc(t('Discount'))+'<select id="dt"><option value="flat"'+(cur.dtype==='flat'?' selected':'')+'>'+esc(t('Flat ₹'))+'</option><option value="pct"'+(cur.dtype==='pct'?' selected':'')+'>'+esc(t('Percent %'))+'</option></select></label>'+
    '<label class="grow">'+esc(t('Amount'))+'<input id="dv" inputmode="decimal" value="'+(cur.dval||'')+'" placeholder="0"></label></div>'+
    '<label style="flex-direction:row;align-items:center;gap:8px;color:var(--fg);font-size:14px"><input type="checkbox" id="gst" style="width:auto"'+(cur.gstOn?' checked':'')+'> '+esc(t('Add GST'))+'</label>'+
    '<div class="note" style="margin-top:-6px">'+esc(t('GST is added at each item\'s rate.'))+'</div>'+
    '<label>'+esc(t('Notes'))+'<input id="nt" value="'+esc(cur.notes)+'" placeholder="'+esc(t('Optional'))+'"></label></div>':'';
  p.innerHTML='<h2>'+esc(t('Current bill'))+'</h2><div id="lines">'+lines+'</div>'+
  '<div class="totals">'+(showBreak?'<span class="muted">'+esc(t('Subtotal'))+'</span><span class="num">'+money(c.sub)+'</span>'+
    (c.disc?'<span class="muted">'+esc(t('Discount'))+'</span><span class="num">− '+money(c.disc)+'</span>':'')+
    (cur.gstOn&&c.tax?'<span class="muted">'+esc(t('GST'))+'</span><span class="num">'+money(c.tax)+'</span>':''):'')+
  '<span class="grand">'+esc(t('Total'))+'</span><span class="grand num">'+money(c.total)+'</span></div>'+
  '<button class="small" id="moreb" style="align-self:flex-start">'+esc(cur.more?t('Fewer options'):t('More options'))+(cur.more?' ▴':' ▾')+'</button>'+more+
  '<div class="row" style="align-items:flex-end"><label class="grow sm">'+esc(t('Paid now'))+'<input id="pn" inputmode="decimal" value="'+esc(cur.paidStr)+'" placeholder="'+c.total+'"></label><label class="grow sm">'+esc(t('Payment'))+'<select id="pm">'+['cash','UPI','card','other'].map(function(m){return '<option value="'+m+'"'+(cur.pay===m?' selected':'')+'>'+esc(t(m))+'</option>'}).join('')+'</select></label><button class="small" id="pfull">'+esc(t('Full'))+'</button></div>'+
  '<div class="totals" style="margin-top:0"><span class="muted">'+esc(t('Balance left'))+'</span><span class="num'+(left>0?' warn':'')+'" id="leftv">'+money(left)+'</span></div><div class="note" id="leftnote"'+(left>0?'':' hidden')+'>'+esc(t('The balance will be added to the pending list.'))+'</div>'+
  '<div class="row"><button class="primary grow" id="save"'+(cur.lines.length?'':' disabled')+'>'+esc(t('Save bill'))+'</button><button id="clear"'+(cur.lines.length?'':' disabled')+'>'+esc(t('Clear'))+'</button></div>';
  $('#moreb').onclick=function(){cur.more=!cur.more;drawBill()};
  $('#pn').oninput=function(e){cur.paidStr=e.target.value;var cc=calc(cur),lf=r2(cc.total-paidNow(cc)),lv=$('#leftv');lv.textContent=money(lf);lv.className='num'+(lf>0?' warn':'');$('#leftnote').hidden=!(lf>0)};
  $('#pfull').onclick=function(){cur.paidStr='';drawBill()};
  $('#pm').onchange=function(e){cur.pay=e.target.value};
  var dt=$('#dt');if(dt){
    dt.onchange=function(e){cur.dtype=e.target.value;cur.paidStr='';drawBill()};
    $('#dv').onchange=function(e){cur.dval=parseFloat(e.target.value)||0;cur.paidStr='';drawBill()};
    $('#gst').onchange=function(e){cur.gstOn=e.target.checked;cur.paidStr='';drawBill()};
    $('#nt').oninput=function(e){cur.notes=e.target.value};
  }
  $('#lines').onclick=function(e){
    var b=e.target.closest('button');if(!b)return;cur.paidStr='';
    if(b.dataset.inc!=null)cur.lines[+b.dataset.inc].qty++;
    else if(b.dataset.dec!=null){var l=cur.lines[+b.dataset.dec];if(l.qty>1)l.qty--;else cur.lines.splice(+b.dataset.dec,1)}
    else if(b.dataset.rm!=null)cur.lines.splice(+b.dataset.rm,1);
    drawBill();
  };
  $('#lines').onchange=function(e){
    var pi=e.target.dataset.price;
    if(pi!=null){var pv=parseFloat(String(e.target.value).replace(/,/g,''));if(pv>=0)cur.lines[+pi].price=r2(pv);cur.paidStr='';drawBill();return}
    var uu=e.target.dataset.unit;
    if(uu!=null){var l=cur.lines[+uu],it=itemById(l.id),prev=l.unit||'pc',nu=e.target.value;
      l.unit=nu;l.factor=it?unitFactor(it,nu):(nu==='doz'?12:(nu==='custom'?(l.factor||1):1));l.unitName=nu==='custom'?(it?it.unitName:l.unitName):'';
      l.price=it?unitPrice(it,nu):(prev===nu?l.price:(nu==='doz'?r2(l.price*12):r2(l.price/12)));
      cur.paidStr='';drawBill();return}
    var i=e.target.dataset.qty;if(i!=null){cur.paidStr='';var q=parseInt(e.target.value,10);if(q>0)cur.lines[+i].qty=q;else cur.lines.splice(+i,1);drawBill()}};
  $('#clear').onclick=function(){var s=cur.clientSel;newBill();cur.clientSel=s;cur.step='items';drawBill()};
  $('#save').onclick=reviewBill;
  var cb=$('#cartbar');
  if(cb){
    cb.hidden=!cur.lines.length||!cartVisible;
    cb.innerHTML='<div><div class="note">'+cur.lines.length+' '+esc(t('Items'))+'</div><b style="font-size:18px">'+money(c.total)+'</b></div><button class="primary" id="cartgo">'+esc(t('View bill'))+'</button>';
    $('#cartgo').onclick=function(){$('#billpanel').scrollIntoView({behavior:'smooth',block:'start'})};
  }
}
function makeBill(){
  if(!cur.lines.length)return null;
  var cid=null,cname='Walk-in customer',cphone='';
  if(cur.clientSel&&cur.clientSel!=='walkin'){var c0=clientById(cur.clientSel);if(c0){cid=c0.id;cname=c0.name;cphone=c0.phone}}
  var tt=calc(cur),pd=paidNow(tt);
  if(r2(tt.total-pd)>0&&!cid){toast(t('Choose a customer to keep a pending amount'));return null}
  return {id:uid(),date:today(),time:nowTime(),clientId:cid,clientName:cname,clientNameHi:(cid&&clientById(cid)&&clientById(cid).nameHi)||'',clientPhone:cphone,
    lines:cur.lines.map(function(l){return {itemId:l.id,name:l.name,nameHi:l.nameHi||'',price:l.price,gst:cur.gstOn?l.gst:0,unit:l.unit||'pc',unitName:l.unitName||'',factor:l.factor||1,qty:l.qty,total:r2(l.price*l.qty)}}),
    subtotal:tt.sub,discount:tt.disc,tax:tt.tax,total:tt.total,pay:cur.pay,notes:cur.notes,status:'paid',payments:pd>0?[{id:uid(),date:today(),time:nowTime(),amount:pd,mode:cur.pay}]:[]};
}
function commitBill(bill){
  var d0=today(),t0=nowTime();bill.date=d0;bill.time=t0;(bill.payments||[]).forEach(function(p){p.date=d0;p.time=t0});
  guard($('#save'),function(){
    return rpc('create_bill',{b:bill}).then(function(r){
      bill.no=r.no;
      bill.lines.forEach(function(l){var it=itemById(l.itemId);if(it&&it.stock!==''&&it.stock!=null)it.stock=Math.max(0,it.stock-Math.round(l.qty*(l.factor||1)))});
      db.bills.push(bill);newBill();
      toast(t('Saved')+' '+bill.no);render();showBill(bill.id);
    }).catch(fail);
  });
}
function saveBill(){var b=makeBill();if(b)commitBill(b)}
/* The bill is shown exactly as the receipt will look. Nothing is saved until Confirm & save is pressed. */
function reviewBill(){
  var bill=makeBill();if(!bill)return;
  var m=$('#modal');openBill=null;openLedger=null;
  m.innerHTML='<div class="dialog" role="dialog" aria-label="'+esc(t('Review bill'))+'"><h2>'+esc(t('Review bill'))+'</h2><p class="note">'+esc(t('Please check the bill. It is saved only when you press Confirm & save.'))+'</p>'+
  '<pre class="receipt">'+esc(receiptText(Object.assign({},bill,{no:'\u2014'})))+'</pre>'+
  '<div class="row stickybar"><button type="button" id="rvback">'+esc(t('Back'))+'</button><button class="primary grow" type="button" id="rvok">'+esc(t('Confirm & save'))+'</button></div></div>';
  m.hidden=false;
  $('#rvback').onclick=closeModal;
  $('#rvok').onclick=function(){closeModal();commitBill(bill)};
}
function receiptText(b){
  var W=34,line=new Array(W+1).join('-'),out=[];
  var c=function(s){var p=Math.max(0,Math.floor((W-s.length)/2));return new Array(p+1).join(' ')+s};
  var lr=function(a,z){var sp=Math.max(1,W-a.length-z.length);return a+new Array(sp+1).join(' ')+z};
  var m=function(n){return (Math.round(n*100)/100).toFixed(2)};
  out.push(c(lang==='hi'?'एवी कॉस्मेटिक्स और बैंगल स्टोर':'AV COSMETICS & BANGLE STORE'),c(t('Tax invoice / cash memo')),line,lr(t('Bill')+': '+b.no,b.date),lr(t('Customer')+': '+nm(b,'clientName','clientNameHi'),b.time));
  if(b.clientPhone)out.push(t('Phone')+': '+b.clientPhone);
  if(b.status==='cancelled')out.push('*** '+t('CANCELLED')+' ***');
  out.push(line);
  b.lines.forEach(function(l){out.push(nm(l).slice(0,W));out.push(lr('  '+qtyLabel(l)+' x '+m(l.price),m(l.total)))});
  out.push(line,lr(t('Subtotal'),m(b.subtotal)));
  if(b.discount)out.push(lr(t('Discount'),'-'+m(b.discount)));
  if(b.tax)out.push(lr(t('GST'),m(b.tax)));
  out.push(lr(t('TOTAL'),m(b.total)));
  var pd=paidOf(b);out.push(lr(t('Paid'),m(pd)));
  if(b.status!=='cancelled'&&b.total-pd>0.004)out.push(lr(t('Balance due'),m(b.total-pd)));
  out.push(lr(t('Paid by'),t(b.pay)),line,c(t('Thank you, visit again')));
  return out.join('\n');
}
function statusPill(b){
  if(b.status==='cancelled')return '<span class="pill cancel">'+esc(t('Cancelled'))+'</span>';
  if(dueOf(b)<=0)return '<span class="pill ok">'+esc(t('Paid'))+'</span>';
  return paidOf(b)>0?'<span class="pill partial">'+esc(t('Part paid'))+'</span>':'<span class="pill unpaid">'+esc(t('Unpaid'))+'</span>';
}
function paidOf(b){return r2((b.payments||[]).reduce(function(s,p){return s+p.amount},0))}
function dueOf(b){return b.status==='cancelled'?0:r2(Math.max(0,b.total-paidOf(b)))}
function addPay(b,amt,mode){b.payments=b.payments||[];b.payments.push({id:uid(),date:today(),time:nowTime(),amount:r2(amt),mode:mode})}
function modeSel(id){return '<select id="'+id+'">'+['cash','UPI','card','other'].map(function(m){return '<option value="'+m+'">'+esc(t(m))+'</option>'}).join('')+'</select>'}
function showBill(id,back){
  var b=db.bills.find(function(x){return x.id===id});if(!b)return;
  openBill=id;openLedger=null;openBack=back||null;var m=$('#modal'),due=dueOf(b);
  var run=0,plist=(b.payments||[]).length?'<h3>'+esc(t('Payments'))+'</h3><div class="tablewrap"><table style="min-width:0"><thead><tr><th>#</th><th>'+esc(t('Date'))+'</th><th>'+esc(t('Payment'))+'</th><th class="num">'+esc(t('Amount'))+'</th><th class="num">'+esc(t('Unpaid'))+'</th></tr></thead><tbody>'+b.payments.map(function(p,n){run=r2(run+p.amount);return '<tr><td>'+(n+1)+'</td><td>'+p.date+' <span class="muted">'+p.time+'</span></td><td>'+esc(t(p.mode))+'</td><td class="num">'+money(p.amount)+'</td><td class="num">'+money(Math.max(0,b.total-run))+'</td></tr>'}).join('')+'</tbody></table></div>':'';
  m.innerHTML='<div class="dialog" role="dialog" aria-label="'+esc(b.no)+'"><div class="row" style="justify-content:space-between"><div class="row" style="gap:10px;flex-wrap:nowrap">'+(back?'<button class="small" id="mback" type="button">\u2190 '+esc(t('Back'))+'</button>':'')+'<h2>'+esc(b.no)+(b.status==='cancelled'?' <span class="pill cancel">'+esc(t('Cancelled'))+'</span>':'')+'</h2></div><button class="small" id="mx">'+esc(t('Close'))+'</button></div>'+
  '<div class="row" style="margin-top:8px">'+statusPill(b)+'<span class="note">'+esc(t('Paid'))+' '+money(paidOf(b))+' / '+money(b.total)+'</span></div><pre class="receipt">'+esc(receiptText(b))+'</pre>'+plist+'<div class="row" style="margin-top:12px"><button class="primary grow" id="msh">'+esc(t('Share PDF'))+'</button><button id="mdl">'+esc(t('Download PDF'))+'</button></div><div class="row" style="margin-top:8px"><button class="grow" id="mc">'+esc(t('Copy as text'))+'</button>'+
  (b.status!=='cancelled'?'<button class="danger" id="mk">'+esc(t('Cancel bill'))+'</button>':'')+'</div><p class="note">'+esc(t('Send the copied text on WhatsApp, or paste it into a printing app for your thermal printer.'))+'</p></div>';
  m.hidden=false;
  $('#mx').onclick=closeModal;
  if(back)$('#mback').onclick=function(){back()};
  $('#mc').onclick=function(){copy(receiptText(b),t('Bill copied'))};
  $('#msh').onclick=function(){sharePdf(b)};
  $('#mdl').onclick=function(){var f=billPdf(b);if(f)saveBlob(f.blob,f.name)};
  var mk=$('#mk');if(mk)mk.onclick=function(){twice(mk,t('Tap again to cancel'),function(){
    rpc('cancel_bill',{p_bill:b.id}).then(function(){
      b.status='cancelled';b.lines.forEach(function(l){var it=itemById(l.itemId);if(it&&it.stock!==''&&it.stock!=null)it.stock+=Math.round(l.qty*(l.factor||1))});
      toast(b.no+' '+t('cancelled'));showBill(id,back);render()}).catch(fail)})};
}
/* PDF of a bill: named FirstName_date_invoice.pdf, shared through the phone's share sheet (WhatsApp etc.) or downloaded */
function pdfName(b){
  var first=String(b.clientName||'Customer').trim().split(/\s+/)[0]||'Customer';
  first=first.replace(/[^A-Za-z0-9\u0900-\u097F_-]/g,'')||'Customer';
  return first+'_'+b.date+'_'+b.no+'.pdf';
}
function billDoc(b){
  var cn=nm(b,'clientName','clientNameHi'),pd=paidOf(b),due=b.status==='cancelled'?0:r2(b.total-pd);
  var totals=[[t('Subtotal'),money(b.subtotal)]];
  if(b.discount)totals.push([t('Discount'),'\u2212 '+money(b.discount)]);
  if(b.tax)totals.push([t('GST'),money(b.tax)]);
  totals.push([t('TOTAL'),money(b.total),true],[t('Paid'),money(pd)]);
  if(due>0)totals.push([t('Balance due'),money(due),true]);
  totals.push([t('Paid by'),t(b.pay)]);
  return {title:t('AV Cosmetics & Bangle Store'),subtitle:t('Tax invoice / cash memo'),stamp:b.status==='cancelled'?'*** '+t('CANCELLED')+' ***':'',
    info:[[t('Bill'),b.no],[t('Date'),b.date+'  '+b.time],[t('Customer'),cn+(b.clientPhone?'  '+b.clientPhone:'')]],
    items:b.lines.map(function(l){return {name:nm(l),detail:qtyLabel(l)+' \u00D7 '+money(l.price),amount:money(l.total)}}),
    totals:totals,footer:t('Thank you, visit again')};
}
function billPdf(b){
  try{return {blob:window.AVPDF.build(billDoc(b)),name:pdfName(b)}}catch(e){toast(t('PDF could not be created'));return null}
}
function saveBlob(blob,name){
  var u=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},4000);
}
function sharePdf(b){
  var f=billPdf(b);if(!f)return;
  var file;try{file=new File([f.blob],f.name,{type:'application/pdf'})}catch(e){}
  if(file&&navigator.canShare&&navigator.canShare({files:[file]})){
    navigator.share({files:[file],title:f.name}).catch(function(e){if(e&&e.name!=='AbortError'){saveBlob(f.blob,f.name);toast(t('PDF downloaded. Attach it in WhatsApp.'))}});
    return;
  }
  saveBlob(f.blob,f.name);toast(t('PDF downloaded. Attach it in WhatsApp.'));
}
function billAction(id){
  var b=db.bills.find(function(x){return x.id===id});
  if(b&&dueOf(b)>0&&b.clientId&&clientById(b.clientId))showLedger(b.clientId);else showBill(id);
}
function showLedger(cid){
  var c=clientById(cid);if(!c)return;
  openLedger=cid;openBill=null;var m=$('#modal');
  var bills=db.bills.filter(function(b){return b.clientId===cid&&b.status!=='cancelled'}).sort(function(a,b){return (a.date+a.time)<(b.date+b.time)?-1:1});
  var due=r2(bills.reduce(function(s,b){return s+dueOf(b)},0));
  var form=due>0?'<div class="stack" style="border-top:1px solid var(--line);padding-top:12px"><div class="row"><label class="grow">'+esc(t('Amount received now (₹)'))+'<input id="la" inputmode="decimal" autocomplete="off"></label><label class="grow">'+esc(t('Payment'))+modeSel('lm')+'</label></div>'+
    '<div class="row"><span class="muted">'+esc(t('Balance after this payment'))+':</span> <b class="warn" id="lprev">'+money(due)+'</b><button class="small" type="button" id="lfull">'+esc(t('Full balance'))+'</button></div><div class="note warn" id="lerr" hidden></div>'+
    '<button class="primary" id="lrec">'+esc(t('Receive payment'))+'</button><p class="note">'+esc(t('Applied to the oldest unpaid bills first.'))+'</p></div>':'';
  m.innerHTML='<div class="dialog wide" role="dialog" aria-label="'+esc(nm(c))+'"><div class="row" style="justify-content:space-between"><div><h2>'+esc(nm(c))+'</h2><div class="note">'+esc(c.phone||'')+'</div></div><button class="small" id="mx">'+esc(t('Close'))+'</button></div>'+
  '<div class="row" style="margin:12px 0"><h3>'+esc(t('Total pending'))+'</h3><span class="big '+(due>0?'warn':'')+'">'+money(due)+'</span></div>'+form+
  '<div class="tablewrap" style="margin-top:12px">'+(bills.length?'<table><thead><tr><th>'+esc(t('Date'))+'</th><th>'+esc(t('Invoice'))+'</th><th class="num">'+esc(t('Total'))+'</th><th class="num">'+esc(t('Paid'))+'</th><th class="num">'+esc(t('Unpaid'))+'</th><th></th></tr></thead><tbody>'+
    bills.map(function(b){var d=dueOf(b);return '<tr><td>'+b.date+'</td><td><b>'+esc(b.no)+'</b> '+statusPill(b)+'</td><td class="num">'+money(b.total)+'</td><td class="num">'+money(paidOf(b))+'</td><td class="num'+(d>0?' warn':'')+'">'+money(d)+'</td><td><button class="small" data-view="'+b.id+'">'+esc(t('View'))+'</button></td></tr>'}).join('')+'</tbody></table>':'<p class="muted">'+esc(t('No bills yet. Save a bill from the New bill tab and it will appear here.'))+'</p>')+'</div></div>';
  m.hidden=false;
  $('#mx').onclick=closeModal;
  m.querySelector('.tablewrap').onclick=function(e){var v=e.target.closest('[data-view]');if(v)showBill(v.dataset.view,function(){showLedger(cid)})};
  var la=$('#la');if(la){
    la.oninput=function(){$('#lerr').hidden=true;var v=parseFloat(la.value)||0,rest=Math.max(0,r2(due-v)),pv=$('#lprev');pv.textContent=money(rest);pv.className=rest>0?'warn':''};
    $('#lfull').onclick=function(){la.value=due;la.oninput()};
  }
  var lr=$('#lrec');if(lr)lr.onclick=function(){
    var amt=parseFloat($('#la').value),le=$('#lerr');
    if(!(amt>0)){le.textContent=t('Enter the amount received first.');le.hidden=false;$('#la').focus();return}
    if(amt>due+0.004){le.textContent=t('More than the balance due')+': '+money(due);le.hidden=false;$('#la').focus();return}
    var mode=$('#lm').value;
    guard(lr,function(){return rpc('receive_client_payment',{p_client:cid,p_amount:amt,p_mode:mode,p_date:today(),p_time:nowTime()}).then(function(){return loadAll()}).then(function(){toast(t('Payment recorded'));showLedger(cid);render()}).catch(fail)});
  };
}
/* Payment history: every payment (part payment) with its invoice, date, time, mode and the balance left after it */
function defaultPay(){var d=today();return {q:'',from:d,to:d,view:'invoice'}}
var payF=defaultPay();
function paymentRows(){
  var rows=[];
  db.bills.forEach(function(b){
    var run=0,list=b.payments||[],n=list.length;
    list.forEach(function(p,i){run=r2(run+p.amount);rows.push({b:b,p:p,i:i+1,n:n,after:Math.max(0,r2(b.total-run))})});
  });
  return rows;
}
function viewPayments(box){
  box.innerHTML='<div class="stack"><div class="panel stack"><div class="row"><label class="grow">'+esc(t('Search'))+'<input id="pq" placeholder="'+esc(t('Customer name, phone or bill number'))+'" value="'+esc(payF.q)+'"></label>'+
  '<label>'+esc(t('From'))+'<input id="pf" type="date" value="'+payF.from+'"></label><label>'+esc(t('To'))+'<input id="pt" type="date" value="'+payF.to+'"></label></div>'+
  '<div class="chips" id="prange"></div><div class="chips" id="pview"></div><div id="psum"></div></div><div id="plist" class="stack"></div></div>';
  var upd=function(){payF.q=$('#pq').value;payF.from=$('#pf').value;payF.to=$('#pt').value;drawPayments()};
  ['#pq','#pf','#pt'].forEach(function(x){$(x).addEventListener('input',upd)});
  $('#pview').onclick=function(e){var b=e.target.closest('[data-pv]');if(b){payF.view=b.dataset.pv;drawPayments()}};
  $('#prange').onclick=function(e){var b=e.target.closest('[data-rg]');if(!b)return;var r=histRange(b.dataset.rg);payF.from=r[0];payF.to=r[1];$('#pf').value=r[0];$('#pt').value=r[1];drawPayments()};
  $('#plist').onclick=function(e){var v=e.target.closest('[data-view]');if(v)showBill(v.dataset.view)};
  drawPayments();
}
function drawPayments(){
  var q=payF.q.trim().toLowerCase();
  var rows=paymentRows().filter(function(r){
    if(payF.from&&r.p.date<payF.from)return false;if(payF.to&&r.p.date>payF.to)return false;
    return !q||(r.b.clientName+' '+hn(r.b,'clientName','clientNameHi')+' '+r.b.clientPhone+' '+r.b.no).toLowerCase().indexOf(q)>-1;
  });
  var total=r2(rows.reduce(function(s2,r){return s2+r.p.amount},0));
  $('#prange').innerHTML=[['today','Today'],['yesterday','Yesterday'],['week','Last 7 days'],['month','This month'],['all','All time']].map(function(r){var v=histRange(r[0]);return '<button class="chip'+(v[0]===payF.from&&v[1]===payF.to?' on':'')+'" data-rg="'+r[0]+'">'+esc(t(r[1]))+'</button>'}).join('');
  $('#pview').innerHTML=[['invoice','By invoice'],['date','By date']].map(function(x){return '<button class="chip'+(payF.view===x[0]?' on':'')+'" data-pv="'+x[0]+'">'+esc(t(x[1]))+'</button>'}).join('');
  $('#psum').innerHTML='<div class="row" style="gap:24px"><div><h3>'+esc(t('Total received'))+'</h3><div class="big">'+money(total)+'</div></div><div><h3>'+esc(t('Payments'))+'</h3><div class="big">'+rows.length+'</div></div></div>';
  var out=$('#plist');
  if(!rows.length){out.innerHTML='<div class="panel"><p class="muted">'+esc(t('No payments found.'))+'</p></div>';return}
  var key=function(r){return r.p.date+' '+r.p.time};
  if(payF.view==='date'){
    rows.sort(function(a,b){return key(a)<key(b)?1:key(a)>key(b)?-1:0});
    out.innerHTML='<div class="panel"><div class="tablewrap"><table><thead><tr><th>'+esc(t('Date'))+'</th><th>'+esc(t('Time'))+'</th><th>'+esc(t('Invoice'))+'</th><th>'+esc(t('Customer'))+'</th><th>'+esc(t('Payment'))+'</th><th class="num">'+esc(t('Amount'))+'</th><th class="num">'+esc(t('Balance after'))+'</th></tr></thead><tbody>'+
    rows.map(function(r){return '<tr><td>'+r.p.date+'</td><td>'+r.p.time+'</td><td><button class="small" data-view="'+r.b.id+'">'+esc(r.b.no)+'</button> <span class="note">'+r.i+' / '+r.n+'</span></td><td>'+esc(nm(r.b,'clientName','clientNameHi'))+'</td><td>'+esc(t(r.p.mode))+'</td><td class="num">'+money(r.p.amount)+'</td><td class="num'+(r.after>0?' warn':'')+'">'+money(r.after)+'</td></tr>'}).join('')+'</tbody></table></div></div>';
    return;
  }
  var groups={},order=[];
  rows.forEach(function(r){var g=groups[r.b.id];if(!g){g=groups[r.b.id]={b:r.b,rows:[],last:''};order.push(g)}g.rows.push(r);if(key(r)>g.last)g.last=key(r)});
  order.sort(function(a,b){return a.last<b.last?1:a.last>b.last?-1:0});
  out.innerHTML=order.map(function(g){
    var b=g.b,due=dueOf(b);
    return '<div class="panel stack"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><b>'+esc(b.no)+'</b> '+statusPill(b)+'<div class="note">'+esc(nm(b,'clientName','clientNameHi'))+(b.clientPhone?' \u00B7 '+esc(b.clientPhone):'')+' \u00B7 '+b.date+'</div></div>'+
    '<div class="note" style="text-align:right">'+esc(t('Total'))+' '+money(b.total)+'<br>'+esc(t('Paid'))+' '+money(paidOf(b))+(due>0?'<br><span class="warn">'+esc(t('Unpaid'))+' '+money(due)+'</span>':'')+'</div></div>'+
    '<div class="tablewrap"><table style="min-width:0"><thead><tr><th>#</th><th>'+esc(t('Date'))+'</th><th>'+esc(t('Time'))+'</th><th>'+esc(t('Payment'))+'</th><th class="num">'+esc(t('Amount'))+'</th><th class="num">'+esc(t('Balance after'))+'</th></tr></thead><tbody>'+
    g.rows.map(function(r){return '<tr><td>'+r.i+' / '+r.n+'</td><td>'+r.p.date+'</td><td>'+r.p.time+'</td><td>'+esc(t(r.p.mode))+'</td><td class="num">'+money(r.p.amount)+'</td><td class="num'+(r.after>0?' warn':'')+'">'+money(r.after)+'</td></tr>'}).join('')+'</tbody></table></div>'+
    '<div class="row"><button class="small" data-view="'+b.id+'">'+esc(t('View bill'))+'</button></div></div>';
  }).join('');
}
function viewPending(box){
  var rows={},list=[];
  db.bills.forEach(function(b){
    var d=dueOf(b);if(!(d>0)||!b.clientId)return;
    list.push(b);var r=rows[b.clientId]||(rows[b.clientId]={id:b.clientId,n:0,total:0,paid:0,due:0,oldest:b.date});
    r.n++;r.total+=b.total;r.paid+=paidOf(b);r.due+=d;if(b.date<r.oldest)r.oldest=b.date;
  });
  var cl=Object.keys(rows).map(function(k){return rows[k]}).sort(function(a,b){return b.due-a.due});
  var sum=r2(cl.reduce(function(s,r){return s+r.due},0));
  list.sort(function(a,b){return (a.date+a.time)<(b.date+b.time)?-1:1});
  if(!list.length){box.innerHTML='<div class="panel"><p class="muted">'+esc(t('No pending amounts. Every bill is fully paid.'))+'</p></div>';return}
  box.innerHTML='<div class="stack"><div class="panel row" style="gap:32px"><div><h3>'+esc(t('Total pending'))+'</h3><div class="big warn">'+money(sum)+'</div></div><div><h3>'+esc(t('Customers with pending'))+'</h3><div class="big">'+cl.length+'</div></div><div><h3>'+esc(t('Pending bills'))+'</h3><div class="big">'+list.length+'</div></div></div>'+
  '<div class="panel stack"><h2>'+esc(t('Pending by customer'))+'</h2><div class="tablewrap"><table><thead><tr><th>'+esc(t('Customer'))+'</th><th class="num">'+esc(t('Pending bills'))+'</th><th class="num">'+esc(t('Total'))+'</th><th class="num">'+esc(t('Paid'))+'</th><th class="num">'+esc(t('Unpaid'))+'</th><th>'+esc(t('Oldest'))+'</th><th></th></tr></thead><tbody>'+
  cl.map(function(r){var c=clientById(r.id);return '<tr><td><b>'+esc(c?nm(c):'')+'</b>'+(c&&c.phone?'<div class="note">'+esc(c.phone)+'</div>':'')+'</td><td class="num">'+r.n+'</td><td class="num">'+money(r.total)+'</td><td class="num">'+money(r.paid)+'</td><td class="num warn">'+money(r.due)+'</td><td>'+r.oldest+'</td><td><button class="small" data-acct="'+r.id+'">'+esc(t('Account'))+'</button></td></tr>'}).join('')+'</tbody></table></div></div>'+
  '<div class="panel stack"><h2>'+esc(t('Pending invoices'))+'</h2><div class="tablewrap"><table><thead><tr><th>'+esc(t('Date'))+'</th><th>'+esc(t('Invoice'))+'</th><th>'+esc(t('Customer'))+'</th><th class="num">'+esc(t('Total'))+'</th><th class="num">'+esc(t('Paid'))+'</th><th class="num">'+esc(t('Unpaid'))+'</th><th></th></tr></thead><tbody>'+
  list.map(function(b){return '<tr><td>'+b.date+'</td><td><b>'+esc(b.no)+'</b> '+statusPill(b)+'</td><td>'+esc(nm(b,'clientName','clientNameHi'))+'</td><td class="num">'+money(b.total)+'</td><td class="num">'+money(paidOf(b))+'</td><td class="num warn">'+money(dueOf(b))+'</td><td><button class="small primary" data-view="'+b.id+'">'+esc(t('Receive'))+'</button></td></tr>'}).join('')+'</tbody></table></div></div></div>';
  box.onclick=function(e){var a=e.target.closest('[data-acct]'),v=e.target.closest('[data-view]');if(a)showLedger(a.dataset.acct);if(v)billAction(v.dataset.view)};
}
function closeModal(){$('#modal').hidden=true;openBill=null;openLedger=null;openBack=null}
$('#modal').addEventListener('click',function(e){if(e.target.id==='modal')closeModal()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeModal();setMenu(false)}});

/* Bill history: filters (date, status, customer, payment mode, total) and sorting. Opens on today's date each time. */
function isoDay(d){var p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function defaultHist(){var d=today();return {q:'',from:d,to:d,status:'all',client:'all',mode:'all',min:'',max:'',sort:'date_desc',keep:false}}
var hist=defaultHist(),lastRoute='';
function billState(b){if(b.status==='cancelled')return 'cancelled';var d=dueOf(b),p=paidOf(b);return d<=0?'paid':(p>0?'part':'unpaid')}
function histRange(k){
  var t0=new Date(),d=function(n){var x=new Date();x.setDate(x.getDate()-n);return isoDay(x)};
  if(k==='today')return [d(0),d(0)];if(k==='yesterday')return [d(1),d(1)];if(k==='week')return [d(6),d(0)];
  if(k==='month')return [isoDay(new Date(t0.getFullYear(),t0.getMonth(),1)),d(0)];return ['',''];
}
var SORTS=[['date_desc','Newest first'],['date_asc','Oldest first'],['total_desc','Total: high to low'],['total_asc','Total: low to high'],['due_desc','Due: high to low'],['due_asc','Due: low to high'],['paid_desc','Paid: high to low'],['paid_asc','Paid: low to high'],['cust_asc','Customer A to Z'],['cust_desc','Customer Z to A'],['no_asc','Bill number: low to high'],['no_desc','Bill number: high to low']];
function viewBills(box){
  var seen={},custs=[];
  db.bills.forEach(function(b){var k=b.clientId||'walkin';if(!seen[k]){seen[k]=1;custs.push({id:k,label:nm(b,'clientName','clientNameHi')})}});
  custs.sort(function(a,c){return a.label.toLowerCase()<c.label.toLowerCase()?-1:1});
  box.innerHTML='<div class="panel stack"><div class="row"><label class="grow">'+esc(t('Search'))+'<input id="hq" placeholder="'+esc(t('Customer name, phone or bill number'))+'" value="'+esc(hist.q)+'"></label></div>'+
  '<div class="chips" id="hrange"></div>'+
  '<div class="row"><label class="grow sm">'+esc(t('From'))+'<input id="hf" type="date" value="'+hist.from+'"></label><label class="grow sm">'+esc(t('To'))+'<input id="ht" type="date" value="'+hist.to+'"></label>'+
  '<label class="grow">'+esc(t('Customer'))+'<select id="hc"><option value="all">'+esc(t('All customers'))+'</option>'+custs.map(function(c){return '<option value="'+esc(c.id)+'"'+(hist.client===c.id?' selected':'')+'>'+esc(c.label)+'</option>'}).join('')+'</select></label></div>'+
  '<div class="row"><label class="grow">'+esc(t('Payment'))+'<select id="hm"><option value="all">'+esc(t('All payment modes'))+'</option>'+['cash','UPI','card','other'].map(function(m){return '<option value="'+m+'"'+(hist.mode===m?' selected':'')+'>'+esc(t(m))+'</option>'}).join('')+'</select></label>'+
  '<label class="grow sm">'+esc(t('Min total'))+'<input id="hmin" inputmode="decimal" value="'+esc(hist.min)+'"></label><label class="grow sm">'+esc(t('Max total'))+'<input id="hmax" inputmode="decimal" value="'+esc(hist.max)+'"></label>'+
  '<label class="grow">'+esc(t('Sort by'))+'<select id="hs">'+SORTS.map(function(x){return '<option value="'+x[0]+'"'+(hist.sort===x[0]?' selected':'')+'>'+esc(t(x[1]))+'</option>'}).join('')+'</select></label></div>'+
  '<div class="chips" id="hstat"></div><div id="hsum"></div><div id="hlist"></div></div>';
  var upd=function(){hist.q=$('#hq').value;hist.from=$('#hf').value;hist.to=$('#ht').value;hist.client=$('#hc').value;hist.mode=$('#hm').value;hist.min=$('#hmin').value;hist.max=$('#hmax').value;hist.sort=$('#hs').value;drawHist()};
  ['#hq','#hf','#ht','#hc','#hm','#hmin','#hmax','#hs'].forEach(function(x){$(x).addEventListener('input',upd);$(x).addEventListener('change',upd)});
  $('#hrange').onclick=function(e){var b=e.target.closest('[data-rg]');if(!b)return;var r=histRange(b.dataset.rg);hist.from=r[0];hist.to=r[1];$('#hf').value=r[0];$('#ht').value=r[1];drawHist()};
  $('#hstat').onclick=function(e){var b=e.target.closest('[data-hs]');if(b){hist.status=b.dataset.hs;drawHist()}};
  $('#hlist').onclick=function(e){
    var th=e.target.closest('[data-sort]');
    if(th){var k=th.dataset.sort,cur2=hist.sort.split('_');hist.sort=k+'_'+(cur2[0]===k&&cur2[1]==='desc'?'asc':'desc');$('#hs').value=SORTS.some(function(x){return x[0]===hist.sort})?hist.sort:'';drawHist();return}
    var v=e.target.closest('[data-view]');if(v)billAction(v.dataset.view);
  };
  drawHist();
}
function drawHist(){
  var q=hist.q.trim().toLowerCase(),min=parseFloat(hist.min),max=parseFloat(hist.max);
  var base=db.bills.filter(function(b){
    if(hist.from&&b.date<hist.from)return false;if(hist.to&&b.date>hist.to)return false;
    if(hist.client!=='all'&&(hist.client==='walkin'?!!b.clientId:b.clientId!==hist.client))return false;
    if(hist.mode!=='all'&&b.pay!==hist.mode)return false;
    if(min>=0&&b.total<min)return false;if(max>=0&&b.total>max)return false;
    return !q||(b.clientName+' '+hn(b,'clientName','clientNameHi')+' '+b.clientPhone+' '+b.no).toLowerCase().indexOf(q)>-1;
  });
  var cnt={all:base.length,paid:0,part:0,unpaid:0,cancelled:0};base.forEach(function(b){cnt[billState(b)]++});
  var list=base.filter(function(b){return hist.status==='all'||billState(b)===hist.status});
  var sp=hist.sort.split('_'),key=sp[0],dir=sp[1]==='asc'?1:-1;
  var val={date:function(b){return b.date+' '+b.time},no:function(b){return b.no},cust:function(b){return nm(b,'clientName','clientNameHi').toLowerCase()},total:function(b){return b.total},paid:function(b){return paidOf(b)},due:function(b){return dueOf(b)}}[key]||function(b){return b.date+' '+b.time};
  list=list.slice().sort(function(a,b){var x=val(a),y=val(b);return x<y?-dir:x>y?dir:(a.no<b.no?1:-1)});
  var rg=[['today','Today'],['yesterday','Yesterday'],['week','Last 7 days'],['month','This month'],['all','All time']];
  $('#hrange').innerHTML=rg.map(function(r){var v=histRange(r[0]);return '<button class="chip'+(v[0]===hist.from&&v[1]===hist.to?' on':'')+'" data-rg="'+r[0]+'">'+esc(t(r[1]))+'</button>'}).join('');
  $('#hstat').innerHTML=[['all','All'],['paid','Paid'],['part','Part paid'],['unpaid','Unpaid'],['cancelled','Cancelled']].map(function(x){return '<button class="chip'+(hist.status===x[0]?' on':'')+'" data-hs="'+x[0]+'">'+esc(t(x[1]))+' ('+cnt[x[0]]+')</button>'}).join('');
  var live=list.filter(function(b){return b.status!=='cancelled'});
  var sT=r2(live.reduce(function(s2,b){return s2+b.total},0)),sP=r2(live.reduce(function(s2,b){return s2+paidOf(b)},0)),sD=r2(live.reduce(function(s2,b){return s2+dueOf(b)},0));
  $('#hsum').innerHTML='<div class="row" style="gap:20px"><div><h3>'+esc(t('Bills'))+'</h3><div class="big">'+list.length+'</div></div><div><h3>'+esc(t('Total'))+'</h3><div class="big">'+money(sT)+'</div></div><div><h3>'+esc(t('Paid'))+'</h3><div class="big">'+money(sP)+'</div></div><div><h3>'+esc(t('Due'))+'</h3><div class="big'+(sD>0?' warn':'')+'">'+money(sD)+'</div></div></div>';
  var arrow=function(k){return key===k?(dir===1?' ▲':' ▼'):''};
  var th=function(k,label,cls){return '<th'+(cls?' class="'+cls+'"':'')+' data-sort="'+k+'" style="cursor:pointer">'+esc(t(label))+arrow(k)+'</th>'};
  $('#hlist').innerHTML=list.length?'<div class="tablewrap"><table><thead><tr>'+th('no','Bill')+th('date','Date')+th('cust','Customer')+th('total','Total','num')+th('paid','Paid','num')+th('due','Due','num')+'<th></th></tr></thead><tbody>'+
    list.map(function(b){return '<tr><td><b>'+esc(b.no)+'</b> '+statusPill(b)+'</td><td>'+b.date+' <span class="muted">'+b.time+'</span></td><td>'+esc(nm(b,'clientName','clientNameHi'))+(b.clientPhone?'<div class="note">'+esc(b.clientPhone)+'</div>':'')+'</td><td class="num">'+money(b.total)+'</td><td class="num">'+money(paidOf(b))+'</td><td class="num'+(dueOf(b)>0?' warn':'')+'">'+money(dueOf(b))+'</td><td><button class="small'+(dueOf(b)>0?' primary':'')+'" data-view="'+b.id+'">'+esc(dueOf(b)>0?t('Receive'):t('View'))+'</button></td></tr>'}).join('')+'</tbody></table></div>'
    :'<p class="muted">'+esc(db.bills.length?t('No bills match this search.'):t('No bills yet. Save a bill from the New bill tab and it will appear here.'))+'</p>';
}

/* Items */
var itemF={q:'',cat:'All',qty:'All',stock:'all'};
function stockState(i){if(i.stock===''||i.stock==null)return 'na';if(i.stock<=0)return 'out';if(i.stock<=5)return 'low';return 'in'}
function allCats(){
  var out=[];(db.categories||[]).concat(db.items.map(function(i){return i.category})).forEach(function(c){if(c&&out.indexOf(c)<0)out.push(c)});
  return out;
}
function viewItems(box){
  box.innerHTML='<div class="cols"><div class="stack"><div class="panel stack"><h2>'+esc(t('Item master'))+'</h2>'+
  '<input id="fq" placeholder="'+esc(t('Search items by name'))+'" value="'+esc(itemF.q)+'" aria-label="'+esc(t('Search items by name'))+'">'+
  '<div class="chips" id="schips"></div><div class="chips" id="cchips"></div><div class="chips" id="qchips"></div><div id="itable"></div></div></div>'+
  '<div class="stack"><form class="panel stack" id="iform"><h2 id="ititle">'+esc(t('Add item'))+'</h2><input type="hidden" id="iid">'+
  '<label>'+esc(t('Name (English)'))+'<input id="in" placeholder="Eyeliner"></label>'+
  '<label>'+esc(t('Name (Hindi)'))+'<input id="inh" placeholder="आईलाइनर"></label>'+
  '<label>'+esc(t('Category'))+'<select id="ic"></select></label>'+
  '<label id="icnw" hidden>'+esc(t('New category name'))+'<input id="icn"></label>'+
  '<div class="row"><label class="grow">'+esc(t('Price per piece (₹)'))+'<input id="ip" inputmode="decimal"></label><label class="grow" id="idzw">'+esc(t('Price per dozen (₹)'))+'<input id="idz" inputmode="decimal"></label></div>'+
  '<div class="row"><label class="grow">'+esc(t('Sold by default in'))+'<select id="iu"><option value="pc">'+esc(t('Piece'))+'</option><option value="doz">'+esc(t('Dozen (12 pcs)'))+'</option><option value="custom">'+esc(t('Manual (own unit)'))+'</option></select></label><label class="grow">'+esc(t('GST rate %'))+'<input id="ig" inputmode="decimal" placeholder="'+esc(t('Optional'))+'"></label></div>'+
  '<div class="stack" id="cuBox" hidden><div class="row"><label class="grow">'+esc(t('Unit name'))+'<input id="iun" placeholder="'+esc(t('e.g. Set'))+'"></label><label class="grow">'+esc(t('Pieces in one unit'))+'<input id="iuq" inputmode="numeric" placeholder="'+esc(t('Optional'))+'"></label><label class="grow">'+esc(t('Price per unit (\u20B9)'))+'<input id="iup" inputmode="decimal" placeholder="'+esc(t('Optional'))+'"></label></div><p class="note">'+esc(t('Only the unit name is needed. Pieces and price are optional. Example: Set, 6 pieces, \u20B9300 shows as "2 Set (12 pcs)" on a bill.'))+'</p></div>'+
  '<p class="note" id="dzNote">'+esc(t('1 dozen = 12 pieces. Fill one price and the other is worked out. Fill both to set a special dozen price.'))+'</p>'+
  '<div class="row"><label class="grow">'+esc(t('HSN code'))+'<input id="ih" placeholder="'+esc(t('Optional'))+'"></label><label class="grow">'+esc(t('Stock (pieces)'))+'<input id="is" inputmode="numeric" placeholder="'+esc(t('Optional'))+'"></label></div>'+
  '<div class="row"><button class="primary grow" type="submit" id="isave">'+esc(t('Add item'))+'</button><button type="button" id="icancel" hidden>'+esc(t('Cancel edit'))+'</button></div>'+
  '<p class="note">'+esc(t('Changing a price here never changes old bills. They keep the price they were billed at.'))+'</p><p class="note">'+esc(t('Type the name in English. In Hindi mode it is written in Hindi automatically. Fill the Hindi name only to correct the spelling.'))+'</p></form>'+
  '<div class="panel stack" id="catpanel"></div>'+
  '<div class="panel stack" id="itemImport"><h2>'+esc(t('Import items from Excel'))+'</h2><p class="muted">'+esc(t('Save your Excel sheet as CSV using the columns in the sample. Name and one price are needed. Then choose the file here.'))+'</p>'+
  '<div class="row"><button id="itemSample" type="button">'+esc(t('Download sample CSV'))+'</button></div>'+
  '<input type="file" id="itemFile" accept=".csv,text/csv,text/plain" aria-label="CSV">'+
  '<textarea id="itemText" placeholder="'+esc(t('Or paste the rows here'))+'" aria-label="'+esc(t('Or paste the rows here'))+'" style="min-height:120px"></textarea>'+
  '<div class="row"><button class="primary" id="itemGo" type="button">'+esc(t('Import items'))+'</button></div><div id="itemRes" class="note"></div></div></div></div>';

  function fillCats(sel){
    $('#ic').innerHTML='<option value="">'+esc(t('Choose a category'))+'</option>'+allCats().map(function(c){return '<option value="'+esc(c)+'">'+esc(tc(c))+'</option>'}).join('')+'<option value="__new__">'+esc(t('+ Add new category…'))+'</option>';
    if(sel)$('#ic').value=sel;
  }
  function drawCats(){
    var cats=allCats();
    $('#catpanel').innerHTML='<h2>'+esc(t('Categories'))+'</h2><div class="stack" style="gap:6px">'+cats.map(function(c){
      var n=db.items.filter(function(i){return i.category===c}).length;
      return '<div class="row" style="justify-content:space-between"><span>'+esc(tc(c))+' <span class="muted">('+n+')</span></span>'+(n===0?'<button class="small danger" data-delcat="'+esc(c)+'">'+esc(t('Delete'))+'</button>':'')+'</div>'}).join('')+'</div>'+
      '<div class="row"><input class="grow" id="ncn" placeholder="'+esc(t('New category name'))+'" aria-label="'+esc(t('New category name'))+'"><button id="ncb">'+esc(t('Add category'))+'</button></div>';
    $('#ncb').onclick=function(){
      var n=$('#ncn').value.trim();if(!n)return;
      if(allCats().indexOf(n)>=0)return;
      guard($('#ncb'),function(){return upsert('categories',{name:n,deleted_at:null},'name').then(function(){unbinCat(n);db.categories.push(n);toast(t('Category added'));render()}).catch(fail)});
    };
  }
  function drawItems(){
    var cnt={all:db.items.length,in:0,low:0,out:0};
    db.items.forEach(function(i){var s=stockState(i);if(s==='in'||s==='low')cnt.in++;if(s==='low')cnt.low++;if(s==='out')cnt.out++});
    $('#schips').innerHTML=[['all','All'],['in','In stock'],['low','Low stock'],['out','Out of stock']].map(function(x){return '<button class="chip'+(itemF.stock===x[0]?' on':'')+'" data-st="'+x[0]+'">'+esc(t(x[1]))+' ('+cnt[x[0]]+')</button>'}).join('');
    $('#cchips').innerHTML=['All'].concat(allCats()).map(function(c){return '<button class="chip'+(itemF.cat===c?' on':'')+'" data-ct="'+esc(c)+'">'+esc(tc(c))+'</button>'}).join('');
    if(itemF.qty!=='All'&&!db.items.some(function(i){return qKind(i)===itemF.qty}))itemF.qty='All';
    $('#qchips').innerHTML=qChipsHtml(db.items,itemF.qty,'data-qt');
    var q=itemF.q.trim().toLowerCase();
    var list=db.items.filter(function(i){
      if(itemF.cat!=='All'&&i.category!==itemF.cat)return false;
      if(itemF.qty!=='All'&&qKind(i)!==itemF.qty)return false;
      var st=stockState(i);
      if(itemF.stock==='in'&&st!=='in'&&st!=='low')return false;
      if(itemF.stock==='low'&&st!=='low')return false;
      if(itemF.stock==='out'&&st!=='out')return false;
      return !q||(i.name+' '+hn(i)).toLowerCase().indexOf(q)>-1;
    });
    $('#itable').innerHTML='<div class="tablewrap"><table><thead><tr><th>'+esc(t('Item'))+'</th><th>'+esc(t('Category'))+'</th><th class="num">'+esc(t('Price'))+'</th><th class="num">'+esc(t('GST'))+'</th><th class="num">'+esc(t('Stock'))+'</th><th></th></tr></thead><tbody>'+
    (list.length?list.map(function(i){
      var st=stockState(i);
      var stc=st==='na'?'–':i.stock+(st==='out'?' <span class="pill unpaid">'+esc(t('Out of stock'))+'</span>':st==='low'?' <span class="pill partial">'+esc(t('Low stock'))+'</span>':'');
      return '<tr><td><b>'+esc(nm(i))+'</b>'+(i.hsn?'<div class="note">HSN '+esc(i.hsn)+'</div>':'')+'</td><td>'+esc(tc(i.category))+'</td><td class="num">'+priceCell(i)+'</td><td class="num">'+(i.gst?i.gst+'%':'–')+'</td><td class="num">'+stc+'</td><td class="row"><button class="small" data-edit="'+i.id+'">'+esc(t('Edit'))+'</button><button class="small danger" data-del="'+i.id+'">'+esc(t('Delete'))+'</button></td></tr>'}).join(''):
      '<tr><td colspan="6" class="muted">'+esc(db.items.length?t('No items in this view.'):t('No items yet. Add the first one using the form.'))+'</td></tr>')+'</tbody></table></div>';
  }
  fillCats('');drawCats();drawItems();wireItemImport();
  $('#fq').addEventListener('input',function(e){itemF.q=e.target.value;drawItems()});
  $('#ic').onchange=function(){$('#icnw').hidden=this.value!=='__new__';if(this.value==='__new__')$('#icn').focus()};
  var reset=function(){$('#iform').reset();$('#iid').value='';$('#ititle').textContent=t('Add item');$('#isave').textContent=t('Add item');$('#icancel').hidden=true;$('#icnw').hidden=true;syncCu()};
  function syncCu(){var cu=$('#iu').value==='custom';$('#idzw').hidden=cu;$('#dzNote').hidden=cu;var show=$('#iu').value==='custom'||$('#iun').value||$('#iuq').value||$('#iup').value;$('#cuBox').hidden=!show}
  $('#iu').onchange=syncCu;
  $('#icancel').onclick=reset;
  $('#in').oninput=function(){$('#inh').placeholder=tr(this.value)||'आईलाइनर'};
  $('#ip').oninput=function(){var v=parseFloat(this.value);$('#idz').placeholder=v>=0?String(r2(v*12)):''};
  $('#idz').oninput=function(){var v=parseFloat(this.value);$('#ip').placeholder=v>=0?String(r2(v/12)):''};
  $('#iform').onsubmit=function(e){
    e.preventDefault();
    var pp=parseFloat($('#ip').value),dp=parseFloat($('#idz').value);
    var un=$('#iun').value.trim(),uq=parseInt($('#iuq').value,10)||0,up=parseFloat($('#iup').value),isCustom=$('#iu').value==='custom';
    if(isCustom)dp=NaN;
    if(isCustom&&!un){toast(t('Enter the unit name'));$('#cuBox').hidden=false;return}
    if(!(pp>=0)&&!(dp>=0)&&!(isCustom&&up>=0)){toast(t('Enter a valid price'));return}
    var price=pp>=0?pp:(dp>=0?r2(dp/12):r2(up/(uq>=1?uq:1)));
    var cat=$('#ic').value;
    if(cat==='__new__')cat=$('#icn').value.trim();
    if(!cat){toast(t('Choose a category'));return}
    var newCat=db.categories.indexOf(cat)<0;
    var st=$('#is').value.trim();
    var o={name:$('#in').value.trim(),nameHi:$('#inh').value.trim(),unit:$('#iu').value,unitName:un||'',unitQty:uq>=1?uq:1,unitPrice:(up>=0&&un)?up:'',dozenPrice:dp>=0?dp:'',category:cat,price:price,gst:parseFloat($('#ig').value)||0,hsn:$('#ih').value.trim(),stock:st===''?'':parseInt(st,10),active:true};
    if(!o.name)o.name=o.nameHi;if(!o.name){toast(t('Enter the item name'));return}
    var id=$('#iid').value,old=id?itemById(id):null,rec=id?Object.assign({},old,o):Object.assign({id:uid()},o);
    var skipStock=!!old&&String(old.stock)===String(o.stock);
    guard($('#isave'),function(){
      return upsert('items',itemRow(rec,skipStock)).then(function(){return newCat?upsert('categories',{name:cat,deleted_at:null},'name'):null}).then(function(){
        if(newCat){unbinCat(cat);db.categories.push(cat)}
        if(id)Object.assign(old,rec);else db.items.push(rec);
        toast(t(id?'Item updated':'Item added'));render();
      }).catch(fail);
    });
  };
  box.onclick=function(e){
    var ed=e.target.closest('[data-edit]'),dl=e.target.closest('[data-del]'),st=e.target.closest('[data-st]'),ct=e.target.closest('[data-ct]'),qt=e.target.closest('[data-qt]'),dc=e.target.closest('[data-delcat]');
    if(st){itemF.stock=st.dataset.st;drawItems()}
    if(ct){itemF.cat=ct.dataset.ct;drawItems()}
    if(qt){itemF.qty=qt.dataset.qt;drawItems()}
    if(dc)twice(dc,t('Sure?'),function(){binSet('categories','name',dc.dataset.delcat,new Date().toISOString()).then(function(){db.categories=db.categories.filter(function(c){return c!==dc.dataset.delcat});toBin('category',dc.dataset.delcat,dc.dataset.delcat);if(itemF.cat===dc.dataset.delcat)itemF.cat='All';toast(t('Moved to Bin'));render()},fail)});
    if(ed){var i=itemById(ed.dataset.edit);$('#iid').value=i.id;$('#in').value=i.name;$('#inh').value=i.nameHi||HN[i.name]||'';fillCats(i.category);$('#ip').value=i.price;$('#idz').value=(i.dozenPrice===''||i.dozenPrice==null)?'':i.dozenPrice;$('#iu').value=i.unit||'pc';$('#iun').value=i.unitName||'';$('#iuq').value=(i.unitQty>1)?i.unitQty:'';$('#iup').value=(i.unitPrice===''||i.unitPrice==null)?'':i.unitPrice;syncCu();$('#ig').value=i.gst||'';$('#ih').value=i.hsn||'';$('#is').value=i.stock;$('#ititle').textContent=t('Edit item');$('#isave').textContent=t('Save changes');$('#icancel').hidden=false;$('#in').focus()}
    if(dl)twice(dl,t('Sure?'),function(){binSet('items','id',dl.dataset.del,new Date().toISOString()).then(function(){var it=itemById(dl.dataset.del);db.items=db.items.filter(function(x){return x.id!==dl.dataset.del});if(it)toBin('item',it.id,it.name,it);toast(t('Moved to Bin'));render()},fail)});
  };
}

/* Clients */
function deleteCustomer(id,btn){
  var c=clientById(id);if(!c)return;
  var due=r2(db.bills.filter(function(b){return b.clientId===id}).reduce(function(s2,b){return s2+dueOf(b)},0));
  if(due>0){toast(t('This customer still owes')+' '+money(due)+'. '+t('Collect the payment first.'));return}
  twice(btn,t('Sure?'),function(){
    binSet('clients','id',id,new Date().toISOString()).then(function(){db.clients=db.clients.filter(function(x){return x.id!==id});toBin('client',id,c.name,c);toast(t('Moved to Bin'));render()},fail);
  });
}
function viewClients(box){
  var stats={};db.bills.forEach(function(b){if(b.clientId&&b.status!=='cancelled'){var s=stats[b.clientId]||(stats[b.clientId]={n:0,t:0,d:0});s.n++;s.t+=b.total;s.d+=dueOf(b)}});
  box.innerHTML='<div class="cols"><div class="panel stack"><h2>'+esc(t('Customers'))+'</h2><div class="tablewrap"><table><thead><tr><th>'+esc(t('Name'))+'</th><th>'+esc(t('Phone'))+'</th><th class="num">'+esc(t('Bills'))+'</th><th class="num">'+esc(t('Spent'))+'</th><th class="num">'+esc(t('Pending'))+'</th><th></th></tr></thead><tbody>'+
  (db.clients.length?db.clients.map(function(c){var s=stats[c.id]||{n:0,t:0,d:0};return '<tr><td><b>'+esc(nm(c))+'</b>'+(c.address?'<div class="note">'+esc(c.address)+'</div>':'')+'</td><td>'+esc(c.phone)+'</td><td class="num">'+s.n+'</td><td class="num">'+money(s.t)+'</td><td class="num'+(s.d>0?' warn':'')+'">'+money(s.d)+'</td><td class="row"><button class="small" data-acct="'+c.id+'">'+esc(t('Account'))+'</button><button class="small" data-hist="'+esc(c.name)+'">'+esc(t('Bills'))+'</button><button class="small" data-edit="'+c.id+'">'+esc(t('Edit'))+'</button></td></tr>'}).join(''):'<tr><td colspan="6" class="muted">'+esc(t('No customers yet. They are added when you bill a new customer.'))+'</td></tr>')+
  '</tbody></table></div></div><form class="panel stack" id="cform"><h2 id="ctitle">'+esc(t('Add customer'))+'</h2><input type="hidden" id="cid">'+
  '<label>'+esc(t('Name (English)'))+'<input id="cn"></label><label>'+esc(t('Name (Hindi)'))+'<input id="cnh"></label><label>'+esc(t('Phone'))+'<input id="cp" inputmode="numeric" autocomplete="off" placeholder="'+esc(t('10-digit number'))+'"><span class="note warn" id="cperr" hidden>'+esc(t('Phone number must be 10 digits'))+'</span></label><label>'+esc(t('Address'))+'<input id="ca" placeholder="'+esc(t('Optional'))+'"></label>'+
  '<div class="row"><button class="primary grow" type="submit" id="csave">'+esc(t('Add customer'))+'</button><button type="button" id="ccancel" hidden>'+esc(t('Cancel edit'))+'</button><button type="button" class="danger" id="cdel" hidden>'+esc(t('Delete customer'))+'</button></div>'+
  '<p class="note">'+esc(t('Past bills keep the name they were saved with, even if you edit the customer later.'))+'</p><p class="note">'+esc(t('Type the name in English. In Hindi mode it is written in Hindi automatically. Fill the Hindi name only to correct the spelling.'))+'</p></form></div>'+
  '<div class="panel stack" id="importPanel" style="margin-top:16px"><h2>'+esc(t('Import customers from Excel'))+'</h2><p class="muted">'+esc(t('Save your Excel sheet as CSV, with the columns Name, Mobile Number and Address. Then choose the file here.'))+'</p>'+
  '<div class="row"><button id="csvSample" type="button">'+esc(t('Download sample CSV'))+'</button></div>'+
  '<input type="file" id="csvFile" accept=".csv,text/csv,text/plain" aria-label="CSV">'+
  '<textarea id="csvText" placeholder="'+esc(t('Or paste the rows here'))+'" aria-label="'+esc(t('Or paste the rows here'))+'" style="min-height:120px"></textarea>'+
  '<div class="row"><button class="primary" id="csvGo" type="button">'+esc(t('Import customers'))+'</button></div><div id="csvRes" class="note"></div></div>';
  $('#ccancel').onclick=function(){render()};
  $('#cn').oninput=function(){$('#cnh').placeholder=tr(this.value)};
  $('#cn').onblur=function(){this.value=titleCase(this.value)};
  phoneInput('#cp','#cperr');
  wireImport();
  $('#cform').onsubmit=function(e){
    e.preventDefault();var id=$('#cid').value;
    var o={name:titleCase($('#cn').value),nameHi:$('#cnh').value.trim(),phone:cleanPhone($('#cp').value),address:$('#ca').value.trim()};
    if(!o.name)o.name=o.nameHi;if(!o.name){toast(t('Enter the customer name'));return}
    if(phoneErr(o.phone)){$('#cperr').hidden=false;$('#cp').focus();toast(t('Phone number must be 10 digits'));return}
    var dup=o.phone&&db.clients.find(function(c){return c.phone===o.phone&&c.id!==$('#cid').value});
    if(dup){toast(t('This number already belongs to')+' '+nm(dup));return}
    var rec=id?Object.assign({},clientById(id),o):Object.assign({id:uid(),created:today()},o);
    guard($('#csave'),function(){return upsert('clients',clientRow(rec)).then(function(){if(id)Object.assign(clientById(id),rec);else db.clients.push(rec);toast(t(id?'Customer updated':'Customer added'));render()}).catch(fail)});
  };
  box.onclick=function(e){
    var ed=e.target.closest('[data-edit]'),h=e.target.closest('[data-hist]');
    if(ed){var c=clientById(ed.dataset.edit);$('#cid').value=c.id;$('#cn').value=c.name;$('#cnh').value=c.nameHi||HN[c.name]||'';$('#cp').value=c.phone;$('#ca').value=c.address||'';$('#ctitle').textContent=t('Edit customer');$('#csave').textContent=t('Save changes');$('#ccancel').hidden=false;$('#cdel').hidden=false;$('#cdel').onclick=function(){deleteCustomer(c.id,this)};$('#cn').focus()}
    var ac=e.target.closest('[data-acct]');if(ac)showLedger(ac.dataset.acct);
    if(h){var hc=db.clients.find(function(x){return x.name===h.dataset.hist});hist=Object.assign(defaultHist(),{from:'',to:'',client:hc?hc.id:'all',q:hc?'':h.dataset.hist,keep:true});location.hash='bills'}
  };
}

/* Reports */
function qtySold(u){
  return Object.keys(u).sort(function(a,b){return a==='pc'?-1:b==='pc'?1:0}).map(function(k){var q=u[k];return q+' '+(k==='pc'?t(q===1?'pc':'pcs'):k==='doz'?t('dozen'):uLabel(k.slice(2)))}).join(', ');
}
function viewReports(box){
  var ok=db.bills.filter(function(b){return b.status!=='cancelled'});
  var td=today(),day={},mon={},items={},dayDue={},monDue={};
  ok.forEach(function(b){
    day[b.date]=(day[b.date]||0)+b.total;var mk=b.date.slice(0,7);mon[mk]=(mon[mk]||0)+b.total;dayDue[b.date]=r2((dayDue[b.date]||0)+dueOf(b));monDue[mk]=r2((monDue[mk]||0)+dueOf(b));
    b.lines.forEach(function(l){var s=items[l.name]||(items[l.name]={u:{},t:0,h:l.nameHi||HN[l.name]||''});var uk=(l.unit==='custom'&&l.unitName)?'c:'+l.unitName:(l.unit||'pc');s.u[uk]=(s.u[uk]||0)+l.qty;s.t+=l.total});
  });
  var todayBills=ok.filter(function(b){return b.date===td}),byPay={},collected=0;
  ok.forEach(function(b){(b.payments||[]).forEach(function(p){if(p.date===td){byPay[p.mode]=(byPay[p.mode]||0)+p.amount;collected+=p.amount}})});
  var days=Object.keys(day).sort().reverse().slice(0,14),maxD=Math.max.apply(null,days.map(function(d){return day[d]}).concat([1]));
  var il=Object.keys(items).sort(function(a,b){return items[b].t-items[a].t}),maxI=Math.max.apply(null,il.map(function(k){return items[k].t}).concat([1]));
  var dueAll=r2(ok.reduce(function(s2,b){return s2+dueOf(b)},0)),dueToday=r2(todayBills.reduce(function(s2,b){return s2+dueOf(b)},0));
  var pendCards='<div><h3>'+esc(t('Pending today'))+'</h3><div class="big'+(dueToday>0?' warn':'')+'">'+money(dueToday)+'</div></div><div><h3>'+esc(t('Total pending'))+'</h3><div class="big'+(dueAll>0?' warn':'')+'">'+money(dueAll)+'</div></div>';
  var tbl=function(head,rows){return rows.length?'<div class="tablewrap"><table><thead><tr>'+head+'</tr></thead><tbody>'+rows.join('')+'</tbody></table></div>':'<p class="muted">'+esc(t('Nothing to show yet. Save a bill and the figures appear here.'))+'</p>'};
  box.innerHTML='<div class="stack"><div class="panel stack"><h2>'+esc(t('Today'))+', '+td+'</h2><div class="row" style="gap:24px"><div><h3>'+esc(t('Sales'))+'</h3><div class="big">'+money(todayBills.reduce(function(s,b){return s+b.total},0))+'</div></div><div><h3>'+esc(t('Bills'))+'</h3><div class="big">'+todayBills.length+'</div></div><div><h3>'+esc(t('Collected'))+'</h3><div class="big">'+money(collected)+'</div></div>'+
  ['cash','UPI','card','other'].map(function(m){return '<div><h3>'+esc(t(m))+'</h3><div class="big">'+money(byPay[m]||0)+'</div></div>'}).join('')+pendCards+'</div><p class="note">'+esc(t('At closing, check the cash and UPI figures against your drawer and your UPI app.'))+'</p></div>'+
  '<div class="cols"><div class="panel stack"><h2>'+esc(t('Daily sales'))+'</h2>'+tbl('<th>'+esc(t('Date'))+'</th><th class="num">'+esc(t('Sales'))+'</th><th class="num">'+esc(t('Pending'))+'</th><th class="barcell"></th>',days.map(function(d){return '<tr><td>'+d+'</td><td class="num">'+money(day[d])+'</td><td class="num'+((dayDue[d]||0)>0?' warn':'')+'">'+money(dayDue[d]||0)+'</td><td><div class="bar" style="width:'+Math.round(day[d]/maxD*100)+'%"></div></td></tr>'}))+'</div>'+
  '<div class="panel stack"><h2>'+esc(t('Monthly sales'))+'</h2>'+tbl('<th>'+esc(t('Month'))+'</th><th class="num">'+esc(t('Sales'))+'</th><th class="num">'+esc(t('Pending'))+'</th>',Object.keys(mon).sort().reverse().map(function(m){return '<tr><td>'+m+'</td><td class="num">'+money(mon[m])+'</td><td class="num'+((monDue[m]||0)>0?' warn':'')+'">'+money(monDue[m]||0)+'</td></tr>'}))+'</div></div>'+
  '<div class="panel stack"><h2>'+esc(t('Item-wise sales'))+'</h2>'+tbl('<th>'+esc(t('Item'))+'</th><th class="num">'+esc(t('Quantity sold'))+'</th><th class="num">'+esc(t('Sales'))+'</th><th class="barcell"></th>',il.map(function(k){return '<tr><td>'+esc(lang==='hi'?(items[k].h||HN[k]||tr(k)):k)+'</td><td class="num">'+qtySold(items[k].u)+'</td><td class="num">'+money(items[k].t)+'</td><td><div class="bar" style="width:'+Math.round(items[k].t/maxI*100)+'%"></div></td></tr>'}))+'<p class="note">'+esc(t('Cancelled bills are left out of every figure.'))+'</p></div></div>';
}

/* Backup */
function viewBackup(box){
  box.innerHTML='<div class="cols"><div class="panel stack"><h2>'+esc(t('Back up'))+'</h2><p class="muted">'+esc(t('Copy all items, customers and bills as one block of text. Paste it into a note or a file and keep it in Google Drive or on a computer. Do this at least once a week.'))+'</p>'+
  '<div class="row"><button class="primary" id="bk">'+esc(t('Copy backup'))+'</button><button id="bshow">'+esc(t('Show backup text'))+'</button></div><textarea id="bta" hidden readonly aria-label="'+esc(t('Show backup text'))+'"></textarea>'+
  '<p class="note">'+esc(t('Your data is saved in the cloud database. Everyone you add as a user can sign in and see it. The backup contains customer phone numbers, so keep it private.'))+'</p></div>'+
  '<div class="panel stack"><h2>'+esc(t('Restore'))+'</h2><p class="muted">'+esc(t('Pick a saved backup file, or paste the backup text below. The backup is added to the database.'))+'</p>'+
  '<input type="file" id="bf" accept=".json,.txt,text/plain,application/json" aria-label="'+esc(t('Restore'))+'"><textarea id="rta" placeholder="'+esc(t('Paste backup text here'))+'" aria-label="'+esc(t('Paste backup text here'))+'"></textarea>'+
  '<div class="row"><button class="primary" id="rs">'+esc(t('Restore from text'))+'</button><button id="wipe">'+esc(t('Refresh data'))+'</button></div><p class="note">'+esc(t('Restoring adds the backup to the database. Items, customers and bills that already exist are skipped.'))+'</p></div></div>';
  var data=function(){return JSON.stringify(Object.assign({},db,{bin:[]}))};
  $('#bk').onclick=function(){copy(data(),t('Backup copied'))};
  $('#bshow').onclick=function(){var x=$('#bta');x.value=data();x.hidden=false;x.select()};
  $('#bf').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){$('#rta').value=String(r.result)};r.readAsText(f)};
  $('#rs').onclick=function(){var b=$('#rs');twice(b,t('Add this backup to the database?'),function(){
    var d;try{d=JSON.parse($('#rta').value);if(!d||!Array.isArray(d.items)||!Array.isArray(d.bills)||!Array.isArray(d.clients))throw 0}catch(x){toast(t('That text is not a valid backup'));return}
    guard(b,function(){return rpc('import_backup',{d:d}).then(function(r){return loadAll().then(function(){toast(t('Imported')+': '+r.bills+' '+t('Bills')+', '+r.items+' '+t('Items')+', '+r.clients+' '+t('Customers'));render()})}).catch(fail)});
  })};
  $('#wipe').onclick=function(){guard($('#wipe'),function(){return loadAll().then(function(){toast(t('Data refreshed'));render()}).catch(fail)})};
}

/* Customer import: parse a CSV file (Name, Mobile Number, Address) */
var SAMPLE_CSV='Name,Mobile Number,Address\r\nPriya Sharma,9876500011,Lajpat Nagar\r\nAnita Verma,9876500022,\r\n';
function parseCSV(text){
  text=String(text||'').replace(/^\uFEFF/,'');
  var first=text.split(/\r?\n/)[0]||'';
  var delim=[',',';','\t'].map(function(d){return [d,first.split(d).length]}).sort(function(a,b){return b[1]-a[1]})[0][0];
  var rows=[],row=[],cell='',q=false,i,c,has=function(r){return r.some(function(x){return x.trim()!==''})};
  for(i=0;i<text.length;i++){
    c=text[i];
    if(q){if(c==='"'){if(text[i+1]==='"'){cell+='"';i++}else q=false}else cell+=c}
    else if(c==='"')q=true;
    else if(c===delim){row.push(cell);cell=''}
    else if(c==='\n'||c==='\r'){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);cell='';if(has(row))rows.push(row);row=[]}
    else cell+=c;
  }
  row.push(cell);if(has(row))rows.push(row);
  return rows;
}
function readCustomers(text){
  var rows=parseCSV(text),res={added:[],skipped:[]};
  if(!rows.length)return res;
  var h=rows[0].map(function(x){return x.trim().toLowerCase()});
  var hasHeader=h.some(function(x){return /name|mobile|phone|address/.test(x)});
  var iN=0,iP=1,iA=2;
  if(hasHeader){
    iN=h.findIndex(function(x){return /name/.test(x)});iP=h.findIndex(function(x){return /mobile|phone|number/.test(x)});iA=h.findIndex(function(x){return /address/.test(x)});
    if(iN<0)iN=0;rows=rows.slice(1);
  }
  var seen={};db.clients.forEach(function(c){if(c.phone)seen[c.phone]=1});
  rows.forEach(function(r,k){
    var line=k+(hasHeader?2:1),name=titleCase(r[iN]||''),ph=cleanPhone(iP>=0?(r[iP]||''):''),ad=iA>=0?(r[iA]||'').trim():'';
    if(!name){res.skipped.push(t('Row')+' '+line+': '+t('no name'));return}
    if(phoneErr(ph)){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('mobile number must be 10 digits'));return}
    if(ph&&seen[ph]){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('mobile number already exists'));return}
    if(ph)seen[ph]=1;
    res.added.push({id:uid(),name:name,nameHi:'',phone:ph,address:ad,created:today()});
  });
  return res;
}
function wireImport(){
  $('#csvSample').onclick=function(){
    var b=new Blob(['\uFEFF'+SAMPLE_CSV],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download='customers-sample.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);
  };
  $('#csvFile').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){$('#csvText').value=String(r.result)};r.readAsText(f)};
  $('#csvGo').onclick=function(){
    var res=readCustomers($('#csvText').value);
    if(!res.added.length&&!res.skipped.length){toast(t('Choose a CSV file or paste the rows first'));return}
    guard($('#csvGo'),function(){
      var batches=[];for(var i=0;i<res.added.length;i+=200)batches.push(res.added.slice(i,i+200));
      return batches.reduce(function(p,b){return p.then(function(){return rest('POST','/rest/v1/clients?on_conflict=id',b.map(clientRow),'resolution=merge-duplicates,return=minimal')})},Promise.resolve()).then(function(){
        db.clients=db.clients.concat(res.added);render();
        var box=$('#csvRes');
        if(box)box.innerHTML='<b class="good-text">'+esc(t('Added'))+': '+res.added.length+'</b>'+(res.skipped.length?'<br><b>'+esc(t('Skipped'))+': '+res.skipped.length+'</b><br>'+res.skipped.slice(0,20).map(esc).join('<br>')+(res.skipped.length>20?'<br>\u2026':''):'');
        toast(t('Added')+': '+res.added.length);
      }).catch(fail);
    });
  };
}

/* Items import: parse a CSV file (see the sample for the columns) */
var SAMPLE_ITEMS_CSV='Name,Hindi Name,Category,Price per Piece,Price per Dozen,Sold In,GST %,HSN Code,Stock (pieces),Unit Name,Pieces in Unit,Price per Unit\r\n'+
  'Matte Lipstick,\u092E\u0948\u091F \u0932\u093F\u092A\u0938\u094D\u091F\u093F\u0915,Cosmetics,349,,Piece,18,3304,24,,,\r\n'+
  'Glass Bangles,\u0915\u093E\u0901\u091A \u0915\u0940 \u091A\u0942\u0921\u093C\u093F\u092F\u093E\u0901,Bangles,12.5,150,Dozen,3,7018,240,,,\r\n'+
  'Silk Thread Bangles,,Bangles,40,,Manual,3,7117,60,Set,6,220\r\n';
function colKey(n){
  if(/hindi/.test(n))return 'nameHi';
  if(/dozen/.test(n))return 'dozen';
  if(/unitname/.test(n))return 'unitName';
  if(/piecesin|piecesper|unitqty|qtyinunit/.test(n))return 'unitQty';
  if(/priceperunit|unitprice/.test(n))return 'unitPrice';
  if(/soldin|defaultunit|^unit$|sellby|soldby/.test(n))return 'soldIn';
  if(/category/.test(n))return 'category';
  if(/gst|tax/.test(n))return 'gst';
  if(/hsn/.test(n))return 'hsn';
  if(/stock|qty|quantity/.test(n))return 'stock';
  if(/price|rate|mrp/.test(n))return 'price';
  if(/name|item|product/.test(n))return 'name';
  return '';
}
function readItems(text){
  var rows=parseCSV(text),res={added:[],skipped:[],cats:[]};
  if(rows.length<2){return res}
  var map={};rows[0].forEach(function(h,i){var k=colKey(h.toLowerCase().replace(/[^a-z0-9]/g,''));if(k&&map[k]==null)map[k]=i});
  if(map.name==null){res.skipped.push(t('Row')+' 1: '+t('no name'));return res}
  var num=function(v){var x=parseFloat(String(v==null?'':v).replace(/[^\d.\-]/g,''));return isNaN(x)?NaN:x};
  var get=function(r,k){return map[k]==null?'':String(r[map[k]]==null?'':r[map[k]]).trim()};
  var seen={};db.items.forEach(function(i){seen[i.name.toLowerCase()]=1});
  var cats=db.categories.slice();
  rows.slice(1).forEach(function(r,k){
    var line=k+2,name=get(r,'name');
    if(!name){res.skipped.push(t('Row')+' '+line+': '+t('no name'));return}
    if(seen[name.toLowerCase()]){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('item already exists'));return}
    var pp=num(get(r,'price')),dp=num(get(r,'dozen')),up=num(get(r,'unitPrice')),uq=parseInt(get(r,'unitQty'),10)||0,un=get(r,'unitName'),si=get(r,'soldIn').toLowerCase();
    var custom=!!un;
    if(!(pp>=0)&&!(dp>=0)&&!(custom&&up>=0)){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('no price'));return}
    var unit='pc';
    if(/manual|custom|own/.test(si)){if(!custom){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('Manual unit needs the unit name'));return}unit='custom'}
    else if(/doz/.test(si))unit='doz';
    var price=pp>=0?pp:(dp>=0?r2(dp/12):r2(up/(uq>=1?uq:1))),st=get(r,'stock'),cat=get(r,'category')||'Other',g=num(get(r,'gst'));
    seen[name.toLowerCase()]=1;
    if(cats.indexOf(cat)<0){cats.push(cat);res.cats.push(cat)}
    res.added.push({id:uid(),name:name,nameHi:get(r,'nameHi'),category:cat,price:price,dozenPrice:dp>=0?dp:'',unit:unit,unitName:custom?un:'',unitQty:custom&&uq>=1?uq:1,unitPrice:(custom&&up>=0)?up:'',gst:g>=0?g:0,hsn:get(r,'hsn'),stock:st===''||isNaN(parseInt(st,10))?'':Math.max(0,parseInt(st,10)),active:true});
  });
  return res;
}
function wireItemImport(){
  $('#itemSample').onclick=function(){
    var b=new Blob(['\uFEFF'+SAMPLE_ITEMS_CSV],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download='items-sample.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);
  };
  $('#itemFile').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){$('#itemText').value=String(r.result)};r.readAsText(f)};
  $('#itemGo').onclick=function(){
    var res=readItems($('#itemText').value);
    if(!res.added.length&&!res.skipped.length){toast(t('Choose a CSV file or paste the rows first'));return}
    guard($('#itemGo'),function(){
      var batches=[];for(var i=0;i<res.added.length;i+=200)batches.push(res.added.slice(i,i+200));
      var p=res.cats.length?rest('POST','/rest/v1/categories?on_conflict=name',res.cats.map(function(n){return {name:n,deleted_at:null}}),'resolution=merge-duplicates,return=minimal'):Promise.resolve();
      return batches.reduce(function(q,b){return q.then(function(){return rest('POST','/rest/v1/items?on_conflict=id',b.map(function(i){return itemRow(i)}),'resolution=merge-duplicates,return=minimal')})},p).then(function(){
        db.items=db.items.concat(res.added);res.cats.forEach(function(c){db.categories.push(c)});render();
        var box=$('#itemRes');
        if(box)box.innerHTML='<b class="good-text">'+esc(t('Added'))+': '+res.added.length+'</b>'+(res.skipped.length?'<br><b>'+esc(t('Skipped'))+': '+res.skipped.length+'</b><br>'+res.skipped.slice(0,20).map(esc).join('<br>')+(res.skipped.length>20?'<br>\u2026':''):'');
        toast(t('Added')+': '+res.added.length);
      }).catch(fail);
    });
  };
}

/* Bin: everything deleted stays here for 30 days and can be restored */
var binF='all';
function fmtDay(iso){var d=new Date(iso),p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function binTable(e){return e.type==='item'?'items':e.type==='client'?'clients':'categories'}
function binCol(e){return e.type==='category'?'name':'id'}
function viewBin(box){
  var live=db.bin.filter(function(e){return binDays(e)>0});
  var kinds=[['all','All'],['item','Items'],['client','Customers'],['category','Categories']];
  var cnt=function(k){return k==='all'?live.length:live.filter(function(e){return e.type===k}).length};
  var list=live.filter(function(e){return binF==='all'||e.type===binF}).sort(function(a,b){return a.at<b.at?1:-1});
  var typeName=function(e){return e.type==='item'?t('Item'):e.type==='client'?t('Customer'):t('Category')};
  var label=function(e){return e.type==='category'?tc(e.name):nm(e.data)};
  box.innerHTML='<div class="panel stack"><h2>'+esc(t('Bin'))+'</h2><p class="muted">'+esc(t('Deleted items, customers and categories stay here for 30 days. You can restore them until then. After 30 days they are deleted for good.'))+'</p><p class="note">'+esc(t('Bills are never deleted. Use Cancel bill to cancel one.'))+'</p>'+
  '<div class="chips">'+kinds.map(function(k){return '<button class="chip'+(binF===k[0]?' on':'')+'" data-bf="'+k[0]+'">'+esc(t(k[1]))+' ('+cnt(k[0])+')</button>'}).join('')+'</div>'+
  (list.length?'<div class="tablewrap"><table><thead><tr><th>'+esc(t('Type'))+'</th><th>'+esc(t('Name'))+'</th><th>'+esc(t('Deleted on'))+'</th><th class="num">'+esc(t('Days left'))+'</th><th></th></tr></thead><tbody>'+
    list.map(function(e,i){return '<tr><td>'+esc(typeName(e))+'</td><td><b>'+esc(label(e))+'</b>'+(e.type==='client'&&e.data.phone?'<div class="note">'+esc(e.data.phone)+'</div>':'')+'</td><td>'+fmtDay(e.at)+'</td><td class="num">'+binDays(e)+'</td><td class="row"><button class="small primary" data-rs="'+i+'">'+esc(t('Restore'))+'</button><button class="small danger" data-fd="'+i+'">'+esc(t('Delete forever'))+'</button></td></tr>'}).join('')+'</tbody></table></div>'
   :'<p class="muted">'+esc(t('The Bin is empty.'))+'</p>')+'</div>';
  box.onclick=function(ev){
    var bf=ev.target.closest('[data-bf]'),rs=ev.target.closest('[data-rs]'),fd=ev.target.closest('[data-fd]');
    if(bf){binF=bf.dataset.bf;render();return}
    if(rs){
      var e=list[+rs.dataset.rs];
      guard(rs,function(){return binSet(binTable(e),binCol(e),e.id,null).then(function(){
        db.bin=db.bin.filter(function(x){return x!==e});
        if(e.type==='item'){db.items.push(e.data);db.items.sort(function(a,b){return a.name<b.name?-1:1})}
        else if(e.type==='client'){db.clients.push(e.data);db.clients.sort(function(a,b){return a.name<b.name?-1:1})}
        else db.categories.push(e.id);
        toast(t('Restored')+': '+label(e));render();
      }).catch(fail)});
    }
    if(fd){
      var f=list[+fd.dataset.fd];
      twice(fd,t('Sure?'),function(){del(binTable(f),binCol(f),f.id).then(function(){db.bin=db.bin.filter(function(x){return x!==f});toast(t('Deleted for good'));render()},fail)});
    }
  };
}

/* Label every table cell with its column name so phones can show each row as a card */
function labelTables(){
  document.querySelectorAll('table:not([data-lbl])').forEach(function(tb){
    tb.setAttribute('data-lbl','1');
    var hs=[].map.call(tb.querySelectorAll('thead th'),function(h){return h.textContent.trim()});
    tb.querySelectorAll('tbody tr').forEach(function(tr){[].forEach.call(tr.children,function(td,i){td.setAttribute('data-label',hs[i]||'')})});
  });
}
new MutationObserver(labelTables).observe(document.body,{childList:true,subtree:true});
if(auth)startApp();else showLogin();
})();
