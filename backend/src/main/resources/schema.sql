/* ############ ROLES ############ */
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='roles' AND schema_id=SCHEMA_ID('dbo'))
EXEC('
  CREATE TABLE dbo.roles (
    id INT IDENTITY PRIMARY KEY,
    code NVARCHAR(50) UNIQUE NOT NULL,
    name NVARCHAR(100) NOT NULL
  )
');

/* ############ USERS ############ */
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='users' AND schema_id=SCHEMA_ID('dbo'))
EXEC('
  CREATE TABLE dbo.users (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    email NVARCHAR(255) NOT NULL UNIQUE,
    password_hash NVARCHAR(255) NOT NULL,
    full_name NVARCHAR(255) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
  )
');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Users_Email' AND object_id=OBJECT_ID('dbo.users'))
EXEC('CREATE INDEX IX_Users_Email ON dbo.users(email)');

/* ############ USER_ROLES ############ */
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='user_roles' AND schema_id=SCHEMA_ID('dbo'))
EXEC('
  CREATE TABLE dbo.user_roles (
    user_id UNIQUEIDENTIFIER NOT NULL
      FOREIGN KEY REFERENCES dbo.users(id) ON DELETE CASCADE,
    role_id INT NOT NULL
      FOREIGN KEY REFERENCES dbo.roles(id) ON DELETE CASCADE,
    CONSTRAINT PK_user_roles PRIMARY KEY (user_id, role_id)
  )
');

/* ############ LOCATIONS ############ */
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='locations' AND schema_id=SCHEMA_ID('dbo'))
EXEC('
  CREATE TABLE dbo.locations (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    owner_id UNIQUEIDENTIFIER NOT NULL
      FOREIGN KEY REFERENCES dbo.users(id),
    name NVARCHAR(200) NOT NULL,
    description NVARCHAR(MAX) NULL,
    address_text NVARCHAR(500) NULL,
    geo_lat FLOAT NULL,
    geo_lng FLOAT NULL,
    cover_image_url NVARCHAR(600) NULL,
    is_active BIT NOT NULL DEFAULT 1,
    created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
  )
');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Locations_Active' AND object_id=OBJECT_ID('dbo.locations'))
EXEC('CREATE INDEX IX_Locations_Active ON dbo.locations(is_active)');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Locations_Geo' AND object_id=OBJECT_ID('dbo.locations'))
EXEC('CREATE INDEX IX_Locations_Geo ON dbo.locations(geo_lat, geo_lng)');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Locations_Name' AND object_id=OBJECT_ID('dbo.locations'))
EXEC('CREATE INDEX IX_Locations_Name ON dbo.locations(name)');

