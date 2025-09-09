# ---- Build stage ----
FROM gradle:8.8-jdk21 AS build
WORKDIR /app
COPY build.gradle settings.gradle gradlew gradle/ ./
RUN ./gradlew --version
COPY src ./src
RUN ./gradlew clean bootJar -x test

# ---- Run stage ----
FROM eclipse-temurin:21-jre
WORKDIR /app
ENV SPRING_PROFILES_ACTIVE=prod \
    JAVA_OPTS=""
EXPOSE 8081
COPY --from=build /app/build/libs/*-SNAPSHOT.jar /app/app.jar
ENTRYPOINT ["sh","-c","java $JAVA_OPTS -jar /app/app.jar"]
