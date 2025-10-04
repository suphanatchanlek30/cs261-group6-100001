/* data.sql */
/* ROLES */
INSERT INTO dbo.roles(code, name)
SELECT * FROM (VALUES
                   ('ADMIN','Administrator'),
                   ('HOST','Host'),
                   ('USER','End User')
              ) AS r(code,name)
WHERE NOT EXISTS (SELECT 1 FROM dbo.roles WHERE code=r.code);

/* ADMIN USER — ใช้ INT IDENTITY */
IF NOT EXISTS (SELECT 1 FROM dbo.users WHERE email='admin@yourapp.com')
  INSERT INTO dbo.users(email,password_hash,full_name,is_active)
  VALUES ('admin@yourapp.com','password','Platform Admin',1);

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
