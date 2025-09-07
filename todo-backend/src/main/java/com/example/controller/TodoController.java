package com.example.controller;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.entity.Todo;
import com.example.entity.User;
import com.example.mapper.TodoMapper;
import com.example.mapper.UserMapper;

import io.swagger.v3.oas.annotations.security.SecurityRequirement;


@RestController
@SecurityRequirement(name = "bearerAuth")
@RequestMapping("/todos")
public class TodoController {
  private final TodoMapper mapper;
  private final UserMapper userMapper;


  public TodoController(TodoMapper mapper, UserMapper userMapper, PasswordEncoder passwordEncoder) {
    this.mapper = mapper; this.userMapper = userMapper;
  }

  private Integer currentUserId() {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
//    return userMapper.findByUsername(username).getId();
    User user = userMapper.findByUsername(username);
    if (user == null|| username.equals("anonymousUser")) {
      throw new UsernameNotFoundException("ユーザーが見つかりません: " + username);
    }
    return user.getId();
  }
  //@SecurityRequirement(name = "bearerAuth")
  @GetMapping
  public List<Todo> list() { return mapper.findAllByUserId(currentUserId()); }
  //@SecurityRequirement(name = "bearerAuth")
  @GetMapping("/{id}")
  public ResponseEntity<Todo> get(@PathVariable Integer id) {
    Todo t = mapper.findByIdAndUserId(id, currentUserId());
    return (t==null) ? ResponseEntity.notFound().build() : ResponseEntity.ok(t);
  }

  public record TodoReq(@NotBlank String title, String description, boolean done,
		  LocalDate dueDate, short priority) {}

  @PostMapping
  public Todo create(@RequestBody @Valid TodoReq req) {
    Todo t = new Todo();
    t.setUserId(currentUserId());
    t.setTitle(req.title());
    t.setDescription(req.description());
    t.setDone(req.done());
    mapper.insert(t);
    return t;
  }

  @PutMapping("/{id}")
  public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody @Valid TodoReq req) {
    Todo t = mapper.findByIdAndUserId(id, currentUserId());
    if (t==null) return ResponseEntity.notFound().build();
    t.setTitle(req.title()); t.setDescription(req.description()); t.setDone(req.done());
    t.setDueDate(req.dueDate()); t.setPriority(req.priority());
    mapper.update(t);
    return ResponseEntity.noContent().build();
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<?> delete(@PathVariable Integer id) {
    int rows = mapper.delete(id, currentUserId());
    return (rows==0) ? ResponseEntity.notFound().build() : ResponseEntity.noContent().build();
  }
  

  

}

//  private final Map<Integer, Todo> store = new ConcurrentHashMap<>();
//  private final AtomicInteger seq = new AtomicInteger(1000);
//
//  public TodoController() {
//    store.put(1, new Todo(1,"Read docs"));
//    store.put(2, new Todo(2,"Write code"));
//  }
//
//  @GetMapping public List<Todo> list(){ return new ArrayList<>(store.values()); }
//
//  public record TodoReq(@NotBlank String title, String description, boolean done){}
//
//  @PostMapping public Todo create(@RequestBody @Valid TodoReq req){
//    int id = seq.incrementAndGet();
//    Todo t = new Todo(id, req.title()); t.setDescription(req.description()); t.setDone(req.done());
//    store.put(id, t); return t;
//  }
//
//  @PutMapping("/{id}") public ResponseEntity<?> update(@PathVariable Integer id, @RequestBody @Valid TodoReq req){
//    Todo t = store.get(id); if (t==null) return ResponseEntity.notFound().build();
//    t.setTitle(req.title()); t.setDescription(req.description()); t.setDone(req.done());
//    return ResponseEntity.noContent().build();
//  }
//
//  @DeleteMapping("/{id}") public ResponseEntity<?> del(@PathVariable Integer id){
//    return store.remove(id)!=null ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
//  }
