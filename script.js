// --- HTML Elementlerine Erişim ---
// Bu kısım, HTML dosyasındaki farklı elementlere JavaScript ile erişmemizi sağlar.
// Her bir değişken, ilgili HTML elementini temsil eder.
const dataInput = document.getElementById('dataInput'); // Veri girişi yapılan input alanı
const encodeButton = document.getElementById('encodeButton'); // "Veriyi Kodla" butonu
const inputError = document.getElementById('inputError'); // Giriş hatalarını gösteren alan
const encodedOutput = document.getElementById('encodedOutput'); // Kodlanmış bitlerin görsel olarak gösterildiği alan
const encodedText = document.getElementById('encodedText'); // Kodlanmış verinin metin olarak gösterildiği alan
const errorPositionInput = document.getElementById('errorPositionInput'); // Hata eklenecek bit konumunu belirten input alanı
const injectSingleErrorButton = document.getElementById('injectSingleErrorButton'); // "Tek Hata Ekle" butonu
const injectDoubleErrorButton = document.getElementById('injectDoubleErrorButton'); // "Çift Hata Ekle" butonu
const errorInjectionMessage = document.getElementById('errorInjectionMessage'); // Hata ekleme sonuç mesajı
const checkAndCorrectButton = document.getElementById('checkAndCorrectButton'); // "Kontrol Et ve Düzelt" butonu
const syndromeOutput = document.getElementById('syndromeOutput'); // Sendrom ve genel parity çıktısı
const correctionResult = document.getElementById('correctionResult'); // Hata düzeltme sonucu mesajı
const correctedOutput = document.getElementById('correctedOutput'); // Düzeltilmiş bitlerin görsel olarak gösterildiği alan

// --- Global Değişkenler ---
// Bu değişkenler, uygulamanın farklı fonksiyonları arasında bilgi paylaşımını sağlar.
let currentEncodedData = ''; // Şu anda ekranda olan kodlanmış veriyi tutar (hata eklenmiş haliyle değişebilir)
let lastErrorPositions = []; // Son eklenen hatanın/hataların konumlarını saklar (görsel vurgulama için)
let originalInputDataLength = 0; // Kullanıcının başlangıçta girdiği veri uzunluğunu saklar (8, 16 veya 32)

// --- Olay Dinleyicileri (Event Listeners) ---
// Bu kısım, butonlara tıklandığında hangi fonksiyonların çalışacağını belirler.
encodeButton.addEventListener('click', handleEncodeData); // Kodlama butonuna tıklandığında
injectSingleErrorButton.addEventListener('click', handleInjectSingleError); // Tek hata ekleme butonuna tıklandığında
injectDoubleErrorButton.addEventListener('click', handleInjectDoubleError); // Çift hata ekleme butonuna tıklandığında
checkAndCorrectButton.addEventListener('click', handleCheckAndCorrect); // Kontrol ve düzeltme butonuna tıklandığında


// --- Global Yardımcı Fonksiyonlar ---

/**
 * Veri bit uzunluğuna göre Hamming kodu için gerekli olan parity bitlerinin sayısını belirler.
 * Örneğin, 8 bit veri için 4 parity biti gerekir.
 * @param {number} dataLength Veri bitlerinin uzunluğu (8, 16, 32 olmalı)
 * @returns {number} Hesaplanan parity bitlerinin sayısı
 */
function getParityBitCount(dataLength) {
    if (dataLength === 8) return 4;
    if (dataLength === 16) return 5;
    if (dataLength === 32) return 6;
    return 0; // Geçersiz uzunluk için 0 döndürür
}

/**
 * Bir sayının 2'nin kuvveti olup olmadığını kontrol eder (örn. 1, 2, 4, 8...).
 * Hamming kodunda parity bitleri bu konumlara yerleşir.
 * @param {number} n Kontrol edilecek sayı
 * @returns {boolean} Sayı 2'nin kuvveti ise true, değilse false
 */
