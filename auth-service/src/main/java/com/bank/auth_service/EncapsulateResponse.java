package com.bank.auth_service;

public record EncapsulateResponse(
    String ciphertext,
    String sharedSecret
) {}
