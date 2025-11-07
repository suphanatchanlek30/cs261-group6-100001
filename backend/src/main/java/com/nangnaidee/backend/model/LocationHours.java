// backend/src/main/java/com/nangnaidee/backend/model/LocationHours.java

package com.nangnaidee.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@ToString(onlyExplicitlyIncluded = true)
@Entity
@Table(name = "location_hours", schema = "dbo")
public class LocationHours {

    @Id
    @Column(name = "id", columnDefinition = "uniqueidentifier")
    @EqualsAndHashCode.Include
    @ToString.Include
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "location_id", nullable = false)
    private Location location;

    @Column(name = "location_id", nullable = false, insertable = false, updatable = false)
    private UUID locationId;

    @Column(name = "day_of_week", nullable = false)
    @Enumerated(EnumType.STRING)
    @ToString.Include
    private DayOfWeek dayOfWeek;

    @Column(name = "start_time", nullable = false)
    private LocalTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalTime endTime;

    @PrePersist
    public void prePersist() {
        if (id == null) {
            id = UUID.randomUUID();
        }
    }

    public enum DayOfWeek {
        MONDAY("mon"),
        TUESDAY("tue"), 
        WEDNESDAY("wed"),
        THURSDAY("thu"),
        FRIDAY("fri"),
        SATURDAY("sat"),
        SUNDAY("sun");

        private final String shortName;

        DayOfWeek(String shortName) {
            this.shortName = shortName;
        }

        public String getShortName() {
            return shortName;
        }

        public static DayOfWeek fromShortName(String shortName) {
            for (DayOfWeek day : values()) {
                if (day.shortName.equals(shortName)) {
                    return day;
                }
            }
            throw new IllegalArgumentException("Invalid day: " + shortName);
        }
    }
}