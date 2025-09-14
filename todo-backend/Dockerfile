# ---- Build stage ----
FROM gradle:8.8-jdk21 AS build
WORKDIR /app
# 1) まず wrapper と設定だけコピー（キャッシュ効かせる）
#COPY build.gradle settings.gradle gradlew gradle/ ./
# 2) gradlew の改行をLF化＆実行権限付与 
#RUN sed -i 's/\r$//' gradlew && chmod +x gradlew
COPY build.gradle settings.gradle ./

# 動作確認（任意）
RUN gradle --version

# 3) 残りのソース
COPY src ./src

# 4) ビルド
RUN gradle clean bootJar -x test

# ---- Run stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""
EXPOSE 8081
COPY --from=build /app/build/libs/app.jar /app/app.jar
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
