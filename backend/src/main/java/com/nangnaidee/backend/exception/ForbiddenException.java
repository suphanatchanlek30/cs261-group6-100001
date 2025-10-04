// src/main/java/com/nangnaidee/backend/exception/ForbiddenException.java

package com.nangnaidee.backend.exception;

public class ForbiddenException extends RuntimeException {
    public ForbiddenException(String message) {
        super(message);
    }
}
