-- Supabase'de SQL sorguları çalıştırmak için exec fonksiyonu
CREATE OR REPLACE FUNCTION exec(query text)
RETURNS void AS $$
BEGIN
  EXECUTE query;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
