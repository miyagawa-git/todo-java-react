package com.example.mapper;

import java.util.List;

import org.apache.ibatis.annotations.Delete;
import org.apache.ibatis.annotations.Insert;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Options;
import org.apache.ibatis.annotations.Select;
import org.apache.ibatis.annotations.Update;

import com.example.entity.Todo;

@Mapper
public interface TodoMapper {
  @Select("select * from todos where user_id = #{userId} order by id desc")
  List<Todo> findAllByUserId(Integer userId);

  @Select("select * from todos where id = #{id} and user_id = #{userId}")
  Todo findByIdAndUserId(Integer id, Integer userId);

  @Insert("""
    insert into todos (user_id, title, description, done)
    values (#{userId}, #{title}, #{description}, #{done})
  """)
  @Options(useGeneratedKeys = true, keyProperty = "id")
  void insert(Todo todo);

  @Update("""
    update todos set title=#{title}, description=#{description}, done=#{done}, updated_at=now(),
    priority=#{priority}
    where id=#{id} and user_id=#{userId}
  """)
  int update(Todo todo);

  @Delete("delete from todos where id=#{id} and user_id=#{userId}")
  int delete(Integer id, Integer userId);
}