function isPowerOfTwo(n) {
    // Pozitif ve sadece bir bitin 1 olduğu sayılar 2'nin kuvvetidir.
    // (n & (n - 1)) işlemi, 2'nin kuvveti olan sayılar için 0 sonucunu verir.
    return n > 0 && (n & (n - 1)) === 0;
}

/**
 * Verilen bir bit dizisindeki belirli indekslerdeki bitlerin XOR toplamını hesaplar.
 * Bu, parity bitlerinin değerlerini veya sendrom bitlerini hesaplamak için kullanılır.
 * @param {string} bitString Bitlerin dizisi (örn. "10110010")
 * @param {number[]} indices Kontrol edilecek bit indeksleri (1'den başlayan konumlar)
 * @returns {number} Hesaplanan parity/sendrom değeri (0 veya 1)
 */
function calculateXORParity(bitString, indices) {
    let parity = 0;
    for (const index of indices) {
        // bitString 0'dan başlayan indekslemeyi kullanır,
        // ancak Hamming kodunda bit konumları 1'den başlar.
        // Bu yüzden `index - 1` ile doğru JavaScript dizinini buluruz.
        if (bitString[index - 1] === '1') {
            parity ^= 1; // Bit 1 ise XOR ile parity'yi ters çevir (0->1, 1->0)
        }
    }
    return parity;
}


// --- Ana İşlev Fonksiyonları ---

/**
 * Kullanıcının girdiği veriyi alır, doğrular ve Hamming kodlama sürecini başlatır.
 * Giriş hatalarını kontrol eder ve ilgili mesajları gösterir.
 */
function handleEncodeData() {
    const rawData = dataInput.value.trim(); // Girişin başındaki ve sonundaki boşlukları temizler
    inputError.textContent = ''; // Önceki hata mesajını temizler

    // 1. Girdi boş mu kontrol et
    if (rawData === '') {
        inputError.textContent = 'Lütfen bir veri girin.';
        return;
    }

    // 2. Sadece 0 ve 1'lerden mi oluşuyor kontrol et (ikili format)
    if (!/^[01]+$/.test(rawData)) {
        inputError.textContent = 'Veri sadece 0 ve 1\'lerden oluşmalıdır.';
        return;
    }

    // 3. Bit uzunluğunu kontrol et (8, 16 veya 32 bit olmalı)
    const dataLength = rawData.length;
    if (dataLength !== 8 && dataLength !== 16 && dataLength !== 32) {
        inputError.textContent = `Geçersiz veri uzunluğu: ${dataLength} bit. Lütfen 8, 16 veya 32 bit girin.`;
        return;
    }

    // Tüm doğrulamalar başarılı olursa:
    inputError.textContent = ''; // Hata mesajı olmadığını belirt

    originalInputDataLength = dataLength; // Orijinal veri uzunluğunu sakla

    const encodedData = encodeHamming(rawData, dataLength); // Veriyi Hamming kodu ile kodla
    currentEncodedData = encodedData; // Kodlanmış veriyi global değişkene ata
    
    // Kodlanmış veriyi ekranda görselleştir ve metin olarak göster
    displayBits(encodedOutput, encodedData, 'encoded', originalInputDataLength); 
    encodedText.textContent = `Kodlanmış Veri: ${encodedData} (Toplam ${encodedData.length} bit)`;

    // Yeni kodlama yapıldığında hata ekleme ve düzeltme bölümünü sıfırla
    errorPositionInput.value = ''; 
    errorInjectionMessage.textContent = ''; 
    syndromeOutput.textContent = ''; 
    correctionResult.textContent = ''; 
    correctedOutput.innerHTML = ''; 
    lastErrorPositions = []; // Vurgulanmış hata konumlarını temizle
}

