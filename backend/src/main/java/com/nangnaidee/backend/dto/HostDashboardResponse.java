package com.nangnaidee.backend.dto;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

public class HostDashboardResponse {

    public static class Cards {
        public int locationsTotal;
        public int pendingReview;
        public int approved;
        public BigDecimal todayIncome;

        public Cards(int locationsTotal, int pendingReview, int approved, BigDecimal todayIncome) {
            this.locationsTotal = locationsTotal;
            this.pendingReview = pendingReview;
            this.approved = approved;
            this.todayIncome = todayIncome;
        }
    }

    public static class BookingTrendItem {
        public LocalDate date;
        public int bookings;

        public BookingTrendItem(LocalDate date, int bookings) {
            this.date = date;
            this.bookings = bookings;
        }
    }

    public static class RevenueDailyItem {
        public LocalDate date;
        public BigDecimal revenue;

        public RevenueDailyItem(LocalDate date, BigDecimal revenue) {
            this.date = date;
            this.revenue = revenue;
        }
    }

    public Cards cards;
    public List<BookingTrendItem> bookingTrend;
    public List<RevenueDailyItem> revenueDaily;

    public HostDashboardResponse(Cards cards, List<BookingTrendItem> bookingTrend, List<RevenueDailyItem> revenueDaily) {
        this.cards = cards;
        this.bookingTrend = bookingTrend;
        this.revenueDaily = revenueDaily;
    }
}
