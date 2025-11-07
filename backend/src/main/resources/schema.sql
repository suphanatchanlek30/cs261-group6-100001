/* src/main/resources/schema.sql */
-- ROLES
CREATE TABLE dbo.roles (
                           id INT IDENTITY PRIMARY KEY,
                           code NVARCHAR(50) UNIQUE NOT NULL,
                           name NVARCHAR(100) NOT NULL
);

-- USERS (INT IDENTITY)
CREATE TABLE dbo.users (
                           id INT IDENTITY(1,1) PRIMARY KEY,
                           email NVARCHAR(255) NOT NULL UNIQUE,
                           password_hash NVARCHAR(255) NOT NULL,
                           full_name NVARCHAR(255) NULL,
                           is_active BIT NOT NULL DEFAULT 1,
                           created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
);

CREATE INDEX IX_Users_Email ON dbo.users(email);

-- USER_ROLES (user_id = INT)
CREATE TABLE dbo.user_roles (
                                user_id INT NOT NULL
                                    FOREIGN KEY REFERENCES dbo.users(id) ON DELETE CASCADE,
                                role_id INT NOT NULL
                                    FOREIGN KEY REFERENCES dbo.roles(id) ON DELETE CASCADE,
                                CONSTRAINT PK_user_roles PRIMARY KEY (user_id, role_id)
);

-- LOCATIONS (owner_id = INT)
CREATE TABLE dbo.locations (
                               id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                               owner_id INT NOT NULL
                                   FOREIGN KEY REFERENCES dbo.users(id),
                               name NVARCHAR(200) NOT NULL,
                               description NVARCHAR(MAX) NULL,
                               address_text NVARCHAR(500) NULL,
                               geo_lat FLOAT NULL,
                               geo_lng FLOAT NULL,
                               cover_image_url NVARCHAR(600) NULL,
                               is_active BIT NOT NULL DEFAULT 1,
                               created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
);

CREATE INDEX IX_Locations_Active ON dbo.locations(is_active);
CREATE INDEX IX_Locations_Geo ON dbo.locations(geo_lat, geo_lng);
CREATE INDEX IX_Locations_Name ON dbo.locations(name);

-- LOCATION_UNITS
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
);

ALTER TABLE dbo.location_units ADD CONSTRAINT CK_Units_Price CHECK (price_hourly > 0);
ALTER TABLE dbo.location_units ADD CONSTRAINT CK_Units_Capacity CHECK (capacity >= 1);
CREATE INDEX IX_Units_Location_Active ON dbo.location_units(location_id, is_active);
CREATE INDEX IX_Units_Location ON dbo.location_units(location_id);
CREATE INDEX IX_Units_Name ON dbo.location_units(name);

-- BOOKINGS (user_id = INT)
CREATE TABLE dbo.bookings (
                              id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                              user_id INT NOT NULL
                                  FOREIGN KEY REFERENCES dbo.users(id),
                              location_unit_id UNIQUEIDENTIFIER NOT NULL
                                  FOREIGN KEY REFERENCES dbo.location_units(id),
                              start_time DATETIME2(0) NOT NULL,
                              end_time   DATETIME2(0) NOT NULL,
                              hours      INT NOT NULL CHECK (hours >= 1),
                              total      DECIMAL(10,2) NOT NULL,
                              status NVARCHAR(20) NOT NULL DEFAULT 'HOLD',
                              booking_code NVARCHAR(32) NULL,
                              created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
);

ALTER TABLE dbo.bookings ADD CONSTRAINT CK_Bookings_Hourly CHECK (
    DATEPART(MINUTE, start_time) = 0
        AND DATEADD(HOUR, hours, start_time) = end_time
        AND hours >= 1
    );

ALTER TABLE dbo.bookings ADD CONSTRAINT CK_Bookings_Status CHECK (
    status IN ('HOLD','PENDING_REVIEW','CONFIRMED','CANCELLED','EXPIRED')
    );

CREATE UNIQUE INDEX UQ_Booking_Slot
    ON dbo.bookings(location_unit_id, start_time, end_time)
    WHERE status IN ('HOLD','PENDING_REVIEW','CONFIRMED');

CREATE INDEX IX_Bookings_User ON dbo.bookings(user_id, start_time DESC);
CREATE UNIQUE INDEX UQ_Bookings_Code ON dbo.bookings(booking_code) WHERE booking_code IS NOT NULL;

-- PAYMENTS (reviewed_by = INT)
CREATE TABLE dbo.payments (
                              id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                              booking_id UNIQUEIDENTIFIER NOT NULL UNIQUE
                                  FOREIGN KEY REFERENCES dbo.bookings(id) ON DELETE CASCADE,
                              method NVARCHAR(30) NOT NULL DEFAULT 'QR',
                              amount DECIMAL(10,2) NOT NULL,
                              proof_url NVARCHAR(600) NULL,
                              status NVARCHAR(20) NOT NULL DEFAULT 'PENDING',
                              reviewed_by INT NULL
    FOREIGN KEY REFERENCES dbo.users(id),
                              reviewed_at DATETIME2(0) NULL,
                              created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
);

ALTER TABLE dbo.payments ADD CONSTRAINT CK_Payments_Amt CHECK (amount >= 0);
ALTER TABLE dbo.payments ADD CONSTRAINT CK_Payments_Status CHECK (status IN ('PENDING','APPROVED','REJECTED'));

-- REVIEWS (user_id = INT)
CREATE TABLE dbo.reviews (
                             id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                             booking_id UNIQUEIDENTIFIER NOT NULL UNIQUE
                                 FOREIGN KEY REFERENCES dbo.bookings(id) ON DELETE CASCADE,
                             user_id INT NOT NULL
                                 FOREIGN KEY REFERENCES dbo.users(id),
                             location_id UNIQUEIDENTIFIER NOT NULL
                                 FOREIGN KEY REFERENCES dbo.locations(id),
                             rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
                             comment NVARCHAR(1000) NULL,
                             created_at DATETIME2(0) NOT NULL DEFAULT SYSDATETIME()
);

-- LOCATIONS
ALTER TABLE dbo.locations
    ADD cover_image_public_id NVARCHAR(300) NULL;

-- LOCATION_UNITS
ALTER TABLE dbo.location_units
    ADD image_public_id NVARCHAR(300) NULL;

-- LOCATION_HOURS
--เราทําการสร้างตาราง location_hours เพื่อเก็บข้อมูลชั่วโมงการทํางานของสถานที่ต่างๆ ตอนแรกมันไม่มีตารางนี้
CREATE TABLE dbo.location_hours (
                                    id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
                                    location_id UNIQUEIDENTIFIER NOT NULL
                                        FOREIGN KEY REFERENCES dbo.locations(id) ON DELETE CASCADE,
                                    day_of_week NVARCHAR(10) NOT NULL,
                                    start_time TIME NOT NULL,
                                    end_time TIME NOT NULL,
                                    CONSTRAINT CK_location_hours_day CHECK (day_of_week IN ('MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY','SUNDAY')),
                                    CONSTRAINT CK_location_hours_time CHECK (start_time < end_time)
);

CREATE INDEX IX_location_hours_location ON dbo.location_hours(location_id);
CREATE INDEX IX_location_hours_day ON dbo.location_hours(location_id, day_of_week);