/* ############ LOCATION_UNITS ############ */
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='location_units' AND schema_id=SCHEMA_ID('dbo'))
EXEC('
  CREATE TABLE dbo.location_units (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    location_id UNIQUEIDENTIFIER NOT NULL
      FOREIGN KEY REFERENCES dbo.locations(id) ON DELETE CASCADE,
    code NVARCHAR(100) NOT NULL,
    name NVARCHAR(200) NULL,
    image_url NVARCHAR(600) NULL,
    short_desc NVARCHAR(300) NULL,
    capacity INT NOT NULL DEFAULT 1,
    price_hourly DECIMAL(10,2) NOT NULL,
    is_active BIT NOT NULL DEFAULT 1,
    CONSTRAINT UQ_unit_code UNIQUE (location_id, code)
  )
');

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Units_Price' AND parent_object_id=OBJECT_ID('dbo.location_units'))
EXEC('ALTER TABLE dbo.location_units ADD CONSTRAINT CK_Units_Price CHECK (price_hourly > 0)');

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Units_Capacity' AND parent_object_id=OBJECT_ID('dbo.location_units'))
EXEC('ALTER TABLE dbo.location_units ADD CONSTRAINT CK_Units_Capacity CHECK (capacity >= 1)');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Units_Location_Active' AND object_id=OBJECT_ID('dbo.location_units'))
EXEC('CREATE INDEX IX_Units_Location_Active ON dbo.location_units(location_id, is_active)');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Units_Location' AND object_id=OBJECT_ID('dbo.location_units'))
EXEC('CREATE INDEX IX_Units_Location ON dbo.location_units(location_id)');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Units_Name' AND object_id=OBJECT_ID('dbo.location_units'))
EXEC('CREATE INDEX IX_Units_Name ON dbo.location_units(name)');

/* ############ BOOKINGS ############ */
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='bookings' AND schema_id=SCHEMA_ID('dbo'))
EXEC('
  CREATE TABLE dbo.bookings (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL
      FOREIGN KEY REFERENCES dbo.users(id),
    location_unit_id UNIQUEIDENTIFIER NOT NULL
      FOREIGN KEY REFERENCES dbo.location_units(id),
    start_time DATETIME2(0) NOT NULL,
    end_time   DATETIME2(0) NOT NULL,
    hours      INT NOT NULL CHECK (hours >= 1),
    total      DECIMAL(10,2) NOT NULL,
    status NVARCHAR(20) NOT NULL DEFAULT ''HOLD'',
    booking_code NVARCHAR(32) NULL,
    created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
  )
');

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Bookings_Hourly' AND parent_object_id=OBJECT_ID('dbo.bookings'))
EXEC('
  ALTER TABLE dbo.bookings ADD CONSTRAINT CK_Bookings_Hourly CHECK (
    DATEPART(MINUTE, start_time) = 0
    AND DATEADD(HOUR, hours, start_time) = end_time
    AND hours >= 1
  )
');

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Bookings_Status' AND parent_object_id=OBJECT_ID('dbo.bookings'))
EXEC('
  ALTER TABLE dbo.bookings ADD CONSTRAINT CK_Bookings_Status CHECK (
    status IN (''HOLD'',''PENDING_REVIEW'',''CONFIRMED'',''CANCELLED'',''EXPIRED'')
  )
');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UQ_Booking_Slot' AND object_id=OBJECT_ID('dbo.bookings'))
EXEC('
  CREATE UNIQUE INDEX UQ_Booking_Slot
    ON dbo.bookings(location_unit_id, start_time, end_time)
    WHERE status IN (''HOLD'',''PENDING_REVIEW'',''CONFIRMED'')
');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='IX_Bookings_User' AND object_id=OBJECT_ID('dbo.bookings'))
EXEC('CREATE INDEX IX_Bookings_User ON dbo.bookings(user_id, start_time DESC)');

IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name='UQ_Bookings_Code' AND object_id=OBJECT_ID('dbo.bookings'))
EXEC('CREATE UNIQUE INDEX UQ_Bookings_Code ON dbo.bookings(booking_code) WHERE booking_code IS NOT NULL');

/* ############ PAYMENTS ############ */
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='payments' AND schema_id=SCHEMA_ID('dbo'))
EXEC('
  CREATE TABLE dbo.payments (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    booking_id UNIQUEIDENTIFIER NOT NULL UNIQUE
      FOREIGN KEY REFERENCES dbo.bookings(id) ON DELETE CASCADE,
    method NVARCHAR(30) NOT NULL DEFAULT ''QR'',
    amount DECIMAL(10,2) NOT NULL,
    proof_url NVARCHAR(600) NULL,
    status NVARCHAR(20) NOT NULL DEFAULT ''PENDING'',
    reviewed_by UNIQUEIDENTIFIER NULL
      FOREIGN KEY REFERENCES dbo.users(id),
    reviewed_at DATETIME2(0) NULL,
    created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
  )
');

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Payments_Amt' AND parent_object_id=OBJECT_ID('dbo.payments'))
EXEC('ALTER TABLE dbo.payments ADD CONSTRAINT CK_Payments_Amt CHECK (amount >= 0)');

IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name='CK_Payments_Status' AND parent_object_id=OBJECT_ID('dbo.payments'))
EXEC('ALTER TABLE dbo.payments ADD CONSTRAINT CK_Payments_Status CHECK (status IN (''PENDING'',''APPROVED'',''REJECTED''))');

/* ############ REVIEWS ############ */
IF NOT EXISTS (SELECT 1 FROM sys.tables WHERE name='reviews' AND schema_id=SCHEMA_ID('dbo'))
EXEC('
  CREATE TABLE dbo.reviews (
    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    booking_id UNIQUEIDENTIFIER NOT NULL UNIQUE
      FOREIGN KEY REFERENCES dbo.bookings(id) ON DELETE CASCADE,
    user_id UNIQUEIDENTIFIER NOT NULL
      FOREIGN KEY REFERENCES dbo.users(id),
    location_id UNIQUEIDENTIFIER NOT NULL
      FOREIGN KEY REFERENCES dbo.locations(id),
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment NVARCHAR(1000) NULL,
    created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
  )
');
