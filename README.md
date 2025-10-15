# cs261-group6-100001
---

# NangNaiDee — Monorepo Guide

โครงสร้างนี้ใช้ **repo เดียว** สำหรับทั้ง **Backend (Spring Boot)** และ **Frontend (Next.js/React หรือที่ทีมใช้)**

```
.
├─ backend/      # Spring Boot (Java 17, Maven, WAR)
├─ frontend/     # Next.js/React/… (Node 18+)
├─ README.md
```

> **หลักการสำคัญ:**
>
> * ทุกงาน = 1 branch (ไม่ทำบน `main`)
> * ชื่อ branch ชัดเจน แยก **ฝั่งงาน** (fe/be) + **ประเภทงาน** (feat/fix/chore/docs/refactor) + **คำอธิบายสั้น**
> * commit message ตาม Conventional Commits (สั้น ชัด)
> * ก่อน push/PR ให้ `git pull --rebase` เพื่อดึงงานล่าสุดมารวมเสมอ
> * ห้าม push secret (`.env`, password) ขึ้น repo

---

## 0) เตรียมเครื่องครั้งแรก

```bash
# clone โปรเจกต์ (ครั้งแรก)
git clone https://github.com/<ORG_OR_USER>/<REPO>.git
cd <REPO>

# ตั้ง main เป็น upstream (ครั้งเดียว)
git branch --set-upstream-to=origin/main main

# ดึงล่าสุดรอบแรก
git pull --rebase
```

---

## 1) กติกาตั้งชื่อ Branch

รูปแบบทั่วไป:

```
<area>/<type>-<short-kebab-title>
```

* `<area>`:

  * `fe` = Frontend
  * `be` = Backend
* `<type>`:

  * `feat` = เพิ่มฟีเจอร์
  * `fix`  = แก้บั๊ก
  * `chore` = งานจิปาถะ (เช่น config, build)
  * `docs` = เอกสาร
  * `refactor` = ปรับโครงสร้างโค้ด ไม่เปลี่ยนพฤติกรรม
* `<short-kebab-title>`: คำสั้นๆ เชิงคำอธิบาย ใช้ขีด `-` คั่น

---

## Docker Quickstart (Backend + Frontend เชื่อมต่อ SQL Server ภายนอก)

**สำหรับผู้ที่มี SQL Server ติดตั้งในเครื่องอยู่แล้ว**

1) เตรียมตัวแปรสภาพแวดล้อม

```powershell
Copy-Item .env.example .env -Force
Copy-Item frontend/.env.local.example frontend/.env.local -Force
```

เปิดแก้ไฟล์ `.env` แล้วกำหนดค่าให้ตรงกับ SQL Server ที่มีอยู่:
- **DB_HOST=host.docker.internal** (สำหรับเชื่อมต่อจาก Docker ไปยัง localhost)
- **DB_PORT=1433** (หรือพอร์ตที่ SQL Server ใช้)
- **DB_USERNAME=sa** (หรือ username ที่ใช้)
- **MSSQL_SA_PASSWORD=รหัสผ่าน SQL Server**
- **MSSQL_DB=ชื่อฐานข้อมูลที่มีอยู่แล้ว** (เช่น NangNaideeDB2)
- **APP_JWT_SECRET=สตริงยาวๆ แบบสุ่ม**
- **APP_JWT_EXPIRATION=604800000**
- ค่า Cloudinary หากใช้งาน (ว่างได้)

ตรวจสอบ `frontend/.env.local` ให้มี:
- NEXT_PUBLIC_URL=http://localhost:8080/api

2) **สำคัญ:** ตรวจสอบว่า SQL Server เปิดรับ TCP/IP connections

- เปิด **SQL Server Configuration Manager**
- ไปที่ **SQL Server Network Configuration** > **Protocols for MSSQLSERVER**
- ตรวจสอบว่า **TCP/IP** เป็น **Enabled**
- Restart SQL Server service หากเพิ่งเปิด TCP/IP

3) สร้างฐานข้อมูลใน SQL Server (ถ้ายังไม่มี)

เปิด **SQL Server Management Studio (SSMS)** หรือใช้ `sqlcmd`:
```sql
CREATE DATABASE NangNaideeDB2;
GO
```

4) เปิด Docker Desktop (Windows) ให้ขึ้นสถานะ Running และใช้ Linux containers

5) รันทั้งโปรเจ็กต์จากโฟลเดอร์ root ของ repo

```powershell
docker compose up --build
```

เมื่อสำเร็จ:
- SQL Server: localhost:1433 (ใช้งานตามปกติ)
- Backend: http://localhost:8080 (health: /api/health)
- Frontend: http://localhost:3000

คำสั่งที่ใช้บ่อย:

```powershell
docker compose up -d --build     # รันเบื้องหลัง
docker compose logs -f backend   # ดู log ของ backend
docker compose down              # ปิดทุก service
docker compose down -v           # ปิดและล้าง volume (ล้างฐานข้อมูล)
```

**ตัวอย่าง**

* `fe/feat-auth-ui` — ทำหน้า UI Login/Register
* `be/feat-auth-register` — ทำ API สมัครสมาชิก
* `fe/fix-search-bar` — แก้บั๊กช่องค้นหาค้าง
* `be/refactor-payment-service` — จัดโครง Service จ่ายเงินใหม่
* `chore/ci-add-actions` — เพิ่ม workflow CI (ไม่จำกัด area)

---

## 2) มาตรฐาน Commit Message (Conventional Commits)

รูปแบบ:

```
<type>(<scope>): <short message>
```

