// src/main/java/com/nangnaidee/backend/exception/EmailAlreadyExistsException.java

package com.nangnaidee.backend.exception;

public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}