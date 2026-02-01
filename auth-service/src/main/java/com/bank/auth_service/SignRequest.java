package com.bank.auth_service;

public record SignRequest(
    String privateKey,
    String sessionId,
    String serverNonce
) {}
