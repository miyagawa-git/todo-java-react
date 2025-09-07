package com.example.mapper;

import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Select;

import com.example.entity.User;

@Mapper
public interface UserMapper {
  @Select("select * from users where username = #{username}")
  User findByUsername(String username);
  
  @Insert("""
		    insert into users ( username, password, roles)
		    values (#{username}, #{password}, #{roles})
		  """)
  void insert(User user);
}
