psql -f init_db.sql -U postgres

PGPASSWORD=somepass psql -d example -f structure.sql -U serverUser

for file in $(ls -1t --reverse migrations/*.sql); do
  echo "Applying migration: $file"
  PGPASSWORD=somepass psql -d example -f "$file" -U serverUser
done