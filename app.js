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
'New bill':'नया बिल','Bill history':'बिल इतिहास','Products':'सामान','Customers':'ग्राहक','Reports':'रिपोर्ट','Backup':'बैकअप',
'Example data loaded.':'नमूना डेटा लोड है।',
'The products and customers below are samples. Edit them in Products and Customers, or clear all examples in Backup.':'नीचे दिए सामान और ग्राहक नमूने हैं। इन्हें सामान और ग्राहक टैब में बदलें, या बैकअप टैब से सभी नमूने हटाएँ।',
'Search products by name':'नाम से सामान खोजें','All':'सभी','out of stock':'स्टॉक खत्म','left':'बचे',
'No products match. Add products in the Products tab.':'कोई सामान नहीं मिला। सामान टैब में सामान जोड़ें।',
'Current bill':'वर्तमान बिल','Customer':'ग्राहक','Walk-in customer':'सामान्य ग्राहक','+ New customer…':'+ नया ग्राहक…',
'Name':'नाम','Customer name':'ग्राहक का नाम','Phone':'फ़ोन','Phone number':'फ़ोन नंबर',
'Decrease':'घटाएँ','Increase':'बढ़ाएँ','Quantity':'मात्रा','Remove':'हटाएँ',
'Tap an product to add it to the bill.':'बिल में जोड़ने के लिए सामान पर टैप करें।',
'Discount':'छूट','Flat ₹':'सीधी ₹','Percent %':'प्रतिशत %','Amount':'राशि','Payment':'भुगतान',
'cash':'नकद','UPI':'UPI','card':'कार्ड','other':'अन्य','Notes':'टिप्पणी','Optional':'वैकल्पिक',
'Who is this bill for?':'यह बिल किसके लिए है?','Search customer by name or phone':'नाम या फ़ोन से ग्राहक खोजें','No customers match.':'कोई ग्राहक नहीं मिला।',
'+ New customer':'+ नया ग्राहक','Continue':'आगे बढ़ें','Cancel':'रद्द करें','Bill for':'बिल किसका','Change':'बदलें','More options':'और विकल्प','Fewer options':'कम विकल्प','Add GST':'जीएसटी जोड़ें',
'GST is added at each product\'s rate.':'हर सामान की अपनी दर से जीएसटी जुड़ेगा।',
'Pending':'बकाया','Paid':'जमा','Custom date':'अपनी तारीख','Quantity sold':'बिकी मात्रा','Pending today':'आज का बकाया','Yesterday':'कल','Last 7 days':'पिछले 7 दिन','This month':'इस महीने','All time':'सारा समय','All customers':'सभी ग्राहक','All payment modes':'सभी भुगतान तरीके','Min total':'कम से कम कुल','Max total':'ज़्यादा से ज़्यादा कुल','Sort by':'क्रम','Newest first':'नया पहले','Oldest first':'पुराना पहले',
'Total: high to low':'कुल: ज़्यादा से कम','Total: low to high':'कुल: कम से ज़्यादा','Due: high to low':'बाकी: ज़्यादा से कम','Due: low to high':'बाकी: कम से ज़्यादा','Paid: high to low':'जमा: ज़्यादा से कम','Paid: low to high':'जमा: कम से ज़्यादा','Customer A to Z':'ग्राहक A से Z','Customer Z to A':'ग्राहक Z से A','Bill number: low to high':'बिल नंबर: कम से ज़्यादा','Bill number: high to low':'बिल नंबर: ज़्यादा से कम','Bin':'बिन','Moved to Bin':'बिन में डाला गया','Restored':'वापस आ गया','Delete forever':'हमेशा के लिए हटाएँ','Deleted on':'हटाने की तारीख','Days left':'बचे दिन','Type':'प्रकार','Deleted for good':'हमेशा के लिए हटा दिया','Delete customer':'ग्राहक हटाएँ',
'Deleted products, customers, categories and bills stay here for 30 days. You can restore them until then. After 30 days they are deleted for good.':'हटाए गए सामान, ग्राहक और श्रेणियाँ यहाँ 30 दिन रहते हैं। तब तक आप उन्हें वापस ला सकते हैं। 30 दिन बाद वे हमेशा के लिए हट जाते हैं।','Bills are never deleted. Use Cancel bill to cancel one.':'बिल कभी नहीं हटाए जाते। बिल रद्द करने के लिए "बिल रद्द करें" दबाएँ।','The Bin is empty.':'बिन खाली है।',
'This customer still owes':'इस ग्राहक का बकाया है','Collect the payment first.':'पहले भुगतान ले लें।','Please check the bill. It is saved only when you press Confirm & save.':'कृपया बिल जाँच लें। "पक्का करें और सहेजें" दबाने पर ही यह सहेजा जाएगा।','edited':'बदला हुआ','By invoice':'बिल-वार','By date':'तारीख-वार','Time':'समय','Pending amount':'बकाया रकम','Total received':'कुल प्राप्त','No payments found.':'कोई भुगतान नहीं मिला।','Share PDF':'PDF शेयर करें','Download PDF':'PDF डाउनलोड करें','PDF downloaded. Attach it in WhatsApp.':'PDF डाउनलोड हो गया। इसे WhatsApp में जोड़ें।','PDF could not be created':'PDF नहीं बन सका',
'Review bill':'बिल जाँचें','Please check the bill before saving.':'सहेजने से पहले बिल जाँच लें।','Back':'वापस','Confirm & save':'पक्का करें और सहेजें',
'Import products from Excel':'Excel से सामान जोड़ें','Save your Excel sheet as CSV using the columns in the sample. Name and one price are needed. Then choose the file here.':'अपनी Excel शीट को नमूने के कॉलम के साथ CSV के रूप में सहेजें। नाम और एक कीमत ज़रूरी हैं। फिर फ़ाइल यहाँ चुनें।',
'Import products':'सामान जोड़ें','no price':'कीमत नहीं है','product already exists':'सामान पहले से है','Manual unit needs the unit name and pieces':'मैनुअल इकाई के लिए इकाई का नाम और पीस चाहिए','Manual (own unit)':'मैनुअल (अपनी इकाई)','Unit name':'इकाई का नाम','Pieces in one unit':'एक इकाई में पीस','Price per unit (\u20B9)':'प्रति इकाई कीमत (\u20B9)','e.g. Set':'जैसे सेट',
'Enter the unit name and how many pieces it holds':'इकाई का नाम और उसमें कितने पीस हैं, लिखें','Only the unit name is needed. Pieces and price are optional. Example: Set, 6 pieces, \u20B9300 shows as "2 Set (12 pcs)" on a bill.':'सिर्फ़ इकाई का नाम ज़रूरी है। पीस और कीमत वैकल्पिक हैं। उदाहरण: सेट, 6 पीस, \u20B9300 बिल में "2 सेट (12 पीस)" दिखेगा।','Enter the unit name':'इकाई का नाम लिखें','Manual unit needs the unit name':'मैनुअल इकाई के लिए इकाई का नाम चाहिए','Import customers from Excel':'Excel से ग्राहक जोड़ें','Save your Excel sheet as CSV with the columns Name, WhatsApp Number, Other Numbers (optional) and Address. Put several numbers in one cell with commas. Numbers under WhatsApp Number are marked WA and numbers under Other Numbers are marked Mob. The first WhatsApp number is the main one.':'अपनी Excel शीट को CSV में सहेजें, कॉलम: नाम, WhatsApp नंबर, अन्य नंबर (वैकल्पिक) और पता। एक खाने में कई नंबर कॉमा से अलग लिखें। WhatsApp नंबर वाले नंबर WA और अन्य नंबर वाले Mob बनते हैं। पहला WhatsApp नंबर मुख्य होता है।',
'Download sample CSV':'नमूना CSV डाउनलोड करें','Import customers':'ग्राहक जोड़ें','Or paste the rows here':'या पंक्तियाँ यहाँ पेस्ट करें','Row':'पंक्ति','no name':'नाम नहीं है','mobile number must be 10 digits':'मोबाइल नंबर 10 अंकों का होना चाहिए','mobile number already exists':'मोबाइल नंबर पहले से है',
'Choose a CSV file or paste the rows first':'पहले CSV फ़ाइल चुनें या पंक्तियाँ पेस्ट करें','Added':'जोड़े गए','Skipped':'छोड़े गए','Switch to light mode':'लाइट मोड चालू करें','Switch to dark mode':'डार्क मोड चालू करें','Sign in':'साइन इन','Sign out':'साइन आउट','Email':'ईमेल','Password':'पासवर्ड','Wrong email or password':'ईमेल या पासवर्ड गलत है','Could not connect. Check your internet.':'कनेक्ट नहीं हो सका। इंटरनेट जाँचें।',
'Only people added by the shop owner can sign in.':'सिर्फ़ दुकान मालिक द्वारा जोड़े गए लोग ही साइन इन कर सकते हैं।','Loading\u2026':'लोड हो रहा है\u2026','Try again':'फिर कोशिश करें','Could not save. Check your internet and try again.':'सहेजा नहीं जा सका। इंटरनेट जाँचकर फिर कोशिश करें।',
'This number is already used by another customer':'यह नंबर किसी और ग्राहक का है','Data found on this phone.':'इस फ़ोन पर डेटा मिला।','Import it into the cloud database once, so every phone can see it.':'इसे एक बार क्लाउड डेटाबेस में जोड़ें, ताकि हर फ़ोन पर दिखे।',
'Import into cloud':'क्लाउड में जोड़ें','Imported':'जोड़ा गया','Add this backup to the database?':'यह बैकअप डेटाबेस में जोड़ें?','Refresh data':'डेटा ताज़ा करें','Data refreshed':'डेटा ताज़ा हुआ',
'Restoring adds the backup to the database. Products, customers and bills that already exist are skipped.':'बैकअप वापस लाने पर वह डेटाबेस में जुड़ता है। जो सामान, ग्राहक और बिल पहले से हैं उन्हें छोड़ दिया जाता है।',
'Your data is saved in the cloud database. Everyone you add as a user can sign in and see it. The backup contains customer phone numbers, so keep it private.':'आपका डेटा क्लाउड डेटाबेस में सहेजा जाता है। जिन्हें आप जोड़ेंगे वे साइन इन करके इसे देख सकेंगे। बैकअप में ग्राहकों के फ़ोन नंबर हैं, इसे निजी रखें।',
'Pick a saved backup file, or paste the backup text below. The backup is added to the database.':'सहेजी हुई बैकअप फ़ाइल चुनें, या नीचे बैकअप टेक्स्ट पेस्ट करें। बैकअप डेटाबेस में जुड़ जाएगा।','View bill':'बिल देखें','Enter amount':'राशि लिखें','Amount received now (\u20B9)':'अभी प्राप्त राशि (\u20B9)','Enter the amount received first.':'पहले प्राप्त राशि लिखें।','More than the balance due':'बाकी रकम से ज़्यादा',
'If the customer will pay the rest later, leave it. The balance stays in Pending until you record the payment.':'अगर ग्राहक बाकी रकम बाद में देगा तो कुछ न करें। भुगतान दर्ज करने तक यह बकाया में रहेगा।','10-digit number':'10 अंक का नंबर','Phone number must be 10 digits':'फ़ोन नंबर 10 अंकों का होना चाहिए','This number already belongs to':'यह नंबर पहले से इनका है','Skin Care':'त्वचा की देखभाल','Hair Accessories':'हेयर एक्सेसरीज़','Jewellery':'ज्वैलरी','Bindi & Sindoor':'बिंदी और सिंदूर','Mehndi':'मेहंदी','Perfume':'परफ्यूम','Other':'अन्य',
'In stock':'स्टॉक में','Low stock':'कम स्टॉक','Out of stock':'स्टॉक खत्म','Categories':'श्रेणियाँ','Add category':'श्रेणी जोड़ें','New category name':'नई श्रेणी का नाम','Choose a category':'श्रेणी चुनें',
'+ Add new category\u2026':'+ नई श्रेणी जोड़ें\u2026','Category added':'श्रेणी जुड़ गई','No products in this view.':'इस फ़िल्टर में कोई सामान नहीं।','Only':'सिर्फ़','in stock':'स्टॉक में',
'Balance after this payment':'इस भुगतान के बाद बाकी','Full balance':'पूरा बाकी','Amount is more than the balance due':'राशि बाकी रकम से ज़्यादा है','Part paid':'आंशिक जमा','Receive':'भुगतान लें',
'The balance will be added to the pending list.':'बाकी रकम बकाया सूची में जुड़ जाएगी।','You can record this balance in several parts. Each part is saved with its date.':'यह बाकी रकम कई बार में दर्ज कर सकते हैं। हर किस्त तारीख के साथ सहेजी जाती है।','pc':'पीस','pcs':'पीस','dozen':'दर्जन','Piece':'पीस','Dozen (12 pcs)':'दर्जन (12 पीस)','Unit':'इकाई',
'Price per piece (\u20B9)':'कीमत प्रति पीस (\u20B9)','Price per dozen (\u20B9)':'कीमत प्रति दर्जन (\u20B9)','Sold by default in':'आमतौर पर बिकता है','Stock (pieces)':'स्टॉक (पीस)','Pieces sold':'बिके पीस',
'1 dozen = 12 pieces. Fill one price and the other is worked out. Fill both to set a special dozen price.':'1 दर्जन = 12 पीस। एक कीमत भरें, दूसरी अपने आप निकल जाएगी। दर्जन का अलग भाव रखना हो तो दोनों भरें।','Paid':'जमा','Paid now':'अभी जमा','Balance left':'बाकी रकम','Full':'पूरा','Balance due':'बाकी','Due':'बाकी','Unpaid':'बाकी','Payments':'भुगतान विवरण','Amount received':'प्राप्त राशि',
'Record payment':'भुगतान दर्ज करें','Receive payment':'भुगतान लें','Applied to the oldest unpaid bills first.':'सबसे पुराने बकाया बिलों में पहले जुड़ेगा।','Account':'खाता','Total pending':'कुल बकाया',
'Customers with pending':'बकाया वाले ग्राहक','Pending bills':'बकाया बिल','Invoice':'बिल नंबर','Oldest':'सबसे पुराना','Pending invoices':'बकाया बिल सूची','Pending by customer':'ग्राहक-वार बकाया',
'No pending amounts. Every bill is fully paid.':'कोई बकाया नहीं। सभी बिल पूरे चुकाए गए हैं।','Choose a customer to keep a pending amount':'बकाया रखने के लिए ग्राहक चुनें',
'Enter a valid amount':'सही राशि लिखें','Payment recorded':'भुगतान दर्ज हुआ','Collected':'वसूली',
'Cosmetics':'कॉस्मेटिक्स','Bangles':'चूड़ियाँ','Name (English)':'नाम (अंग्रेज़ी)','Name (Hindi)':'नाम (हिन्दी)','Enter the product name':'सामान का नाम लिखें',
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
'Product List':'सामान सूची','Product':'सामान','Category':'श्रेणी','Price':'कीमत','Stock':'स्टॉक','Edit':'बदलें','Delete':'हटाएँ',
'No products yet. Add the first one with the + Add product button.':'अभी कोई सामान नहीं है। फ़ॉर्म से पहला सामान जोड़ें।',
'Add product':'सामान जोड़ें','e.g. Eyeliner':'जैसे आईलाइनर','Cosmetics, Bangles…':'कॉस्मेटिक्स, चूड़ियाँ…',
'Price (₹)':'कीमत (₹)','GST rate %':'जीएसटी दर %','HSN code':'HSN कोड','Cancel edit':'बदलाव रद्द करें','Save changes':'बदलाव सहेजें','Edit product':'सामान बदलें',
'Changing a price here never changes old bills. They keep the price they were billed at.':'यहाँ कीमत बदलने से पुराने बिल नहीं बदलते। वे उसी कीमत पर रहते हैं जिस पर बने थे।',
'Enter a valid price':'सही कीमत लिखें','Product updated':'सामान अपडेट हुआ','Product added':'सामान जुड़ गया','Sure?':'पक्का?','Product deleted':'सामान हटाया गया',
'Bills':'बिल','Spent':'खर्च','Address':'पता','Add customer':'ग्राहक जोड़ें','More':'ज़्यादा','Downloaded':'डाउनलोड हो गया','Sold in last 30 days':'पिछले 30 दिन में बिका','Low at or below':'कम स्टॉक सीमा','Type the quantity for every product':'हर सामान की मात्रा लिखें','Show rate per piece':'बिल पर दर प्रति पीस दिखाएँ','Show rate per piece on the bill (default is per dozen)':'बिल पर दर प्रति पीस दिखाएँ (सामान्य: प्रति दर्जन)','Rate on bill':'बिल पर दर','Per dozen':'प्रति दर्जन','Per piece':'प्रति पीस','doz':'दर्जन','SQL query that will run':'चलने वाली SQL क्वेरी','Nothing to add':'जोड़ने के लिए कुछ नहीं','Download sample Excel':'नमूना Excel डाउनलोड करें','Could not read that Excel file. Save it as CSV and try again.':'यह Excel फ़ाइल पढ़ी नहीं जा सकी। इसे CSV में सहेजकर फिर कोशिश करें।','Details':'विवरण','What was it for? (optional)':'यह किसलिए था? (वैकल्पिक)','Expenses':'खर्चे','Expense':'खर्चा','Add expense':'खर्चा जोड़ें','Edit expense':'खर्चा बदलें','Expense added':'खर्चा जुड़ गया','Expense updated':'खर्चा अपडेट हुआ','Total expenses':'कुल खर्चे','Biggest category':'सबसे बड़ी श्रेणी','By category':'श्रेणी-वार','Entries':'प्रविष्टियाँ','Final Sales':'कुल बिक्री (खर्चे घटाकर)','Paid by':'भुगतान माध्यम','Note':'नोट','Save':'सहेजें','Enter a valid amount':'सही रकम लिखें','Choose the date':'तारीख चुनें','No expenses in this period. Add one with the + Add expense button.':'इस अवधि में कोई खर्चा नहीं। + खर्चा जोड़ें दबाकर जोड़ें।','Rent':'किराया','Salary':'वेतन','Electricity':'बिजली','Transport':'आना-जाना','Stock purchase':'माल की ख़रीद','Packing':'पैकिंग','Repair':'मरम्मत','Tea & food':'चाय-खाना','Other':'अन्य','Select all':'सभी चुनें','selected':'चुने गए','Restore selected':'चुने हुए वापस लाएँ','Delete selected':'चुने हुए हटाएँ','Select':'चुनें','Collected by payment mode':'भुगतान माध्यम से प्राप्त','No payments in this period.':'इस अवधि में कोई भुगतान नहीं।','in this period':'इस अवधि में','Reports':'रिपोर्ट','Received':'प्राप्त','Copy bill':'बिल की कॉपी','Copying bill':'बिल की कॉपी बन रही है','Choose the customer for the new bill. You can add or remove products next.':'नए बिल के लिए ग्राहक चुनें। फिर सामान जोड़ या हटा सकते हैं।','Delete invoice':'बिल हटाएँ','Tap again to delete':'हटाने के लिए फिर दबाएँ','deleted':'हटाया गया','Delete moves the invoice to the Bin for 30 days. Stock is put back. You can restore it from the Bin.':'हटाने पर बिल 30 दिन के लिए बिन में जाता है। स्टॉक वापस जुड़ जाता है। बिन से इसे वापस ला सकते हैं।','With GST':'GST के साथ','Some products have no GST rate set. Add it in Products.':'कुछ सामान पर GST दर नहीं है। सामान में जोड़ें।','Stock unit':'स्टॉक इकाई','Enter a valid number':'सही संख्या लिखें','Leave empty for 12 x piece price':'खाली छोड़ें तो 12 x पीस दाम','Also sell in dozen':'दर्जन में भी बेचें','Save this unit for other products':'यह इकाई दूसरे सामान के लिए सहेजें','Saved units':'सहेजी इकाइयाँ','All categories':'सभी श्रेणियाँ','All units':'सभी इकाई','Unit':'इकाई','Stock':'स्टॉक','View more':'और देखें','View less':'कम देखें','Add products manually':'सामान हाथ से जोड़ें','Add customers manually':'ग्राहक हाथ से जोड़ें','Less':'कम','WhatsApp number':'WhatsApp नंबर','Created':'बनाया गया','Add another number':'दूसरा नंबर जोड़ें','Remove':'हटाएँ','Download Excel':'Excel डाउनलोड करें','Other numbers':'अन्य नंबर','Customers list downloaded':'ग्राहक सूची डाउनलोड हो गई','Mobile':'मोबाइल','Edit customer':'ग्राहक बदलें','Customer updated':'ग्राहक अपडेट हुआ','Customer added':'ग्राहक जुड़ गया',
'No customers yet. They are added when you bill a new customer.':'अभी कोई ग्राहक नहीं है। नए ग्राहक का बिल बनाने पर वे जुड़ जाते हैं।',
'Past bills keep the name they were saved with, even if you edit the customer later.':'ग्राहक को बाद में बदलने पर भी पुराने बिल में वही नाम रहता है जिससे वे सहेजे गए थे।',
'Today':'आज','Sales':'बिक्री','Daily sales':'दैनिक बिक्री','Monthly sales':'मासिक बिक्री','Month':'महीना','Product-wise sales':'सामान-वार बिक्री','Qty sold':'बिकी मात्रा',
'At closing, check the cash and UPI figures against your drawer and your UPI app.':'दुकान बंद करते समय नकद और UPI के आँकड़े अपने गल्ले और UPI ऐप से मिलाएँ।',
'Nothing to show yet. Save a bill and the figures appear here.':'अभी दिखाने को कुछ नहीं है। बिल सहेजें, आँकड़े यहाँ दिखेंगे।',
'Cancelled bills are left out of every figure.':'रद्द बिल किसी भी आँकड़े में शामिल नहीं हैं।',
'Back up':'बैकअप लें','Copy all products, customers and bills as one block of text. Paste it into a note or a file and keep it in Google Drive or on a computer. Do this at least once a week.':'सारा सामान, ग्राहक और बिल एक टेक्स्ट के रूप में कॉपी करें। इसे नोट या फ़ाइल में पेस्ट करके Google Drive या कंप्यूटर पर रखें। हफ़्ते में कम से कम एक बार करें।',
'Copy backup':'बैकअप कॉपी करें','Show backup text':'बैकअप टेक्स्ट दिखाएँ','Backup copied':'बैकअप कॉपी हुआ',
'Your data is saved in this browser only. Clearing browser data or resetting the phone erases it. The backup contains customer phone numbers, so keep it private.':'आपका डेटा सिर्फ़ इसी ब्राउज़र में सहेजा गया है। ब्राउज़र डेटा साफ़ करने या फ़ोन रीसेट करने पर यह मिट जाएगा। बैकअप में ग्राहकों के फ़ोन नंबर हैं, इसे निजी रखें।',
'Restore':'वापस लाएँ','Pick a saved backup file, or paste the backup text below. This replaces everything now in the app.':'सहेजी हुई बैकअप फ़ाइल चुनें, या नीचे बैकअप टेक्स्ट पेस्ट करें। इससे ऐप का मौजूदा सारा डेटा बदल जाएगा।',
'Paste backup text here':'बैकअप टेक्स्ट यहाँ पेस्ट करें','Restore from text':'टेक्स्ट से वापस लाएँ','Replace all data?':'सारा डेटा बदलें?',
'Backup restored':'बैकअप वापस आ गया','That text is not a valid backup':'यह टेक्स्ट सही बैकअप नहीं है',
'Clear example data':'नमूना डेटा हटाएँ','Remove sample data?':'नमूना डेटा हटाएँ?','Sample data removed':'नमूना डेटा हटा दिया',
'Clear example data removes the sample products and customers and keeps your own bills.':'नमूना डेटा हटाने से नमूना सामान और ग्राहक हट जाते हैं, आपके अपने बिल बने रहते हैं।'
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
/* Names: the English name is always the main name. Hindi name is used in Hindi mode.
   If one of them is missing it is worked out from the other. */