* `type`: feat | fix | chore | docs | refactor | test | style
* `scope`: fe | be | payment | auth | search (หรือโมดูลที่เกี่ยว)
* ตัวอย่าง

  * `feat(fe): add login form validation`
  * `fix(be): prevent double booking overlap`
  * `chore(repo): add root .gitignore`

---

## 3) วงจรการทำงาน (Full Loop) — เหมือนกันทั้ง Frontend/Backend

### A) เริ่มงานใหม่

```bash
# อยู่ที่ root repo
git checkout main
git pull --rebase             # ดึงล่าสุด

# สร้าง branch ใหม่จาก main
git checkout -b fe/feat-auth-ui
# หรือฝั่ง backend
# git checkout -b be/feat-auth-register
```

### B) ลงมือทำงาน (ในโฟลเดอร์ที่เกี่ยว)

```bash
# ตัวอย่าง Frontend
cd frontend
npm i            # ครั้งแรกเท่านั้น
npm run dev      # รัน dev server

# ตัวอย่าง Backend
cd ../backend
mvn spring-boot:run
```

### C) เช็กสถานะ / commit

```bash
git status
git add .
git commit -m "feat(fe): implement login form + basic validations"
```

### D) ดึงของคนอื่นมารวม (ก่อน push ทุกครั้ง)

```bash
git fetch origin
git pull --rebase origin main   # รวมงานล่าสุดเข้ามาแบบเรียงประวัติสวย
# ถ้ามี conflict -> แก้ไฟล์ -> git add <ไฟล์> -> git rebase --continue
```

### E) push ขึ้นรีโมต + สร้าง PR

```bash
git push -u origin fe/feat-auth-ui
# เปิดหน้า GitHub แล้วกด "Compare & pull request"
# ใส่คำอธิบาย (What/Why/How to test) ชัดเจน
```

### F) Code Review → แก้ตามรีวิว → Merge

* Reviewer ตรวจ: โค้ดสะอาด/ปลอดภัย/ผ่านรัน
* แก้ไขเพิ่มเติมใน branch เดิม → commit/push เพิ่ม
* **เมื่อ CI ผ่าน + ได้รับ approval** → Merge เข้าสู่ `main` (แนะนำ **Squash & Merge**)

### G) ล้างงานเก่า

```bash
# หลัง merge
git checkout main
git pull --rebase
git branch -d fe/feat-auth-ui           # ลบ branch local
git push origin --delete fe/feat-auth-ui # ลบ branch บนรีโมต (ถ้าไม่ใช้แล้ว)
```

---

## 4) ตัวอย่าง Flow — Frontend

**งาน:** เพิ่มหน้า Search + Filter

```bash
git checkout main
git pull --rebase
git checkout -b fe/feat-search-filter-ui

cd frontend
npm i  # (ถ้ายังไม่เคย)
npm run dev

# coding...
git add .
git commit -m "feat(fe): search page with filters (date, time, radius)"
git pull --rebase origin main
git push -u origin fe/feat-search-filter-ui

# สร้าง PR → รอรีวิว → Squash & Merge
git checkout main
git pull --rebase
git branch -d fe/feat-search-filter-ui
git push origin --delete fe/feat-search-filter-ui
```

---

## 5) ตัวอย่าง Flow — Backend

**งาน:** เพิ่ม API `/api/auth/register`

```bash
git checkout main
git pull --rebase
git checkout -b be/feat-auth-register

cd backend
mvn spring-boot:run

# coding (entity/dto/repo/service/controller)
git add .
git commit -m "feat(be): register endpoint with role validation and bcrypt"
git pull --rebase origin main
git push -u origin be/feat-auth-register

# สร้าง PR → รอรีวิว → Squash & Merge
git checkout main
git pull --rebase
git branch -d be/feat-auth-register
git push origin --delete be/feat-auth-register
```

---

## 6) การแก้ Conflict แบบสั้น

1. `git pull --rebase origin main`
2. Gitบอกไฟล์ไหนชน → เปิดไฟล์ แก้ส่วน `<<<<<<<` … `=======` … `>>>>>>>`
3. `git add <ไฟล์ที่แก้>`
4. `git rebase --continue`
5. ทดสอบรัน → push ต่อ

> ถ้าพังมาก ๆ: `git rebase --abort` แล้วย้อนกลับมาที่จุดก่อนเริ่ม rebase

---

## 7) ข้อตกลงเพิ่มเติม (แนะนำทีม)

* **PR ขนาดเล็ก**: โค้ดน้อย รีวิวเร็ว ลด conflict
* **CI ก่อน merge**: รัน `mvn -q -DskipTests=false test` (backend) และ `npm run build` (frontend)
* **ห้าม commit secrets**: `.env`, DB password ให้ใช้ไฟล์ `.local` ที่อยู่ใน `.gitignore`
* **Branch Protection**: ป้องกัน push ตรงเข้า `main` และบังคับให้มี reviewer อย่างน้อย 1 คน

---

## 8) คำสั่งสรุปที่ใช้บ่อย (ชี้เป้า)

```bash
# เริ่มงานใหม่
git checkout main && git pull --rebase
git checkout -b fe/feat-<something>   # หรือ be/feat-<something>

# ทำงาน + commit
git add . && git commit -m "feat(fe): ..."

# อัปเดตจาก main ก่อน push
git pull --rebase origin main

# push + เปิด PR
git push -u origin fe/feat-<something>

# หลัง merge
git checkout main && git pull --rebase
git branch -d fe/feat-<something>
git push origin --delete fe/feat-<something>
```

---
