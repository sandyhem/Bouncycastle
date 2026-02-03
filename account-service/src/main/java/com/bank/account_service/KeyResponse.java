package com.bank.account_service;

import java.security.PrivateKey;
import java.security.PublicKey;

public record KeyResponse(
    String publicKey,
    String privateKey
) {}