/**
 * Veriyi Hamming SEC-DED (Tek Hata Düzeltme, Çift Hata Tespit) koduna göre kodlar.
 * @param {string} dataBits Yalnızca veri bitlerini içeren ikili string (örn. "10110010")
 * @param {number} originalDataLength Orijinal veri bitlerinin uzunluğu (8, 16, 32)
 * @returns {string} Oluşturulan Hamming kodu string'i
 */
function encodeHamming(dataBits, originalDataLength) {
    // Veri bitlerini tersine çeviriyoruz, çünkü Hamming kodunda D1, D2...
    // mantıksal olarak sağdan sola, yani en az anlamlı bitten başlar.
    const reversedDataBits = dataBits.split('').reverse().join(''); 

    const parityBitCount = getParityBitCount(originalDataLength); // Gereken parity biti sayısını al
    const totalBitsExcludingOverallParity = originalDataLength + parityBitCount; // Genel parity hariç toplam bit sayısı
    let hammingCodeArray = new Array(totalBitsExcludingOverallParity).fill('0'); // Boş bir dizi oluştur (tüm bitler başlangıçta 0)

    // 1. Veri bitlerini doğru Hamming konumlarına yerleştir
    let dataBitIndex = 0; // Tersine çevrilmiş veri bitleri için indeks
    for (let i = 1; i <= totalBitsExcludingOverallParity; i++) {
        if (!isPowerOfTwo(i)) { // Eğer konum 2'nin kuvveti değilse, burası bir veri bitidir
            hammingCodeArray[i - 1] = reversedDataBits[dataBitIndex]; // Veri bitini yerleştir
            dataBitIndex++; // Sonraki veri bitine geç
        }
    }

    // 2. Parity bitlerini hesapla ve kendi konumlarına yerleştir
    for (let i = 0; i < parityBitCount; i++) {
        const parityPosition = Math.pow(2, i); // Parity bitinin konumu (1, 2, 4, 8...)
        let checkIndices = []; // Bu parity bitinin kontrol ettiği bitlerin listesi

        // Bu parity bitinin kontrol ettiği tüm konumları bul (kendi konumu dahil)
        // Bir konumun belirli bir parity biti tarafından kontrol edilip edilmediği,
        // o konumun ikili temsilindeki ilgili bitin 1 olup olmadığına bağlıdır.
        for (let j = 1; j <= totalBitsExcludingOverallParity; j++) {
            if ((j & parityPosition) !== 0) { // Bitwise AND işlemi ile kontrol
                checkIndices.push(j);
            }
        }

        // Parity bitinin değerini hesapla (kontrol ettiği bitlerin XOR toplamı)
        const currentParityValue = calculateXORParity(hammingCodeArray.join(''), checkIndices);
        hammingCodeArray[parityPosition - 1] = currentParityValue.toString(); // Hesaplanan parity bitini yerleştir
    }
    
    // 3. SEC-DED özelliği için tüm kodlanmış bitlerin genel parity bitini ekle (en sona)
    const finalHammingCodeLength = totalBitsExcludingOverallParity + 1; // Genel parity biti dahil toplam uzunluk
    let finalHammingCodeArray = new Array(finalHammingCodeLength).fill('0'); // Yeni, daha uzun bir dizi oluştur

    // Mevcut (veri+parity) kodlanmış bitleri yeni diziye kopyala
    for(let i = 0; i < totalBitsExcludingOverallParity; i++) {
        finalHammingCodeArray[i] = hammingCodeArray[i];
    }

    // Genel parity bitini hesapla (tüm veri ve diğer parity bitlerinin XOR'u)
    let overallParity = 0;
    for (let i = 0; i < totalBitsExcludingOverallParity; i++) { // Sadece veri ve kontrol bitlerini kapsar (genel parity hariç)
        if (finalHammingCodeArray[i] === '1') {
            overallParity ^= 1;
        }
    }
    // Genel parity bitini en sona ekle
    finalHammingCodeArray[finalHammingCodeLength - 1] = overallParity.toString(); 

    return finalHammingCodeArray.join(''); // Son kodu string olarak döndür
}

