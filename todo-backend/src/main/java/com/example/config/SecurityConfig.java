package com.example.config;

import java.io.IOException;
import java.util.List;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.filter.OncePerRequestFilter;

import com.example.service.CustomUserDetailsService;
import com.example.service.JwtService;

//SecurityConfig.java
@Configuration @EnableWebSecurity(debug=true)
public class SecurityConfig {
private final JwtService jwt;
private final CustomUserDetailsService uds;

public SecurityConfig(CustomUserDetailsService uds, JwtService jwt) {
    this.uds = uds; this.jwt = jwt;
  }

    @Bean
    SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    return http
      .csrf(csrf -> csrf.disable())
      .cors(cors -> cors.configurationSource(req -> {
        CorsConfiguration c = new CorsConfiguration();
        c.setAllowedOrigins(List.of("http://localhost:5173"));
        c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        return c;
      }))
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
        .requestMatchers("/auth/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
//        .anyRequest().permitAll()
        .anyRequest().authenticated()
      )
      .addFilterBefore(jwtAuthFilter(), UsernamePasswordAuthenticationFilter.class)
      .userDetailsService(uds)
      .build();
  }

  @Bean
  public PasswordEncoder passwordEncoder(){ return new BCryptPasswordEncoder(); }

  @Bean
  public OncePerRequestFilter jwtAuthFilter() {
    return new OncePerRequestFilter() {
      @Override
      protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain)
          throws ServletException, IOException {
        String h = req.getHeader("Authorization");

        if (h != null && h.startsWith("Bearer ")) {
          String token = h.substring(7);
          try {
            String username = jwt.extractUsername(token);
            if (username != null && SecurityContextHolder.getContext().getAuthentication()==null) {
              UserDetails ud = uds.loadUserByUsername(username);
              UsernamePasswordAuthenticationToken auth =
                new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
              auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
              SecurityContextHolder.getContext().setAuthentication(auth);
              System.out.println("Authorization header: " + h);
              System.out.println("Username from token: " + username);
              System.out.println("UserDetails found: " + ud);
            }
            //ExpiredJwtException(期限切れ)を捕まえたら401を返してchainを進めないように
          } catch (io.jsonwebtoken.ExpiredJwtException e) {
              res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
              res.setHeader("WWW-Authenticate",
                "Bearer error=\"invalid_token\", error_description=\"expired\"");
              return; 
          }  catch (Exception ignored) {ignored.printStackTrace();}
          
        }
        chain.doFilter(req, res);
      }
    };
  }
}
