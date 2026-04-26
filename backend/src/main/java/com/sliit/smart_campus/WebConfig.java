package com.sliit.smart_campus;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import org.springframework.web.filter.CorsFilter;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.util.List;

/**
 * Global CORS configuration using a CorsFilter bean.
 *
 * WHY CorsFilter instead of WebMvcConfigurer.addCorsMappings()?
 * ─────────────────────────────────────────────────────────────
 * WebMvcConfigurer CORS runs inside Spring MVC's DispatcherServlet.
 * Multipart requests (file uploads) are parsed by MultipartResolver
 * BEFORE the MVC interceptor chain executes, so CORS headers never get
 * appended. A CorsFilter is a plain Servlet Filter — it fires first,
 * before any Spring MVC processing — guaranteeing CORS headers on every
 * response: plain JSON, multipart/form-data POSTs, and OPTIONS preflights.
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Bean
    public CorsFilter corsFilter() {
        CorsConfiguration config = new CorsConfiguration();

        // Allowed frontend origins
        config.setAllowedOrigins(List.of(
                "http://localhost:3000",
                "http://localhost:3001"
        ));

        // All standard HTTP methods including OPTIONS (preflight)
        config.setAllowedMethods(List.of(
                "GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"
        ));

        // Allow all request headers (Content-Type, multipart boundaries, etc.)
        config.setAllowedHeaders(List.of("*"));

        // No credentials (cookies / Authorization headers) required
        config.setAllowCredentials(false);

        // Cache preflight response for 1 hour
        config.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/api/**", config);

        return new CorsFilter(source);
    }
}
