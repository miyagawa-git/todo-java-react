package com.example.service;

import java.util.Arrays;
import java.util.List;

import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.example.entity.User;
import com.example.mapper.UserMapper;

//UserDetails & 認証
@Service
public class CustomUserDetailsService implements UserDetailsService {
  private final UserMapper userMapper;
  public CustomUserDetailsService(UserMapper userMapper){ this.userMapper=userMapper; }

  @Override
  public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {

	User u = userMapper.findByUsername(username);
    if (u == null) throw new UsernameNotFoundException("Not found");

    List<SimpleGrantedAuthority> auth = Arrays.stream(u.getRoles().split(","))
      .map(String::trim).map(SimpleGrantedAuthority::new).toList();
    
    return new org.springframework.security.core.userdetails.User(u.getUsername(), u.getPassword(), auth);
  }
}
