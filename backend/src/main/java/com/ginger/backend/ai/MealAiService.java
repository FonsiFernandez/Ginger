package com.ginger.backend.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.ginger.backend.api.dto.FoodLogDto;
import com.ginger.backend.api.dto.LogMealResponse;
import com.ginger.backend.api.dto.MealItemDto;
import com.ginger.backend.api.dto.ParseMealResponse;
import com.ginger.backend.domain.FoodLog;
import com.ginger.backend.repo.FoodLogRepo;
import com.ginger.backend.repo.UserProfileRepo;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import static com.ginger.backend.api.DtoMapper.toDto;

@Service
public class MealAiService {

    private final GeminiAiClient gemini;
    private final com.fasterxml.jackson.databind.ObjectMapper mapper;

    private final UserProfileRepo userRepo;
    private final FoodLogRepo foodRepo;

    public MealAiService(GeminiAiClient gemini,
                         com.fasterxml.jackson.databind.ObjectMapper mapper,
                         UserProfileRepo userRepo,
                         FoodLogRepo foodRepo) {
        this.gemini = gemini;
        this.mapper = mapper;
        this.userRepo = userRepo;
        this.foodRepo = foodRepo;
    }

    public ParseMealResponse parseMeal(String text) {
        String prompt = """
      You are a nutrition assistant.
      Convert the user's free-text meal into a STRICT JSON object and output ONLY JSON (no markdown, no code fences, no commentary).

      Schema:
      {
        "description": string,
        "totalCalories": number,
        "totalProteinG": number,
        "totalCarbsG": number,
        "totalFatG": number,
        "items": [
          {
            "name": string,
            "quantity": string,
            "calories": number,
            "proteinG": number,
            "carbsG": number,
            "fatG": number
          }
        ]
      }

      Rules:
      - If quantities are missing, make reasonable assumptions and set quantity as a human-friendly string.
      - Totals must approximately match the sum of items (rounding OK).
      - Do not add extra keys.

      User meal text: "%s"
    """.formatted(text.replace("\"", "'"));

        String raw = gemini.generateText(prompt);

        // Por si Gemini devuelve ```json ... ``` lo limpiamos
        String cleaned = stripCodeFences(raw);

        try {
            JsonNode json = mapper.readTree(cleaned);

            String description = json.path("description").asText(text);
            double totalCalories = json.path("totalCalories").asDouble(0);
            double totalProtein = json.path("totalProteinG").asDouble(0);
            double totalCarbs = json.path("totalCarbsG").asDouble(0);
            double totalFat = json.path("totalFatG").asDouble(0);

            List<MealItemDto> items = new ArrayList<>();
            JsonNode itemsNode = json.path("items");
            if (itemsNode.isArray()) {
                for (JsonNode i : itemsNode) {
                    items.add(new MealItemDto(
                            i.path("name").asText(null),
                            i.path("quantity").asText(null),
                            i.path("calories").isNumber() ? i.path("calories").asDouble() : null,
                            i.path("proteinG").isNumber() ? i.path("proteinG").asDouble() : null,
                            i.path("carbsG").isNumber() ? i.path("carbsG").asDouble() : null,
                            i.path("fatG").isNumber() ? i.path("fatG").asDouble() : null
                    ));
                }
            }

            return new ParseMealResponse(
                    description,
                    totalCalories,
                    totalProtein,
                    totalCarbs,
                    totalFat,
                    items
            );

        } catch (Exception e) {
            throw new IllegalStateException("Failed to parse Gemini JSON. Raw text was:\n" + raw, e);
        }
    }

    private static String stripCodeFences(String s) {
        String t = s.trim();
        // remove ```json ... ```
        if (t.startsWith("```")) {
            t = t.replaceFirst("^```[a-zA-Z]*\\s*", "");
            t = t.replaceFirst("\\s*```\\s*$", "");
        }
        return t.trim();
    }

    public LogMealResponse parseAndLogMeal(Long userId, String text) {
        ParseMealResponse ai = parseMeal(text);

        var user = userRepo.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        FoodLog log = FoodLog.builder()
                .user(user)
                .eatenAt(Instant.now())
                .description(ai.description() != null ? ai.description() : text)
                .calories(ai.totalCalories())
                .proteinG(ai.totalProteinG())
                .carbsG(ai.totalCarbsG())
                .fatG(ai.totalFatG())
                .build();

        FoodLog saved = foodRepo.save(log);

        FoodLogDto dto = toDto(saved);
        return new LogMealResponse(dto, ai);
    }
}
