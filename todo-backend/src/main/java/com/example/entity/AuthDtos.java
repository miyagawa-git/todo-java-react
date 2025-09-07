package com.example.entity;

public class AuthDtos {
	public record LoginRequest(String username, String password) {}
	public record LoginResponse(String token) {}

}
