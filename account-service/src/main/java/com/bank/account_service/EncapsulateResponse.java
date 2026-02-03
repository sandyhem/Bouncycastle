package com.bank.account_service;

public record EncapsulateResponse(
    String ciphertext,
    String sharedSecret
) {}
