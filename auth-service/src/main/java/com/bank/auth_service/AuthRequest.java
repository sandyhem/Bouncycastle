package com.bank.auth_service;

public record AuthRequest(
    String sessionId,
    String clientPublicKey,
    String signature,
    String kemCiphertext
) {}