/**
 * Bitleri HTML elementleri içinde renkli kutucuklar ve indekslerle görselleştirir.
 * Farklı bit türlerini (veri, parity, genel parity) farklı renklerle gösterir
 * ve hatalı bitleri vurgular.
 * @param {HTMLElement} displayElement Bitlerin gösterileceği HTML elementi (örn. encodedOutput)
 * @param {string} bitString Gösterilecek bit dizisi (örn. "10110010")
 * @param {string} viewType Görselleştirmenin genel tipi ('input', 'encoded', 'corrected', 'error')
 * @param {number} originalDataLength Orijinal veri uzunluğu (sadece 'encoded' ve 'corrected' için gerekli)
 * @param {number[]} highlightPositions Vurgulanacak bit indeksleri (örn. hatalı bitler, 1'den başlayan konumlar)
 */
function displayBits(displayElement, bitString, viewType = '', originalDataLength = 0, highlightPositions = []) {
    displayElement.innerHTML = ''; // Önceki içeriği temizle

    if (!bitString) {
        return; // Boş string gelirse bir şey yapma
    }

    let parityPositions = [];
    if (viewType === 'encoded' || viewType === 'corrected' || viewType === 'error') {
        const parityBitCount = getParityBitCount(originalDataLength);
        for (let i = 0; i < parityBitCount; i++) {
            parityPositions.push(Math.pow(2, i)); // Parity bitlerinin konumlarını (1, 2, 4...) kaydet
        }
        // Genel parity biti her zaman en sondaki konumdadır.
        parityPositions.push(bitString.length); 
    }

    for (let i = 0; i < bitString.length; i++) {
        const bitValue = bitString[i];
        const bitIndex = i + 1; // Kullanıcı için 1'den başlayan indeks

        const bitDiv = document.createElement('div');
        bitDiv.classList.add('bit'); // Tüm bitler için temel stil sınıfı
        bitDiv.textContent = bitValue;
        bitDiv.title = `Bit ${bitIndex}: ${bitValue}`; // Mouse üzerine gelince bilgi gösterir

        // Bit tipine göre ek stil sınıfları uygula (renklendirme için)
        if (viewType === 'input') {
            bitDiv.classList.add('data-bit'); // Giriş verisi sadece veri bitidir
        } else if (viewType === 'encoded' || viewType === 'corrected' || viewType === 'error') {
            // Bit genel parity biti ise (en sondaki bit)
            if (bitIndex === bitString.length) { 
                bitDiv.classList.add('overall-parity-bit'); 
            } else if (parityPositions.includes(bitIndex)) { // Diğer parity bitleri ise
                bitDiv.classList.add('parity-bit'); 
            } else { // Geri kalanlar veri bitidir
                bitDiv.classList.add('data-bit');
            }
        }
        
        // Eğer bu bit vurgulanacak konumlar arasında ise 'error-bit' sınıfı ekle
        if (highlightPositions.includes(bitIndex)) {
            bitDiv.classList.add('error-bit');
        }

        // Bitin konum indeksini küçük fontla üzerine yazmak için span oluştur
        const indexSpan = document.createElement('span');
        indexSpan.classList.add('bit-index');
        indexSpan.textContent = bitIndex;
        bitDiv.appendChild(indexSpan);

        displayElement.appendChild(bitDiv); // Oluşturulan bit div'ini ekrana ekle
    }
}

/**
 * Kodlanmış veriye kullanıcının belirttiği konuma tek bir bit hatası ekler.
 * Hata ekleme sonrası mesajları ve görselleştirmeyi günceller.
 */
