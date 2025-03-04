#!/bin/bash

# Supabase bilgilerini .env dosyasından al
source .env

# SQL dosyasını oku
SQL_CONTENT=$(cat new_bookings_table.sql)

# Supabase'e SQL sorgusunu gönder
curl -X POST "https://exdgeyldiufinjgwkeqy.supabase.co/rest/v1/rpc/exec_sql" \
  -H "apikey: $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Authorization: Bearer $SUPABASE_SERVICE_ROLE_KEY" \
  -H "Content-Type: application/json" \
  -d "{\"query\": \"$SQL_CONTENT\"}"

echo "Bookings tablosu güncellendi." 