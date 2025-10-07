// src/main/java/com/nangnaidee/backend/exception/UnprocessableEntityException.java

package com.nangnaidee.backend.exception;

public class UnprocessableEntityException extends RuntimeException {
    public UnprocessableEntityException(String message) {
        super(message);
    }
}