var DEVA=/[ऀ-ॿ]/;
var DV={c:{'क':'k','ख':'kh','ग':'g','घ':'gh','ङ':'n','च':'ch','छ':'chh','ज':'j','झ':'jh','ञ':'n','ट':'t','ठ':'th','ड':'d','ढ':'dh','ण':'n','त':'t','थ':'th','द':'d','ध':'dh','न':'n','प':'p','फ':'ph','ब':'b','भ':'bh','म':'m','य':'y','र':'r','ल':'l','ळ':'l','व':'v','श':'sh','ष':'sh','स':'s','ह':'h'},
  nk:{'ड':'r','ढ':'rh','फ':'f','ज':'z','क':'q','ख':'kh','ग':'g'},
  iv:{'अ':'a','आ':'a','इ':'i','ई':'i','उ':'u','ऊ':'u','ऋ':'ri','ए':'e','ऐ':'ai','ओ':'o','औ':'au','ऑ':'o'},
  m:{'ा':'a','ि':'i','ी':'i','ु':'u','ू':'u','ृ':'ri','े':'e','ै':'ai','ो':'o','ौ':'au','ॉ':'o','ॅ':'e'}};
function devaWord(w){
  var u=[],i=0,ch,c;
  while(i<w.length){
    ch=w[i];
    if(DV.c[ch]){
      c=DV.c[ch];i++;
      if(w[i]==='़'){c=DV.nk[ch]||c;i++}
      if(w[i]==='्'){u.push({c:c,v:''});i++}
      else if(DV.m[w[i]]!=null){u.push({c:c,v:DV.m[w[i]]});i++}
      else u.push({c:c,v:null});
    }else if(DV.iv[ch]!=null){u.push({c:'',v:DV.iv[ch]});i++}
    else if(ch==='ं'||ch==='ँ'){u.push({c:'n',v:''});i++}
    else if(ch==='ः'){u.push({c:'h',v:''});i++}
    else i++;
  }
  var last=u.length-1,out='',k,j;
  var voiced=function(x,idx){return x.v!==''&&!(x.v===null&&idx===last)};
  for(k=0;k<u.length;k++){
    var x=u[k],v=x.v;
    if(v===null){
      if(k===last)v='';
      else{
        j=k+1;while(j<u.length&&u[j].v==='')j++;
        var prevV=k>0&&u[k-1].v!==''&&u[k-1].c!==undefined&&(u[k-1].v!==null||true);
        v=(k>0&&prevV&&j<u.length&&voiced(u[j],j))?'':'a';
      }
    }
    out+=x.c+v;
  }
  return out;
}
function enOf(hi){
  hi=String(hi||'').trim();if(!hi)return '';
  var key=Object.keys(HN).find(function(k){return HN[k]===hi});if(key)return key;
  if(!enOf.rev){enOf.rev={};Object.keys(HW).forEach(function(k){if(!enOf.rev[HW[k]])enOf.rev[HW[k]]=k});enOf.rev['चूड़ी']='churi';enOf.rev['चूड़ियाँ']='churiyan';enOf.rev['चूड़ियां']='churiyan'}
  var out=hi.replace(/[ऀ-ॿ]+/g,function(w){return enOf.rev[w]||devaWord(w)});
  return titleCase(out);
}
function hiOf(en){en=String(en||'').trim();return en?(HN[en]||tr(en)):''}
/* fill the missing one of English / Hindi name; returns {name,nameHi} */
function bothNames(en,hi){
  en=String(en||'').trim();hi=String(hi||'').trim();
  if(en&&DEVA.test(en)&&!hi){hi=en;en=''}
  if(!en&&hi)en=DEVA.test(hi)?enOf(hi):hi;
  if(en&&!hi)hi=hiOf(en);
  return {name:en,nameHi:hi};
}
function hn(o,k,h){k=k||'name';h=h||'nameHi';return (o[h]&&DEVA.test(o[h]))?o[h]:(HN[o[k]]||tr(o[k]))}
function nm(o,k,h){k=k||'name';return lang==='hi'?hn(o,k,h):o[k]}
function tc(c){return lang==='hi'?(HI[c]||tr(c)):c}

