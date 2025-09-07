package com.example.entity;

import java.time.Instant;
import java.time.LocalDate;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

import com.fasterxml.jackson.annotation.JsonFormat;

import lombok.Data;

//@Data=自動で getter / setter / toString / equals / hashCode を生成してくれる
@Data 
public class Todo {
	  private Integer id;
	  private Integer userId;
	  private String title;
	  private String description;
	  private Boolean done;
	  private Instant createdAt;
	  private Instant updatedAt;
	  @Min(0) @Max(3)
	  private short priority = 0; // 0=なし, 1=低, 2=中, 3=高
	  @JsonFormat(pattern = "yyyy-MM-dd")
	  private LocalDate dueDate;
	}