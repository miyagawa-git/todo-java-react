package com.example.service;

import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;

//JwtService.java
@Service
public class JwtService {
@Value("${jwt.secret}") String secret;
@Value("${jwt.expiration-minutes}") long exp;

public String generate(String username) {
 Instant now = Instant.now();
 return Jwts.builder()
   .setSubject(username)
   .setIssuedAt(Date.from(now))
   .setExpiration(Date.from(now.plus(Duration.ofMinutes(exp))))
   .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
   .compact();
}

public String username(String token) {
 return Jwts.parserBuilder()
   .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
   .build().parseClaimsJws(token).getBody().getSubject();
}

public String generateToken(String username) {
    Instant now = Instant.now();
    return Jwts.builder()
      .setSubject(username)
      .setIssuedAt(Date.from(now))
      .setExpiration(Date.from(now.plus(Duration.ofMinutes(exp))))
      .signWith(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)), SignatureAlgorithm.HS256)
      .compact();
  }

  public String extractUsername(String token) {
    return Jwts.parserBuilder()
      .setSigningKey(Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8)))
      .build()
      .parseClaimsJws(token)
      .getBody()
      .getSubject();
  }
}
