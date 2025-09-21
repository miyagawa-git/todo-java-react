package com.example.demo;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.authentication.builders.AuthenticationManagerBuilder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import com.example.controller.AuthController;
import com.example.entity.User;
import com.example.mapper.UserMapper;
import com.example.service.JwtService;

/**
 * AuthController の超軽量スモークテスト（standalone MockMvc）。
 *
 * - Spring Boot のコンテキストは起動しない（standaloneSetup）：コントローラを手で new する
 * - 依存（JwtService / UserMapper / PasswordEncoder / AuthenticationManagerBuilder）は Mockito のモックで差し替え
 * - 起動範囲を必要最小限に絞り、環境変数・DB・Flyway・Security に依存しない
 * - エンドポイントの“存在”と“最低限の契約”を検証する
 *    - /auth/login：ボディ無しなら 400 Bad Request を返す（ボディ必須）
 *    - /auth/register：PasswordEncoder でエンコード後に UserMapper#insert を呼ぶ
 * → Renderでも環境変数・DBなしで安全に動く
 */
class PublicApiSmokeTest {

  private MockMvc mvc;

  // 依存はすべて Mockito のモック
  private JwtService jwt;
  private UserMapper userMapper;
  private PasswordEncoder passwordEncoder;
  private AuthenticationManagerBuilder amb;

  @BeforeEach
  void setup() {
    jwt = mock(JwtService.class);
    userMapper = mock(UserMapper.class);
    passwordEncoder = mock(PasswordEncoder.class);
    amb = mock(AuthenticationManagerBuilder.class);

    AuthController controller = new AuthController(amb, jwt, userMapper, passwordEncoder);

    mvc = MockMvcBuilders.standaloneSetup(controller)
          .build();
  }

  /** ボディなしで /auth/login を叩いたら 400 を返す（存在確認＋バリデーション） */
  @Test
  void login_requires_body_returns_400() throws Exception {
    mvc.perform(post("/auth/login").contentType(MediaType.APPLICATION_JSON))
       .andExpect(status().isBadRequest());
  }

  /** /auth/register に正しいJSONを投げると、パスワードをエンコードして UserMapper.insert が呼ばれる */
  @Test
  void register_encodes_password_and_inserts_user() throws Exception {
    when(passwordEncoder.encode("pass")).thenReturn("ENC(pass)");

    mvc.perform(
        post("/auth/register")
          .contentType(MediaType.APPLICATION_JSON)
          .content("{\"username\":\"testuser\",\"password\":\"pass\",\"roles\":\"1\"}")
    ).andExpect(status().isOk());

    //コントローラ内で new された User はこちらから参照できないので、キャプチャして中身をチェックする
    ArgumentCaptor<User> captor = ArgumentCaptor.forClass(User.class);
    //userMapper.insert(...) が 1回だけ呼ばれたことを検証
    verify(userMapper, times(1)).insert(captor.capture());

    User saved = captor.getValue();
    //testuserがJSONでPOSTされたことの確認
    assertEquals("testuser", saved.getUsername());
    //passwordEncoder.encode("pass")が呼ばれたことの確認
    assertEquals("ENC(pass)", saved.getPassword());
  }
}
