package com.example.controller;

import jakarta.validation.Valid;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.User;
import com.example.mapper.UserMapper;
import com.example.service.JwtService;

//AuthController.java認証API
@RestController @RequestMapping("/auth")
public class AuthController {
private final JwtService jwt;
private final UserMapper userMapper;
@Autowired
private PasswordEncoder passwordEncoder;

private final AuthenticationManagerBuilder amb;
public AuthController(AuthenticationManagerBuilder amb, JwtService jwt,UserMapper userMapper
		,PasswordEncoder passwordEncoder) {
	this.userMapper = userMapper;this.passwordEncoder = passwordEncoder;
	this.amb = amb; this.jwt = jwt;
  }

public record LoginRequest(String username, String password){}
public record LoginResponse(String token){}

@PostMapping("/login")
public LoginResponse login(@RequestBody @Valid LoginRequest req) {
  Authentication a = amb.getObject().authenticate(
    new UsernamePasswordAuthenticationToken(req.username(), req.password()));
  SecurityContextHolder.getContext().setAuthentication(a);
  return new LoginResponse(jwt.generateToken(req.username()));
}

public record UserReq(String username, String password, String roles) {}

@PostMapping("/register")
public String registerUser(@RequestBody @Valid UserReq req) {
  User u = new User();
  u.setUsername(req.username());
  u.setPassword(passwordEncoder.encode(req.password())); // BCryptで暗号化
  u.setRoles("0"); 
//  u.setRoles(req.roles()); 
  userMapper.insert(u);
  return "User registered";
}

}
