# Hamming Kodu Simülatörü

Bu proje, **Hamming Tek Hata Düzeltme (SEC) ve Çift Hata Tespit (DED)** kodlama prensiplerini interaktif bir web arayüzü üzerinden simüle eden bir araçtır. Kullanıcıların ikili veri girmesine, bu veriyi Hamming kodu ile kodlamasına, tek veya çift hata eklemesine ve ardından kodun bu hataları nasıl tespit edip tek hataları düzelttiğini gözlemlemesine olanak tanır.

## Proje Sunumu
Proje sunumuna ait YouTube videosuna [buradan](https://www.youtube.com/watch?v=DDAdMSyhcKc) ulaşabilirsiniz.

## Kurulum ve Çalıştırma

Projeye [buradan](https://mlkyzgt.github.io/Hamming_Code_Simulator/) ulaşabilirsiniz.

## Proje Açıklaması

Günümüz dijital dünyasında verilerin güvenilir bir şekilde iletilmesi hayati önem taşımaktadır. Ancak veri iletimi sırasında, elektromanyetik parazitler, sinyal bozulmaları veya donanım arızaları gibi çeşitli nedenlerle bit hataları meydana gelebilir. Bu hatalar, iletilen bilginin bütünlüğünü bozarak yanlış yorumlanmasına yol açabilir.

Bu projenin temel amacı, Bilgi Teorisi ve Dijital Haberleşme derslerinde önemli bir yer tutan Hamming kodunun çalışma prensibini somut bir şekilde göstermektir. Geliştirilen bu simülatör, soyut matematiksel kavramları interaktif bir kullanıcı arayüzü ile birleştirerek öğrenmeyi kolaylaştırır. Özellikle:

* **Veri Kodlama Süreci:** Giriş verisinin nasıl parity bitleriyle genişletilerek hata toleranslı bir koda dönüştürüldüğünü adım adım görselleştirir.
* **Hata Enjeksiyonu:** Kullanıcının kontrollü bir şekilde tek veya çift hata eklemesine izin vererek, gerçek dünya senaryolarındaki veri bozulmalarını taklit etme imkanı sunar.
* **Hata Tespiti ve Düzeltme Mekanizması:** Sendrom bitlerinin hesaplanması ve genel parity kontrolünün nasıl kullanılarak hataların konumunun belirlendiğini ve tek hataların nasıl otomatik olarak düzeltildiğini anlaşılır kılar. Çift hataların ise tespit edilmesine rağmen Hamming SEC-DED kodu ile düzeltilemediğini vurgular.

Bu araç, özellikle mühendislik ve bilgisayar bilimi öğrencileri için Hamming kodunu kavramsal olarak anlamalarına yardımcı olacak değerli bir öğrenme aracı olarak tasarlanmıştır.

## Proje Hakkında

İletişim sistemlerinde veriler aktarılırken gürültü nedeniyle hatalar oluşabilir. Hamming kodu, bu hataları tespit etmek ve belirli sınırlar içinde düzeltmek için kullanılan güçlü bir ileri hata düzeltme (FEC) tekniğidir. Bu simülatör, Hamming kodunun temel mantığını görsel ve etkileşimli bir şekilde anlamanıza yardımcı olmayı amaçlar.

**Özellikler:**

* **Veri Girişi ve Kodlama:** 8, 16 veya 32 bitlik ikili veri girişi yapın ve verinizi otomatik olarak Hamming (SEC-DED) koduna dönüştürün.
* **İnteraktif Bit Görselleştirmesi:** Veri bitleri, parity bitleri ve genel parity biti farklı renklerle görselleştirilir, bu da kod yapısını anlamayı kolaylaştırır.
* **Hata Enjeksiyonu:**
    * Belirli bir konuma manuel olarak tek bir bit hatası ekleyin.
    * Rastgele iki farklı konuma çift hata ekleyin.
* **Hata Tespiti ve Düzeltme:**
    * Gönderilen veri üzerindeki hataları tespit etmek için sendrom bitlerini ve genel parity kontrolünü hesaplar.
    * Tek hataları otomatik olarak düzeltir ve düzeltilmiş veriyi gösterir.
    * Çift hataları tespit eder ancak bu kodlama şeması ile düzeltilemeyeceğini bildirir.
* **Anlaşılır Geri Bildirim:** Hata durumları, sendrom değerleri ve düzeltme sonuçları kullanıcıya açık mesajlarla sunulur.

## Kullanılan Teknolojiler

* **HTML5:** Projenin yapısal iskeleti için.
* **CSS:** Görsel tasarım ve kullanıcı arayüzü stilizasyonu için.
* **JavaScript:** Dinamik etkileşimler, Hamming kodlama/kod çözme algoritmaları ve hata işleme mantığı için.

## Nasıl Kullanılır?

1.  **Veri Girişi:** "Veri Girişi" kutucuğuna 8, 16 veya 32 bitlik ikili bir sayı (sadece 0 ve 1'lerden oluşan) girin.
2.  **Veriyi Kodla:** "Veriyi Kodla" butonuna tıklayın. Kodlanmış Hamming kodu "Kodlanmış Veri" bölümünde görünecektir. Parity bitleri (sarı), veri bitleri (açık mavi) ve genel parity biti (yeşil) farklı renklerle gösterilecektir.
3.  **Hata Ekleme:**
    * **Tek Hata:** "Tek Hata Ekle" bölümündeki kutucuğa 1 ile kodlanmış verinin toplam bit uzunluğu arasında bir sayı girin ve "Tek Hata Ekle" butonuna tıklayın. Belirtilen konumdaki bit değişecek ve kırmızı renkte vurgulanacaktır.
    * **Çift Hata:** "Çift Hata Ekle" butonuna tıklayın. Uygulama rastgele iki konuma hata ekleyecek ve bu bitleri kırmızı renkte vurgulayacaktır.
4.  **Kontrol Et ve Düzelt:** "Kontrol Et ve Düzelt" butonuna tıklayın.
    * Uygulama sendrom bitlerini ve genel parity kontrol sonucunu hesaplayıp gösterecektir.
    * Eğer tek hata varsa, bunu düzeltecek ve düzeltilmiş veriyi "Düzeltilmiş Veri" bölümünde gösterecektir.
    * Eğer çift hata varsa, bunu tespit edecek ancak düzeltilemeyeceğini bildirecektir.
    * Hata yoksa, verinin temiz olduğunu bildirecektir.

