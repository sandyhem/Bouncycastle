package com.bank.account_service;

public record SignRequest(
    String privateKey,
    String sessionId,
    String serverNonce
) {}
