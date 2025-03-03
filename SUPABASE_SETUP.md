# Supabase Kurulumu

Bu projede veritabanı olarak Supabase kullanılmaktadır. Aşağıdaki adımları izleyerek Supabase'i projenize entegre edebilirsiniz.

## Adım 1: Supabase Hesabı Oluşturma

1. [Supabase](https://supabase.com/) web sitesine gidin ve bir hesap oluşturun.
2. Yeni bir proje oluşturun.
3. Proje oluşturulduktan sonra, proje ayarlarından API URL ve anon key bilgilerini alın.

## Adım 2: .env Dosyasını Güncelleme

`.env` dosyasını aşağıdaki bilgilerle güncelleyin:

```
SUPABASE_URL="https://your-project-url.supabase.co"
SUPABASE_ANON_KEY="your-anon-key"
```

Bu değerleri Supabase projenizden aldığınız gerçek değerlerle değiştirin.

## Adım 3: SQL Prosedürlerini Yükleme

1. Supabase SQL editörüne gidin.
2. `sql/init.sql` dosyasındaki SQL kodunu kopyalayın ve SQL editörüne yapıştırın.
3. SQL kodunu çalıştırın.

Bu işlem, veritabanında gerekli tabloları oluşturmak için kullanılacak stored procedure'ları oluşturacaktır.

## Adım 4: Uygulamayı Başlatma

1. Express sunucusunu başlatın:
   ```
   npm run server
   ```

2. React uygulamasını başlatın:
   ```
   npm run dev
   ```

3. Tarayıcıda admin paneline gidin ve "Veritabanını Başlat" butonuna tıklayın.
4. Ardından "Admin Kullanıcısı Oluştur" butonuna tıklayın.

## Adım 5: Giriş Yapma

Admin kullanıcısı oluşturulduktan sonra, aşağıdaki bilgilerle giriş yapabilirsiniz:

- Kullanıcı adı: `admin`
- Şifre: `admin123`

## Sorun Giderme

Eğer veritabanı bağlantısı ile ilgili sorunlar yaşıyorsanız:

1. Supabase URL ve anon key değerlerinin doğru olduğundan emin olun.
2. Supabase projenizin aktif olduğundan emin olun.
3. SQL prosedürlerinin başarıyla oluşturulduğundan emin olun.
4. Ağ bağlantınızın Supabase'e erişim sağlayabildiğinden emin olun.
