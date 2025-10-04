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

    // ใช้ Haversine บน SQL Server (radians/sin/cos/acos พร้อม OFFSET/FETCH)
    private static final String BASE_SELECT = """
        SELECT l.id, l.name, l.address_text, l.geo_lat, l.geo_lng, l.cover_image_url,
               (6371 * acos(
                   cos(radians(:lat)) * cos(radians(l.geo_lat)) *
                   cos(radians(l.geo_lng) - radians(:lng)) +
                   sin(radians(:lat)) * sin(radians(l.geo_lat))
               )) AS distance_km
        FROM dbo.locations l
        WHERE (:q IS NULL OR l.name LIKE :qLike OR l.address_text LIKE :qLike)
          AND l.geo_lat IS NOT NULL AND l.geo_lng IS NOT NULL
        HAVING (6371 * acos(
                   cos(radians(:lat)) * cos(radians(l.geo_lat)) *
                   cos(radians(l.geo_lng) - radians(:lng)) +
                   sin(radians(:lat)) * sin(radians(l.geo_lat))
               )) <= :radiusKm
        """;

    @Override
    public List<LocationListItem> searchNear(String q, double lat, double lng, double radiusKm, int offset, int size) {
        String sql = BASE_SELECT + " ORDER BY distance_km ASC OFFSET :offset ROWS FETCH NEXT :size ROWS ONLY";
        var qy = em.createNativeQuery(sql)
                .setParameter("lat", lat)
                .setParameter("lng", lng)
                .setParameter("radiusKm", radiusKm)
                .setParameter("offset", offset)
                .setParameter("size", size);

        if (q == null || q.isBlank()) {
            qy.setParameter("q", null);
            qy.setParameter("qLike", null);
        } else {
            String like = "%" + q.trim() + "%";
            qy.setParameter("q", q);
            qy.setParameter("qLike", like);
        }

        @SuppressWarnings("unchecked")
        List<Object[]> rows = qy.getResultList();
        List<LocationListItem> items = new ArrayList<>();
        for (Object[] r : rows) {
            UUID id = (UUID) r[0];
            String name = (String) r[1];
            String addr = (String) r[2];
            Double la = r[3] == null ? null : ((BigDecimal) r[3]).doubleValue();
            Double ln = r[4] == null ? null : ((BigDecimal) r[4]).doubleValue();
            String img = (String) r[5];
            Double dist = r[6] == null ? null : ((Double) r[6]);
            if (dist == null && r[6] instanceof BigDecimal bd) dist = bd.doubleValue();
            items.add(new LocationListItem(id, name, addr, la, ln, img, dist));
        }
        return items;
    }

    @Override
    public long countNear(String q, double lat, double lng, double radiusKm) {
        String countSql = """
          SELECT COUNT(*) FROM (
             """ + BASE_SELECT + """
          ) as sub
          """;
        var qy = em.createNativeQuery(countSql)
                .setParameter("lat", lat)
                .setParameter("lng", lng)
                .setParameter("radiusKm", radiusKm);

        if (q == null || q.isBlank()) {
            qy.setParameter("q", null);
            qy.setParameter("qLike", null);
        } else {
            String like = "%" + q.trim() + "%";
            qy.setParameter("q", q);
            qy.setParameter("qLike", like);
        }

        Object single = qy.getSingleResult();
        if (single instanceof BigDecimal bd) return bd.longValue();
        if (single instanceof Number n) return n.longValue();
        return Long.parseLong(single.toString());
    }
}
