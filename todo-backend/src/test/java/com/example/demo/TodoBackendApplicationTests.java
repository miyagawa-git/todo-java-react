package com.example.demo;

import org.junit.jupiter.api.Disabled;
import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@Disabled("CI実行環境（GitHub Actions）ではDBが無いのでスキップ")
@SpringBootTest
class TodoBackendApplicationTests {

	@Test
	void contextLoads() {
	}

}
