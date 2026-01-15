package com.ginger.backend.api;

import com.ginger.backend.ai.MealAiService;
import com.ginger.backend.api.dto.ParseMealRequest;
import com.ginger.backend.api.dto.ParseMealResponse;
import com.ginger.backend.api.dto.LogMealResponse;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final MealAiService mealAiService;

    public AiController(MealAiService mealAiService) {
        this.mealAiService = mealAiService;
    }

    @PostMapping("/parse-meal")
    public ParseMealResponse parseMeal(@Valid @RequestBody ParseMealRequest req) {
        return mealAiService.parseMeal(req.text());
    }

    @PostMapping("/log-meal")
    public LogMealResponse logMeal(@Valid @RequestBody ParseMealRequest req) {
        return mealAiService.parseAndLogMeal(req.userId(), req.text());
    }

}