/* ---------- data: Supabase cloud database (plain fetch, no library) ---------- */
var DEFAULT_CATS=['Cosmetics','Bangles','Skin Care','Hair Accessories','Jewellery','Bindi & Sindoor','Mehndi','Perfume','Other'];
var db={items:[],clients:[],bills:[],categories:[],units:[],expenses:[],bin:[]};
var legacy=null;
function migrate(){
  db.items.forEach(function(i){if(!i.nameHi&&HN[i.name])i.nameHi=HN[i.name]});
  db.clients.forEach(function(c){if(!c.nameHi&&HN[c.name])c.nameHi=HN[c.name]});
  /* repair: a Hindi text saved in the English name box becomes the Hindi name, and the English name is worked out */
  var fx={items:[],clients:[]};
  var fix=function(o,list,isClient){
    if(o.nameHi&&!DEVA.test(o.nameHi)&&!DEVA.test(o.name||'')){o.nameHi=hiOf(o.name);list.push(o);return}
    if(!DEVA.test(o.name||''))return;
    var en=(o.nameHi&&!DEVA.test(o.nameHi))?o.nameHi:'',b=bothNames(en,o.name);
    o.name=isClient?titleCase(b.name):b.name;o.nameHi=b.nameHi;list.push(o);
  };
  db.items.forEach(function(i){fix(i,fx.items,false)});
  db.clients.forEach(function(c){fix(c,fx.clients,true)});
  if(fx.items.length)rest('POST','/rest/v1/items?on_conflict=id',fx.items.map(function(i){return itemRow(i,true)}),'resolution=merge-duplicates,return=minimal').catch(function(){});
  if(fx.clients.length)rest('POST','/rest/v1/clients?on_conflict=id',fx.clients.map(clientRow),'resolution=merge-duplicates,return=minimal').catch(function(){});
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
function rowExpense(r){return {id:r.id,date:r.date,amount:+r.amount,note:r.note||''}}
function expRow(e){return {id:e.id,date:e.date,amount:e.amount,note:e.note||''}}
function rowItem(r){return {id:r.id,name:r.name,nameHi:r.name_hi||'',category:r.category||'',price:+r.price,dozenPrice:r.dozen_price==null?'':+r.dozen_price,unit:r.unit||'pc',unitName:r.unit_name||'',unitQty:r.unit_qty||1,unitPrice:r.unit_price==null?'':+r.unit_price,gst:+r.gst||0,hsn:r.hsn||'',stock:r.stock==null?'':r.stock,allowDozen:!!r.allow_dozen,ratePc:!!r.rate_pc,stockUnit:r.stock_unit||'',active:r.active!==false}}
function itemRow(i,skipStock){
  var o={id:i.id,name:i.name,name_hi:i.nameHi||'',category:i.category||'',price:i.price,dozen_price:(i.dozenPrice===''||i.dozenPrice==null)?null:i.dozenPrice,unit:i.unit||'pc',unit_name:i.unitName||'',unit_qty:i.unitQty||1,unit_price:(i.unitPrice===''||i.unitPrice==null)?null:i.unitPrice,gst:i.gst||0,hsn:i.hsn||'',allow_dozen:!!i.allowDozen,rate_pc:!!i.ratePc,stock_unit:i.stockUnit||'',active:i.active!==false};
  if(!skipStock)o.stock=(i.stock===''||i.stock==null)?null:i.stock;
  return o;
}
function rowClient(r){return {id:r.id,name:titleCase(r.name),nameHi:r.name_hi||'',phone:r.phone||'',phones:Array.isArray(r.phones)?r.phones:[],address:r.address||'',created:(r.created_at||'').slice(0,10)}}
function clientRow(c){return {id:c.id,name:c.name,name_hi:c.nameHi||'',phone:c.phone||'',phones:c.phones||[],address:c.address||''}}
function rowPay(r){return {id:r.id,date:r.date,time:r.time,amount:+r.amount,mode:r.mode}}
function rowBill(r,pays){return {id:r.id,no:r.no,date:r.date,time:r.time,clientId:r.client_id,clientName:r.client_id?titleCase(r.client_name):r.client_name,clientNameHi:r.client_name_hi||'',clientPhone:r.client_phone||'',lines:r.lines||[],subtotal:+r.subtotal,discount:+r.discount,tax:+r.tax,total:+r.total,pay:r.pay,notes:r.notes||'',status:r.status,payments:pays||[]}}
function loadAll(){
  return Promise.all([fetchAll('items','name.asc'),fetchAll('categories','name.asc'),fetchAll('clients','name.asc'),fetchAll('bills','created_at.asc'),fetchAll('payments','created_at.asc'),fetchAll('units','name.asc').catch(function(){return []}),fetchAll('expenses','date.desc').catch(function(){return []})]).then(function(a){
    var pays={};a[4].forEach(function(p){(pays[p.bill_id]=pays[p.bill_id]||[]).push(rowPay(p))});
    db.items=[];db.categories=[];db.clients=[];db.bin=[];db.units=a[5].map(function(r){return {name:r.name,qty:r.qty||1}});db.expenses=[];a[6].forEach(function(r){var o=rowExpense(r);if(r.deleted_at)db.bin.push({type:'expense',id:r.id,name:o.note||'Expense',at:r.deleted_at,data:o});else db.expenses.push(o)});
    a[0].forEach(function(r){var o=rowItem(r);if(r.deleted_at)db.bin.push({type:'item',id:r.id,name:o.name,at:r.deleted_at,data:o});else db.items.push(o)});
    a[1].forEach(function(c){if(c.deleted_at)db.bin.push({type:'category',id:c.name,name:c.name,at:c.deleted_at});else db.categories.push(c.name)});
    a[2].forEach(function(r){var o=rowClient(r);if(r.deleted_at)db.bin.push({type:'client',id:r.id,name:o.name,at:r.deleted_at,data:o});else db.clients.push(o)});
    db.bills=[];a[3].forEach(function(b){var o=rowBill(b,pays[b.id]);if(b.deleted_at)db.bin.push({type:'bill',id:b.id,name:b.no,at:b.deleted_at,data:o});else db.bills.push(o)});
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
  db={items:[],clients:[],bills:[],categories:[],units:[],expenses:[],bin:[]};
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
      legacy=null;return loadAll().then(function(){toast(t('Imported')+': '+r.bills+' '+t('Bills')+', '+r.items+' '+t('Products')+', '+r.clients+' '+t('Customers'));render()});
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
var tabs=[['billing','New bill'],['bills','Bill history'],['payments','Payments'],['expenses','Expenses'],['items','Products'],['clients','Customers'],['reports','Reports'],['bin','Bin'],['backup','Backup']];
function route(){var h=location.hash.replace('#','');if(h==='pending')return 'payments';return tabs.some(function(x){return x[0]===h})?h:'billing'}
function render(){
  if(!auth){showLogin();return}
  var r=route();
  if(r==='bills'&&lastRoute!=='bills'&&!hist.keep)hist=defaultHist();
  if(r==='bills')hist.keep=false;
  if(r==='payments'&&lastRoute!=='payments')payF=defaultPay();
  if(r==='reports'&&lastRoute!=='reports')repF=defaultRep();
  if(r==='expenses'&&lastRoute!=='expenses')expF=defaultExp();
  if(r==='payments'&&location.hash==='#pending'&&lastRoute!=='payments_p'){payF.tab='pending'}
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
  ({billing:viewBilling,bills:viewBills,payments:viewPayments,expenses:viewExpenses,items:viewItems,clients:viewClients,reports:viewReports,bin:viewBin,backup:viewBackup})[r](box);
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
function qHas(i,k){return qKind(i)===k||(k==='doz'&&du(i)!=='custom')}
function qKinds(items){
  var seen={},out=[];items.forEach(function(i){var k=qKind(i);if(!seen[k]){seen[k]=1;out.push(k)}if(du(i)!=='custom'&&!seen.doz){seen.doz=1;out.push('doz')}});
  var rank=function(k){return k==='pc'?0:k==='doz'?1:2};
  return out.sort(function(a,b){return rank(a)-rank(b)||(a<b?-1:1)});
}
function qChipsHtml(items,active,attr){
  var kinds=qKinds(items);if(kinds.length<2)return '';
  return ['All'].concat(kinds).map(function(k){return '<button class="chip'+(k===active?' on':'')+'" '+attr+'="'+esc(k)+'">'+esc(k==='All'?t('All'):qLabel(k))+'</button>'}).join('');
}
function priceEdited(l){var it=itemById(l.id);return !!it&&Math.abs(l.price-unitPrice(it,l.unit||'pc'))>0.004}
function defaultStockUnit(i){var u=du(i);return u==='custom'?i.unitName:'doz'}
function stockFactorOf(i,su){
  if(su==='pc')return 1;if(su==='doz')return 12;
  if(su===i.unitName)return i.unitQty||1;
  var u=db.units.find(function(x){return x.name===su});return u?u.qty:1;
}
function stockText(i){
  var n=+i.stock,su=i.stockUnit||defaultStockUnit(i);if(du(i)==='pc'&&su==='pc')su='doz';var f=stockFactorOf(i,su),pcs=n+' '+t('pc');
  if(su==='pc')return pcs;
  var un=su==='doz'?t('doz'):uLabel(su);
  if(f<=1)return n+' '+esc(un);
  var w=Math.floor(n/f),r=n-w*f;
  if(w<1)return pcs;
  return w+' '+esc(un)+(r?' '+r+' '+t('pc'):'')+'<div class="note">= '+pcs+'</div>';
}
function stockPlain(i){var h=stockText(i);return h.replace(/<div[^>]*>.*?<\/div>/,'')}
function pieceOpt(l){
  var it=itemById(l.id);if((l.unit||'pc')!=='pc'&&it&&du(it)==='custom')return '';
  return '<option value="pc"'+((l.unit||'pc')==='pc'?' selected':'')+'>'+esc(t('Piece'))+'</option>';
}
function dozOpt(l){
  var it=itemById(l.id);if(l.unit!=='doz'&&(!it||du(it)==='custom'))return '';
  return '<option value="doz"'+(l.unit==='doz'?' selected':'')+'>'+esc(t('Dozen (12 pcs)'))+'</option>';
}
function priceCell(i){
  var pcs=i.unitQty>1?' ('+i.unitQty+' '+esc(t('pcs'))+')':'';
  if(du(i)==='custom')return money(customPrice(i))+' / '+esc(uLabel(i.unitName))+pcs;
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
/* rate shown on the bill: per dozen by default, or per piece */
function rateText(l){
  var u=l.unit||'pc',mode=l.showRate||'doz';
  if(u==='custom')return money(l.price)+'/'+unitShort(l);
  if(u==='pc')return mode==='pc'?money(l.price)+'/'+t('pc'):money(r2(l.price*12))+'/'+t('doz');
  return mode==='pc'?money(r2(l.price/12))+'/'+t('pc'):money(l.price)+'/'+t('doz');
}
function unitShort(l){var u=l.unit||'pc';return u==='doz'?t('doz'):u==='custom'?uLabel(l.unitName||'unit'):t('pc')}
/* easy to read for customers: 15 pieces -> "1 doz 3 pc" */
function qtyLabel(l){
  var u=l.unit||'pc',f=l.factor||1,q=l.qty;
  if(u==='pc'){if(q>=12){var w=Math.floor(q/12),r=q-w*12;return w+' '+t('doz')+(r?' '+r+' '+t('pc'):'')}return q+' '+t('pc')}
  if(u==='doz')return q+' '+t('doz');
  return q+' '+uLabel(l.unitName||'unit')+(f>1?' ('+(q*f)+' '+t('pc')+')':'');
}
function clientLabel(){
  var c=cur.clientSel&&cur.clientSel!=='walkin'?clientById(cur.clientSel):null;
  return c?nm(c):nm({name:'Walk-in customer'});
}
function viewBilling(box){
  if(cur.step==='client'){drawClientStep(box);return}
  box.innerHTML='<div class="stack"><div class="panel row" style="justify-content:space-between"><div><span class="muted">'+esc(t('Bill for'))+':</span> <b>'+esc(clientLabel())+'</b></div><button class="small" id="chg">'+esc(t('Change'))+'</button></div>'+
  '<div class="cols"><div class="panel stack"><input id="q" placeholder="'+esc(t('Search products by name'))+'" value="'+esc(query)+'" aria-label="'+esc(t('Search products by name'))+'"><div class="chips" id="cats"></div><div class="chips" id="qcats"></div><div class="grid" id="grid"></div></div>'+
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
  box.innerHTML='<div class="panel stack" style="max-width:640px;margin:0 auto"><h2>'+esc(t('Who is this bill for?'))+'</h2>'+(cur.copyOf?'<div class="banner">'+esc(t('Copying bill'))+' <b>'+esc(cur.copyOf)+'</b> ('+cur.lines.length+' '+esc(t('Products'))+'). '+esc(t('Choose the customer for the new bill. You can add or remove products next.'))+'</div>':'')+
  '<input id="cq" placeholder="'+esc(t('Search customer by name or phone'))+'" value="'+esc(cq)+'" aria-label="'+esc(t('Search customer by name or phone'))+'">'+
  '<div class="stack" id="clist" style="gap:6px"></div><div id="newc"></div></div>';
  $('#cq').addEventListener('input',function(e){cq=e.target.value;drawClist()});
  drawClist();drawNew();
}
function drawClist(){
  var q=cq.trim().toLowerCase();
  var list=db.clients.filter(function(c){return !q||(c.name+' '+hn(c)+' '+c.phone+' '+(c.phones||[]).map(function(x){return x.n}).join(' ')).toLowerCase().indexOf(q)>-1});
  var h=list.map(function(c){return '<button class="tile" data-pick="'+c.id+'"><b>'+esc(nm(c))+'</b>'+(c.phone?'<span>'+esc(c.phone)+'</span>':'')+'</button>'}).join('')+
    '<button class="tile" data-pick="walkin"><b>'+esc(nm({name:'Walk-in customer'}))+'</b></button>';
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
  if(filterQty!=='All'&&!act.some(function(i){return qHas(i,filterQty)}))filterQty='All';
  $('#qcats').innerHTML=qChipsHtml(act,filterQty,'data-qty');
  $('#qcats').onclick=function(e){var b=e.target.closest('[data-qty]');if(b){filterQty=b.dataset.qty;drawGrid()}};
  var q=query.trim().toLowerCase();
  var list=db.items.filter(function(i){return i.active&&(filterCat==='All'||i.category===filterCat)&&(filterQty==='All'||qHas(i,filterQty))&&(!q||(i.name+' '+hn(i)).toLowerCase().indexOf(q)>-1)});
  $('#grid').innerHTML=list.length?list.map(function(i){
    var has=i.stock!==''&&i.stock!=null,out=has&&i.stock<=0;
    return '<button class="tile'+(out?' out':'')+'" data-add="'+i.id+'"><div class="tl"><b>'+esc(nm(i))+'</b><span>'+esc(tc(i.category))+(has?' \u00B7 '+(out?esc(t('out of stock')):stockPlain(i)+' '+esc(t('left'))):'')+'</span></div><span class="price">'+money(unitPrice(i,du(i)))+' / '+esc(unitName(du(i),1,i))+'</span></button>';
  }).join(''):'<p class="muted">'+esc(t('No products match. Add products in the Products tab.'))+'</p>';
  $('#grid').onclick=function(e){var b=e.target.closest('[data-add]');if(b)addLine(b.dataset.add)};
}
function addLine(id){
  var it=itemById(id),l=cur.lines.find(function(x){return x.id===id});
  var u0=du(it);cur.paidStr='';if(l)l.qty++;else cur.lines.push({id:id,name:it.name,nameHi:it.nameHi||HN[it.name]||'',price:unitPrice(it,u0),unit:u0,unitName:u0==='custom'?it.unitName:'',factor:unitFactor(it,u0),gst:it.gst||0,showRate:it.ratePc?'pc':'doz',qty:u0==='pc'?0:1});
  drawBill();
}
function drawBill(){
  var p=$('#billpanel');if(!p)return;
  var c=calc(cur),left=r2(c.total-paidNow(c)),showBreak=c.disc>0||(cur.gstOn&&c.tax>0);
  var lines=cur.lines.length?cur.lines.map(function(l,i){var two=(l.unit||'pc')==='pc'&&!l.unitName&&(l.factor||1)===1,dz=Math.floor(l.qty/12),pz=l.qty-dz*12;return '<div class="line"><div style="min-width:0"><b>'+esc(nm(l))+'</b><div class="note">\u20B9<input class="priceinp" data-price="'+i+'" inputmode="decimal" value="'+l.price+'" aria-label="'+esc(t('Price'))+'"> / '+esc(unitName(l.unit||'pc',1,l))+((l.factor||1)>1?' · '+l.qty+' × '+(l.factor||1)+' = '+(l.qty*(l.factor||1))+' '+esc(t('pcs')):'')+(priceEdited(l)?' <span class="warn">('+esc(t('edited'))+')</span>':'')+(cur.gstOn&&l.gst?' + '+l.gst+'% '+esc(t('GST')):'')+'</div>'+(two?'<label class="ratechk"><input type="checkbox" data-rate="'+i+'"'+(l.showRate==='pc'?' checked':'')+'> '+esc(t('Show rate per piece'))+'</label>':'<select class="unitsel" data-unit="'+i+'" aria-label="'+esc(t('Unit'))+'">'+pieceOpt(l)+dozOpt(l)+customOpt(l)+'</select>')+stockWarn(l)+'</div>'+
    (two?'<div class="qty2"><input data-dz="'+i+'" inputmode="numeric" value="'+(dz||'')+'" aria-label="'+esc(t('doz'))+'"><span class="muted">'+esc(t('doz'))+'</span><input data-pz="'+i+'" inputmode="numeric" value="'+(pz||'')+'" aria-label="'+esc(t('pc'))+'"><span class="muted">'+esc(t('pc'))+'</span></div>':'<div class="qty"><button class="small" data-dec="'+i+'" aria-label="'+esc(t('Decrease'))+'">−</button><input data-qty="'+i+'" inputmode="numeric" value="'+l.qty+'" aria-label="'+esc(t('Quantity'))+'"><button class="small" data-inc="'+i+'" aria-label="'+esc(t('Increase'))+'">+</button></div>')+
    '<div class="num">'+money(l.price*l.qty)+'</div><button class="small" data-rm="'+i+'" aria-label="'+esc(t('Remove'))+'">✕</button></div>'}).join(''):'<p class="muted">'+esc(t('Tap an product to add it to the bill.'))+'</p>';
  var more=cur.more?'<div class="stack" style="border-top:1px solid var(--line);padding-top:12px">'+
    '<div class="row"><label class="grow">'+esc(t('Discount'))+'<select id="dt"><option value="flat"'+(cur.dtype==='flat'?' selected':'')+'>'+esc(t('Flat ₹'))+'</option><option value="pct"'+(cur.dtype==='pct'?' selected':'')+'>'+esc(t('Percent %'))+'</option></select></label>'+
    '<label class="grow">'+esc(t('Amount'))+'<input id="dv" inputmode="decimal" value="'+(cur.dval||'')+'" placeholder="0"></label></div>'+
    '<label>'+esc(t('Notes'))+'<input id="nt" value="'+esc(cur.notes)+'" placeholder="'+esc(t('Optional'))+'"></label></div>':'';
  p.innerHTML='<h2>'+esc(t('Current bill'))+'</h2><div id="lines">'+lines+'</div>'+
  '<div class="totals">'+(showBreak?'<span class="muted">'+esc(t('Subtotal'))+'</span><span class="num">'+money(c.sub)+'</span>'+
    (c.disc?'<span class="muted">'+esc(t('Discount'))+'</span><span class="num">− '+money(c.disc)+'</span>':'')+
    (cur.gstOn&&c.tax?'<span class="muted">'+esc(t('GST'))+'</span><span class="num">+ '+money(c.tax)+'</span>':''):'')+
  '<span class="grand">'+esc(t('Total'))+'</span><span class="grand num">'+money(c.total)+'</span></div>'+
  '<label style="flex-direction:row;align-items:center;gap:8px;color:var(--fg);font-size:15px;font-weight:600"><input type="checkbox" id="gst" style="width:auto"'+(cur.gstOn?' checked':'')+'> '+esc(t('With GST'))+'</label>'+
  (cur.gstOn&&cur.lines.some(function(l){return !l.gst})?'<div class="note warn">'+esc(t('Some products have no GST rate set. Add it in Products.'))+'</div>':'')+
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
    $('#nt').oninput=function(e){cur.notes=e.target.value};
  }
  $('#gst').onchange=function(e){cur.gstOn=e.target.checked;cur.paidStr='';drawBill()};
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
    if(e.target.dataset.rate!=null){cur.lines[+e.target.dataset.rate].showRate=e.target.checked?'pc':'doz';return}
    var dzi=e.target.dataset.dz,pzi=e.target.dataset.pz;
    if(dzi!=null||pzi!=null){
      var ix=+(dzi!=null?dzi:pzi),ln=cur.lines[ix],box=e.target.closest('.line');
      var d1=parseInt(box.querySelector('[data-dz]').value,10)||0,p1=parseInt(box.querySelector('[data-pz]').value,10)||0,tot=Math.max(0,d1)*12+Math.max(0,p1);
      cur.paidStr='';ln.qty=tot;drawBill();return;
    }
    var i=e.target.dataset.qty;if(i!=null){cur.paidStr='';var q=parseInt(e.target.value,10);if(q>0)cur.lines[+i].qty=q;else cur.lines.splice(+i,1);drawBill()}};
  $('#clear').onclick=function(){var s=cur.clientSel;newBill();cur.clientSel=s;cur.step='items';drawBill()};
  $('#save').onclick=reviewBill;
  var cb=$('#cartbar');
  if(cb){
    cb.hidden=!cur.lines.length||!cartVisible;
    cb.innerHTML='<div><div class="note">'+cur.lines.length+' '+esc(t('Products'))+'</div><b style="font-size:18px">'+money(c.total)+'</b></div><button class="primary" id="cartgo">'+esc(t('View bill'))+'</button>';
    $('#cartgo').onclick=function(){$('#billpanel').scrollIntoView({behavior:'smooth',block:'start'})};
  }
}
function makeBill(){
  if(!cur.lines.length)return null;
  var nq=cur.lines.filter(function(l){return !(l.qty>0)});if(nq.length){toast(t('Type the quantity for every product')+': '+nq.map(function(l){return nm(l)}).join(', '));return null}
  var cid=null,cname='Walk-in customer',cphone='';
  if(cur.clientSel&&cur.clientSel!=='walkin'){var c0=clientById(cur.clientSel);if(c0){cid=c0.id;cname=c0.name;cphone=c0.phone}}
  var tt=calc(cur),pd=paidNow(tt);
  if(r2(tt.total-pd)>0&&!cid){toast(t('Choose a customer to keep a pending amount'));return null}
  return {id:uid(),date:today(),time:nowTime(),clientId:cid,clientName:cname,clientNameHi:(cid&&clientById(cid)&&clientById(cid).nameHi)||'',clientPhone:cphone,
    lines:cur.lines.map(function(l){return {itemId:l.id,name:l.name,nameHi:l.nameHi||'',price:l.price,gst:cur.gstOn?l.gst:0,unit:l.unit||'pc',unitName:l.unitName||'',factor:l.factor||1,qty:l.qty,showRate:l.showRate||((itemById(l.id)||{}).ratePc?'pc':'doz'),total:r2(l.price*l.qty)}}),
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
  b.lines.forEach(function(l){out.push(nm(l).slice(0,W));out.push(lr('  '+qtyLabel(l)+' @ '+rateText(l).replace(/^\u20B9/,''),m(l.total)));if(b.tax>0&&l.gst)out.push('    + '+l.gst+'% '+t('GST'))});
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
  (b.status!=='cancelled'?'<button class="danger" id="mk">'+esc(t('Cancel bill'))+'</button>':'')+'<button id="mcopy">'+esc(t('Copy bill'))+'</button><button class="danger" id="mdel">'+esc(t('Delete invoice'))+'</button></div><p class="note">'+esc(t('Delete moves the invoice to the Bin for 30 days. Stock is put back. You can restore it from the Bin.'))+'</p><p class="note">'+esc(t('Send the copied text on WhatsApp, or paste it into a printing app for your thermal printer.'))+'</p></div>';
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
  $('#mcopy').onclick=function(){
    var lines=b.lines.map(function(l){var it=itemById(l.itemId);return {id:l.itemId,name:l.name,nameHi:l.nameHi||'',price:l.price,unit:l.unit||'pc',unitName:l.unitName||'',factor:l.factor||1,gst:it?(it.gst||0):(l.gst||0),qty:l.qty}});
    newBill();cur.lines=lines;cur.gstOn=b.tax>0;if(b.discount>0){cur.dtype='flat';cur.dval=b.discount;cur.more=true}
    cur.copyOf=b.no;cur.step='client';cq='';closeModal();
    if(location.hash==='#billing')render();else location.hash='billing';
  };
  $('#mdel').onclick=function(){var btn=this;twice(btn,t('Tap again to delete'),function(){
    rpc('delete_bill',{p_bill:b.id}).then(function(){
      if(b.status!=='cancelled')b.lines.forEach(function(l){var it=itemById(l.itemId);if(it&&it.stock!==''&&it.stock!=null)it.stock+=Math.round(l.qty*(l.factor||1))});
      db.bills=db.bills.filter(function(x){return x.id!==b.id});toBin('bill',b.id,b.no,b);
      closeModal();toast(b.no+' '+t('Moved to Bin'));render()}).catch(fail)})};
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
    items:b.lines.map(function(l){return {name:nm(l),detail:qtyLabel(l)+' @ '+rateText(l)+((b.tax>0&&l.gst)?'  + '+l.gst+'% '+t('GST'):''),amount:money(l.total)}}),
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
function defaultPay(){var d=today();return {q:'',from:d,to:d,custom:false,view:'date',tab:'received',sort:'date_desc',psort:'due_desc',isort:'date_asc'}}
var payF=defaultPay(),payExp={rows:[],name:'payments'};
function paymentRows(){
  var rows=[];
  db.bills.forEach(function(b){
    var run=0,list=b.payments||[],n=list.length;
    list.forEach(function(p,i){run=r2(run+p.amount);rows.push({b:b,p:p,i:i+1,n:n,after:Math.max(0,r2(b.total-run))})});
  });
  return rows;
}
function viewPayments(box){
  box.innerHTML='<div class="stack"><h2 style="margin:0">'+esc(t('Payments'))+'</h2><div class="pcards" id="pcards"></div><div class="panel stack">'+
  '<div class="row" id="pfilters"><input class="srch" id="pq" placeholder="'+esc(t('Search'))+': '+esc(t('Customer name, phone or bill number'))+'" aria-label="'+esc(t('Search'))+'" value="'+esc(payF.q)+'">'+rangeSel('prg',payF)+'<select id="pvs" aria-label="'+esc(t('View'))+'"><option value="date">'+esc(t('By date'))+'</option><option value="invoice">'+esc(t('By invoice'))+'</option></select>'+xlBtn('pxl')+'</div><div class="row" id="pcustom"'+(payF.custom?'':' hidden')+'><label class="grow">'+esc(t('From'))+'<input id="pf" type="date" value="'+payF.from+'"></label><label class="grow">'+esc(t('To'))+'<input id="pt" type="date" value="'+payF.to+'"></label></div></div><div id="plist" class="stack"></div></div>';
  var upd=function(){payF.q=$('#pq').value;payF.from=$('#pf').value;payF.to=$('#pt').value;drawPayments()};
  ['#pq','#pf','#pt'].forEach(function(x){$(x).addEventListener('input',upd)});
  $('#pvs').value=payF.view;$('#pvs').onchange=function(){payF.view=this.value;drawPayments()};
  $('#prg').onchange=function(){
    var k=this.value;
    if(k==='custom'){payF.custom=true;$('#pcustom').hidden=false;drawPayments();return}
    var r=histRange(k);payF.custom=false;payF.from=r[0];payF.to=r[1];$('#pf').value=r[0];$('#pt').value=r[1];$('#pcustom').hidden=true;drawPayments();
  };
  $('#pxl').onclick=function(){downloadSheet(payExp.rows,payExp.name==='pending'?'Pending':'Payments',payExp.name)};
  $('#pcards').onclick=function(e){var c=e.target.closest('[data-ptab]');if(c){payF.tab=c.dataset.ptab;drawPayments()}};
  $('#plist').onclick=function(e){
    var h1=e.target.closest('[data-ps]'),h2=e.target.closest('[data-pcs]'),h3=e.target.closest('[data-pis]');
    if(h1){payF.sort=nextSort(payF.sort,h1.dataset.ps);drawPayments();return}
    if(h2){payF.psort=nextSort(payF.psort,h2.dataset.pcs);drawPayments();return}
    if(h3){payF.isort=nextSort(payF.isort,h3.dataset.pis);drawPayments();return}
    var v=e.target.closest('[data-view]'),rc=e.target.closest('[data-recv]'),a=e.target.closest('[data-acct]');if(a)showLedger(a.dataset.acct);else if(rc)billAction(rc.dataset.recv);else if(v)showBill(v.dataset.view)};
  drawPayments();
}
function drawPayments(){
  var q=payF.q.trim().toLowerCase();
  var rows=paymentRows().filter(function(r){
    if(payF.from&&r.p.date<payF.from)return false;if(payF.to&&r.p.date>payF.to)return false;
    return !q||(r.b.clientName+' '+hn(r.b,'clientName','clientNameHi')+' '+r.b.clientPhone+' '+r.b.no).toLowerCase().indexOf(q)>-1;
  });
  var total=r2(rows.reduce(function(s2,r){return s2+r.p.amount},0));
  $('#prg').value=rangeKey(payF);
  $('#pvs').value=payF.view;
  var ps=pendingStats(),pend=payF.tab==='pending';
  if(pend){
    var pm=function(b){return !q||(b.clientName+' '+hn(b,'clientName','clientNameHi')+' '+b.clientPhone+' '+b.no).toLowerCase().indexOf(q)>-1};
    payExp={name:'pending',rows:[['Date','Invoice','Customer','Phone','Total','Paid','Unpaid']].concat(ps.list.filter(pm).map(function(b){return [b.date,b.no,b.clientName,b.clientPhone||'',r2(b.total),r2(paidOf(b)),r2(dueOf(b))]}))};
  }else{
    payExp={name:'payments',rows:[['Date','Time','Invoice','Customer','Phone','Payment','Amount','Pending amount']].concat(rows.slice().sort(function(a,b){var x=a.p.date+' '+a.p.time,y=b.p.date+' '+b.p.time;return x<y?1:x>y?-1:0}).map(function(r){return [r.p.date,r.p.time,r.b.no,r.b.clientName,r.b.clientPhone||'',r.p.mode,r2(r.p.amount),r2(r.after)]}))};
  }
  $('#pcards').innerHTML='<button type="button" class="pcard'+(pend?'':' on')+'" data-ptab="received"><span class="muted">'+esc(t('Received'))+'</span><b class="big">'+money(total)+'</b><span class="note">'+rows.length+' '+esc(t('Payments'))+' \u00B7 '+esc(t(RANGES.find(function(x){return x[0]===rangeKey(payF)}).slice(1,2)[0]))+'</span></button>'+
    '<button type="button" class="pcard'+(pend?' on':'')+'" data-ptab="pending"><span class="muted">'+esc(t('Pending'))+'</span><b class="big warn">'+money(ps.sum)+'</b><span class="note">'+ps.cl.length+' '+esc(t('Customers'))+' \u00B7 '+ps.list.length+' '+esc(t('Pending bills'))+'</span></button>';
  $('#prg').hidden=pend;$('#pvs').hidden=pend;if(pend)$('#pcustom').hidden=true;else $('#pcustom').hidden=!payF.custom;
  var out=$('#plist');
  if(pend){out.innerHTML=pendingHtml(q);return}
  if(!rows.length){out.innerHTML='<div class="panel"><p class="muted">'+esc(t('No payments found.'))+'</p></div>';return}
  var key=function(r){return r.p.date+' '+r.p.time};
  if(payF.view==='date'){
    rows=sortBy(rows,payF.sort,{date:key,invoice:function(r){return r.b.no},cust:function(r){return nm(r.b,'clientName','clientNameHi').toLowerCase()},pay:function(r){return r.p.mode},amount:function(r){return r.p.amount},pend:function(r){return r.after}});
    out.innerHTML='<div class="panel"><div class="tablewrap"><table><thead><tr>'+sortTh('Date','date',payF.sort,'data-ps')+sortTh('Time','date',payF.sort,'data-ps')+sortTh('Invoice','invoice',payF.sort,'data-ps')+sortTh('Customer','cust',payF.sort,'data-ps')+sortTh('Payment','pay',payF.sort,'data-ps')+sortTh('Amount','amount',payF.sort,'data-ps','num')+sortTh('Pending amount','pend',payF.sort,'data-ps','num')+'<th></th></tr></thead><tbody>'+
    rows.map(function(r){return '<tr><td>'+r.p.date+'</td><td>'+r.p.time+'</td><td><button class="small" data-view="'+r.b.id+'">'+esc(r.b.no)+'</button> <span class="note">'+r.i+' / '+r.n+'</span></td><td>'+esc(nm(r.b,'clientName','clientNameHi'))+'</td><td>'+esc(t(r.p.mode))+'</td><td class="num">'+money(r.p.amount)+'</td><td class="num'+(r.after>0?' warn':'')+'">'+money(r.after)+'</td><td>'+((r.i===r.n&&dueOf(r.b)>0&&r.b.clientId)?'<button class="small primary" data-recv="'+r.b.id+'">'+esc(t('Receive'))+'</button>':'')+'</td></tr>'}).join('')+'</tbody></table></div></div>';
    return;
  }
  var groups={},order=[];
  rows.forEach(function(r){var g=groups[r.b.id];if(!g){g=groups[r.b.id]={b:r.b,rows:[],last:''};order.push(g)}g.rows.push(r);if(key(r)>g.last)g.last=key(r)});
  order.sort(function(a,b){return a.last<b.last?1:a.last>b.last?-1:0});
  out.innerHTML=order.map(function(g){
    var b=g.b,due=dueOf(b);
    return '<div class="panel stack"><div class="row" style="justify-content:space-between;align-items:flex-start"><div><b>'+esc(b.no)+'</b> '+statusPill(b)+'<div class="note">'+esc(nm(b,'clientName','clientNameHi'))+(b.clientPhone?' \u00B7 '+esc(b.clientPhone):'')+' \u00B7 '+b.date+'</div></div>'+
    '<div class="note" style="text-align:right">'+esc(t('Total'))+' '+money(b.total)+'<br>'+esc(t('Paid'))+' '+money(paidOf(b))+(due>0?'<br><span class="warn">'+esc(t('Unpaid'))+' '+money(due)+'</span>':'')+'</div></div>'+
    '<div class="tablewrap"><table style="min-width:0"><thead><tr><th>#</th><th>'+esc(t('Date'))+'</th><th>'+esc(t('Time'))+'</th><th>'+esc(t('Payment'))+'</th><th class="num">'+esc(t('Amount'))+'</th><th class="num">'+esc(t('Pending amount'))+'</th></tr></thead><tbody>'+
    g.rows.map(function(r){return '<tr><td>'+r.i+' / '+r.n+'</td><td>'+r.p.date+'</td><td>'+r.p.time+'</td><td>'+esc(t(r.p.mode))+'</td><td class="num">'+money(r.p.amount)+'</td><td class="num'+(r.after>0?' warn':'')+'">'+money(r.after)+'</td></tr>'}).join('')+'</tbody></table></div>'+
    '<div class="row"><button class="small" data-view="'+b.id+'">'+esc(t('View bill'))+'</button>'+((due>0&&b.clientId)?'<button class="small primary" data-recv="'+b.id+'">'+esc(t('Receive'))+'</button>':'')+'</div></div>';
  }).join('');
}
function sortTh(label,key,cur,attr,cls){var c=cur.split('_'),on=c[0]===key;return '<th'+(cls?' class="'+cls+'"':'')+' '+attr+'="'+key+'" style="cursor:pointer">'+esc(t(label))+(on?(c[1]==='asc'?' \u25B2':' \u25BC'):'')+'</th>'}
function nextSort(cur,key){var c=cur.split('_');return key+'_'+(c[0]===key&&c[1]==='desc'?'asc':'desc')}
function sortBy(arr,cur,vals){var c=cur.split('_'),f=vals[c[0]]||vals[Object.keys(vals)[0]],d=c[1]==='asc'?1:-1;return arr.slice().sort(function(a,b){var x=f(a),y=f(b);return x<y?-d:x>y?d:0})}
function pendingStats(){
  var rows={},list=[];
  db.bills.forEach(function(b){
    var d=dueOf(b);if(!(d>0)||!b.clientId)return;
    list.push(b);var r=rows[b.clientId]||(rows[b.clientId]={id:b.clientId,n:0,total:0,paid:0,due:0,oldest:b.date});
    r.n++;r.total+=b.total;r.paid+=paidOf(b);r.due+=d;if(b.date<r.oldest)r.oldest=b.date;
  });
  var cl=Object.keys(rows).map(function(k){return rows[k]}).sort(function(a,b){return b.due-a.due});
  list.sort(function(a,b){return (a.date+a.time)<(b.date+b.time)?-1:1});
  return {cl:cl,list:list,sum:r2(cl.reduce(function(s,r){return s+r.due},0))};
}
function pendingHtml(q){
  var ps=pendingStats(),match=function(b){return !q||(b.clientName+' '+hn(b,'clientName','clientNameHi')+' '+b.clientPhone+' '+b.no).toLowerCase().indexOf(q)>-1};
  var list=ps.list.filter(match),ids={};list.forEach(function(b){ids[b.clientId]=1});
  var cl=ps.cl.filter(function(r){return ids[r.id]});
  if(!list.length)return '<div class="panel"><p class="muted">'+esc(ps.list.length?t('No payments found.'):t('No pending amounts. Every bill is fully paid.'))+'</p></div>';
  return '<div class="panel stack"><h2>'+esc(t('Pending by customer'))+'</h2><div class="tablewrap"><table><thead><tr>'+sortTh('Customer','cust',payF.psort,'data-pcs')+sortTh('Pending bills','bills',payF.psort,'data-pcs','num')+sortTh('Total','total',payF.psort,'data-pcs','num')+sortTh('Paid','paid',payF.psort,'data-pcs','num')+sortTh('Unpaid','due',payF.psort,'data-pcs','num')+sortTh('Oldest','oldest',payF.psort,'data-pcs')+'<th></th></tr></thead><tbody>'+
  sortBy(cl,payF.psort,{cust:function(r){var c=clientById(r.id);return c?nm(c).toLowerCase():''},bills:function(r){return r.n},total:function(r){return r.total},paid:function(r){return r.paid},due:function(r){return r.due},oldest:function(r){return r.oldest}}).map(function(r){var c=clientById(r.id);return '<tr><td><b>'+esc(c?nm(c):'')+'</b>'+(c&&c.phone?'<div class="note">'+esc(c.phone)+'</div>':'')+'</td><td class="num">'+r.n+'</td><td class="num">'+money(r.total)+'</td><td class="num">'+money(r.paid)+'</td><td class="num warn">'+money(r.due)+'</td><td>'+r.oldest+'</td><td><button class="small" data-acct="'+r.id+'">'+esc(t('Account'))+'</button></td></tr>'}).join('')+'</tbody></table></div></div>'+
  '<div class="panel stack"><h2>'+esc(t('Pending invoices'))+'</h2><div class="tablewrap"><table><thead><tr>'+sortTh('Date','date',payF.isort,'data-pis')+sortTh('Invoice','no',payF.isort,'data-pis')+sortTh('Customer','cust',payF.isort,'data-pis')+sortTh('Total','total',payF.isort,'data-pis','num')+sortTh('Paid','paid',payF.isort,'data-pis','num')+sortTh('Unpaid','due',payF.isort,'data-pis','num')+'<th></th></tr></thead><tbody>'+
  sortBy(list,payF.isort,{date:function(b){return b.date+' '+b.time},no:function(b){return b.no},cust:function(b){return nm(b,'clientName','clientNameHi').toLowerCase()},total:function(b){return b.total},paid:function(b){return paidOf(b)},due:function(b){return dueOf(b)}}).map(function(b){return '<tr><td>'+b.date+'</td><td><b>'+esc(b.no)+'</b> '+statusPill(b)+'</td><td>'+esc(nm(b,'clientName','clientNameHi'))+'</td><td class="num">'+money(b.total)+'</td><td class="num">'+money(paidOf(b))+'</td><td class="num warn">'+money(dueOf(b))+'</td><td><button class="small primary" data-recv="'+b.id+'">'+esc(t('Receive'))+'</button></td></tr>'}).join('')+'</tbody></table></div></div>';
}
function closeModal(){$('#modal').hidden=true;openBill=null;openLedger=null;openBack=null}
$('#modal').addEventListener('click',function(e){if(e.target.id==='modal')closeModal()});
document.addEventListener('keydown',function(e){if(e.key==='Escape'){closeModal();setMenu(false)}});

/* Bill history: filters (date, status, customer, payment mode, total) and sorting. Opens on today's date each time. */
function isoDay(d){var p=function(n){return String(n).padStart(2,'0')};return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())}
function defaultHist(){var d=today();return {q:'',from:d,to:d,custom:false,status:'all',client:'all',mode:'all',min:'',max:'',sort:'date_desc',keep:false}}
var hist=defaultHist(),lastRoute='',histLast=[];
function billState(b){if(b.status==='cancelled')return 'cancelled';var d=dueOf(b),p=paidOf(b);return d<=0?'paid':(p>0?'part':'unpaid')}
function histRange(k){
  var t0=new Date(),d=function(n){var x=new Date();x.setDate(x.getDate()-n);return isoDay(x)};
  if(k==='today')return [d(0),d(0)];if(k==='yesterday')return [d(1),d(1)];if(k==='week')return [d(6),d(0)];
  if(k==='month')return [isoDay(new Date(t0.getFullYear(),t0.getMonth(),1)),d(0)];return ['',''];
}
var RANGES=[['today','Today'],['yesterday','Yesterday'],['week','Last 7 days'],['month','This month'],['all','All time'],['custom','Custom date']];
function rangeKey(h){if(h.custom)return 'custom';var k=['today','yesterday','week','month','all'].find(function(x){var v=histRange(x);return v[0]===h.from&&v[1]===h.to});return k||'custom'}
function xlBtn(id){return '<button class="small xlb" type="button" id="'+id+'" title="'+esc(t('Download Excel'))+'"><span class="xf">'+esc(t('Download Excel'))+'</span><span class="xs">\u2B07 Excel</span></button>'}
function rangeSel(id,h){var cur=rangeKey(h);return '<select id="'+id+'" aria-label="'+esc(t('Date'))+'" title="'+esc(t('Date'))+'">'+RANGES.map(function(r){return '<option value="'+r[0]+'"'+(cur===r[0]?' selected':'')+'>'+esc(t(r[1]))+'</option>'}).join('')+'</select>'}
var SORTS=[['date_desc','Newest first'],['date_asc','Oldest first'],['total_desc','Total: high to low'],['total_asc','Total: low to high'],['due_desc','Due: high to low'],['due_asc','Due: low to high'],['paid_desc','Paid: high to low'],['paid_asc','Paid: low to high'],['cust_asc','Customer A to Z'],['cust_desc','Customer Z to A'],['no_asc','Bill number: low to high'],['no_desc','Bill number: high to low']];
function viewBills(box){
  var seen={},custs=[];
  db.bills.forEach(function(b){var k=b.clientId||'walkin';if(!seen[k]){seen[k]=1;custs.push({id:k,label:nm(b,'clientName','clientNameHi')})}});
  custs.sort(function(a,c){return a.label.toLowerCase()<c.label.toLowerCase()?-1:1});
  box.innerHTML='<div class="panel stack"><h2>'+esc(t('Bill history'))+'</h2>'+
  '<div class="row" id="hfilters"><input class="srch" id="hq" placeholder="'+esc(t('Search'))+': '+esc(t('Customer name, phone or bill number'))+'" aria-label="'+esc(t('Search'))+'" value="'+esc(hist.q)+'">'+rangeSel('hrg',hist)+'<select id="hc"><option value="all">'+esc(t('All customers'))+'</option>'+custs.map(function(c){return '<option value="'+esc(c.id)+'"'+(hist.client===c.id?' selected':'')+'>'+esc(c.label)+'</option>'}).join('')+'</select>'+'<select id="hm"><option value="all">'+esc(t('All payment modes'))+'</option>'+['cash','UPI','card','other'].map(function(m){return '<option value="'+m+'"'+(hist.mode===m?' selected':'')+'>'+esc(t(m))+'</option>'}).join('')+'</select>'+'<select id="hs" aria-label="'+esc(t('Status'))+'"></select>'+xlBtn('hxl')+'</div>'+
  '<div class="row" id="hcustom"'+(hist.custom?'':' hidden')+'><label class="grow sm">'+esc(t('From'))+'<input id="hf" type="date" value="'+hist.from+'"></label><label class="grow sm">'+esc(t('To'))+'<input id="ht" type="date" value="'+hist.to+'"></label></div>'+
  '<div class="chips sortbar" id="hsort"></div>'+
  '<div id="hsum"></div><div id="hlist"></div></div>';
  var upd=function(){hist.q=$('#hq').value;hist.from=$('#hf').value;hist.to=$('#ht').value;hist.client=$('#hc').value;hist.mode=$('#hm').value;hist.min='';hist.max='';drawHist()};
  ['#hq','#hf','#ht','#hc','#hm'].forEach(function(x){$(x).addEventListener('input',upd);$(x).addEventListener('change',upd)});
  $('#hrg').onchange=function(){
    var k=this.value;
    if(k==='custom'){hist.custom=true;$('#hcustom').hidden=false;drawHist();return}
    var r=histRange(k);hist.custom=false;hist.from=r[0];hist.to=r[1];$('#hf').value=r[0];$('#ht').value=r[1];$('#hcustom').hidden=true;drawHist();
  };
  $('#hs').onchange=function(){hist.status=this.value;drawHist()};
  $('#hxl').onclick=function(){exportBills(histLast)};
  var sortBy=function(k){var c2=hist.sort.split('_');hist.sort=k+'_'+(c2[0]===k&&c2[1]==='desc'?'asc':'desc');drawHist()};
  $('#hsort').onclick=function(e){var b=e.target.closest('[data-sort]');if(b)sortBy(b.dataset.sort)};
  $('#hlist').onclick=function(e){
    var th=e.target.closest('[data-sort]');
    if(th){sortBy(th.dataset.sort);return}
    var v=e.target.closest('[data-view]');if(v)showBill(v.dataset.view);
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
  histLast=list;
  $('#hrg').value=rangeKey(hist);
  $('#hsort').innerHTML=[['no','Bill'],['date','Date'],['cust','Customer'],['total','Total'],['paid','Paid'],['due','Due']].map(function(x){return '<button class="chip'+(key===x[0]?' on':'')+'" data-sort="'+x[0]+'">'+esc(t(x[1]))+(key===x[0]?(dir===1?' \u25B2':' \u25BC'):'')+'</button>'}).join('');
  $('#hs').innerHTML=[['all','All'],['paid','Paid'],['part','Part paid'],['unpaid','Unpaid'],['cancelled','Cancelled']].map(function(x){return '<option value="'+x[0]+'"'+(hist.status===x[0]?' selected':'')+'>'+esc(t(x[1]))+' ('+cnt[x[0]]+')</option>'}).join('');
  var live=list.filter(function(b){return b.status!=='cancelled'});
  var sT=r2(live.reduce(function(s2,b){return s2+b.total},0)),sP=r2(live.reduce(function(s2,b){return s2+paidOf(b)},0)),sD=r2(live.reduce(function(s2,b){return s2+dueOf(b)},0));
  var hk=function(label,val,sub,cls){return '<div class="kpi'+(cls?' '+cls:'')+'"><span class="muted">'+esc(label)+'</span><b class="big">'+val+'</b><span class="note">'+sub+'</span></div>'};
  $('#hsum').innerHTML='<div class="kpis">'+hk(t('Bills'),list.length,list.length!==live.length?esc(t('Cancelled'))+' '+(list.length-live.length):'&nbsp;')+hk(t('Total'),money(sT),'&nbsp;')+hk(t('Paid'),money(sP),sT>0?Math.round(sP/sT*100)+'%':'&nbsp;')+hk(t('Due'),money(sD),sD>0?esc(t('Pending')):'&nbsp;',sD>0?'warnc':'')+'</div>';
  var arrow=function(k){return key===k?(dir===1?' ▲':' ▼'):''};
  var th=function(k,label,cls){return '<th'+(cls?' class="'+cls+'"':'')+' data-sort="'+k+'" style="cursor:pointer">'+esc(t(label))+arrow(k)+'</th>'};
  $('#hlist').innerHTML=list.length?'<div class="tablewrap"><table><thead><tr>'+th('no','Bill')+th('date','Date')+th('cust','Customer')+th('total','Total','num')+th('paid','Paid','num')+th('due','Due','num')+'<th></th></tr></thead><tbody>'+
    list.map(function(b){return '<tr><td><b>'+esc(b.no)+'</b> '+statusPill(b)+'</td><td>'+b.date+' <span class="muted">'+b.time+'</span></td><td>'+esc(nm(b,'clientName','clientNameHi'))+(b.clientPhone?'<div class="note">'+esc(b.clientPhone)+'</div>':'')+'</td><td class="num">'+money(b.total)+'</td><td class="num">'+money(paidOf(b))+'</td><td class="num'+(dueOf(b)>0?' warn':'')+'">'+money(dueOf(b))+'</td><td><button class="small" data-view="'+b.id+'">'+esc(t('View'))+'</button></td></tr>'}).join('')+'</tbody></table></div>'
    :'<p class="muted">'+esc(db.bills.length?t('No bills match this search.'):t('No bills yet. Save a bill from the New bill tab and it will appear here.'))+'</p>';
}

/* Items */
var itemF={q:'',cat:'All',qty:'All',stock:'all'};
/* Low stock follows how fast the product sells: low when the stock left is 25% or less of what was sold in the last 30 days */
var LOW_PCT=25,soldCache={key:'',map:{}};
function sold30(){
  var key=db.bills.length+'|'+db.bills.filter(function(b){return b.status==='cancelled'}).length+'|'+today();
  if(soldCache.key===key)return soldCache.map;
  var from=new Date();from.setDate(from.getDate()-29);from=isoDay(from);var m={};
  db.bills.forEach(function(b){if(b.status==='cancelled'||b.date<from)return;(b.lines||[]).forEach(function(l){if(l.itemId)m[l.itemId]=(m[l.itemId]||0)+l.qty*(l.factor||1)})});
  soldCache={key:key,map:m};return m;
}
function lowInfo(i){var sold=sold30()[i.id]||0;return {sold:sold,limit:Math.floor(sold*LOW_PCT/100)}}
function stockState(i){
  if(i.stock===''||i.stock==null)return 'na';
  if(i.stock<=0)return 'out';
  var li=lowInfo(i);
  return (li.sold>0&&i.stock<=li.limit)?'low':'in';
}
function allCats(){
  var out=[];(db.categories||[]).concat(db.items.map(function(i){return i.category})).forEach(function(c){if(c&&out.indexOf(c)<0)out.push(c)});
  return out;
}
var catsOpen=false;
var pview=(function(){try{return localStorage.getItem('pview')==='min'?'min':'full'}catch(e){return 'full'}})();
function viewItems(box){
  box.innerHTML='<div class="cols single" id="icols"><div class="stack"><div class="panel stack"><div class="row" style="justify-content:space-between"><h2>'+esc(t('Product List'))+'</h2><div class="row"><button class="small" type="button" id="icatbtn">'+esc(t('Category'))+'</button><button class="small primary" type="button" id="inew">+ '+esc(t('Add product'))+'</button></div></div>'+
  '<div class="stack" style="gap:8px"><div class="srow"><input class="grow" id="fq" placeholder="'+esc(t('Search products by name'))+'" value="'+esc(itemF.q)+'" aria-label="'+esc(t('Search products by name'))+'"><div class="seg" role="group"><button type="button" class="'+(pview==='min'?'':'on')+'" data-pv="full">'+esc(t('More'))+'</button><button type="button" class="'+(pview==='min'?'on':'')+'" data-pv="min">'+esc(t('Less'))+'</button></div>'+xlBtn('ixl')+'</div><div id="ifilters"></div></div>'+
  '<div id="itable"></div></div>'+
  '</div>'+
  '<div class="stack" id="catside"'+(catsOpen?'':' hidden')+'><div class="popcard"><button type="button" id="catclose" class="xclose" aria-label="'+esc(t('Cancel'))+'" title="'+esc(t('Cancel'))+'">\u2715</button><div class="panel stack" id="catpanel"></div></div></div>'+
  '<div class="stack" id="iside" hidden><div class="popcard"><button type="button" id="iclose" class="xclose" aria-label="'+esc(t('Cancel'))+'" title="'+esc(t('Cancel'))+'">\u2715</button><form class="panel stack" id="iform"><h2 id="ititle">'+esc(t('Add product'))+'</h2><input type="hidden" id="iid">'+
  '<label>'+esc(t('Name (English)'))+'<input id="in" placeholder="Eyeliner"></label>'+
  '<label>'+esc(t('Name (Hindi)'))+'<input id="inh" placeholder="आईलाइनर"></label>'+
  '<label>'+esc(t('Category'))+'<select id="ic"></select></label>'+
  '<label id="icnw" hidden>'+esc(t('New category name'))+'<input id="icn"></label>'+
  '<div class="row" id="ipw"><label class="grow">'+esc(t('Price per piece (₹)'))+'<input id="ip" inputmode="decimal"></label></div>'+
  '<div class="row"><label class="grow">'+esc(t('Sold by default in'))+'<select id="iu"></select></label></div>'+
  '<label id="iadw" hidden style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="iad" checked style="width:auto"> '+esc(t('Also sell in dozen'))+'</label>'+
  '<label id="irpw" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="irp" style="width:auto"> '+esc(t('Show rate per piece on the bill (default is per dozen)'))+'</label>'+
  '<label id="idzw" hidden>'+esc(t('Price per dozen (₹)'))+'<input id="idz" inputmode="decimal" placeholder="'+esc(t('Leave empty for 12 x piece price'))+'"></label>'+
  '<div class="stack" id="cuBox" hidden><div class="row"><label class="grow">'+esc(t('Unit name'))+'<input id="iun" placeholder="'+esc(t('e.g. Set'))+'"></label><label class="grow">'+esc(t('Pieces in one unit'))+'<input id="iuq" inputmode="numeric" placeholder="'+esc(t('Optional'))+'"></label><label class="grow">'+esc(t('Price per unit (\u20B9)'))+'<input id="iup" inputmode="decimal"></label></div><label id="isuw" style="flex-direction:row;align-items:center;gap:8px"><input type="checkbox" id="isu" style="width:auto"> '+esc(t('Save this unit for other products'))+'</label></div>'+
  '<div class="row"><label class="grow">'+esc(t('Stock'))+'<input id="is" inputmode="decimal" placeholder="'+esc(t('Optional'))+'"></label><label class="grow">'+esc(t('Stock unit'))+'<select id="isun"></select></label></div><div class="note" id="isnote" hidden></div>'+
  '<button type="button" class="small" id="imorebtn">'+esc(t('View more'))+' \u25BE</button>'+
  '<div class="stack" id="imore" hidden>'+
  '<div class="row"><label class="grow">'+esc(t('GST rate %'))+'<input id="ig" inputmode="decimal" placeholder="'+esc(t('Optional'))+'"></label><label class="grow">'+esc(t('HSN code'))+'<input id="ih" placeholder="'+esc(t('Optional'))+'"></label></div></div>'+
  '<div class="row"><button class="primary grow" type="submit" id="isave">'+esc(t('Add product'))+'</button></div>'+
  '</form>'+
  '<div class="panel stack" id="itemImport" hidden><h2>'+esc(t('Import products from Excel'))+'</h2>'+
  '<div class="row"><button id="itemSampleX" type="button">'+esc(t('Download sample Excel'))+'</button><button id="itemSample" type="button">'+esc(t('Download sample CSV'))+'</button></div>'+
  '<input type="file" id="itemFile" accept=".xlsx,.csv,text/csv,text/plain" aria-label="Excel / CSV">'+
  '<textarea id="itemText" placeholder="'+esc(t('Or paste the rows here'))+'" aria-label="'+esc(t('Or paste the rows here'))+'" style="min-height:80px"></textarea>'+
  '<div class="stack" id="itemSql" hidden><h3>'+esc(t('SQL query that will run'))+'</h3><pre class="sqlbox" id="itemSqlPre"></pre><div class="note" id="itemSqlNote" style="white-space:pre-line"></div></div>'+
  '<div class="row"><button class="primary" id="itemGo" type="button">'+esc(t('Import products'))+'</button></div><div id="itemRes" class="note"></div></div><button type="button" id="iimpbtn">'+esc(t('Import products from Excel'))+'</button></div></div></div>';

  function fillCats(sel){
    $('#ic').innerHTML='<option value="">'+esc(t('Choose a category'))+'</option>'+allCats().map(function(c){return '<option value="'+esc(c)+'">'+esc(tc(c))+'</option>'}).join('')+'<option value="__new__">'+esc(t('+ Add new category…'))+'</option>';
    if(sel)$('#ic').value=sel;
  }
  function drawCats(){
    var cats=allCats();
    $('#catpanel').innerHTML='<h2>'+esc(t('Categories'))+'</h2><div class="stack" style="gap:6px">'+cats.map(function(c){
      var n=db.items.filter(function(i){return i.category===c}).length;
      return '<div class="row" style="justify-content:space-between"><span>'+esc(tc(c))+' <span class="muted">('+n+')</span></span>'+(n===0?'<button class="small danger" data-delcat="'+esc(c)+'">'+esc(t('Delete'))+'</button>':'')+'</div>'}).join('')+'</div>'+
      '<div class="row"><input class="grow" id="ncn" placeholder="'+esc(t('New category name'))+'" aria-label="'+esc(t('New category name'))+'"><button id="ncb">'+esc(t('Add category'))+'</button></div>'+
      (db.units.length?'<h2 style="margin-top:8px">'+esc(t('Saved units'))+'</h2><div class="stack" style="gap:6px">'+db.units.map(function(u){return '<div class="row" style="justify-content:space-between"><span>'+esc(uLabel(u.name))+(u.qty>1?' <span class="muted">('+u.qty+' '+esc(t('pcs'))+')</span>':'')+'</span><button class="small danger" data-delunit="'+esc(u.name)+'">'+esc(t('Delete'))+'</button></div>'}).join('')+'</div>':'');
    $('#ncb').onclick=function(){
      var n=$('#ncn').value.trim();if(!n)return;
      if(allCats().indexOf(n)>=0)return;
      guard($('#ncb'),function(){return upsert('categories',{name:n,deleted_at:null},'name').then(function(){unbinCat(n);db.categories.push(n);toast(t('Category added'));render()}).catch(fail)});
    };
  }
  function drawItems(){
    var cnt={all:db.items.length,in:0,low:0,out:0};
    db.items.forEach(function(i){var s=stockState(i);if(s==='in'||s==='low')cnt.in++;if(s==='low')cnt.low++;if(s==='out')cnt.out++});
    if(itemF.qty!=='All'&&!db.items.some(function(i){return qHas(i,itemF.qty)}))itemF.qty='All';
    function sel(id,label,opts,cur){return '<select id="'+id+'" aria-label="'+esc(label)+'" title="'+esc(label)+'">'+opts.map(function(o){return '<option value="'+esc(o[0])+'"'+(o[0]===cur?' selected':'')+'>'+esc(o[1])+'</option>'}).join('')+'</select>'}
    var h=sel('isf',t('Stock'),[['all','All'],['in','In stock'],['low','Low stock'],['out','Out of stock']].map(function(x){return [x[0],t(x[1])+' ('+cnt[x[0]]+')']}),itemF.stock);
    h+=sel('icf',t('Category'),[['All',t('All categories')]].concat(allCats().map(function(c){return [c,tc(c)]})),itemF.cat);
    var kinds=qKinds(db.items);
    if(kinds.length>=2)h+=sel('iqf',t('Unit'),[['All',t('All units')]].concat(kinds.map(function(k){return [k,qLabel(k)]})),itemF.qty);
    $('#ifilters').innerHTML=h;
    var q=itemF.q.trim().toLowerCase();
    var list=db.items.filter(function(i){
      if(itemF.cat!=='All'&&i.category!==itemF.cat)return false;
      if(itemF.qty!=='All'&&!qHas(i,itemF.qty))return false;
      var st=stockState(i);
      if(itemF.stock==='in'&&st!=='in'&&st!=='low')return false;
      if(itemF.stock==='low'&&st!=='low')return false;
      if(itemF.stock==='out'&&st!=='out')return false;
      return !q||(i.name+' '+hn(i)).toLowerCase().indexOf(q)>-1;
    });
    if(pview==='min'){
      $('#itable').innerHTML='<div class="tablewrap"><table class="minlist"><thead><tr><th>'+esc(t('Product'))+'</th><th class="num">'+esc(t('Price'))+'</th><th></th></tr></thead><tbody>'+
      (list.length?list.map(function(i){var u=du(i),pr=u==='custom'?money(customPrice(i))+' / '+esc(uLabel(i.unitName)):u==='doz'?money(dozPrice(i))+' / '+esc(t('dozen')):money(i.price)+' / '+esc(t('pc'));
        return '<tr><td><b>'+esc(nm(i))+'</b></td><td class="num">'+pr+'</td><td class="row"><button class="small" data-edit="'+i.id+'">'+esc(t('Edit'))+'</button><button class="small danger" data-del="'+i.id+'">'+esc(t('Delete'))+'</button></td></tr>'}).join(''):
      '<tr><td colspan="3" class="muted">'+esc(db.items.length?t('No products in this view.'):t('No products yet. Add the first one with the + Add product button.'))+'</td></tr>')+'</tbody></table></div>';
      return;
    }
    $('#itable').innerHTML='<div class="tablewrap"><table><thead><tr><th>'+esc(t('Product'))+'</th><th>'+esc(t('Category'))+'</th><th class="num">'+esc(t('Price'))+'</th><th class="num">'+esc(t('Stock'))+'</th><th class="num">'+esc(t('GST'))+'</th><th>'+esc(t('HSN code'))+'</th><th></th></tr></thead><tbody>'+
    (list.length?list.map(function(i){
      var st=stockState(i);
      var stc=st==='na'?'–':stockText(i)+(st==='out'?' <span class="pill unpaid">'+esc(t('Out of stock'))+'</span>':st==='low'?' <span class="pill partial" title="'+esc(t('Sold in last 30 days')+': '+lowInfo(i).sold+' '+t('pc')+' \u00B7 '+t('Low at or below')+' '+lowInfo(i).limit+' '+t('pc'))+'">'+esc(t('Low stock'))+'</span>':'');
      return '<tr><td><b>'+esc(nm(i))+'</b>'+'</td><td>'+esc(tc(i.category))+'</td><td class="num">'+priceCell(i)+'</td><td class="num">'+stc+'</td><td class="num">'+(i.gst?i.gst+'%':'–')+'</td><td>'+(i.hsn?esc(i.hsn):'–')+'</td><td class="row"><button class="small" data-edit="'+i.id+'">'+esc(t('Edit'))+'</button><button class="small danger" data-del="'+i.id+'">'+esc(t('Delete'))+'</button></td></tr>'}).join(''):
      '<tr><td colspan="7" class="muted">'+esc(db.items.length?t('No products in this view.'):t('No products yet. Add the first one with the + Add product button.'))+'</td></tr>')+'</tbody></table></div>';
  }
  fillCats('');fillUnits('');syncCu();refreshStock(false);drawCats();drawItems();wireItemImport();
  $('#fq').addEventListener('input',function(e){itemF.q=e.target.value;drawItems()});
  $('#ixl').onclick=function(){exportItems()};
  $('#ic').onchange=function(){$('#icnw').hidden=this.value!=='__new__';if(this.value==='__new__')$('#icn').focus()};
  var reset=function(){$('#iform').reset();$('#iid').value='';$('#ititle').textContent=t('Add product');$('#isave').textContent=t('Add product');$('#icancel').hidden=true;$('#icnw').hidden=true;syncCu()};
  function fillUnits(v){
    $('#iu').innerHTML='<option value="pc">'+esc(t('Piece'))+'</option><option value="doz">'+esc(t('Dozen (12 pcs)'))+'</option>'+db.units.map(function(u){return '<option value="u:'+esc(u.name)+'">'+esc(uLabel(u.name))+(u.qty>1?' ('+u.qty+' '+esc(t('pcs'))+')':'')+'</option>'}).join('')+'<option value="custom">'+esc(t('Manual (own unit)'))+'</option>';
    if(v)$('#iu').value=v;
  }
  function stockOpts(){
    var o=[['pc',t('Piece'),1],['doz',t('Dozen (12 pcs)'),12]];
    db.units.forEach(function(u){o.push(['u:'+u.name,uLabel(u.name)+(u.qty>1?' ('+u.qty+' '+t('pcs')+')':''),u.qty])});
    var mn=$('#iun').value.trim();
    if(mn&&!db.units.some(function(u){return u.name===mn})){var mq=parseInt($('#iuq').value,10)||1;o.push(['m',uLabel(mn)+(mq>1?' ('+mq+' '+t('pcs')+')':''),mq])}
    return o;
  }
  function stockFactor(){var v=$('#isun').value,f=1;stockOpts().forEach(function(o){if(o[0]===v)f=o[2]});return f}
  var stockPicked=false;
  function refreshStock(keep){
    var prev=$('#isun').value,o=stockOpts(),iv=$('#iu').value,want='pc';
    if(iv==='doz'||iv==='pc')want='doz';else if(iv.indexOf('u:')===0)want=iv;else if(iv==='custom'&&$('#iun').value.trim())want=o.some(function(x){return x[0]==='m'})?'m':'pc';
    $('#isun').innerHTML=o.map(function(x){return '<option value="'+esc(x[0])+'">'+esc(x[1])+'</option>'}).join('');
    $('#isun').value=(keep&&stockPicked&&o.some(function(x){return x[0]===prev}))?prev:want;
    stockNote();
  }
  function stockNote(){var f=stockFactor(),v=parseFloat($('#is').value),n=$('#isnote');if(f>1&&v>0){n.hidden=false;n.textContent='= '+Math.round(v*f)+' '+t('pcs')}else n.hidden=true}
  function isCu(){var v=$('#iu').value;return v==='custom'||v.indexOf('u:')===0}
  function syncCu(){var v=$('#iu').value,cu=isCu(),saved=v.indexOf('u:')===0;$('#ipw').hidden=cu;$('#irpw').hidden=cu;$('#idzw').hidden=cu||!$('#iad').checked;var show=cu||$('#iun').value||$('#iuq').value||$('#iup').value;$('#cuBox').hidden=!show;$('#isuw').hidden=!(show&&!saved)}
  $('#iu').onchange=function(){var v=this.value;if(v.indexOf('u:')===0){var u=db.units.find(function(x){return 'u:'+x.name===v});if(u){$('#iun').value=u.name;$('#iuq').value=u.qty>1?u.qty:''}}if(v==='doz')$('#iad').checked=true;syncCu();stockPicked=false;refreshStock(false)};
  $('#iun').addEventListener('input',function(){refreshStock(true)});$('#iuq').addEventListener('input',function(){refreshStock(true)});
  $('#is').addEventListener('input',stockNote);$('#isun').onchange=function(){stockPicked=true;stockNote()};
  $('#iad').onchange=function(){syncCu();refreshStock(true)};
  function setMore(on){$('#imore').hidden=!on;$('#imorebtn').textContent=t(on?'View less':'View more')+(on?' \u25B4':' \u25BE')}
  $('#imorebtn').onclick=function(){setMore($('#imore').hidden)};
  $('#iclose').onclick=function(){render()};
  function openItemForm(){$('#iside').hidden=false;$('#in').focus()}
  $('#iside').onclick=function(e){if(e.target===this)render()};
  $('#inew').onclick=function(){$('#iimpbtn').hidden=false;$('#iimpbtn').textContent=t('Import products from Excel');$('#itemImport').hidden=true;$('#iform').hidden=false;setMore(false);openItemForm()};
  $('#iimpbtn').onclick=function(){var imp=$('#itemImport').hidden;$('#itemImport').hidden=!imp;$('#iform').hidden=imp;this.textContent=imp?t('Add products manually'):t('Import products from Excel')};
  document.onkeydown=function(e){if(e.key!=='Escape')return;if($('#catside')&&!$('#catside').hidden)closeCats();else if($('#iside')&&!$('#iside').hidden)render()};
  $('#in').oninput=function(){$('#inh').placeholder=tr(this.value)||'आईलाइनर'};
  $('#ip').oninput=function(){var v=parseFloat(this.value);$('#idz').placeholder=v>=0?String(r2(v*12)):''};
  $('#idz').oninput=function(){var v=parseFloat(this.value);$('#ip').placeholder=v>=0?String(r2(v/12)):''};
  $('#iform').onsubmit=function(e){
    e.preventDefault();
    var pp=parseFloat($('#ip').value),dp=parseFloat($('#idz').value);
    var un=$('#iun').value.trim(),uq=parseInt($('#iuq').value,10)||0,up=parseFloat($('#iup').value),iv=$('#iu').value,isCustom=iv==='custom'||iv.indexOf('u:')===0,allowDz=!isCustom&&($('#iad').checked||iv==='doz');
    if(isCustom||!allowDz)dp=NaN;
    if(isCustom)pp=NaN;
    if(isCustom&&!un){toast(t('Enter the unit name'));$('#cuBox').hidden=false;return}
    if(!(pp>=0)&&!(dp>=0)&&!(isCustom&&up>=0)){toast(t('Enter a valid price'));return}
    var price=pp>=0?pp:(dp>=0?r2(dp/12):r2(up/(uq>=1?uq:1)));
    var cat=$('#ic').value;
    if(cat==='__new__')cat=$('#icn').value.trim();
    if(!cat){toast(t('Choose a category'));return}
    var newCat=db.categories.indexOf(cat)<0;
    var st=$('#is').value.trim(),stf=stockFactor();if(st!==''&&!(parseFloat(st)>=0)){toast(t('Enter a valid number'));return}
    var o={name:$('#in').value.trim(),nameHi:$('#inh').value.trim(),unit:isCustom?'custom':iv,allowDozen:allowDz,ratePc:!isCustom&&$('#irp').checked,unitName:un||'',unitQty:uq>=1?uq:1,unitPrice:(up>=0&&un)?up:'',dozenPrice:dp>=0?dp:'',category:cat,price:price,gst:parseFloat($('#ig').value)||0,hsn:$('#ih').value.trim(),stock:st===''?'':Math.round(parseFloat(st)*stf),stockUnit:(function(v){return v==='pc'||v==='doz'?v:(v==='m'?$('#iun').value.trim():v.replace(/^u:/,''))})($('#isun').value),active:true};
    if(!o.name&&!o.nameHi){toast(t('Enter the product name'));return}
    (function(b){o.name=b.name;o.nameHi=b.nameHi})(bothNames(o.name,o.nameHi));
    var id=$('#iid').value,old=id?itemById(id):null,rec=id?Object.assign({},old,o):Object.assign({id:uid()},o);
    var skipStock=!!old&&String(old.stock)===String(o.stock);
    guard($('#isave'),function(){
      return upsert('items',itemRow(rec,skipStock)).then(function(){return newCat?upsert('categories',{name:cat,deleted_at:null},'name'):null}).then(function(){
        if($('#isu').checked&&un&&!db.units.some(function(x){return x.name===un})){var nu={name:un,qty:uq>=1?uq:1};return upsert('units',nu,'name').then(function(){db.units.push(nu)})}
      }).then(function(){
        if(newCat){unbinCat(cat);db.categories.push(cat)}
        if(id)Object.assign(old,rec);else db.items.push(rec);
        toast(t(id?'Product updated':'Product added'));render();
      }).catch(fail);
    });
  };
  box.onchange=function(e){var id=e.target.id;if(id==='isf')itemF.stock=e.target.value;else if(id==='icf')itemF.cat=e.target.value;else if(id==='iqf')itemF.qty=e.target.value;else return;drawItems()};
  function closeCats(){catsOpen=false;$('#catside').hidden=true}
  $('#icatbtn').onclick=function(){catsOpen=true;$('#catside').hidden=false};
  $('#catclose').onclick=closeCats;
  $('#catside').onclick=function(e){if(e.target===this)closeCats()};
  box.onclick=function(e){
    var ed=e.target.closest('[data-edit]'),dl=e.target.closest('[data-del]'),dc=e.target.closest('[data-delcat]'),dun=e.target.closest('[data-delunit]'),pv=e.target.closest('[data-pv]');
    if(pv){pview=pv.dataset.pv;try{localStorage.setItem('pview',pview)}catch(x){}render();return}
    if(dun)twice(dun,t('Sure?'),function(){del('units','name',dun.dataset.delunit).then(function(){db.units=db.units.filter(function(x){return x.name!==dun.dataset.delunit});toast(t('Deleted'));render()},fail)});
    if(dc)twice(dc,t('Sure?'),function(){binSet('categories','name',dc.dataset.delcat,new Date().toISOString()).then(function(){db.categories=db.categories.filter(function(c){return c!==dc.dataset.delcat});toBin('category',dc.dataset.delcat,dc.dataset.delcat);if(itemF.cat===dc.dataset.delcat)itemF.cat='All';toast(t('Moved to Bin'));render()},fail)});
    if(ed){var i=itemById(ed.dataset.edit);$('#iid').value=i.id;$('#in').value=i.name;$('#inh').value=i.nameHi||HN[i.name]||'';fillCats(i.category);$('#ip').value=i.price;$('#idz').value=(i.dozenPrice===''||i.dozenPrice==null)?'':i.dozenPrice;$('#iu').value=(i.unit==='custom'&&db.units.some(function(x){return x.name===i.unitName}))?'u:'+i.unitName:(i.unit||'pc');$('#iad').checked=true;$('#irp').checked=!!i.ratePc;$('#isu').checked=false;$('#iun').value=i.unitName||'';$('#iuq').value=(i.unitQty>1)?i.unitQty:'';$('#iup').value=hasCustom(i)?customPrice(i):'';syncCu();$('#ig').value=i.gst||'';$('#ih').value=i.hsn||'';refreshStock(false);(function(){var su=i.stockUnit||defaultStockUnit(i),mn=$('#iun').value.trim(),v='pc';
          if(su==='doz')v='doz';else if(su!=='pc'){if(db.units.some(function(x){return x.name===su}))v='u:'+su;else if(su===mn)v='m'}
          $('#isun').value=v;var f=stockFactor();$('#is').value=(i.stock===''||i.stock==null)?'':Number((i.stock/f).toFixed(4))})();stockNote();$('#ititle').textContent=t('Edit product');$('#isave').textContent=t('Save changes');$('#iimpbtn').hidden=true;$('#itemImport').hidden=true;$('#iform').hidden=false;setMore(!!(i.gst||i.hsn));openItemForm()}
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
var cview=(function(){try{return localStorage.getItem('cview')==='min'?'min':'full'}catch(e){return 'full'}})();
function numTags(c){
  var all=[{t:'WA',n:c.phone}].concat(c.phones||[]).filter(function(x){return x.n});
  return '<div class="phones">'+all.map(function(x){return '<div><span class="tag '+(x.t==='WA'?'wa':'mob')+'">'+esc(x.t)+'</span> '+esc(x.n)+'</div>'}).join('')+'</div>';
}
function viewClients(box){
  var stats={};db.bills.forEach(function(b){if(b.clientId&&b.status!=='cancelled'){var s=stats[b.clientId]||(stats[b.clientId]={n:0,t:0,d:0});s.n++;s.t+=b.total;s.d+=dueOf(b)}});
  var min=cview==='min',cols=min?5:7;
  var head=min?'<th>'+esc(t('Name'))+'</th><th>'+esc(t('WhatsApp number'))+'</th><th>'+esc(t('Address'))+'</th><th>'+esc(t('Created'))+'</th><th></th>'
    :'<th>'+esc(t('Name'))+'</th><th>'+esc(t('Phone'))+'</th><th>'+esc(t('Address'))+'</th><th>'+esc(t('Created'))+'</th><th class="num">'+esc(t('Bills'))+'</th><th class="num">'+esc(t('Spent'))+'</th><th class="num">'+esc(t('Pending'))+'</th><th></th>';
  if(!min)cols=8;
  function rowOf(c){
    var s=stats[c.id]||{n:0,t:0,d:0};
    var btns='<td class="row"><button class="small" data-acct="'+c.id+'">'+esc(t('Account'))+'</button>'+(min?'':'<button class="small" data-hist="'+esc(c.name)+'">'+esc(t('Bills'))+'</button>')+'<button class="small" data-edit="'+c.id+'">'+esc(t('Edit'))+'</button></td>';
    if(min)return '<tr><td><b>'+esc(nm(c))+'</b></td><td>'+esc(c.phone)+'</td><td>'+esc(c.address||'')+'</td><td>'+esc(fmtDay(c.created))+'</td>'+btns+'</tr>';
    return '<tr><td><b>'+esc(nm(c))+'</b></td><td>'+numTags(c)+'</td><td>'+esc(c.address||'')+'</td><td>'+esc(fmtDay(c.created))+'</td><td class="num">'+s.n+'</td><td class="num">'+money(s.t)+'</td><td class="num'+(s.d>0?' warn':'')+'">'+money(s.d)+'</td>'+btns+'</tr>';
  }
  box.innerHTML='<div class="cols single" id="ccols"><div class="panel stack"><div class="row" style="justify-content:space-between"><h2>'+esc(t('Customers'))+'</h2><div class="row"><button class="small primary" type="button" id="cnew">+ '+esc(t('Add customer'))+'</button><div class="seg" role="group"><button type="button" class="'+(min?'':'on')+'" data-cv="full">'+esc(t('More'))+'</button><button type="button" class="'+(min?'on':'')+'" data-cv="min">'+esc(t('Less'))+'</button></div><button class="small" type="button" id="cxl">'+esc(t('Download Excel'))+'</button></div></div><div class="tablewrap"><table'+(min?' class="minrows"':'')+'><thead><tr>'+head+'</tr></thead><tbody>'+
  (db.clients.length?db.clients.map(rowOf).join(''):'<tr><td colspan="'+cols+'" class="muted">'+esc(t('No customers yet. They are added when you bill a new customer.'))+'</td></tr>')+
  '</tbody></table></div></div><div class="stack" id="cside" hidden><div class="popcard"><button type="button" id="cclose" class="xclose" aria-label="'+esc(t('Cancel'))+'" title="'+esc(t('Cancel'))+'">\u2715</button>'+
  '<div class="panel stack" id="importPanel" hidden><h2>'+esc(t('Import customers from Excel'))+'</h2><p class="muted">'+esc(t('Save your Excel sheet as CSV with the columns Name, WhatsApp Number, Other Numbers (optional) and Address. Put several numbers in one cell with commas. Numbers under WhatsApp Number are marked WA and numbers under Other Numbers are marked Mob. The first WhatsApp number is the main one.'))+'</p>'+
  '<div class="row"><button id="csvSample" type="button">'+esc(t('Download sample CSV'))+'</button></div>'+
  '<input type="file" id="csvFile" accept=".xlsx,.csv,text/csv,text/plain" aria-label="Excel / CSV">'+
  '<textarea id="csvText" placeholder="'+esc(t('Or paste the rows here'))+'" aria-label="'+esc(t('Or paste the rows here'))+'" style="min-height:80px"></textarea>'+
  '<div class="stack" id="csvSql" hidden><h3>'+esc(t('SQL query that will run'))+'</h3><pre class="sqlbox" id="csvSqlPre"></pre><div class="note" id="csvSqlNote" style="white-space:pre-line"></div></div>'+
  '<div class="row"><button class="primary" id="csvGo" type="button">'+esc(t('Import customers'))+'</button></div><div id="csvRes" class="note"></div></div>'+
  '<form class="panel stack" id="cform"><h2 id="ctitle">'+esc(t('Add customer'))+'</h2><input type="hidden" id="cid">'+
  '<label>'+esc(t('Name (English)'))+'<input id="cn"></label><label>'+esc(t('Name (Hindi)'))+'<input id="cnh"></label><label>'+esc(t('WhatsApp number'))+'<input id="cp" inputmode="numeric" autocomplete="off" placeholder="'+esc(t('10-digit number'))+'"><span class="note warn" id="cperr" hidden>'+esc(t('Phone number must be 10 digits'))+'</span></label><div class="stack" id="cxtra"></div><button type="button" class="small" id="cadd">+ '+esc(t('Add another number'))+'</button><label>'+esc(t('Address'))+'<input id="ca" placeholder="'+esc(t('Optional'))+'"></label>'+
  '<div class="row"><button class="primary grow" type="submit" id="csave">'+esc(t('Add customer'))+'</button><button type="button" class="danger" id="cdel" hidden>'+esc(t('Delete customer'))+'</button></div>'+
  '</form><button type="button" id="cimpbtn">'+esc(t('Import customers from Excel'))+'</button></div></div></div>';
  function openForm(){$('#cside').hidden=false;$('#cn').focus()}
  $('#cside').onclick=function(e){if(e.target===this)render()};
  document.onkeydown=function(e){if(e.key==='Escape'&&$('#cside')&&!$('#cside').hidden)render()};
  $('#cimpbtn').onclick=function(){var imp=$('#importPanel').hidden;$('#importPanel').hidden=!imp;$('#cform').hidden=imp;this.textContent=imp?t('Add customers manually'):t('Import customers from Excel')};
  $('#cnew').onclick=function(){$('#cimpbtn').hidden=false;$('#cimpbtn').textContent=t('Import customers from Excel');$('#importPanel').hidden=true;$('#cform').hidden=false;openForm()};
  $('#cclose').onclick=function(){render()};
  $('#cn').oninput=function(){$('#cnh').placeholder=tr(this.value)};
  $('#cn').onblur=function(){this.value=titleCase(this.value)};
  phoneInput('#cp','#cperr');
  function addXtra(tp,n){
    var d=document.createElement('div');d.className='row xrow';
    d.innerHTML='<select class="xt" aria-label="type"><option value="WA">WA</option><option value="Mob">Mob</option></select><input class="xn grow" inputmode="numeric" autocomplete="off" placeholder="'+esc(t('10-digit number'))+'"><button type="button" class="small danger xdel">'+esc(t('Remove'))+'</button>';
    d.querySelector('.xt').value=tp==='WA'?'WA':'Mob';
    var inp=d.querySelector('.xn');inp.value=n||'';inp.oninput=function(){this.value=cleanPhone(this.value)};
    d.querySelector('.xdel').onclick=function(){d.remove()};
    $('#cxtra').appendChild(d);return inp;
  }
  $('#cadd').onclick=function(){addXtra('Mob','').focus()};
  box.querySelectorAll('[data-cv]').forEach(function(b){b.onclick=function(){cview=b.dataset.cv;try{localStorage.setItem('cview',cview)}catch(e){}render()}});
  $('#cxl').onclick=function(){exportCustomers()};
  wireImport();
  $('#cform').onsubmit=function(e){
    e.preventDefault();var id=$('#cid').value;
    var o={name:titleCase($('#cn').value),nameHi:$('#cnh').value.trim(),phone:cleanPhone($('#cp').value),address:$('#ca').value.trim(),phones:[]};
    var bad=false,seenN={};if(o.phone)seenN[o.phone]=1;
    box.querySelectorAll('.xrow').forEach(function(r){var n=cleanPhone(r.querySelector('.xn').value);if(!n)return;if(phoneErr(n)){bad=true;r.querySelector('.xn').focus();return}if(seenN[n])return;seenN[n]=1;o.phones.push({t:r.querySelector('.xt').value,n:n})});
    if(bad){toast(t('Phone number must be 10 digits'));return}
    if(!o.name&&!o.nameHi){toast(t('Enter the customer name'));return}
    (function(b){o.name=titleCase(b.name);o.nameHi=b.nameHi})(bothNames(o.name,o.nameHi));
    if(phoneErr(o.phone)){$('#cperr').hidden=false;$('#cp').focus();toast(t('Phone number must be 10 digits'));return}
    var dup=o.phone&&db.clients.find(function(c){return c.phone===o.phone&&c.id!==$('#cid').value});
    if(dup){toast(t('This number already belongs to')+' '+nm(dup));return}
    var rec=id?Object.assign({},clientById(id),o):Object.assign({id:uid(),created:today()},o);
    guard($('#csave'),function(){return upsert('clients',clientRow(rec)).then(function(){if(id)Object.assign(clientById(id),rec);else db.clients.push(rec);toast(t(id?'Customer updated':'Customer added'));render()}).catch(fail)});
  };
  box.onclick=function(e){
    var ed=e.target.closest('[data-edit]'),h=e.target.closest('[data-hist]');
    if(ed){var c=clientById(ed.dataset.edit);$('#cid').value=c.id;$('#cn').value=c.name;$('#cnh').value=c.nameHi||HN[c.name]||'';$('#cp').value=c.phone;$('#ca').value=c.address||'';$('#cxtra').innerHTML='';(c.phones||[]).forEach(function(x){addXtra(x.t,x.n)});$('#ctitle').textContent=t('Edit customer');$('#csave').textContent=t('Save changes');$('#cimpbtn').hidden=true;$('#importPanel').hidden=true;$('#cform').hidden=false;openForm();$('#cdel').hidden=false;$('#cdel').onclick=function(){deleteCustomer(c.id,this)};$('#cn').focus()}
    var ac=e.target.closest('[data-acct]');if(ac)showLedger(ac.dataset.acct);
    if(h){var hc=db.clients.find(function(x){return x.name===h.dataset.hist});hist=Object.assign(defaultHist(),{from:'',to:'',client:hc?hc.id:'all',q:hc?'':h.dataset.hist,keep:true});location.hash='bills'}
  };
}


/* Excel export: builds a real .xlsx (zip of XML) with no library */
var CRC=(function(){var t=[],c,n,k;for(n=0;n<256;n++){c=n;for(k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;t[n]=c>>>0}return function(b){var x=0xFFFFFFFF;for(var i=0;i<b.length;i++)x=t[(x^b[i])&255]^(x>>>8);return (x^0xFFFFFFFF)>>>0}})();
function zipStore(files){
  var enc=new TextEncoder(),parts=[],cd=[],off=0;
  function u16(v){return [v&255,(v>>8)&255]}function u32(v){return [v&255,(v>>8)&255,(v>>16)&255,(v>>>24)&255]}
  files.forEach(function(f){
    var nb=enc.encode(f.name),db_=enc.encode(f.data),crc=CRC(db_);
    var lh=new Uint8Array([0x50,0x4b,3,4].concat(u16(20),u16(0x0800),u16(0),u16(0),u16(0x21),u32(crc),u32(db_.length),u32(db_.length),u16(nb.length),u16(0)));
    parts.push(lh,nb,db_);
    cd.push(new Uint8Array([0x50,0x4b,1,2].concat(u16(20),u16(20),u16(0x0800),u16(0),u16(0),u16(0x21),u32(crc),u32(db_.length),u32(db_.length),u16(nb.length),u16(0),u16(0),u16(0),u16(0),u32(0),u32(off))),nb);
    off+=lh.length+nb.length+db_.length;
  });
  var cdLen=0;cd.forEach(function(x){cdLen+=x.length});
  var end=new Uint8Array([0x50,0x4b,5,6].concat(u16(0),u16(0),u16(files.length),u16(files.length),u32(cdLen),u32(off),u16(0)));
  return new Blob(parts.concat(cd,[end]),{type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'});
}
function xlsxBlob(rows,sheet,opts){
  function col(i){var s2='';i++;while(i>0){var m=(i-1)%26;s2=String.fromCharCode(65+m)+s2;i=Math.floor((i-1)/26)}return s2}
  function x(v){return String(v).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]}).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g,'')}
  var data=rows.map(function(r,ri){return '<row r="'+(ri+1)+'">'+r.map(function(v,ci){
    var ref=col(ci)+(ri+1);
    if(typeof v==='number')return '<c r="'+ref+'"><v>'+v+'</v></c>';
    return '<c r="'+ref+'" t="inlineStr"'+((ri===0||rows[ri].hdr)?' s="1"':'')+'><is><t xml:space="preserve">'+x(v)+'</t></is></c>'}).join('')+'</row>'}).join('');
  var ncol=rows[0].length,cols='<cols>'+rows[0].map(function(_,i){return '<col min="'+(i+1)+'" max="'+(i+1)+'" width="'+(i===0?26:i===4?34:18)+'" customWidth="1"/>'}).join('')+'</cols>';
  var H='<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
  var files=([
    {name:'[Content_Types].xml',data:H+'<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'},
    {name:'_rels/.rels',data:H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'},
    {name:'xl/workbook.xml',data:H+'<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="'+x(sheet)+'" sheetId="1" r:id="rId1"/></sheets></workbook>'},
    {name:'xl/_rels/workbook.xml.rels',data:H+'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'},
    {name:'xl/styles.xml',data:H+'<styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders><cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs><cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/><xf numFmtId="0" fontId="1" fillId="0" borderId="0" xfId="0" applyFont="1"/></cellXfs></styleSheet>'},
    {name:'xl/worksheets/sheet1.xml',data:H+'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews>'+cols+'<sheetData>'+data+'</sheetData></worksheet>'}
  ]);
  if(opts&&opts.lists&&opts.lists.length){
    var byName=function(n){return files.find(function(f){return f.name===n})},ns='http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet';
    byName('[Content_Types].xml').data=byName('[Content_Types].xml').data.replace('</Types>','<Override PartName="/xl/worksheets/sheet2.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/></Types>');
    byName('xl/workbook.xml').data=byName('xl/workbook.xml').data.replace('</sheets>','<sheet name="Lists" sheetId="2" r:id="rId3"/></sheets>');
    byName('xl/_rels/workbook.xml.rels').data=byName('xl/_rels/workbook.xml.rels').data.replace('</Relationships>','<Relationship Id="rId3" Type="'+ns+'" Target="worksheets/sheet2.xml"/></Relationships>');
    var dv='<dataValidations count="'+opts.validations.length+'">'+opts.validations.map(function(v){var n=opts.lists[v.list].length||1;return '<dataValidation type="list" allowBlank="1" showInputMessage="1" showErrorMessage="0" sqref="'+v.ref+'"><formula1>Lists!$'+col(v.list)+'$1:$'+col(v.list)+'$'+n+'</formula1></dataValidation>'}).join('')+'</dataValidations>';
    var sh1=byName('xl/worksheets/sheet1.xml');sh1.data=sh1.data.replace('</sheetData></worksheet>','</sheetData>'+dv+'</worksheet>');
    var maxN=Math.max.apply(null,opts.lists.map(function(l){return l.length}).concat([1])),lrows='';
    for(var r2i=0;r2i<maxN;r2i++){lrows+='<row r="'+(r2i+1)+'">'+opts.lists.map(function(l,ci){return l[r2i]==null?'':'<c r="'+col(ci)+(r2i+1)+'" t="inlineStr"><is><t xml:space="preserve">'+x(l[r2i])+'</t></is></c>'}).join('')+'</row>'}
    files.push({name:'xl/worksheets/sheet2.xml',data:H+'<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>'+lrows+'</sheetData></worksheet>'});
  }
  return zipStore(files);
}
function itemsSampleXlsx(){
  var rows=parseCSV(SAMPLE_ITEMS_CSV).map(function(r,ri){return ri===0?r:r.map(function(v,ci){return (ci===3||ci===5)&&v!==''&&!isNaN(+v)?+v:v})});
  var cats=db.categories.length?db.categories.slice():['Cosmetics','Bangles'];
  var units=['Piece','Dozen'].concat(db.units.map(function(u){return u.name}));
  db.items.forEach(function(i){if(i.unitName&&units.indexOf(i.unitName)<0)units.push(i.unitName)});
  return xlsxBlob(rows,'Products',{lists:[cats,units,units],validations:[{ref:'C2:C1000',list:0},{ref:'E2:E1000',list:1},{ref:'G2:G1000',list:2}]});
}
/* Read a .xlsx file (first sheet) and turn it into CSV text, so the same importers can read it */
function xlsxToCsv(buf){
  var u8=new Uint8Array(buf),dv=new DataView(buf),dec=new TextDecoder();
  var eocd=-1,k;for(k=u8.length-22;k>=0;k--){if(dv.getUint32(k,true)===0x06054b50){eocd=k;break}}
  if(eocd<0)return Promise.reject(new Error('not an xlsx'));
  var n=dv.getUint16(eocd+10,true),p=dv.getUint32(eocd+16,true),ents={},i;
  for(i=0;i<n;i++){
    var nl=dv.getUint16(p+28,true),el=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true);
    ents[dec.decode(u8.subarray(p+46,p+46+nl))]={m:dv.getUint16(p+10,true),cs:dv.getUint32(p+20,true),off:dv.getUint32(p+42,true)};
    p+=46+nl+el+cl;
  }
  function inflate(e){
    var lo=e.off,start=lo+30+dv.getUint16(lo+26,true)+dv.getUint16(lo+28,true),data=u8.subarray(start,start+e.cs);
    if(e.m===0)return Promise.resolve(dec.decode(data));
    var rs=new ReadableStream({start:function(c){c.enqueue(data);c.close()}}).pipeThrough(new DecompressionStream('deflate-raw'));
    return new Response(rs).arrayBuffer().then(function(b){return dec.decode(b)});
  }
  var names=Object.keys(ents),sheetName=ents['xl/worksheets/sheet1.xml']?'xl/worksheets/sheet1.xml':names.filter(function(x){return /^xl\/worksheets\/[^/]+\.xml$/.test(x)}).sort()[0];
  if(!sheetName)return Promise.reject(new Error('no sheet'));
  var P=function(x){return new DOMParser().parseFromString(x,'application/xml')};
  return Promise.all([inflate(ents[sheetName]),ents['xl/sharedStrings.xml']?inflate(ents['xl/sharedStrings.xml']):Promise.resolve('')]).then(function(r){
    var sst=[];if(r[1]){Array.prototype.forEach.call(P(r[1]).getElementsByTagName('si'),function(si){sst.push(Array.prototype.map.call(si.getElementsByTagName('t'),function(t2){return t2.textContent}).join(''))})}
    var out=[];
    Array.prototype.forEach.call(P(r[0]).getElementsByTagName('row'),function(row){
      var cells=[];
      Array.prototype.forEach.call(row.getElementsByTagName('c'),function(c){
        var ref=c.getAttribute('r')||'',m=/^([A-Z]+)/.exec(ref),ci=0;
        if(m){for(var q=0;q<m[1].length;q++)ci=ci*26+(m[1].charCodeAt(q)-64);ci--}else ci=cells.length;
        var ty=c.getAttribute('t'),v=c.getElementsByTagName('v')[0],txt='';
        if(ty==='s')txt=v?(sst[+v.textContent]||''):'';
        else if(ty==='inlineStr')txt=Array.prototype.map.call(c.getElementsByTagName('t'),function(t2){return t2.textContent}).join('');
        else txt=v?v.textContent:'';
        while(cells.length<ci)cells.push('');cells[ci]=txt;
      });
      out.push(cells);
    });
    return out.map(function(r2){return r2.map(function(v){v=String(v==null?'':v);return /[",\n\r]/.test(v)?'"'+v.replace(/"/g,'""')+'"':v}).join(',')}).join('\r\n');
  });
}
function loadSheetFile(f,ta){
  if(/\.xlsx$/i.test(f.name)){f.arrayBuffer().then(xlsxToCsv).then(function(txt){ta.value=txt}).catch(function(){toast(t('Could not read that Excel file. Save it as CSV and try again.'))});return}
  var r=new FileReader();r.onload=function(){ta.value=String(r.result)};r.readAsText(f);
}
function downloadSheet(rows,sheet,name){saveBlob(xlsxBlob(rows,sheet),'AV-'+name+'-'+today()+'.xlsx');toast(t('Downloaded'))}
function hdrRow(a){a.hdr=true;return a}
function statusLabel(b){return t({paid:'Paid',part:'Part paid',unpaid:'Unpaid',cancelled:'Cancelled'}[billState(b)])}
function exportBills(list){
  var rows=[['Bill','Date','Time','Customer','Phone','Products','Total','Paid','Due','Status','Payment']];
  list.forEach(function(b){rows.push([b.no,b.date,b.time,b.clientName,b.clientPhone||'',b.lines.map(function(l){return l.name+' '+qtyLabel(l)}).join('; '),r2(b.total),r2(paidOf(b)),r2(dueOf(b)),statusLabel(b),b.pay])});
  downloadSheet(rows,'Bill history','bill-history');
}
function exportItems(){
  var rows=[['Name','Name (Hindi)','Category','Price','Unit','Dozen price','Custom unit','Custom unit price','Stock','GST %','HSN code']];
  db.items.forEach(function(i){rows.push([i.name,hn(i)===i.name?'':hn(i),i.category||'',i.price,i.unit||'pc',i.dozenPrice===''?'':i.dozenPrice,i.unitName||'',i.unitPrice===''?'':i.unitPrice,stockState(i)==='na'?'':stockText(i),i.gst||'',i.hsn||''])});
  saveBlob(xlsxBlob(rows,'Products'),'AV-products-'+today()+'.xlsx');toast(t('Downloaded'));
}
function exportCustomers(){
  var stats={};db.bills.forEach(function(b){if(b.clientId&&b.status!=='cancelled'){var s2=stats[b.clientId]||(stats[b.clientId]={n:0,t:0,d:0});s2.n++;s2.t+=b.total;s2.d+=dueOf(b)}});
  var rows=[['Name','Name (Hindi)','WhatsApp number','Other numbers','Address','Created','Bills','Spent','Pending']];
  db.clients.forEach(function(c){var s2=stats[c.id]||{n:0,t:0,d:0};
    rows.push([c.name,c.nameHi||'',c.phone||'',(c.phones||[]).map(function(x){return x.t+': '+x.n}).join(', '),c.address||'',c.created||'',s2.n,r2(s2.t),r2(s2.d)])});
  saveBlob(xlsxBlob(rows,'Customers'),'AV-customers-'+today()+'.xlsx');toast(t('Customers list downloaded'));
}

/* Reports */
function qtySold(u){
  return Object.keys(u).sort(function(a,b){return a==='pc'?-1:b==='pc'?1:0}).map(function(k){var q=u[k];return q+' '+(k==='pc'?t(q===1?'pc':'pcs'):k==='doz'?t('dozen'):uLabel(k.slice(2)))}).join(', ');
}
/* Expenses: daily shop costs. Deleted ones go to the Bin like everything else. */
function defaultExp(){var r=histRange('month');return {q:'',from:r[0],to:r[1],custom:false}}
var expF=defaultExp();
function viewExpenses(box){
  var q=expF.q.trim().toLowerCase();
  var list=db.expenses.filter(function(e){
    if(expF.from&&e.date<expF.from)return false;if(expF.to&&e.date>expF.to)return false;
    return !q||(e.note||'').toLowerCase().indexOf(q)>-1;
  }).sort(function(a,b){return a.date<b.date?1:a.date>b.date?-1:0});
  var total=r2(list.reduce(function(s2,e){return s2+e.amount},0));
  var kpi=function(label,val,sub){return '<div class="kpi"><span class="muted">'+esc(label)+'</span><b class="big">'+val+'</b><span class="note">'+sub+'</span></div>'};
  box.innerHTML='<div class="stack"><div class="panel stack"><div class="row" style="justify-content:space-between"><h2>'+esc(t('Expenses'))+'</h2><button class="small primary" type="button" id="enew">+ '+esc(t('Add expense'))+'</button></div>'+
  '<div class="row" id="efilters"><input class="srch" id="eq" placeholder="'+esc(t('Search'))+'" aria-label="'+esc(t('Search'))+'" value="'+esc(expF.q)+'">'+rangeSel('erg',expF)+'</div>'+
  '<div class="row" id="ecustom"'+(expF.custom?'':' hidden')+'><label class="grow sm">'+esc(t('From'))+'<input id="ef" type="date" value="'+expF.from+'"></label><label class="grow sm">'+esc(t('To'))+'<input id="et" type="date" value="'+expF.to+'"></label></div>'+
  '<div class="kpis ekpi">'+kpi(t('Total expenses'),money(total),list.length+' '+esc(t('Entries')))+'</div></div>'+
  '<div class="panel stack">'+(list.length?'<div class="tablewrap"><table class="exprows"><thead><tr><th>'+esc(t('Date'))+'</th><th>'+esc(t('Details'))+'</th><th class="num">'+esc(t('Amount'))+'</th><th></th></tr></thead><tbody>'+
    list.map(function(e){return '<tr><td>'+e.date+'</td><td><b>'+esc(e.note||'–')+'</b></td><td class="num">'+money(e.amount)+'</td><td class="row"><button class="small" data-eedit="'+e.id+'">'+esc(t('Edit'))+'</button><button class="small danger" data-edel="'+e.id+'">'+esc(t('Delete'))+'</button></td></tr>'}).join('')+'</tbody></table></div>':'<p class="muted">'+esc(t('No expenses in this period. Add one with the + Add expense button.'))+'</p>')+'</div></div>'+
  '<div class="stack" id="eside" hidden><div class="popcard"><button type="button" id="eclose" class="xclose" aria-label="'+esc(t('Cancel'))+'" title="'+esc(t('Cancel'))+'">✕</button><form class="panel stack" id="eform"><h2 id="etitle">'+esc(t('Add expense'))+'</h2><input type="hidden" id="eid">'+
  '<div class="row"><label class="grow">'+esc(t('Date'))+'<input id="ed" type="date"></label><label class="grow">'+esc(t('Amount'))+' (₹)<input id="ea" inputmode="decimal"></label></div>'+
  '<label>'+esc(t('Details'))+'<input id="en" placeholder="'+esc(t('What was it for? (optional)'))+'"></label>'+
  '<button class="primary" type="submit" id="esave">'+esc(t('Save'))+'</button></form></div></div>';
  var upd=function(){expF.q=$('#eq').value;expF.from=$('#ef').value;expF.to=$('#et').value;viewExpenses(box);var el=$('#eq');if(el&&document.activeElement!==el){}};
  $('#eq').addEventListener('change',upd);$('#eq').addEventListener('input',function(){expF.q=this.value;clearTimeout(upd.t);upd.t=setTimeout(function(){var pos=$('#eq').selectionStart;viewExpenses(box);var el=$('#eq');el.focus();try{el.setSelectionRange(pos,pos)}catch(x){}},250)});
  ['#ef','#et'].forEach(function(x){$(x).addEventListener('change',upd)});
  $('#erg').onchange=function(){var k=this.value;if(k==='custom'){expF.custom=true;viewExpenses(box);return}var r=histRange(k);expF.custom=false;expF.from=r[0];expF.to=r[1];viewExpenses(box)};
  var open=function(e){
    $('#eside').hidden=false;$('#eid').value=e?e.id:'';$('#etitle').textContent=t(e?'Edit expense':'Add expense');
    $('#ed').value=e?e.date:today();$('#ea').value=e?e.amount:'';$('#en').value=e?e.note:'';
    $('#ea').focus();
  };
  $('#enew').onclick=function(){open(null)};
  $('#eclose').onclick=function(){$('#eside').hidden=true};
  $('#eside').onclick=function(e){if(e.target===this)this.hidden=true};
  $('#eform').onsubmit=function(ev){
    ev.preventDefault();
    var amt=parseFloat(String($('#ea').value).replace(/,/g,'')),d0=$('#ed').value;
    if(!(amt>0)){toast(t('Enter a valid amount'));$('#ea').focus();return}
    if(!d0){toast(t('Choose the date'));return}
    var id=$('#eid').value,rec={id:id||uid(),date:d0,amount:r2(amt),note:$('#en').value.trim()};
    guard($('#esave'),function(){return upsert('expenses',expRow(rec)).then(function(){
      if(id){var old=db.expenses.find(function(x){return x.id===id});if(old)Object.assign(old,rec)}else db.expenses.push(rec);
      toast(t(id?'Expense updated':'Expense added'));viewExpenses(box);
    }).catch(fail)});
  };
  box.onclick=function(ev){
    var ed=ev.target.closest('[data-eedit]'),dl=ev.target.closest('[data-edel]');
    if(ed){open(db.expenses.find(function(x){return x.id===ed.dataset.eedit}))}
    if(dl)twice(dl,t('Sure?'),function(){var e=db.expenses.find(function(x){return x.id===dl.dataset.edel});binSet('expenses','id',e.id,new Date().toISOString()).then(function(){db.expenses=db.expenses.filter(function(x){return x!==e});toBin('expense',e.id,e.note||'Expense',e);toast(t('Moved to Bin'));viewExpenses(box)},fail)});
  };
  document.onkeydown=function(e){if(e.key==='Escape'&&$('#eside')&&!$('#eside').hidden)$('#eside').hidden=true};
}

function defaultRep(){var d=today();return {from:d,to:d,custom:false}}
var repF=defaultRep();
function viewReports(box){
  var ok=db.bills.filter(function(b){return b.status!=='cancelled'});
  var inR=function(d){return (!repF.from||d>=repF.from)&&(!repF.to||d<=repF.to)};
  var rb=ok.filter(function(b){return inR(b.date)});
  var sales=r2(rb.reduce(function(s2,b){return s2+b.total},0)),due=r2(rb.reduce(function(s2,b){return s2+dueOf(b)},0));
  var dueAll=r2(ok.reduce(function(s2,b){return s2+dueOf(b)},0));
  var byPay={},collected=0,npay=0;
  ok.forEach(function(b){(b.payments||[]).forEach(function(p){if(inR(p.date)){byPay[p.mode]=(byPay[p.mode]||0)+p.amount;collected+=p.amount;npay++}})});
  collected=r2(collected);
  var day={},dayDue={},mon={},monDue={},items={};
  rb.forEach(function(b){
    day[b.date]=(day[b.date]||0)+b.total;dayDue[b.date]=r2((dayDue[b.date]||0)+dueOf(b));
    var mk=b.date.slice(0,7);mon[mk]=(mon[mk]||0)+b.total;monDue[mk]=r2((monDue[mk]||0)+dueOf(b));
    b.lines.forEach(function(l){var x=items[l.name]||(items[l.name]={u:{},t:0,h:l.nameHi||HN[l.name]||''});var uk=(l.unit==='custom'&&l.unitName)?'c:'+l.unitName:(l.unit||'pc');x.u[uk]=(x.u[uk]||0)+l.qty;x.t+=l.total});
  });
  var days=Object.keys(day).sort().reverse().slice(0,31),maxD=Math.max.apply(null,days.map(function(d){return day[d]}).concat([1]));
  var months=Object.keys(mon).sort().reverse(),maxM=Math.max.apply(null,months.map(function(m){return mon[m]}).concat([1]));
  var il=Object.keys(items).sort(function(a,c){return items[c].t-items[a].t}),maxI=Math.max.apply(null,il.map(function(k){return items[k].t}).concat([1])),totI=il.reduce(function(s2,k){return s2+items[k].t},0)||1;
  var expR=db.expenses.filter(function(e){return inR(e.date)}),expTot=r2(expR.reduce(function(s2,e){return s2+e.amount},0)),profit=r2(sales-expTot);
  var kpi=function(label,val,sub,cls){return '<div class="kpi'+(cls?' '+cls:'')+'"><span class="muted">'+esc(label)+'</span><b class="big">'+val+'</b><span class="note">'+sub+'</span></div>'};
  var row=function(name,note,frac,amount,side,warn){return '<div class="rrow"><div class="rname"><b>'+name+'</b>'+(note?'<div class="note">'+note+'</div>':'')+'</div><div class="rtrack"><div class="rfill" style="width:'+Math.max(2,Math.round(frac*100))+'%"></div></div><div class="ramt">'+amount+'</div><div class="rside'+(warn?' warn':' muted')+'">'+side+'</div></div>'};
  var none='<p class="muted">'+esc(t('Nothing to show yet. Save a bill and the figures appear here.'))+'</p>';
  var modes=['cash','UPI','card','other'],modeCls={cash:'m-cash',UPI:'m-upi',card:'m-card',other:'m-other'};
  var modeBar=collected>0?'<div class="modebar">'+modes.filter(function(m){return byPay[m]>0}).map(function(m){return '<span class="'+modeCls[m]+'" style="width:'+(byPay[m]/collected*100)+'%"></span>'}).join('')+'</div>':'';
  var legend='<div class="modelegend">'+modes.map(function(m){var v=r2(byPay[m]||0);return '<div class="modeitem"><span class="dot '+modeCls[m]+'"></span><div><div class="muted">'+esc(t(m))+'</div><b>'+money(v)+'</b>'+(collected>0&&v>0?' <span class="note">'+Math.round(v/collected*100)+'%</span>':'')+'</div></div>'}).join('')+'</div>';
  box.innerHTML='<div class="stack">'+
  '<div class="panel stack"><div class="row rhd" style="justify-content:space-between"><h2>'+esc(t('Reports'))+'</h2><div class="row" id="rfilters">'+rangeSel('rrg',repF)+''+xlBtn('rxl')+'</div></div>'+
  '<div class="row" id="rcustom"'+(repF.custom?'':' hidden')+'><label class="grow sm">'+esc(t('From'))+'<input id="rf" type="date" value="'+repF.from+'"></label><label class="grow sm">'+esc(t('To'))+'<input id="rt" type="date" value="'+repF.to+'"></label></div>'+
  '<div class="kpis">'+kpi(t('Sales'),money(sales),rb.length+' '+esc(t('Bills')))+kpi(t('Collected'),money(collected),npay+' '+esc(t('Payments')))+kpi(t('Pending'),money(due),esc(t('in this period')),due>0?'warnc':'')+kpi(t('Total pending'),money(dueAll),esc(t('All time')),dueAll>0?'warnc':'')+kpi(t('Expenses'),money(expTot),expR.length+' '+esc(t('Entries')))+kpi(t('Final Sales'),money(profit),esc(t('Sales'))+' \u2212 '+esc(t('Expenses')),profit<0?'warnc':'')+'</div>'+
  '</div>'+
  '<div class="panel stack"><h2>'+esc(t('Collected by payment mode'))+'</h2>'+(collected>0?modeBar:'<p class="muted">'+esc(t('No payments in this period.'))+'</p>')+legend+'<p class="note">'+esc(t('At closing, check the cash and UPI figures against your drawer and your UPI app.'))+'</p></div>'+
  '<div class="cols"><div class="panel stack"><h2>'+esc(t('Daily sales'))+'</h2>'+(days.length?'<div class="rhead"><span>'+esc(t('Date'))+'</span><span></span><span>'+esc(t('Sales'))+'</span><span>'+esc(t('Pending'))+'</span></div>'+days.map(function(d){return row(d,'',day[d]/maxD,money(day[d]),money(dayDue[d]||0),(dayDue[d]||0)>0)}).join(''):none)+'</div>'+
  '<div class="panel stack"><h2>'+esc(t('Monthly sales'))+'</h2>'+(months.length?'<div class="rhead"><span>'+esc(t('Month'))+'</span><span></span><span>'+esc(t('Sales'))+'</span><span>'+esc(t('Pending'))+'</span></div>'+months.map(function(m){return row(m,'',mon[m]/maxM,money(mon[m]),money(monDue[m]||0),(monDue[m]||0)>0)}).join(''):none)+'</div></div>'+
  '<div class="panel stack"><h2>'+esc(t('Product-wise sales'))+'</h2>'+(il.length?'<div class="rhead"><span>'+esc(t('Product'))+'</span><span></span><span>'+esc(t('Sales'))+'</span><span>%</span></div>'+il.map(function(k){return row(esc(lang==='hi'?(items[k].h||HN[k]||tr(k)):k),esc(qtySold(items[k].u)),items[k].t/maxI,money(items[k].t),Math.round(items[k].t/totI*100)+'%',false)}).join(''):none)+'<p class="note">'+esc(t('Cancelled bills are left out of every figure.'))+'</p></div></div>';
  $('#rxl').onclick=function(){
    var rows=[hdrRow(['Report','From','To']),['AV Cosmetics & Bangle Store',repF.from||'',repF.to||''],[],hdrRow(['Summary','Amount','Details']),
      ['Sales',sales,rb.length+' bills'],['Collected',collected,npay+' payments'],['Pending (this period)',due,''],['Total pending (all time)',dueAll,''],['Expenses',expTot,expR.length+' entries'],['Final Sales (Sales - Expenses)',profit,''],[],
      hdrRow(['Collected by payment mode','Amount','Share'])].concat(modes.map(function(m){var v=r2(byPay[m]||0);return [m,v,collected>0?Math.round(v/collected*100)+'%':'']}),[[],hdrRow(['Daily sales','Sales','Pending'])],
      days.map(function(d){return [d,r2(day[d]),r2(dayDue[d]||0)]}),[[],hdrRow(['Monthly sales','Sales','Pending'])],
      months.map(function(m){return [m,r2(mon[m]),r2(monDue[m]||0)]}),[[],hdrRow(['Product','Quantity sold','Sales'])],
      il.map(function(k){return [k,qtySold(items[k].u),r2(items[k].t)]}));
    downloadSheet(rows,'Reports','reports');
  };
  var upd=function(){repF.from=$('#rf').value;repF.to=$('#rt').value;viewReports(box)};
  ['#rf','#rt'].forEach(function(x){$(x).addEventListener('change',upd)});
  $('#rrg').onchange=function(){
    var k=this.value;
    if(k==='custom'){repF.custom=true;viewReports(box);return}
    var r=histRange(k);repF.custom=false;repF.from=r[0];repF.to=r[1];viewReports(box);
  };
}

/* Backup */
function viewBackup(box){
  box.innerHTML='<div class="cols"><div class="panel stack"><h2>'+esc(t('Back up'))+'</h2><p class="muted">'+esc(t('Copy all products, customers and bills as one block of text. Paste it into a note or a file and keep it in Google Drive or on a computer. Do this at least once a week.'))+'</p>'+
  '<div class="row"><button class="primary" id="bk">'+esc(t('Copy backup'))+'</button><button id="bshow">'+esc(t('Show backup text'))+'</button></div><textarea id="bta" hidden readonly aria-label="'+esc(t('Show backup text'))+'"></textarea>'+
  '<p class="note">'+esc(t('Your data is saved in the cloud database. Everyone you add as a user can sign in and see it. The backup contains customer phone numbers, so keep it private.'))+'</p></div>'+
  '<div class="panel stack"><h2>'+esc(t('Restore'))+'</h2><p class="muted">'+esc(t('Pick a saved backup file, or paste the backup text below. The backup is added to the database.'))+'</p>'+
  '<input type="file" id="bf" accept=".json,.txt,text/plain,application/json" aria-label="'+esc(t('Restore'))+'"><textarea id="rta" placeholder="'+esc(t('Paste backup text here'))+'" aria-label="'+esc(t('Paste backup text here'))+'"></textarea>'+
  '<div class="row"><button class="primary" id="rs">'+esc(t('Restore from text'))+'</button><button id="wipe">'+esc(t('Refresh data'))+'</button></div><p class="note">'+esc(t('Restoring adds the backup to the database. Products, customers and bills that already exist are skipped.'))+'</p></div></div>';
  var data=function(){return JSON.stringify(Object.assign({},db,{bin:[]}))};
  $('#bk').onclick=function(){copy(data(),t('Backup copied'))};
  $('#bshow').onclick=function(){var x=$('#bta');x.value=data();x.hidden=false;x.select()};
  $('#bf').onchange=function(e){var f=e.target.files[0];if(!f)return;var r=new FileReader();r.onload=function(){$('#rta').value=String(r.result)};r.readAsText(f)};
  $('#rs').onclick=function(){var b=$('#rs');twice(b,t('Add this backup to the database?'),function(){
    var d;try{d=JSON.parse($('#rta').value);if(!d||!Array.isArray(d.items)||!Array.isArray(d.bills)||!Array.isArray(d.clients))throw 0}catch(x){toast(t('That text is not a valid backup'));return}
    guard(b,function(){return rpc('import_backup',{d:d}).then(function(r){return loadAll().then(function(){toast(t('Imported')+': '+r.bills+' '+t('Bills')+', '+r.items+' '+t('Products')+', '+r.clients+' '+t('Customers'));render()})}).catch(fail)});
  })};
  $('#wipe').onclick=function(){guard($('#wipe'),function(){return loadAll().then(function(){toast(t('Data refreshed'));render()}).catch(fail)})};
}

/* Customer import: parse a CSV file (Name, Mobile Number, Address) */
var SAMPLE_CSV='Name,WhatsApp Number,Other Numbers,Address\r\nPriya Sharma,"9876500011, 8876567786","9876500033, 9898765434",Lajpat Nagar\r\nAnita Verma,9876500022,7867786534,Karol Bagh\r\nSunita Devi,6565764523,,Lal Ganj\r\n';
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
  var hasHeader=h.some(function(x){return /name|mobile|phone|address|whatsapp/.test(x)});
  var iN=0,iP=1,iA=2,iO=-1;
  if(hasHeader){
    iN=h.findIndex(function(x){return /name/.test(x)&&!/other/.test(x)});iO=h.findIndex(function(x){return /other|alternate|extra/.test(x)});
    iP=h.findIndex(function(x,i){return i!==iO&&/whatsapp|mobile|phone|number/.test(x)});iA=h.findIndex(function(x){return /address/.test(x)});
    if(iN<0)iN=0;rows=rows.slice(1);
  }
  var seen={};db.clients.forEach(function(c){if(c.phone)seen[c.phone]=1});
  rows.forEach(function(r,k){
    var line=k+(hasHeader?2:1),bn=bothNames(r[iN]||'',''),name=titleCase(bn.name),waToks=String(iP>=0?(r[iP]||''):'').split(/[,;|\/]+/).filter(function(x){return /\d/.test(x)}),ph=cleanPhone((waToks[0]||'').replace(/[^\d]/g,'')),ad=iA>=0?(r[iA]||'').trim():'';
    if(!name){res.skipped.push(t('Row')+' '+line+': '+t('no name'));return}
    if(phoneErr(ph)){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('mobile number must be 10 digits'));return}
    if(ph&&seen[ph]){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('mobile number already exists'));return}
    if(ph)seen[ph]=1;
    var extra=[],xs={};if(ph)xs[ph]=1;
    waToks.slice(1).forEach(function(tok){var n=cleanPhone(tok.replace(/[^\d]/g,''));if(n.length!==10||xs[n])return;xs[n]=1;extra.push({t:'WA',n:n})});
    String(iO>=0?(r[iO]||''):'').split(/[,;|\/]+/).forEach(function(tok){var n=cleanPhone(tok.replace(/[^\d]/g,''));if(n.length!==10||xs[n])return;xs[n]=1;extra.push({t:/wa|whats/i.test(tok)?'WA':'Mob',n:n})});
    res.added.push({id:uid(),name:name,nameHi:bn.nameHi,phone:ph,phones:extra,address:ad,created:today()});
  });
  return res;
}
function sqlLit(v){
  if(v===null||v===undefined)return 'NULL';
  if(typeof v==='number')return String(v);
  if(typeof v==='boolean')return v?'true':'false';
  if(v&&v.raw!==undefined)return v.raw;
  return "'"+String(v).replace(/'/g,"''")+"'";
}
function sqlInsert(table,cols,rows,conflict){
  var vals=rows.map(function(r){return '  ('+cols.map(function(c){return sqlLit(r[c])}).join(', ')+')'}).join(',\n');
  var upd=cols.filter(function(c){return c!==conflict}).map(function(c){return c+' = excluded.'+c}).join(', ');
  return 'insert into public.'+table+' ('+cols.join(', ')+')\nvalues\n'+vals+'\non conflict ('+conflict+') do update set '+upd+';';
}
function itemsSql(res){
  var cols=['id','name','name_hi','category','price','dozen_price','unit','unit_name','unit_qty','unit_price','gst','hsn','allow_dozen','rate_pc','stock_unit','active','stock'];
  var out=res.cats.length?sqlInsert('categories',['name','deleted_at'],res.cats.map(function(n){return {name:n,deleted_at:null}}),'name')+'\n\n':'';
  return out+sqlInsert('items',cols,res.added.map(function(i){var r=itemRow(i);if(r.stock===undefined)r.stock=null;return r}),'id');
}
function clientsSql(res){
  var cols=['id','name','name_hi','phone','phones','address'];
  return sqlInsert('clients',cols,res.added.map(function(c){var r=clientRow(c);r.phones={raw:sqlLit(JSON.stringify(c.phones||[]))+'::jsonb'};return r}),'id');
}
function wireImport(){
  $('#csvSample').onclick=function(){
    var b=new Blob(['\uFEFF'+SAMPLE_CSV],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download='customers-sample.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);
  };
  var fileText='';
  var text=function(){return $('#csvText').value.trim()?$('#csvText').value:fileText};
  var preview=function(){
    var tx=text(),box=$('#csvSql');if(!tx.trim()){box.hidden=true;return}
    var res=readCustomers(tx);$('#csvSqlPre').textContent=res.added.length?clientsSql(res):'-- '+t('Nothing to add');
    $('#csvSqlNote').textContent=res.skipped.length?t('Skipped')+': '+res.skipped.length+'\n'+res.skipped.slice(0,10).join('\n'):'';box.hidden=false;
  };
  $('#csvText').addEventListener('input',preview);
  $('#csvFile').onchange=function(e){var f=e.target.files[0];if(f)loadSheetFile(f,{set value(v){fileText=v;$('#csvText').value='';preview()}})};
  $('#csvGo').onclick=function(){
    var res=readCustomers(text());
    if(!res.added.length&&!res.skipped.length){toast(t('Choose a CSV file or paste the rows first'));return}
    guard($('#csvGo'),function(){
      var batches=[];for(var i=0;i<res.added.length;i+=200)batches.push(res.added.slice(i,i+200));
      return batches.reduce(function(p,b){return p.then(function(){return rest('POST','/rest/v1/clients?on_conflict=id',b.map(clientRow),'resolution=merge-duplicates,return=minimal')})},Promise.resolve()).then(function(){
        db.clients=db.clients.concat(res.added);fileText='';render();
        var box=$('#csvRes');
        if(box)box.innerHTML='<b class="good-text">'+esc(t('Added'))+': '+res.added.length+'</b>'+(res.skipped.length?'<br><b>'+esc(t('Skipped'))+': '+res.skipped.length+'</b><br>'+res.skipped.slice(0,20).map(esc).join('<br>')+(res.skipped.length>20?'<br>\u2026':''):'');
        toast(t('Added')+': '+res.added.length);
      }).catch(fail);
    });
  };
}

/* Items import: parse a CSV file (see the sample for the columns) */
var SAMPLE_ITEMS_CSV='Name,Hindi Name,Category,Price per Unit,Unit Name,Stock,Stock Unit\r\n'+
  'Matte Lipstick,\u092E\u0948\u091F \u0932\u093F\u092A\u0938\u094D\u091F\u093F\u0915,Cosmetics,10,Piece,24,Dozen\r\n'+
  'Kajal,\u0915\u093E\u091C\u0932,Cosmetics,45,Piece,20,Dozen\r\n'+
  'Glass Bangles,\u0915\u093E\u0901\u091A \u0915\u0940 \u091A\u0942\u0921\u093C\u093F\u092F\u093E\u0901,Bangles,150,Toda,10,Toda\r\n'+
  'Silk Thread Bangles,,Bangles,200,Toda,60,Toda\r\n';
function colKey(n){
  if(/hindi/.test(n))return 'nameHi';
  if(/stockunit|unitofstock/.test(n))return 'stockUnit';
  if(/alsosell|sellindozen|sellindoz|allowdozen/.test(n))return 'allowDozen';
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
  if(map.name==null&&map.nameHi==null){res.skipped.push(t('Row')+' 1: '+t('no name'));return res}
  var num=function(v){var x=parseFloat(String(v==null?'':v).replace(/[^\d.\-]/g,''));return isNaN(x)?NaN:x};
  var get=function(r,k){return map[k]==null?'':String(r[map[k]]==null?'':r[map[k]]).trim()};
  var seen={};db.items.forEach(function(i){seen[i.name.toLowerCase()]=1});
  var cats=db.categories.slice();
  rows.slice(1).forEach(function(r,k){
    var bn=bothNames(get(r,'name'),get(r,'nameHi')),line=k+2,name=bn.name;
    if(!name){res.skipped.push(t('Row')+' '+line+': '+t('no name'));return}
    if(seen[name.toLowerCase()]){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('product already exists'));return}
    var pp=num(get(r,'price')),dp=num(get(r,'dozen')),up=num(get(r,'unitPrice')),uq=parseInt(get(r,'unitQty'),10)||0,un=get(r,'unitName'),si=get(r,'soldIn').toLowerCase();
    if(map.soldIn==null&&un){
      /* simple sheet: the Unit Name says how the product is sold, Price per Unit is the price of that unit */
      if(/^(pc|pcs|piece|pieces)$/i.test(un)){un='';si='piece';if(!(pp>=0))pp=up;up=NaN}
      else if(/^(doz|dozen|dozens)$/i.test(un)){un='';si='dozen';if(!(dp>=0))dp=up;up=NaN}
      else si='manual';
    }
    var custom=!!un;
    if(!(pp>=0)&&!(dp>=0)&&!(custom&&up>=0)){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('no price'));return}
    var unit='pc';
    if(/manual|custom|own/.test(si)){if(!custom){res.skipped.push(t('Row')+' '+line+': '+name+' - '+t('Manual unit needs the unit name'));return}unit='custom'}
    else if(/doz/.test(si))unit='doz';
    var wantDz=map.allowDozen==null?dp>=0:/^(y|yes|true|1|haan|ha|\u2713|x)$/i.test(get(r,'allowDozen'));
    if(!wantDz&&unit!=='doz')dp=NaN;
    var allowDz=unit!=='custom'&&(unit==='doz'||wantDz||dp>=0);
    var price=pp>=0?pp:(dp>=0?r2(dp/12):r2(up/(uq>=1?uq:1))),st=get(r,'stock'),cat=get(r,'category')||'Other',g=num(get(r,'gst'));
    var sus=get(r,'stockUnit').toLowerCase(),stHdr=map.stock!=null?String(rows[0][map.stock]).toLowerCase():'';
    var sUnit,sF;
    if(!sus&&/piece|pcs/.test(stHdr)&&map.stockUnit==null){sUnit='pc';sF=1}
    else if(/doz/.test(sus)){sUnit='doz';sF=12}
    else if(/^(pc|pcs|piece|pieces)$/.test(sus)){sUnit='pc';sF=1}
    else if(sus&&custom&&sus===un.toLowerCase()){sUnit=un;sF=uq>=1?uq:1}
    else if(sus){sUnit=sus;sF=1}
    else if(unit==='custom'){sUnit=un;sF=uq>=1?uq:1}
    else{sUnit='doz';sF=12}
    var stNum=num(st);
    seen[name.toLowerCase()]=1;
    if(cats.indexOf(cat)<0){cats.push(cat);res.cats.push(cat)}
    res.added.push({id:uid(),name:name,nameHi:bn.nameHi,category:cat,price:price,dozenPrice:dp>=0?dp:'',allowDozen:allowDz,unit:unit,unitName:custom?un:'',unitQty:custom&&uq>=1?uq:1,unitPrice:(custom&&up>=0)?up:'',gst:g>=0?g:0,hsn:get(r,'hsn'),stock:(st===''||isNaN(stNum))?'':Math.max(0,Math.round(stNum*sF)),stockUnit:sUnit,active:true});
  });
  return res;
}
function wireItemImport(){
  $('#itemSample').onclick=function(){
    var b=new Blob(['\uFEFF'+SAMPLE_ITEMS_CSV],{type:'text/csv;charset=utf-8'}),u=URL.createObjectURL(b),a=document.createElement('a');
    a.href=u;a.download='items-sample.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(function(){URL.revokeObjectURL(u)},1000);
  };
  $('#itemSampleX').onclick=function(){saveBlob(itemsSampleXlsx(),'products-sample.xlsx')};
  var fileText='';
  var text=function(){return $('#itemText').value.trim()?$('#itemText').value:fileText};
  var preview=function(){
    var tx=text(),box=$('#itemSql');if(!tx.trim()){box.hidden=true;return}
    var res=readItems(tx);$('#itemSqlPre').textContent=res.added.length?itemsSql(res):'-- '+t('Nothing to add');
    $('#itemSqlNote').textContent=res.skipped.length?t('Skipped')+': '+res.skipped.length+'\n'+res.skipped.slice(0,10).join('\n'):'';box.hidden=false;
  };
  $('#itemText').addEventListener('input',preview);
  $('#itemFile').onchange=function(e){var f=e.target.files[0];if(f)loadSheetFile(f,{set value(v){fileText=v;$('#itemText').value='';preview()}})};
  $('#itemGo').onclick=function(){
    var res=readItems(text());
    if(!res.added.length&&!res.skipped.length){toast(t('Choose a CSV file or paste the rows first'));return}
    guard($('#itemGo'),function(){
      var batches=[];for(var i=0;i<res.added.length;i+=200)batches.push(res.added.slice(i,i+200));
      var p=res.cats.length?rest('POST','/rest/v1/categories?on_conflict=name',res.cats.map(function(n){return {name:n,deleted_at:null}}),'resolution=merge-duplicates,return=minimal'):Promise.resolve();
      return batches.reduce(function(q,b){return q.then(function(){return rest('POST','/rest/v1/items?on_conflict=id',b.map(function(i){return itemRow(i)}),'resolution=merge-duplicates,return=minimal')})},p).then(function(){
        db.items=db.items.concat(res.added);res.cats.forEach(function(c){db.categories.push(c)});fileText='';render();
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
function binTable(e){return e.type==='item'?'items':e.type==='client'?'clients':e.type==='expense'?'expenses':'categories'}
function binCol(e){return e.type==='category'?'name':'id'}
var binSel={};
function binKey(e){return e.type+':'+e.id}
function binRestoreOne(e){
  return (e.type==='bill'?rpc('restore_bill',{p_bill:e.id}):binSet(binTable(e),binCol(e),e.id,null)).then(function(){
    db.bin=db.bin.filter(function(x){return x!==e});
    if(e.type==='item'){db.items.push(e.data);db.items.sort(function(a,b){return a.name<b.name?-1:1})}
    else if(e.type==='client'){db.clients.push(e.data);db.clients.sort(function(a,b){return a.name<b.name?-1:1})}
    else if(e.type==='bill'){db.bills.push(e.data);db.bills.sort(function(a,b){return a.no<b.no?-1:1});if(e.data.status!=='cancelled')e.data.lines.forEach(function(l){var it=itemById(l.itemId);if(it&&it.stock!==''&&it.stock!=null)it.stock=Math.max(0,it.stock-Math.round(l.qty*(l.factor||1)))})}
    else if(e.type==='expense'){db.expenses.push(e.data)}
    else db.categories.push(e.id);
    delete binSel[binKey(e)];
  });
}
function binPurgeOne(f){
  return (f.type==='bill'?rpc('purge_bill',{p_bill:f.id}):del(binTable(f),binCol(f),f.id)).then(function(){db.bin=db.bin.filter(function(x){return x!==f});delete binSel[binKey(f)]});
}
function binEach(arr,fn){return arr.reduce(function(p,e){return p.then(function(){return fn(e)})},Promise.resolve())}
function viewBin(box){
  var live=db.bin.filter(function(e){return binDays(e)>0});
  var kinds=[['all','All'],['item','Products'],['client','Customers'],['category','Categories'],['bill','Bills'],['expense','Expenses']];
  var cnt=function(k){return k==='all'?live.length:live.filter(function(e){return e.type===k}).length};
  var list=live.filter(function(e){return binF==='all'||e.type===binF}).sort(function(a,b){return a.at<b.at?1:-1});
  var typeName=function(e){return e.type==='item'?t('Product'):e.type==='client'?t('Customer'):e.type==='bill'?t('Bill'):e.type==='expense'?t('Expense'):t('Category')};
  var label=function(e){return e.type==='category'?tc(e.name):e.type==='expense'?(e.data.note||t('Expense'))+' \u00B7 '+e.data.date+' \u00B7 '+money(e.data.amount):e.type==='bill'?e.data.no+' · '+nm(e.data,'clientName','clientNameHi')+' · '+money(e.data.total):nm(e.data)};
  var liveKeys={};live.forEach(function(e){liveKeys[binKey(e)]=1});Object.keys(binSel).forEach(function(k){if(!liveKeys[k])delete binSel[k]});
  var picked=list.filter(function(e){return binSel[binKey(e)]}),allOn=list.length>0&&picked.length===list.length;
  box.innerHTML='<div class="panel stack"><h2>'+esc(t('Bin'))+'</h2>'+
  '<div class="row" style="align-items:center"><select id="bf" aria-label="'+esc(t('Type'))+'" style="max-width:260px">'+kinds.map(function(k){return '<option value="'+k[0]+'"'+(binF===k[0]?' selected':'')+'>'+esc(t(k[1]))+' ('+cnt(k[0])+')</option>'}).join('')+'</select>'+
  (list.length?'<label style="flex-direction:row;align-items:center;gap:8px;white-space:nowrap"><input type="checkbox" id="bsa" style="width:auto"'+(allOn?' checked':'')+'> '+esc(t('Select all'))+'</label>':'')+
  (picked.length?'<span class="muted">'+picked.length+' '+esc(t('selected'))+'</span><button class="small primary" id="brsel">'+esc(t('Restore selected'))+'</button><button class="small danger" id="bdsel">'+esc(t('Delete selected'))+'</button>':'')+'</div>'+
  (list.length?'<div class="tablewrap"><table><thead><tr><th style="width:36px"></th><th>'+esc(t('Type'))+'</th><th>'+esc(t('Name'))+'</th><th>'+esc(t('Deleted on'))+'</th><th class="num">'+esc(t('Days left'))+'</th><th></th></tr></thead><tbody>'+
    list.map(function(e,i){return '<tr><td><input type="checkbox" class="bchk" data-k="'+esc(binKey(e))+'" style="width:auto" aria-label="'+esc(t('Select'))+'"'+(binSel[binKey(e)]?' checked':'')+'></td><td>'+esc(typeName(e))+'</td><td><b>'+esc(label(e))+'</b>'+(e.type==='client'&&e.data.phone?'<div class="note">'+esc(e.data.phone)+'</div>':'')+'</td><td>'+fmtDay(e.at)+'</td><td class="num">'+binDays(e)+'</td><td class="row"><button class="small primary" data-rs="'+i+'">'+esc(t('Restore'))+'</button><button class="small danger" data-fd="'+i+'">'+esc(t('Delete forever'))+'</button></td></tr>'}).join('')+'</tbody></table></div>'
   :'<p class="muted">'+esc(t('The Bin is empty.'))+'</p>')+'</div>';
  $('#bf').onchange=function(){binF=this.value;viewBin(box)};
  var sa=$('#bsa');if(sa)sa.onchange=function(){list.forEach(function(e){if(this.checked)binSel[binKey(e)]=1;else delete binSel[binKey(e)]},this);viewBin(box)};
  box.querySelectorAll('.bchk').forEach(function(c){c.onchange=function(){if(c.checked)binSel[c.dataset.k]=1;else delete binSel[c.dataset.k];viewBin(box)}});
  var rsel=$('#brsel');if(rsel)rsel.onclick=function(){guard(rsel,function(){return binEach(picked,binRestoreOne).then(function(){toast(t('Restored')+': '+picked.length);render()}).catch(function(x){fail(x);render()})})};
  var dsel=$('#bdsel');if(dsel)dsel.onclick=function(){twice(dsel,t('Tap again to delete')+' '+picked.length,function(){guard(dsel,function(){return binEach(picked,binPurgeOne).then(function(){toast(t('Deleted for good')+': '+picked.length);render()}).catch(function(x){fail(x);render()})})})};
  box.onclick=function(ev){
    var rs=ev.target.closest('[data-rs]'),fd=ev.target.closest('[data-fd]');
    if(rs){var e=list[+rs.dataset.rs];guard(rs,function(){return binRestoreOne(e).then(function(){toast(t('Restored')+': '+label(e));render()}).catch(fail)})}
    if(fd){var f=list[+fd.dataset.fd];twice(fd,t('Sure?'),function(){binPurgeOne(f).then(function(){toast(t('Deleted for good'));render()},fail)})}
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
/* keep the header and tabs fixed at the top: tell the CSS how tall the header is, and mark when the page has scrolled */
(function(){
  var h=$('header');
  function set(){document.documentElement.style.setProperty('--hdr-h',h.offsetHeight+'px')}
  set();if(window.ResizeObserver)new ResizeObserver(set).observe(h);
  window.addEventListener('resize',set);
  window.addEventListener('scroll',function(){document.body.classList.toggle('scrolled',window.scrollY>2)},{passive:true});
})();
if(auth)startApp();else showLogin();
})();