function handleInjectSingleError() {
    errorInjectionMessage.textContent = ''; // Önceki mesajı temizle
    correctionResult.textContent = ''; // Düzeltme sonucunu temizle
    syndromeOutput.textContent = ''; // Sendrom çıktısını temizle
    correctedOutput.innerHTML = ''; // Düzeltilmiş çıktıyı temizle

    if (!currentEncodedData) {
        errorInjectionMessage.textContent = 'Önce veriyi kodlamalısınız!';
        errorInjectionMessage.style.color = '#dc3545'; // Kırmızı hata mesajı
        return;
    }

    const errorPositionStr = errorPositionInput.value.trim();
    if (errorPositionStr === '') {
        errorInjectionMessage.textContent = 'Lütfen hata eklemek için bir bit konumu girin.';
        errorInjectionMessage.style.color = '#dc3545';
        return;
    }

    const errorPosition = parseInt(errorPositionStr);

    // Hata konumunun geçerli aralıkta olup olmadığını kontrol et
    if (isNaN(errorPosition) || errorPosition < 1 || errorPosition > currentEncodedData.length) {
        errorInjectionMessage.textContent = `Geçersiz bit konumu. 1 ile ${currentEncodedData.length} arasında bir değer girin.`;
        errorInjectionMessage.style.color = '#dc3545';
        return;
    }

    // Hata ekleme işlemi: İlgili bitin değerini ters çevir
    let erroredDataArray = currentEncodedData.split(''); // String'i diziye çevir
    const actualIndex = errorPosition - 1; // JavaScript dizileri 0 tabanlı olduğu için

    erroredDataArray[actualIndex] = (erroredDataArray[actualIndex] === '0' ? '1' : '0'); // Biti ters çevir
    currentEncodedData = erroredDataArray.join(''); // Hata eklenmiş veriyi global değişkene ata
    lastErrorPositions = [errorPosition]; // Son eklenen hatanın konumunu sakla
    
    // Hatalı veriyi ekranda görselleştir ve bilgi mesajı ver
    displayBits(encodedOutput, currentEncodedData, 'error', originalInputDataLength, lastErrorPositions); 
    encodedText.textContent = `Hata Eklenmiş Veri: ${currentEncodedData} (Toplam ${currentEncodedData.length} bit)`;
    errorInjectionMessage.textContent = `Bit ${errorPosition} konumuna tek hata eklendi.`;
    errorInjectionMessage.style.color = '#28a745'; // Yeşil başarı mesajı
}

/**
 * Kodlanmış veriye rastgele iki farklı konuma bit hatası ekler.
 * Hata ekleme sonrası mesajları ve görselleştirmeyi günceller.
 */
function handleInjectDoubleError() {
    errorInjectionMessage.textContent = ''; // Önceki mesajı temizle
    correctionResult.textContent = ''; // Düzeltme sonucunu temizle
    syndromeOutput.textContent = ''; // Sendrom çıktısını temizle
    correctedOutput.innerHTML = ''; // Düzeltilmiş çıktıyı temizle

    if (!currentEncodedData) {
        errorInjectionMessage.textContent = 'Önce veriyi kodlamalısınız!';
        errorInjectionMessage.style.color = '#dc3545';
        return;
    }

    const totalBits = currentEncodedData.length;
    if (totalBits < 2) {
        errorInjectionMessage.textContent = 'Çift hata eklemek için en az 2 bit olmalı.';
        errorInjectionMessage.style.color = '#dc3545';
        return;
    }

    // Rastgele iki farklı konum seç
    let pos1 = Math.floor(Math.random() * totalBits) + 1; // 1'den başlayan rastgele konum 1
    let pos2 = Math.floor(Math.random() * totalBits) + 1; // 1'den başlayan rastgele konum 2

    while (pos1 === pos2) { // İki konumun aynı olmamasını sağla
        pos2 = Math.floor(Math.random() * totalBits) + 1;
    }

    let erroredDataArray = currentEncodedData.split(''); // Veriyi diziye çevir

    // Seçilen konumdaki bitleri ters çevirerek hata ekle
    erroredDataArray[pos1 - 1] = (erroredDataArray[pos1 - 1] === '0' ? '1' : '0');
    erroredDataArray[pos2 - 1] = (erroredDataArray[pos2 - 1] === '0' ? '1' : '0');
    
    currentEncodedData = erroredDataArray.join(''); // Hata eklenmiş veriyi global değişkene ata
    lastErrorPositions = [pos1, pos2]; // Son eklenen hataların konumlarını sakla

    // Hatalı veriyi ekranda görselleştir ve bilgi mesajı ver
    displayBits(encodedOutput, currentEncodedData, 'error', originalInputDataLength, lastErrorPositions); 
    encodedText.textContent = `Hata Eklenmiş Veri: ${currentEncodedData} (Toplam ${currentEncodedData.length} bit)`;
    errorInjectionMessage.textContent = `Bit ${pos1} ve Bit ${pos2} konumlarına çift hata eklendi.`;
    errorInjectionMessage.style.color = '#28a745';
}

