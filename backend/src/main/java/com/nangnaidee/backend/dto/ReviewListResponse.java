// src/main/java/com/nangnaidee/backend/dto/ReviewListResponse.java

package com.nangnaidee.backend.dto;

import java.util.List;

/**
 * Response DTO for location reviews list with pagination
 */
public class ReviewListResponse {
    
    private List<ReviewListItem> items;
    private int page;
    private int size;
    private long total;
    private int totalPages;
    
    public ReviewListResponse() {}
    
    public ReviewListResponse(List<ReviewListItem> items, int page, int size, long total, int totalPages) {
        this.items = items;
        this.page = page;
        this.size = size;
        this.total = total;
        this.totalPages = totalPages;
    }
    
    public List<ReviewListItem> getItems() {
        return items;
    }
    
    public void setItems(List<ReviewListItem> items) {
        this.items = items;
    }
    
    public int getPage() {
        return page;
    }
    
    public void setPage(int page) {
        this.page = page;
    }
    
    public int getSize() {
        return size;
    }
    
    public void setSize(int size) {
        this.size = size;
    }
    
    public long getTotal() {
        return total;
    }
    
    public void setTotal(long total) {
        this.total = total;
    }
    
    public int getTotalPages() {
        return totalPages;
    }
    
    public void setTotalPages(int totalPages) {
        this.totalPages = totalPages;
    }
}