package com.bank.auth_service;

import jakarta.annotation.PostConstruct;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.pqc.jcajce.provider.BouncyCastlePQCProvider;
import org.springframework.stereotype.Component;

import java.security.KeyPair;
import java.security.KeyPairGenerator;
import java.security.PrivateKey;
import java.security.PublicKey;
import java.security.Security;

@Component
public class ServerKeyStore {

    private KeyPair dsaKeyPair;
    private KeyPair kemKeyPair;

    @PostConstruct
    public void init() throws Exception {
        // Register both providers if not already registered
        if (Security.getProvider("BC") == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        if (Security.getProvider("BCPQC") == null) {
            Security.addProvider(new BouncyCastlePQCProvider());
        }

        // Generate ML-DSA-65 key pair (no parameter initialization needed for standard variants)
        KeyPairGenerator dsaGen = KeyPairGenerator.getInstance("ML-DSA-65", "BC");
        dsaKeyPair = dsaGen.generateKeyPair();

        // Generate ML-KEM-768 key pair
        KeyPairGenerator kemGen = KeyPairGenerator.getInstance("ML-KEM-768", "BC");
        kemKeyPair = kemGen.generateKeyPair();
    }

    public PublicKey getDsaPublic() { return dsaKeyPair.getPublic(); }
    public PrivateKey getKemPrivate() { return kemKeyPair.getPrivate(); }
    public PublicKey getKemPublic() { return kemKeyPair.getPublic(); }
}
