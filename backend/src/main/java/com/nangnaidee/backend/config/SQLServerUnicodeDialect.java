package com.nangnaidee.backend.config;

import org.hibernate.boot.model.TypeContributions;
import org.hibernate.dialect.DatabaseVersion;
import org.hibernate.dialect.SQLServerDialect;
import org.hibernate.service.ServiceRegistry;

/**
 * Custom SQL Server Dialect ที่บังคับให้ใช้ NVARCHAR แทน VARCHAR เสมอ
 * เพื่อรองรับภาษาไทยและ Unicode อื่นๆ
 */
public class SQLServerUnicodeDialect extends SQLServerDialect {

    public SQLServerUnicodeDialect() {
        super(DatabaseVersion.make(15, 0)); // SQL Server 2019
    }

    @Override
    public void contributeTypes(TypeContributions typeContributions, ServiceRegistry serviceRegistry) {
        super.contributeTypes(typeContributions, serviceRegistry);

        // บังคับให้ String ทุกตัวใช้ NVARCHAR แทน VARCHAR
        // ไม่ต้องไปแก้ทุก @Column ใน Entity
    }

    @Override
    protected String columnType(int sqlTypeCode) {
        // Override การ map type เพื่อใช้ NVARCHAR
        switch (sqlTypeCode) {
            case java.sql.Types.VARCHAR:
            case java.sql.Types.CHAR:
                return "nvarchar($l)";
            case java.sql.Types.LONGVARCHAR:
            case java.sql.Types.CLOB:
                return "nvarchar(max)";
            default:
                return super.columnType(sqlTypeCode);
        }
    }
}