/**
 * Alınan veriyi kontrol eder, sendrom ve genel parity bitlerini hesaplar.
 * Hatanın tipine (yok, tek, çift) göre düzeltme yapar veya mesaj gösterir.
 */
function handleCheckAndCorrect() {
    syndromeOutput.textContent = ''; // Önceki çıktıları temizle
    correctionResult.textContent = '';
    correctedOutput.innerHTML = '';

    if (!currentEncodedData) {
        correctionResult.textContent = 'Önce veriyi kodlamalı ve hata eklemelisiniz!';
        correctionResult.style.color = '#dc3545';
        return;
    }

    const parityBitCount = getParityBitCount(originalInputDataLength);
    const totalBitsExcludingOverallParity = originalInputDataLength + parityBitCount;

    let receivedDataArray = currentEncodedData.split(''); // Alınan (hatalı olabilecek) veriyi diziye al

    // 1. Sendrom bitlerini hesapla (Hamming parity bitleri üzerinden)
    let syndromeBits = [];
    for (let i = 0; i < parityBitCount; i++) {
        const parityPosition = Math.pow(2, i); // P1, P2, P4 gibi konumlar
        let checkIndices = [];

        // Bu parity bitinin kontrol ettiği tüm bit konumlarını bul
        for (let j = 1; j <= totalBitsExcludingOverallParity; j++) {
            if ((j & parityPosition) !== 0) {
                checkIndices.push(j);
            }
        }
        // Alınan veri üzerindeki bu konumların XOR toplamını hesapla
        const calculatedParity = calculateXORParity(receivedDataArray.join(''), checkIndices);
        // Sendrom bitlerini doğru sıraya (MSB'den LSB'ye) ekle
        syndromeBits.unshift(calculatedParity); 
    }

    const syndrome = parseInt(syndromeBits.join(''), 2); // İkili sendromu onluk sayıya çevir (hata konumunu verir)

    // 2. Genel Parity Bitini Kontrol Et (SEC-DED için)
    // Tüm kodlanmış (alınan) verideki 1'lerin sayısının tek/çift kontrolü
    let overallParityCheck = 0;
    for (let i = 0; i < currentEncodedData.length; i++) { // Tüm alınan veriyi kapsar (genel parity biti dahil)
        if (currentEncodedData[i] === '1') {
            overallParityCheck ^= 1;
        }
    }

    // Sendrom ve Genel Parity Kontrol sonuçlarını ekranda göster
    syndromeOutput.textContent = `Sendrom (C1-C2-C4...): ${syndromeBits.join('')} (Desimal: ${syndrome}) | Genel Parity Kontrol: ${overallParityCheck}`;
    syndromeOutput.style.color = '#0056b3'; // Mavi renk

    let correctedDataArray = [...receivedDataArray]; // Düzeltme için alınan veriyi kopyala
    
    // Hata durumlarını değerlendir ve düzeltme yap
    if (syndrome === 0) { // Sendrom 0 ise (potansiyel olarak hata yok veya çift hata)
        if (overallParityCheck === 0) {
            // Sendrom 0 ve genel parity 0 ise: Hata Yok
            correctionResult.textContent = 'Hata algılanmadı.';
            correctionResult.style.color = '#28a745'; // Yeşil başarı mesajı
            
            // Veriyi hatasız/düzeltilmiş olarak görselleştir ve metinleri güncelle
            displayBits(correctedOutput, currentEncodedData, 'corrected', originalInputDataLength, []); 
            displayBits(encodedOutput, currentEncodedData, 'encoded', originalInputDataLength, []); 
            encodedText.textContent = `Kodlanmış Veri: ${currentEncodedData} (Toplam ${currentEncodedData.length} bit)`;

        } else {
            // Sendrom 0 ama genel parity 1 ise: Çift Hata tespit edildi ancak düzeltilemez
            correctionResult.textContent = 'Çift hata algılandı! Bu kod düzeltilemez.';
            correctionResult.style.color = '#dc3545'; // Kırmızı hata mesajı
            // Hatalı veriyi (düzeltilmemiş haliyle) ve hata konumlarını görselleştir
            displayBits(correctedOutput, receivedDataArray.join(''), 'error', originalInputDataLength, lastErrorPositions); 
            displayBits(encodedOutput, receivedDataArray.join(''), 'error', originalInputDataLength, lastErrorPositions); 
            encodedText.textContent = `Hata Eklenmiş Veri: ${receivedDataArray.join('')} (Toplam ${receivedDataArray.length} bit)`;
        }
    } else { // Sendrom 0 değilse (hata var)
        if (overallParityCheck === 1) {
            // Sendrom 0 değil ve genel parity 1 ise: Tek hata algılandı ve düzeltilebilir
            const errorPosition = syndrome; // Sendrom değeri doğrudan hatanın konumunu verir
            
            // Hatalı biti ters çevirerek düzeltme yap
            correctedDataArray[errorPosition - 1] = (correctedDataArray[errorPosition - 1] === '0' ? '1' : '0');
            correctionResult.textContent = `Tek hata Bit ${errorPosition} konumunda algılandı ve düzeltildi.`;
            correctionResult.style.color = '#28a745'; // Yeşil başarı mesajı

            // Düzeltilmiş veriyi görselleştir ve metinleri güncelle
            displayBits(correctedOutput, correctedDataArray.join(''), 'corrected', originalInputDataLength, []); 
            displayBits(encodedOutput, correctedDataArray.join(''), 'encoded', originalInputDataLength); 
            encodedText.textContent = `Kodlanmış Veri: ${correctedDataArray.join('')} (Toplam ${correctedDataArray.length} bit)`;
            
            currentEncodedData = correctedDataArray.join(''); // Düzeltildiyse, global veriyi de düzeltilmiş haliyle güncelle
            lastErrorPositions = []; // Hata düzeltildiği için artık vurgulanacak hata yok

        } else {
            // Sendrom 0 değil ama genel parity 0 ise: Çift hata algılandı ve düzeltilemez
            correctionResult.textContent = `Çift hata algılandı! Sendrom: ${syndrome}. Bu kod düzeltilemez.`;
            correctionResult.style.color = '#dc3545'; // Kırmızı hata mesajı
            // Hatalı veriyi (düzeltilmemiş haliyle) ve hata konumlarını görselleştir
            displayBits(correctedOutput, receivedDataArray.join(''), 'error', originalInputDataLength, lastErrorPositions); 
            displayBits(encodedOutput, receivedDataArray.join(''), 'error', originalInputDataLength, lastErrorPositions); 
            encodedText.textContent = `Hata Eklenmiş Veri: ${receivedDataArray.join('')} (Toplam ${receivedDataArray.length} bit)`;
        }
    }
}