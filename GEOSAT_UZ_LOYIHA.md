# GeoSat UZ — Loyiha holati va davom ettirish yo'riqnomasi

## Loyiha haqida
- **Nom:** GeoSat UZ (avval AgroSat UZ edi)
- **Maqsad:** Sun'iy yo'ldosh + AI + IoT asosida qishloq xo'jaligi monitoring platformasi
- **Hakaton:** AI yo'nalishi — kosmik texnologiyalar

## Ishlab chiqilgan sayt
- **URL:** https://uzkoze.github.io/agrosat-uz/
- **GitHub:** https://github.com/uzkoze/agrosat-uz
- **Deploy:** gh-pages branch

## API kalitlar
- **NASA Token:** eyJ0eXAiOiJKV1QiLCJvcmlnaW4iOiJFYXJ0aGRhdGEgTG9naW4iLCJzaWciOiJlZGxqd3RwdWJrZXlfb3BzIiwiYWxnIjoiUlMyNTYifQ.eyJ0eXBlIjoiVXNlciIsInVpZCI6ImFncm9zYXR1eiIsImV4cCI6MTc4NDU0MjY4MywiaWF0IjoxNzc5MzU4NjgzLCJpc3MiOiJodHRwczovL3Vycy5lYXJ0aGRhdGEubmFzYS5nb3YiLCJpZGVudGl0eV9wcm92aWRlciI6ImVkbF9vcHMiLCJhY3IiOiJlZGwiLCJhc3N1cmFuY2VfbGV2ZWwiOjN9.bHujOUpcMhsfhD75FK41nmjz3QVdlH-E1suW1FYuarNDFhJUxRjKL6ukoPKyAsV3x26Ib_Z0Myg9HwyyX_8VRAteMKPKj-UrmnSQg-9gAScPPEXSCUl97mXKbk9pB3WOktkwhlCqsvWTh7SvSqfHwLRHBe_dTqK83QAng7c1eaVwdit_AhxpTQ7LeCArQPNEu39qpoN1saABa2UmZhvqtiCQ-PZ6Ac7Lx9wJAZ4deBn3_wtpPPzmrfmh0zgjzpbjMEpE3tJbdVAEiBikOOjxcbllEBnA-S5SxTEHBF1atShy9csinGbzn7NYKhtxDRpyuSXC_npdB66086uD5cu3oA
- **Sentinel Client ID:** e0c995ad-0601-44f3-b2c9-7d36061bb987
- **Sentinel Client Secret:** UWB2pLUhKOc0lWyWXzv4vIjmWpsvKBM0
- **Telegram Bot Token:** 8737341988:AAGRQkB5xOh2mRqw1UJZy6lRF4e8kODr7ao

## Hozirgi holat — nimalar tayyor
✅ React dashboard (5 modul)
✅ GeoSat UZ brending
✅ GitHub Pages ga deploy
✅ Agro Monitor (NDVI, viloyatlar)
✅ Kadastr Monitor (noqonuniy yer)
✅ Issiqlik Xarita (NASA FIRMS)
✅ Chiqindi Deteksiya
✅ Yer Monitor (seysmik)
✅ Live alert ticker
✅ Sidebar + satellite status
⚠️  Hozir mock data (backend yo'q)

## Keyingi qilish kerak bo'lgan ishlar
1. 🔐 Auth + Rol tizimi (6 rol: Fermer, Dehqon, Bog'bon, Agro klaster, Tadqiqotchi, Admin)
2. 🤖 AI kasallik aniqlash (rasm yuklash → Claude API)
3. 💧 IoT yer osti suv monitoringi
4. 🐍 Python FastAPI backend (haqiqiy NASA/Sentinel data)
5. 🤖 Telegram bot (real alertlar)
6. 🗺️ Leaflet interaktiv xarita

## Foydalanuvchi rollari va imkoniyatlari
- **Fermer:** Ekin holati NDVI, suv rejimi, kasallik maslahat
- **Dehqon:** Mahalliy ob-havo, oddiy maslahat
- **Bog'bon:** Meva-sabzavot, hasharot, kasallik
- **Agro klaster:** Ommaviy tahlil, eksport ma'lumot
- **Tadqiqotchi:** To'liq raw data, API access
- **Admin:** Boshqaruv paneli, foydalanuvchilar

## Texnologiyalar
- Frontend: React + Recharts + gh-pages
- Backend (kerak): Python FastAPI + PostgreSQL
- AI: Claude API (kasallik aniqlash, maslahat)
- Data: NASA Earthdata, Sentinel Hub, NASA FIRMS
- Deploy: GitHub Pages (frontend), Railway/Render (backend)

## Yangi chatda davom ettirish uchun
Yangi chatda Claude ga shu faylni yuborg va ayting:
"GeoSat UZ loyihasini davom ettiramiz. Fayl ichida hamma ma'lumot bor."
