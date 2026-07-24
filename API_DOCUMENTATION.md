# News Portal Backend API Documentation

## Table of Contents

1. [Arsitektur & Role](#arsitektur--role)
2. [Permissions Matrix](#permissions-matrix)
3. [API Endpoints](#api-endpoints)
4. [Flow Logic](#flow-logic)
5. [MongoDB Schemas](#mongodb-schemas)
6. [Request/Response Examples](#requestresponse-examples)

---

## Arsitektur & Role

### Role System

| Role | Level | Deskripsi |
|------|-------|-----------|
| **ADMIN** | 1 (Tertinggi) | Administrator portal - mengelola kategori, approve/reject delete request, manage users |
| **WRITER** | 2 | Penulis berita - membuat & edit berita sendiri, request delete berita |
| **USER** | 3 (Terendah) | Pengguna biasa - melihat berita, clap, save, diskusi |

### User Registration Flow

```
1. User register → Role default: "user"
2. Admin mengubah role user menjadi "writer" via PUT /api/users/role
3. Admin TIDAK bisa menjadikan siapapun sebagai "admin"
4. Admin tidak bisa mengubah role admin lain
```

---

## Permissions Matrix

### Legend
- ✅ = Allowed
- ❌ = Not Allowed

| Fitur | ADMIN | WRITER | USER |
|-------|-------|--------|------|
| **Auth** | | | |
| Register | ✅ | ✅ | ✅ |
| Login | ✅ | ✅ | ✅ |
| Change Password | ✅ | ✅ | ✅ |
| **User** | | | |
| View All Users | ✅ | ❌ | ❌ |
| View User by ID | ✅ | ❌ | ❌ |
| Update User Role | ✅ | ❌ | ❌ |
| View Own Profile | ✅ | ✅ | ✅ |
| Update Own Profile | ✅ | ✅ | ✅ |
| **Category** | | | |
| View Categories | ✅ | ✅ | ✅ |
| Create Category | ✅ | ❌ | ❌ |
| Update Category | ✅ | ❌ | ❌ |
| Delete Category | ✅ | ❌ | ❌ |
| Toggle Category | ✅ | ❌ | ❌ |
| **News** | | | |
| View All News | ✅ | ✅ | ✅ |
| View News by ID | ✅ | ✅ | ✅ |
| View News by Slug | ✅ | ✅ | ✅ |
| Create News | ✅ | ✅ | ❌ |
| Update Own News | ✅ | ✅ | ❌ |
| Update Any News | ✅ | ❌ | ❌ |
| Request Delete News | ✅ | ✅ | ❌ |
| Cancel Delete Request | ✅ | ✅ | ❌ |
| Approve Delete Request | ✅ | ❌ | ❌ |
| Reject Delete Request | ✅ | ❌ | ❌ |
| Clap News | ✅ | ✅ | ✅ |
| Save News | ✅ | ✅ | ✅ |
| **Discussion** | | | |
| View Discussions | ✅ | ✅ | ✅ |
| Create Comment | ✅ | ✅ | ✅ |
| Create Reply | ✅ | ✅ | ✅ |
| Update Own Comment | ✅ | ✅ | ✅ |
| Delete Own Comment | ✅ | ✅ | ✅ |
| Delete Any Comment | ✅ | ❌ | ❌ |

---

## API Endpoints

### Auth (`/api/auth`)

#### POST /api/auth/register
Register user baru.

**Auth:** Tidak perlu

**Request Body:**
```json
{
  "fullName": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "Password123"
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| fullName | string | ✅ | 2-100 karakter |
| username | string | ✅ | 3-30 karakter, alphanumeric + underscore |
| email | string | ✅ | Format email valid |
| password | string | ✅ | Min 8 karakter, harus ada huruf besar, huruf kecil, angka |

---

#### POST /api/auth/login
Login user.

**Auth:** Tidak perlu

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "Password123"
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| email | string | ✅ | Format email valid |
| password | string | ✅ | Min 1 karakter |

**Response:**
```json
{
  "sukses": true,
  "pesan": "Login berhasil",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "_id": "...",
      "fullName": "John Doe",
      "username": "johndoe",
      "email": "john@example.com",
      "role": "user"
    }
  }
}
```

---

#### POST /api/auth/change-password
Ganti password user.

**Auth:** ✅ Bearer Token

**Request Body:**
```json
{
  "currentPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| currentPassword | string | ✅ | Min 1 karakter |
| newPassword | string | ✅ | Min 8 karakter, huruf besar, huruf kecil, angka |

---

### User (`/api/users`)

#### GET /api/users
Lihat semua user.

**Auth:** ✅ Bearer Token

**Role:** ADMIN only

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | string/number | 1 | Halaman |
| limit | string/number | 10 | Item per halaman (max 100) |
| role | string | - | Filter role (admin/writer/user) |
| search | string | - | Search nama/username/email |

**Example:** `GET /api/users?page=1&limit=10&role=writer&search=john`

---

#### GET /api/users/profile
Lihat profil sendiri.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**No Parameters**

---

#### PUT /api/users/profile
Update profil sendiri.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**Request Body:**
```json
{
  "fullName": "John Doe Updated",
  "username": "johndoe_updated"
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| fullName | string | ❌ | 2-100 karakter |
| username | string | ❌ | 3-30 karakter, alphanumeric + underscore |

---

#### PUT /api/users/role
Update role user (bikin writer).

**Auth:** ✅ Bearer Token

**Role:** ADMIN only

**Request Body:**
```json
{
  "userId": "64abc123...",
  "role": "writer",
  "reason": "User ini胜任 menjadi writer"
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| userId | string | ✅ | ObjectId user |
| role | string | ✅ | Enum: writer, user |
| reason | string | ❌ | Max 500 karakter |

---

#### POST /api/users/saved/:newsId
Simpan berita.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| newsId | string | ✅ | ObjectId berita |

---

#### DELETE /api/users/saved/:newsId
Hapus berita dari tersimpan.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| newsId | string | ✅ | ObjectId berita |

---

#### GET /api/users/saved
Lihat berita tersimpan.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**No Parameters**

---

#### POST /api/users/clap/:newsId
Tepuk tangan berita.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| newsId | string | ✅ | ObjectId berita |

---

#### DELETE /api/users/clap/:newsId
Hapus tepuk tangan.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| newsId | string | ✅ | ObjectId berita |

---

#### GET /api/users/clapped
Lihat berita yang ditambahkan tepuk.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**No Parameters**

---

### Category (`/api/categories`)

#### GET /api/categories
Lihat semua kategori.

**Auth:** Tidak perlu

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| includeInactive | string | false | Untuk admin only |

**Example:** `GET /api/categories?includeInactive=true`

---

#### GET /api/categories/:id
Lihat kategori by ID.

**Auth:** Tidak perlu

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId kategori |

---

#### POST /api/categories
Buat kategori baru.

**Auth:** ✅ Bearer Token

**Role:** ADMIN only

**Request Body:**
```json
{
  "name": "Politik",
  "description": "Berita seputar politik"
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| name | string | ✅ | 2-100 karakter |
| description | string | ❌ | Max 500 karakter |

---

#### PUT /api/categories/:id
Update kategori.

**Auth:** ✅ Bearer Token

**Role:** ADMIN only

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId kategori |

**Request Body:**
```json
{
  "name": "Politik Indonesia",
  "description": "Berita politik Indonesia"
}
```

---

#### DELETE /api/categories/:id
Hapus kategori.

**Auth:** ✅ Bearer Token

**Role:** ADMIN only

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId kategori |

---

#### PATCH /api/categories/:id/toggle
Toggle aktif/nonaktif kategori.

**Auth:** ✅ Bearer Token

**Role:** ADMIN only

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId kategori |

---

### News (`/api/news`)

#### GET /api/news
Lihat semua berita.

**Auth:** Tidak perlu

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | string/number | 1 | Halaman |
| limit | string/number | 10 | Item per halaman (max 100) |
| category | string | - | Filter by category ID |
| search | string | - | Search by title |

**Example:** `GET /api/news?page=1&limit=10&category=64abc123&search=presiden`

---

#### GET /api/news/:id
Lihat berita by ID.

**Auth:** Tidak perlu

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

---

#### GET /api/news/slug/:slug
Lihat berita by slug.

**Auth:** Tidak perlu

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| slug | string | ✅ | URL-friendly slug |

**Example:** `GET /api/news/slug/presiden-resmi-melorotkan-aturan`

---

#### POST /api/news
Buat berita baru.

**Auth:** ✅ Bearer Token

**Role:** WRITER, ADMIN

**Request Body:**
```json
{
  "title": "Presiden Resmi Melorotkan Aturan Baru",
  "artikel": "Jakarta - Presiden secara resmi telah mengumumkan pelantikan...",
  "foto": "https://example.com/image.jpg",
  "category": "64abc123...",
  "tags": ["politik", "presiden", "berita"]
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| title | string | ✅ | 5-200 karakter |
| artikel | string | ✅ | 20-50000 karakter |
| foto | string | ❌ | URL valid atau kosong |
| category | string | ❌ | ObjectId kategori |
| tags | array | ❌ | Max 10 tag, each 1-50 karakter |

---

#### PUT /api/news/:id
Update berita.

**Auth:** ✅ Bearer Token

**Role:** WRITER (milik sendiri), ADMIN (semua berita)

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

**Request Body:**
```json
{
  "title": "Judul Diperbarui",
  "artikel": "Isi artikel yang diperbarui...",
  "foto": "https://example.com/new-image.jpg",
  "category": "64abc123...",
  "tags": ["tag1", "tag2"]
}
```

---

#### GET /api/news/my/list
Lihat berita sendiri (dashboard writer).

**Auth:** ✅ Bearer Token

**Role:** WRITER, ADMIN

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | string/number | 1 | Halaman |
| limit | string/number | 10 | Item per halaman |

---

#### POST /api/news/:id/request-delete
Request hapus berita (butuh approve admin).

**Auth:** ✅ Bearer Token

**Role:** WRITER (milik sendiri)

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

**Request Body:**
```json
{
  "reason": "Berita mengandung kesalahan informasi yang perlu dihapus"
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| reason | string | ✅ | 10-500 karakter |

---

#### DELETE /api/news/:id/request-delete
Batalkan request hapus berita.

**Auth:** ✅ Bearer Token

**Role:** WRITER (pembuat request)

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

---

#### GET /api/news/my/delete-requests
Lihat request hapus sendiri.

**Auth:** ✅ Bearer Token

**Role:** WRITER, ADMIN

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | string/number | 1 | Halaman |
| limit | string/number | 10 | Item per halaman |

---

#### GET /api/news/admin/delete-requests
Lihat semua request hapus pending.

**Auth:** ✅ Bearer Token

**Role:** ADMIN only

**Query Parameters:**
| Param | Type | Default | Description |
|-------|------|---------|-------------|
| page | string/number | 1 | Halaman |
| limit | string/number | 10 | Item per halaman |

---

#### POST /api/news/admin/delete-requests/:id/approve
Setujui request hapus & hapus berita.

**Auth:** ✅ Bearer Token

**Role:** ADMIN only

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

**Request Body:**
```json
{
  "reviewNote": "Request disetujui karena konten tidakvalid"
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| reviewNote | string | ❌ | Max 500 karakter |

---

#### POST /api/news/admin/delete-requests/:id/reject
Tolak request hapus berita.

**Auth:** ✅ Bearer Token

**Role:** ADMIN only

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

**Request Body:**
```json
{
  "reviewNote": "Request ditolak karena konten sudah akurat"
}
```

---

#### POST /api/news/:id/clap
Tepuk tangan berita.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

---

#### DELETE /api/news/:id/clap
Hapus tepuk tangan.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

---

#### POST /api/news/:id/save
Simpan berita.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

---

#### DELETE /api/news/:id/save
Hapus dari tersimpan.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId berita |

---

### Discussion (`/api/news/:newsId/discussions`)

#### GET /api/news/:newsId/discussions
Lihat semua komentar berita.

**Auth:** Tidak perlu

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| newsId | string | ✅ | ObjectId berita |

---

#### POST /api/news/:newsId/discussions
Posting komentar baru.

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| newsId | string | ✅ | ObjectId berita |

**Request Body:**
```json
{
  "comment": "Berita yang sangat informatif!"
}
```

**Parameters:**
| Field | Type | Required | Validation |
|-------|------|----------|------------|
| comment | string | ✅ | 1-2000 karakter |
| parentId | string | ❌ | ObjectId komentar (untuk reply) |

**Untuk Reply:**
```json
{
  "comment": "Setuju dengan komentar ini!",
  "parentId": "64abc123..."
}
```

---

### Discussion (`/api/discussions`)

#### PUT /api/discussions/:id
Edit komentar sendiri.

**Auth:** ✅ Bearer Token

**Role:** Owner only

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId komentar |

**Request Body:**
```json
{
  "comment": "Komentar yang sudah diperbarui"
}
```

---

#### DELETE /api/discussions/:id
Hapus komentar.

**Auth:** ✅ Bearer Token

**Role:** Owner, ADMIN

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| id | string | ✅ | ObjectId komentar |

---

## Flow Logic

### 1. Authentication Flow

```
┌─────────────┐
│   Register  │
│ POST /auth  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐     ┌─────────────┐
│ Validasi Zod    │────▶│ 400 Bad    │
│                  │     │ Request    │
└──────┬───────────┘     └─────────────┘
       │ Sukses
       ▼
┌──────────────────┐     ┌─────────────┐
│ Check Email &   │────▶│ 400 Email  │
│ Username        │     │ exists      │
└──────┬───────────┘     └─────────────┘
       │ Unique
       ▼
┌──────────────────┐
│ Hash Password   │
│ (bcrypt, 12)    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Save to MongoDB  │
│ Role: "user"    │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ 201 Created     │
│ Return user     │
└─────────────────┘
```

### 2. Login Flow

```
┌─────────────┐
│    Login    │
│ POST /auth  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐     ┌─────────────┐
│ Validasi Zod    │────▶│ 400 Bad    │
│                  │     │ Request    │
└──────┬───────────┘     └─────────────┘
       │ Sukses
       ▼
┌──────────────────┐     ┌──────────────────┐
│ Find User by     │────▶│ 401 Invalid     │
│ Email            │     │ Credentials     │
└──────┬───────────┘     └──────────────────┘
       │ Found
       ▼
┌──────────────────┐     ┌──────────────────┐
│ Verify Password  │────▶│ 401 Invalid     │
│ (bcrypt compare) │     │ Credentials     │
└──────┬───────────┘     └──────────────────┘
       │ Valid
       ▼
┌──────────────────┐
│ Generate JWT     │
│ (7 days)         │
│ {userId, role}  │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ 200 OK          │
│ {token, user}   │
└─────────────────┘
```

### 3. Create News Flow (Writer)

```
┌─────────────┐
│ Create News │
│ POST /news  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Auth Middleware │
│ Check JWT       │
└──────┬───────────┘
       │ Valid
       ▼
┌──────────────────┐     ┌──────────────────┐
│ Role Check      │────▶│ 403 Forbidden    │
│ writer/admin    │     │                   │
└──────┬───────────┘     └──────────────────┘
       │ Authorized
       ▼
┌──────────────────┐     ┌──────────────────┐
│ Validasi Zod    │────▶│ 400 Validation  │
│                  │     │ Failed          │
└──────┬───────────┘     └──────────────────┘
       │ Valid
       ▼
┌──────────────────┐
│ Generate Slug   │
│ (slugify)       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Check Slug      │
│ Uniqueness      │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Save to MongoDB  │
│ author: userId   │
│ deleteStatus:    │
│ "none"          │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ 201 Created     │
│ Return news     │
└─────────────────┘
```

### 4. Delete Request Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                    DELETE REQUEST FLOW                            │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  WRITER                         ADMIN                            │
│    │                              │                              │
│    │ POST /news/:id/request-delete│                              │
│    │ reason: "..."                │                              │
│    ▼                             │                              │
│ ┌──────────────────┐             │                              │
│ │ Check Ownership  │             │                              │
│ │ is author?       │             │                              │
│ └──────┬───────────┘             │                              │
│        │ Yes                    │                              │
│        ▼                        │                              │
│ ┌──────────────────┐             │                              │
│ │ Update News:     │             │                              │
│ │ deleteStatus =   │             │                              │
│ │ "pending"        │             │                              │
│ └──────┬───────────┘             │                              │
│        │                        │                              │
│        ▼                        ▼                              │
│    ┌──────────────────────────────┐                             │
│    │         200 OK               │                             │
│    │  Request submitted           │                             │
│    └──────────────────────────────┘                             │
│                                       │                          │
│                                       ▼                          │
│                          GET /news/admin/delete-requests         │
│                          (View pending requests)                 │
│                                       │                          │
│                        ┌──────────────┴──────────────┐          │
│                        │                              │          │
│                        ▼                              ▼          │
│              ┌─────────────────┐         ┌─────────────────┐   │
│              │ POST .../approve │         │ POST .../reject │   │
│              └────────┬────────┘         └────────┬────────┘   │
│                       │                             │            │
│                       ▼                             ▼            │
│         ┌─────────────────────┐     ┌─────────────────────┐     │
│         │ Update News:        │     │ Update News:        │     │
│         │ deleteStatus =      │     │ deleteStatus =      │     │
│         │ "approved"          │     │ "rejected"          │     │
│         └────────┬────────────┘     └─────────────────────┘     │
│                  │                                           │
│                  ▼                                           │
│         ┌─────────────────────┐                               │
│         │ Delete News from    │                               │
│         │ MongoDB             │                               │
│         └─────────────────────┘                               │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

### 5. Clap & Save Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLAP FLOW                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  USER                                                          │
│    │                                                          │
│    │ POST /news/:id/clap                                      │
│    ▼                                                          │
│ ┌──────────────────┐                                           │
│ │ Check News      │──Not Found──▶ 404                         │
│ │ exists?         │                                           │
│ └──────┬──────────┘                                           │
│        │ Exists                                               │
│        ▼                                                      │
│ ┌──────────────────┐                                           │
│ │ Check if already │──Already clapped──▶ 400 Already clapped  │
│ │ clapped?         │                                           │
│ └──────┬──────────┘                                           │
│        │ Not yet                                              │
│        ▼                                                      │
│ ┌──────────────────┐                                           │
│ │ Add to User      │                                           │
│ │ .claps array     │                                           │
│ └──────┬──────────┘                                           │
│        │                                                      │
│        ▼                                                      │
│ ┌──────────────────┐                                           │
│ │ Increment News  │                                           │
│ │ .clapCount++     │                                           │
│ └──────┬──────────┘                                           │
│        │                                                      │
│        ▼                                                      │
│ ┌──────────────────┐                                           │
│ │ 200 OK          │                                           │
│ │ Clap successful  │                                           │
│ └──────────────────┘                                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## MongoDB Schemas

### User Collection

```javascript
{
  _id: ObjectId,
  fullName: String,           // required
  username: String,           // required, unique
  email: String,              // required, unique, lowercase
  password: String,           // required, hashed (bcrypt)
  role: String,              // enum: "admin" | "writer" | "user", default: "user"
  savedNews: [ObjectId],      // ref: News, default: []
  claps: [ObjectId],         // ref: News, default: []
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - email: 1 (unique)
// - username: 1 (unique)
// - role: 1
```

### Category Collection

```javascript
{
  _id: ObjectId,
  name: String,               // required, unique
  slug: String,               // required, unique, lowercase
  description: String,        // optional
  createdBy: ObjectId,        // ref: User
  isActive: Boolean,          // default: true
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - slug: 1 (unique)
// - isActive: 1
```

### News Collection

```javascript
{
  _id: ObjectId,
  title: String,               // required
  slug: String,                // required, unique, lowercase
  foto: String,                // URL, default: null
  artikel: String,             // required
  author: ObjectId,            // ref: User, required
  category: ObjectId,          // ref: Category, default: null
  tags: [String],              // default: []
  views: Number,                // default: 0
  clapCount: Number,            // default: 0
  saveCount: Number,           // default: 0
  // Delete Request Fields
  deleteStatus: String,         // enum: "none" | "pending" | "approved" | "rejected"
  deleteRequestedBy: ObjectId, // ref: User
  deleteReason: String,
  deleteReviewedBy: ObjectId,  // ref: User
  deleteReviewedAt: Date,
  deleteReviewNote: String,
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - author: 1
// - category: 1
// - slug: 1 (unique)
// - deleteStatus: 1
// - createdAt: -1
```

### Discussion Collection

```javascript
{
  _id: ObjectId,
  newsId: ObjectId,            // ref: News, required
  userId: ObjectId,             // ref: User, required
  parentId: ObjectId,           // ref: Discussion (for replies), default: null
  comment: String,              // required
  createdAt: Date,
  updatedAt: Date
}

// Indexes:
// - newsId: 1, createdAt: -1
// - parentId: 1
// - userId: 1
```

---

## Request/Response Examples

### Success Response

```json
// POST /api/auth/register
{
  "sukses": true,
  "pesan": "Registrasi berhasil",
  "data": {
    "_id": "64abc123def456...",
    "fullName": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "savedNews": [],
    "claps": [],
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### Validation Error Response

```json
{
  "sukses": false,
  "pesan": "Validasi gagal",
  "kesalahan": {
    "title": {
      "_errors": ["Judul minimal 5 karakter"]
    },
    "email": {
      "_errors": ["Format email tidak valid"]
    }
  }
}
```

### Not Found Response

```json
{
  "sukses": false,
  "pesan": "Berita tidak ditemukan"
}
```

### Forbidden Response

```json
{
  "sukses": false,
  "pesan": "Anda tidak memiliki izin untuk memperbarui berita ini"
}
```

---

## JWT Token Structure

```json
{
  "userId": "64abc123def456...",
  "role": "writer",
  "iat": 1705312200,
  "exp": 1705917000
}
```

**Note:** Token expires in 7 days.

---

## Pagination Response Format

```json
{
  "sukses": true,
  "pesan": "Berhasil mengambil daftar berita",
  "data": {
    "data": [...],
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

---

## Filter Examples

### News Filter
```
GET /api/news?page=1&limit=10&category=64abc123&search=presiden
```

### User Filter
```
GET /api/users?page=1&limit=20&role=writer&search=john
```

### News by Author (Dashboard)
```
GET /api/news/my/list?page=1&limit=10
```

---

## Default Values

| Field | Default |
|-------|---------|
| user.role | "user" |
| news.views | 0 |
| news.clapCount | 0 |
| news.saveCount | 0 |
| news.deleteStatus | "none" |
| category.isActive | true |
| pagination.limit | 10 |
| pagination.page | 1 |

---

## Reply System (Nested Comments)

### Overview

Sistem diskusi mendukung nested comments (reply) dengan menggunakan `parentId`.

### Hierarki:

```
Comment A (parentId: null)
│
├── Reply A1 (parentId: Comment A)
│   │
│   └── Reply A1.1 (parentId: Reply A1)
│       │
│       └── Reply A1.1.1 (parentId: Reply A1.1)  ← bisa reply further
│
├── Reply A2 (parentId: Comment A)
│
└── Reply A3 (parentId: Comment A)

Comment B (parentId: null)
│
└── Reply B1 (parentId: Comment B)
```

### Flow Logic Reply:

```
┌──────────────────────────────────────────────────────────────────┐
│                    CREATE REPLY FLOW                              │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│  USER                                                            │
│    │                                                             │
│    │ POST /api/news/:newsId/discussions                          │
│    │ Body: { comment: "...", parentId: "comment_id" }           │
│    ▼                                                             │
│ ┌──────────────────┐                                             │
│ │ Auth Check      │──Fail──▶ 401 Unauthorized                  │
│ │ Bearer Token    │                                             │
│ └──────┬──────────┘                                             │
│        │ OK                                                     │
│        ▼                                                         │
│ ┌──────────────────┐                                             │
│ │ Validate Body   │──Fail──▶ 400 Validation Error               │
│ │ Zod Schema     │                                             │
│ │ comment: required│                                            │
│ │ parentId: optional│                                           │
│ └──────┬──────────┘                                             │
│        │ Valid                                                  │
│        ▼                                                        │
│ ┌──────────────────┐                                             │
│ │ News Exists?    │──No──▶ 404 Berita tidak ditemukan           │
│ └──────┬──────────┘                                             │
│        │ Yes                                                    │
│        ▼                                                        │
│ ┌──────────────────┐                                             │
│ │ parentId given? │──No──▶ Create as main comment (parentId: null)
│ └──────┬──────────┘                                             │
│        │ Yes                                                    │
│        ▼                                                        │
│ ┌──────────────────┐                                             │
│ │ Parent Comment  │──Not Found──▶ 400 Komentar induk tidak ditemukan
│ │ Exists?        │                                             │
│ └──────┬──────────┘                                             │
│        │ Found                                                  │
│        ▼                                                        │
│ ┌──────────────────┐                                             │
│ │ Parent belongs   │──No──▶ 400 Komentar tidak belongs to berita ini
│ │ to same news?   │                                             │
│ └──────┬──────────┘                                             │
│        │ Yes                                                    │
│        ▼                                                        │
│ ┌──────────────────┐                                             │
│ │ Save to MongoDB │                                             │
│ │ parentId: id    │                                             │
│ │ newsId: newsId  │                                             │
│ │ userId: userId  │                                             │
│ └──────┬──────────┘                                             │
│        │                                                        │
│        ▼                                                        │
│ ┌──────────────────┐                                             │
│ │ 201 Created     │                                             │
│ │ Return reply    │                                             │
│ └──────────────────┘                                             │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

### API Endpoint untuk Reply:

#### POST /api/news/:newsId/discussions

**Auth:** ✅ Bearer Token

**Role:** Semua authenticated user

**URI Parameters:**
| Param | Type | Required | Description |
|-------|------|----------|-------------|
| newsId | string | ✅ | ObjectId berita |

**Request Body (Reply):**
```json
{
  "comment": "Balasan yang sangat bagus!",
  "parentId": "64abc123def456789..."  // ObjectId komentar induk
}
```

**Parameters:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| comment | string | ✅ | 1-2000 karakter | Isi balasan |
| parentId | string | ❌ | ObjectId valid | ID komentar induk (kosongkan untuk komentar utama) |

### Get Discussions dengan Replies:

#### GET /api/news/:newsId/discussions

**Auth:** Tidak perlu

**Response Structure:**
```json
{
  "sukses": true,
  "pesan": "Berhasil mengambil komentar",
  "data": [
    {
      "_id": "64abc123...",
      "newsId": "64xyz789...",
      "userId": {
        "_id": "64user...",
        "username": "johndoe",
        "fullName": "John Doe"
      },
      "parentId": null,
      "comment": "Komentar utama",
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T10:30:00.000Z",
      "replies": [
        {
          "_id": "64reply1...",
          "newsId": "64xyz789...",
          "userId": {
            "_id": "64user2...",
            "username": "janedoe",
            "fullName": "Jane Doe"
          },
          "parentId": "64abc123...",
          "comment": "Balasan untuk komentar utama",
          "createdAt": "2024-01-15T11:00:00.000Z",
          "updatedAt": "2024-01-15T11:00:00.000Z"
        }
      ]
    }
  ]
}
```

### Delete dengan Replies:

**CATATAN:** Saat menghapus komentar yang memiliki replies:
1. Semua replies akan ikut dihapus
2. Ini berlaku untuk delete oleh owner atau admin

```
DELETE /api/discussions/:id

Logic:
1. Find comment by ID
2. Check ownership (owner OR admin)
3. Delete all replies where parentId = comment_id
4. Delete the comment itself
```

### Rules Reply:

| Rule | Description |
|------|-------------|
| **Depth** | Unlimited depth (bisa reply reply reply...) |
| **Same News** | Reply harus belongs to berita yang sama dengan parent comment |
| **Owner Only** | Hanya owner komentar yang bisa edit |
| **Owner/Admin** | Owner atau admin bisa hapus |
| **Cascade Delete** | Hapus komentar = hapus semua replies |

### Example Scenarios:

**Scenario 1: User ingin membalas komentar**
```bash
# Step 1: Lihat diskusi
GET /api/news/64xyz789/discussions

# Response includes comments with replies array

# Step 2: Reply ke komentar tertentu
POST /api/news/64xyz789/discussions
{
  "comment": "Setuju dengan pendapat ini!",
  "parentId": "64abc123"  # ID dari komentar yang di-reply
}
```

**Scenario 2: User ingin membuat komentar utama (bukan reply)**
```bash
# Tidak perlu parentId
POST /api/news/64xyz789/discussions
{
  "comment": "Ini komentar utama baru"
}
# Atau parentId: null / parentId: ""
```

**Scenario 3: Admin menghapus komentar yang ada reply-nya**
```bash
# Comment dengan ID ini memiliki 3 replies
DELETE /api/discussions/64abc123

# Result:
# - Reply 1 deleted
# - Reply 2 deleted  
# - Reply 3 deleted
# - Comment deleted
# Response: "Komentar berhasil dihapus"
```

### Discussion Collection Structure:

```javascript
// Main Comment
{
  _id: ObjectId("64abc123..."),
  newsId: ObjectId("64xyz789..."),
  userId: ObjectId("64user111..."),
  parentId: null,                    // null = main comment
  comment: "Komentar utama",
  createdAt: ISODate("2024-01-15T10:30:00Z"),
  updatedAt: ISODate("2024-01-15T10:30:00Z")
}

// Reply (nested comment)
{
  _id: ObjectId("64reply111..."),
  newsId: ObjectId("64xyz789..."),
  userId: ObjectId("64user222..."),
  parentId: ObjectId("64abc123..."), // Points to parent comment
  comment: "Balasan untuk komentar utama",
  createdAt: ISODate("2024-01-15T11:00:00Z"),
  updatedAt: ISODate("2024-01-15T11:00:00Z")
}

// Nested Reply (reply to reply)
{
  _id: ObjectId("64nested111..."),
  newsId: ObjectId("64xyz789..."),
  userId: ObjectId("64user333..."),
  parentId: ObjectId("64reply111..."), // Points to parent reply
  comment: "Balasan untuk balasan",
  createdAt: ISODate("2024-01-15T12:00:00Z"),
  updatedAt: ISODate("2024-01-15T12:00:00Z")
}
```

### Request/Response Example - Create Reply:

**Request:**
```bash
POST /api/news/64xyz789/discussions
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "comment": "Balasan yang sangat informatif!",
  "parentId": "64abc123def456789"
}
```

**Response:**
```json
{
  "sukses": true,
  "pesan": "Komentar berhasil diposting",
  "data": {
    "_id": "64reply999...",
    "newsId": "64xyz789...",
    "userId": {
      "_id": "64currentuser...",
      "username": "currentuser",
      "fullName": "Current User"
    },
    "parentId": "64abc123def456789",
    "comment": "Balasan yang sangat informatif!",
    "createdAt": "2024-01-15T15:00:00.000Z",
    "updatedAt": "2024-01-15T15:00:00.000Z"
  }
}
```

### Request/Response Example - Update Reply:

**Request:**
```bash
PUT /api/discussions/64reply999
Content-Type: application/json
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

{
  "comment": "Komentar yang sudah diperbarui"
}
```

**Response:**
```json
{
  "sukses": true,
  "pesan": "Komentar berhasil diperbarui",
  "data": {
    "_id": "64reply999...",
    "newsId": "64xyz789...",
    "userId": {
      "_id": "64currentuser...",
      "username": "currentuser",
      "fullName": "Current User"
    },
    "parentId": "64abc123def456789",
    "comment": "Komentar yang sudah diperbarui",
    "createdAt": "2024-01-15T15:00:00.000Z",
    "updatedAt": "2024-01-15T16:00:00.000Z"
  }
}
```

### Validation Error - Reply:

```json
{
  "sukses": false,
  "pesan": "Validasi gagal",
  "kesalahan": {
    "comment": {
      "_errors": ["Komentar tidak boleh kosong"]
    },
    "parentId": {
      "_errors": ["Parent ID tidak valid"]
    }
  }
}
```

### Not Found Error - Parent Comment:

```json
{
  "sukses": false,
  "pesan": "Komentar induk tidak ditemukan"
}
```

### Wrong News Error:

```json
{
  "sukses": false,
  "pesan": "Komentar tidak belongs to berita ini"
}
```
