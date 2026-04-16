package com.sliit.smart_campus.controller;

import com.sliit.smart_campus.entity.Resource;
import com.sliit.smart_campus.exception.ResourceNotFoundException;
import com.sliit.smart_campus.service.ResourceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resources")
@CrossOrigin(origins = "http://localhost:3000")
public class ResourceController {

    @Autowired
    private ResourceService resourceService;

    @GetMapping
    public ResponseEntity<List<Resource>> getAllResources(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Integer minCapacity) {

        if (minCapacity != null && minCapacity < 0) {
            throw new IllegalArgumentException("minCapacity must be greater than or equal to 0");
        }

        List<Resource> resources = resourceService.getAllResources();

        if (hasText(type)) {
            resources = resources.stream()
                    .filter(resource -> type.equalsIgnoreCase(resource.getType()))
                    .collect(Collectors.toList());
        }

        if (hasText(status)) {
            resources = resources.stream()
                    .filter(resource -> status.equalsIgnoreCase(resource.getStatus()))
                    .collect(Collectors.toList());
        }

        if (hasText(location)) {
            resources = resources.stream()
                    .filter(resource -> location.equalsIgnoreCase(resource.getLocation()))
                    .collect(Collectors.toList());
        }

        if (minCapacity != null) {
            resources = resources.stream()
                    .filter(resource -> resource.getCapacity() != null && resource.getCapacity() >= minCapacity)
                    .collect(Collectors.toList());
        }

        return ResponseEntity.ok(resources);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Resource> getResourceById(@PathVariable Long id) {
        validateId(id);
        return ResponseEntity.ok(resourceService.getResourceById(id));
    }

    @PostMapping
    public ResponseEntity<Resource> createResource(@RequestBody Resource resource) {
        validateResourceInput(resource);
        Resource createdResource = resourceService.createResource(resource);
        URI location = URI.create("/api/resources/" + createdResource.getId());
        return ResponseEntity.created(location).body(createdResource);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Resource> updateResource(@PathVariable Long id, @RequestBody Resource resource) {
        validateId(id);
        validateResourceInput(resource);
        return ResponseEntity.ok(resourceService.updateResource(id, resource));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteResource(@PathVariable Long id) {
        validateId(id);
        resourceService.deleteResource(id);
        return ResponseEntity.noContent().build();
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, String>> handleResourceNotFound(ResourceNotFoundException ex) {
        return errorResponse(ex.getMessage(), HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleIllegalArgument(IllegalArgumentException ex) {
        return errorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST);
    }

    private ResponseEntity<Map<String, String>> errorResponse(String message, HttpStatus status) {
        Map<String, String> body = new HashMap<>();
        body.put("message", message);
        body.put("status", String.valueOf(status.value()));
        return ResponseEntity.status(status).body(body);
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Id must be a positive number");
        }
    }

    private void validateResourceInput(Resource resource) {
        if (resource == null) {
            throw new IllegalArgumentException("Request body is required");
        }

        if (!hasText(resource.getName())) {
            throw new IllegalArgumentException("Name is required");
        }

        if (!hasText(resource.getType())) {
            throw new IllegalArgumentException("Type is required");
        }

        if (!hasText(resource.getLocation())) {
            throw new IllegalArgumentException("Location is required");
        }

        if (!hasText(resource.getStatus())) {
            throw new IllegalArgumentException("Status is required");
        }
    }

    private boolean hasText(String value) {
        return value != null && !value.trim().isEmpty();
    }
}
