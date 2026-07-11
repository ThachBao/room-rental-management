package com.thachbao.room_rental_management.exception;


public class BadRequestException extends RuntimeException {
    public BadRequestException(String  message){
        super(message);
    }
}
