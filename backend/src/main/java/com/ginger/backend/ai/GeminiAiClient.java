package com.ginger.backend.ai;

import java.io.IOException;
import com.google.genai.Client;
import com.google.genai.types.GenerateContentResponse;
import org.apache.http.HttpException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GeminiAiClient {

    private final String model;
    private Client client; // lazy

    public GeminiAiClient(@Value("${app.ai.model:gemini-3-flash-preview}") String model) {
        this.model = model;
    }

    public String generateText(String prompt) {
        ensureClient();

        try {
            GenerateContentResponse response =
                    client.models.generateContent(model, prompt, null);

            String text = response.text();
            if (text == null || text.isBlank()) {
                throw new IllegalStateException("Gemini returned empty text");
            }
            return text.trim();

        } catch (IOException e) {
            throw new IllegalStateException("Error calling Gemini API", e);
        } catch (HttpException e) {
            throw new RuntimeException(e);
        }
    }

    private void ensureClient() {
        if (client != null) return;

        String apiKey = System.getenv("GEMINI_API_KEY");
        if (apiKey == null || apiKey.isBlank()) {
            // OJO: aquí falla SOLO cuando llamas al endpoint de IA, no al arrancar la app.
            throw new IllegalStateException("Missing GEMINI_API_KEY environment variable");
        }

        // Dependiendo de la versión del SDK, el builder puede variar.
        // Este es el patrón habitual:
        this.client = Client.builder()
                .apiKey(apiKey)
                .build();
    }
}
