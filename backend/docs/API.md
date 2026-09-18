# EcoLink Mock API V1

Base URL development: `http://localhost:8080/api`

Semua endpoint memakai envelope berikut:

```json
{"success": true, "message": "...", "data": {}}
```

Error memakai bentuk `{"success":false,"message":"..."}`. Seluruh data masih mock dan akan kembali ke kondisi awal saat server dimulai ulang.

## Health dan Auth

| Method | URL | Deskripsi | Contoh response |
|---|---|---|---|
| GET | `/health` | Memeriksa API. | `{"success":true,"message":"EcoLink API is running"}` |
| POST | `/auth/register` | Skeleton registrasi; belum terhubung. | `{"success":false,"message":"Register feature is not implemented yet"}` |
| POST | `/auth/login` | Skeleton login; belum terhubung. | `{"success":false,"message":"Login feature is not implemented yet"}` |

## User

| Method | URL | Deskripsi | Contoh response data |
|---|---|---|---|
| GET | `/me/dashboard` | Dashboard user aktif. | `{"user":{"id":"usr_001"},"stats":{"total_recycled":87.4},"active_campaign":{"id":"cmp_001"}}` |
| GET | `/me/passport` | Eco Passport, badge, dan impact terbaru. | `{"user_id":"usr_001","eco_level":"Green Advocate","qr_code":"ECO-USR-001"}` |
| GET | `/me/impact` | Ringkasan dan riwayat impact verified. | `{"user_id":"usr_001","total_recycled":87.4,"impact_history":[]}` |
| GET | `/me/transactions` | Semua transaksi user aktif. Filter: `?status=pending` atau `?status=verified`. | `[{"id":"trx_001","status":"pending"}]` |

## Waste Bank

| Method | URL | Deskripsi | Contoh response data |
|---|---|---|---|
| GET | `/waste-banks` | Daftar bank sampah. | `[{"id":"wb_001","name":"EcoHub Purwokerto","status":"open"}]` |
| GET | `/waste-banks/:id` | Detail bank sampah. | `{"id":"wb_001","name":"EcoHub Purwokerto","accepted_materials":[]}` |
| GET | `/waste-banks/:id/prices` | Harga material pada bank sampah. | `[{"waste_category_id":"cat_pet","price_per_kg":3500,"unit":"kg"}]` |

## Waste Category

| Method | URL | Deskripsi | Contoh response data |
|---|---|---|---|
| GET | `/waste-categories` | Daftar kategori sampah. | `[{"id":"cat_pet","name":"PET Plastic","unit":"kg"}]` |

## Campaign

| Method | URL | Deskripsi | Contoh response data |
|---|---|---|---|
| GET | `/campaigns` | Daftar campaign. | `[{"id":"cmp_001","title":"Plastic Free Campus","progress_percentage":68.4}]` |
| GET | `/campaigns/:id` | Detail campaign. | `{"id":"cmp_001","partner_waste_banks":[{"id":"wb_001"}]}` |
| POST | `/campaigns/:id/join` | Simulasi user aktif bergabung. | `{"campaign_id":"cmp_001","user_id":"usr_001","status":"joined"}` |

Join campaign tidak memerlukan request body selama autentikasi masih mock.

## Transaction

| Method | URL | Deskripsi | Contoh response data |
|---|---|---|---|
| POST | `/transactions` | Membuat transaksi pending dan menghitung harga. | `{"transaction_id":"trx_005","total_weight":2.8,"total_value":9800,"status":"pending"}` |
| GET | `/transactions/:id` | Detail transaksi, relasi, dan impact. | `{"transaction_id":"trx_001","status":"pending","impact":{"impact_added":0}}` |
| PUT | `/transactions/:id/verify` | Memverifikasi transaksi pending. | `{"transaction_id":"trx_001","status":"verified","eco_score_added":28}` |

Request body membuat transaksi:

```json
{
  "user_id": "usr_001",
  "waste_bank_id": "wb_001",
  "campaign_id": "cmp_001",
  "items": [
    {"waste_category_id": "cat_pet", "weight": 2.8}
  ]
}
```

`campaign_id` boleh `null`, string kosong, atau tidak dikirim. Verify tidak membutuhkan request body. Status verifikasi `trx_001` disimpan di memory sampai server di-restart.

## Organization

| Method | URL | Deskripsi | Contoh response data |
|---|---|---|---|
| GET | `/organizations/:id/dashboard` | Ringkasan organisasi dan campaign-nya. | `{"organization":{"id":"org_001"},"campaign_count":1,"total_waste_collected":684}` |

## Status HTTP

- `200 OK`: pembacaan data atau aksi berhasil.
- `201 Created`: transaksi berhasil dibuat.
- `400 Bad Request`: JSON/field/filter tidak valid atau transaksi sudah verified.
- `404 Not Found`: ID mock tidak ditemukan.
- `500 Internal Server Error`: kegagalan internal yang tidak diperkirakan.
