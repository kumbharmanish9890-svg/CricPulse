FROM maven:3.9.9-eclipse-temurin-17 AS build

WORKDIR /app

COPY .mvn .mvn
COPY mvnw .
COPY pom.xml .

RUN chmod +x mvnw

COPY src src

RUN mvn -s /root/.m2/settings.xml clean package -DskipTests

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY settings.xml /root/.m2/settings.xml

COPY --from=build /app/target/cricpulse-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["sh", "-c", "java -jar app.jar --server.port=${PORT:-8080}"]
