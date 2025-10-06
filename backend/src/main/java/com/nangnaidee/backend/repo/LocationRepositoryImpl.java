// src/main/java/com/nangnaidee/backend/repo/LocationRepositoryImpl.java

package com.nangnaidee.backend.repo;

import com.nangnaidee.backend.dto.LocationListItem;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Repository
public class LocationRepositoryImpl implements LocationRepositoryCustom {

    @PersistenceContext
    private EntityManager em;

    // ใช้หมายเลขต่อเนื่อง: ?1=lat, ?2=lng, ?3=q (nullable), ?4=qLike (nullable)
    private static final String BASE_INNER = """
        SELECT l.id, l.name, l.address_text, l.geo_lat, l.geo_lng, l.cover_image_url,
               (6371 * acos(
                   cos(radians(?1)) * cos(radians(l.geo_lat)) *
                   cos(radians(l.geo_lng) - radians(?2)) +
                   sin(radians(?1)) * sin(radians(l.geo_lat))
               )) AS distance_km
        FROM dbo.locations l
        WHERE (?3 IS NULL OR l.name LIKE ?4 OR l.address_text LIKE ?4)
          AND l.geo_lat IS NOT NULL AND l.geo_lng IS NOT NULL
        """;

    @Override
    public List<LocationListItem> searchNear(String q, double lat, double lng, double radiusKm, int offset, int size) {
        // ต่อหมายเลขต่อจากอินเนอร์: ?5=radiusKm, ?6=offset, ?7=size
        String sql = """
            SELECT * FROM (
                """ + BASE_INNER + """
            ) AS t
            WHERE t.distance_km <= ?5
            ORDER BY t.distance_km ASC
            OFFSET ?6 ROWS FETCH NEXT ?7 ROWS ONLY
            """;

        var qy = em.createNativeQuery(sql)
                .setParameter(1, lat)
                .setParameter(2, lng)
                .setParameter(5, radiusKm)
                .setParameter(6, offset)
                .setParameter(7, size);

        if (q == null || q.isBlank()) {
            qy.setParameter(3, null);
            qy.setParameter(4, null);
        } else {
            String like = "%" + q.trim() + "%";
            qy.setParameter(3, q);
            qy.setParameter(4, like);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = qy.getResultList();
        List<LocationListItem> items = new ArrayList<>();
        for (Object[] r : rows) {
            // id อาจมาเป็น String หรือ UUID ขึ้นกับไดรเวอร์
            UUID id;
            Object idObj = r[0];
            if (idObj instanceof UUID u) id = u;
            else if (idObj instanceof String s) id = UUID.fromString(s);
            else throw new IllegalStateException("Unsupported id type: " + idObj);

            String name = (String) r[1];
            String addr = (String) r[2];
            Double la = (r[3] instanceof Number n) ? n.doubleValue() : null;
            Double ln = (r[4] instanceof Number n) ? n.doubleValue() : null;
            String img = (String) r[5];
            Double dist = (r[6] instanceof Number n) ? n.doubleValue() : null;

            items.add(new LocationListItem(id, name, addr, la, ln, img, dist));
        }
        return items;
    }

    @Override
    public long countNear(String q, double lat, double lng, double radiusKm) {
        // ต่อหมายเลขต่อจากอินเนอร์: ?5=radiusKm
        String countSql = """
            SELECT COUNT(*) FROM (
                """ + BASE_INNER + """
            ) AS t
            WHERE t.distance_km <= ?5
            """;

        var qy = em.createNativeQuery(countSql)
                .setParameter(1, lat)
                .setParameter(2, lng)
                .setParameter(5, radiusKm);

        if (q == null || q.isBlank()) {
            qy.setParameter(3, null);
            qy.setParameter(4, null);
        } else {
            String like = "%" + q.trim() + "%";
            qy.setParameter(3, q);
            qy.setParameter(4, like);
        }

        Object single = qy.getSingleResult();
        if (single instanceof BigDecimal bd) return bd.longValue();
        if (single instanceof Number n) return n.longValue();
        return Long.parseLong(single.toString());
    }
}
