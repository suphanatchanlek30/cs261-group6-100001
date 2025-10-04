// src/main/java/com/nangnaidee/backend/exception/InvalidCredentialsException.java
package com.nangnaidee.backend.exception;

public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException(String message) {
        super(message);
    }
}
