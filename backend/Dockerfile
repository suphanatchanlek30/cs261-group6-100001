# ---- Build stage ----
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline
COPY src ./src
RUN mvn -B -DskipTests package

# ---- Run stage ----
FROM eclipse-temurin:17-jre
WORKDIR /app

# ตั้งค่า locale และ encoding รองรับภาษาไทย
ENV LANG=C.UTF-8
ENV LC_ALL=C.UTF-8
ENV JAVA_TOOL_OPTIONS="-Dfile.encoding=UTF-8"

COPY --from=build /app/target/*.war /app/app.war
EXPOSE 8080
ENTRYPOINT ["java","-Dfile.encoding=UTF-8","-Dsun.jnu.encoding=UTF-8","-jar","/app/app.war"]
