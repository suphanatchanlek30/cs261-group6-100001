/* ROLES */
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE code='ADMIN')
  INSERT INTO dbo.roles(code,name) VALUES ('ADMIN','Administrator');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE code='HOST')
  INSERT INTO dbo.roles(code,name) VALUES ('HOST','Host');
IF NOT EXISTS (SELECT 1 FROM dbo.roles WHERE code='USER')
  INSERT INTO dbo.roles(code,name) VALUES ('USER','End User');

/* ADMIN USER (GUID คงที่) — แก้รหัสผ่านจริงก่อนใช้โปรดักชัน */
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email='admin@yourapp.com')
  INSERT INTO dbo.users(id,email,password_hash,full_name,is_active)
  VALUES ('11111111-1111-1111-1111-111111111111','admin@yourapp.com','password','Platform Admin',1);

/* MAP ADMIN -> ROLE ADMIN */
IF NOT EXISTS (
  SELECT 1
  FROM dbo.user_roles ur
  JOIN dbo.users u ON u.id=ur.user_id
  JOIN dbo.roles r ON r.id=ur.role_id
  WHERE u.email='admin@yourapp.com' AND r.code='ADMIN'
)
INSERT INTO dbo.user_roles(user_id, role_id)
SELECT u.id, r.id
FROM dbo.users u CROSS JOIN dbo.roles r
WHERE u.email='admin@yourapp.com' AND r.code='ADMIN';
