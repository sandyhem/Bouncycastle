package com.bank.account_service;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class SessionStore {

    private final Map<String, byte[]> sessions = new ConcurrentHashMap<>();
    private final Map<String, byte[]> nonces = new ConcurrentHashMap<>();

    public void create(String sessionId, byte[] nonce) {
        nonces.put(sessionId, nonce);
    }

    public byte[] getNonce(String sessionId) {
        return nonces.get(sessionId);
    }

    public void establish(String sessionId, byte[] key) {
        sessions.put(sessionId, key);
        nonces.remove(sessionId);
    }

    public byte[] getKey(String sessionId) {
        return sessions.get(sessionId);
    }
}
