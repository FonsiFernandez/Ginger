# --- build stage ---
FROM gradle:8-jdk17 AS build
WORKDIR /app

# Copiamos solo el backend
COPY backend/ /app/

# Build (sin tests para acelerar)
RUN gradle clean bootJar -x test

# --- runtime stage ---
FROM eclipse-temurin:17-jre
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

# Render inyecta PORT; Spring leerá ${PORT:8081}
CMD ["java", "-jar", "app.jar"]
