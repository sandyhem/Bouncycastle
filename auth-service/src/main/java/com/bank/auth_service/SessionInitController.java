package com.bank.auth_service;

import org.bouncycastle.pqc.jcajce.provider.BouncyCastlePQCProvider;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.crypto.Cipher;
import java.security.*;
import java.security.spec.X509EncodedKeySpec;
import java.util.Base64;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/session")
public class SessionInitController {

    private final SessionStore store;
    private final ServerKeyStore serverKeyStore;

    public SessionInitController(SessionStore store, ServerKeyStore serverKeyStore) {
        this.store = store;
        this.serverKeyStore = serverKeyStore;
    }

    @PostMapping("/init")
    public Map<String, String> init() {
        String sessionId = UUID.randomUUID().toString();
        byte[] nonce = new byte[32];
        new SecureRandom().nextBytes(nonce);

        store.create(sessionId, nonce);

        return Map.of(
                "sessionId", sessionId,
                "serverNonce", Base64.getEncoder().encodeToString(nonce)
        );
    }
    
    @PostMapping("/auth")
    public ResponseEntity<?> authenticate(@RequestBody AuthRequest req)
            throws Exception {
        // Ensure BC provider is registered
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastlePQCProvider());
        }

        byte[] nonce = store.getNonce(req.sessionId());
        if (nonce == null) {
            return ResponseEntity.status(400).body("Invalid session");
        }

        // 1️⃣ Verify ML-DSA signature
        try {
            Signature sig = Signature.getInstance("ML-DSA-65", "BC");
            sig.initVerify(decodePublicKey(req.clientPublicKey()));
            sig.update(req.sessionId().getBytes());
            sig.update(nonce);

            if (!sig.verify(Base64.getDecoder().decode(req.signature()))) {
                return ResponseEntity.status(401).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(401).body("Signature verification failed: " + e.getMessage());
        }

        // 2️⃣ ML-KEM decapsulation
        try {
            byte[] ciphertext = Base64.getDecoder().decode(req.kemCiphertext());
            
            // Decapsulate using server's ML-KEM private key
            PrivateKey kemPrivateKey = serverKeyStore.getKemPrivate();
            
            // Use Cipher for KEM decapsulation with ML-KEM-768 (UNWRAP_MODE)
            Cipher kemCipher = Cipher.getInstance("ML-KEM-768", "BC");
            kemCipher.init(Cipher.UNWRAP_MODE, kemPrivateKey);
            javax.crypto.SecretKey sharedSecretKey = (javax.crypto.SecretKey) kemCipher.unwrap(ciphertext, "RAW", javax.crypto.Cipher.SECRET_KEY);
            byte[] sharedSecret = sharedSecretKey.getEncoded();

            // 3️⃣ Derive session key from shared secret
            byte[] sessionKey = sha256(sharedSecret);
            store.establish(req.sessionId(), sessionKey);

            return ResponseEntity.ok(Map.of("status", "SESSION_ESTABLISHED"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body("KEM decapsulation failed: " + e.getMessage());
        }
    }

    private PublicKey decodePublicKey(String encodedKey) throws Exception {
        byte[] decodedKey = Base64.getDecoder().decode(encodedKey);
        X509EncodedKeySpec spec = new X509EncodedKeySpec(decodedKey);
        KeyFactory kf = KeyFactory.getInstance("ML-DSA-65", "BC");
        return kf.generatePublic(spec);
    }

    private byte[] sha256(byte[] input) throws NoSuchAlgorithmException {
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        return digest.digest(input);
    }
}
