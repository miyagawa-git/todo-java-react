package com.example;

import org.mybatis.spring.annotation.MapperScan;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.info.Info;

@OpenAPIDefinition(
		  info = @Info(
		    title = "Todo API",
		    version = "1.0.0",
		    description = "TodoアプリのバックエンドAPI"
		  )
		)
@SpringBootApplication
@MapperScan("com.example.mapper")
public class TodoBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(TodoBackendApplication.class, args);
	}

}
