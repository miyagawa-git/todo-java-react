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
        c.setAllowedOriginPatterns(List.of(
            "https://*.vercel.app",         // Vercel preview & production
            "http://localhost:5173"         // 開発用(Vite等)
        ));
        c.setAllowedMethods(List.of("GET","POST","PUT","DELETE","OPTIONS"));
        c.setAllowedHeaders(List.of("*"));
        c.setAllowCredentials(true);
        return c;
      }))
      .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
      .authorizeHttpRequests(auth -> auth
         // プリフライト許可
        .requestMatchers(org.springframework.http.HttpMethod.OPTIONS, "/**").permitAll()
        .requestMatchers("/auth/**", "/v3/api-docs/**", "/swagger-ui/**").permitAll()
        .anyRequest().authenticated()
      )
      // TODO:未認証アクセスは 401 を返すよう明示
//      .exceptionHandling(ex -> ex.authenticationEntryPoint((req, res, e) -> {
//        res.sendError(HttpServletResponse.SC_UNAUTHORIZED);
//      }))
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

      // ---- 1) 素通し対象（公開パス／Swagger／静的ファイル／プリフライト）----
      final String path = req.getServletPath();
      if ("OPTIONS".equalsIgnoreCase(req.getMethod())
          || path.startsWith("/auth/")
          || path.startsWith("/v3/api-docs")
          || path.startsWith("/swagger-ui")
          || path.equals("/")
          || path.equals("/index.html")
          || path.startsWith("/assets/")    // Viteの静的
          || path.startsWith("/static/")    
          || path.equals("/favicon.ico")) {
        chain.doFilter(req, res);
        return;
      }

      // ---- 2) Authorizationが無ければ何もせず次へ（匿名のままSecurityへ）----
      final String h = req.getHeader("Authorization");
      if (h == null || !h.startsWith("Bearer ")) {
        chain.doFilter(req, res);
        return;
      }

      // ---- 3) Bearerがあるときだけトークン検証し、OKなら認証をセット ----
      try {
        final String token = h.substring(7);
        final String username = jwt.extractUsername(token);

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
          UserDetails ud = uds.loadUserByUsername(username);
          UsernamePasswordAuthenticationToken auth =
              new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
          auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
          SecurityContextHolder.getContext().setAuthentication(auth);
        }
        chain.doFilter(req, res);

      } catch (io.jsonwebtoken.ExpiredJwtException e) {
        // 期限切れは 401（再ログイン促し）
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setHeader("WWW-Authenticate",
            "Bearer error=\"invalid_token\", error_description=\"expired\"");
        // return でチェーンを止める
      } catch (Exception e) {
        // 署名不正など → 401 に統一（403を返さない）
        res.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
        res.setHeader("WWW-Authenticate",
            "Bearer error=\"invalid_token\", error_description=\"invalid or malformed\"");
        // e.printStackTrace();
      }
    }
  };
}

}
