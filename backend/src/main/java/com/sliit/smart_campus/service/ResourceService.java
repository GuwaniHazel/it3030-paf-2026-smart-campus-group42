package com.sliit.smart_campus.service;

import com.sliit.smart_campus.entity.Resource;
import com.sliit.smart_campus.exception.ResourceNotFoundException;
import com.sliit.smart_campus.repository.ResourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ResourceService {

    @Autowired
    private ResourceRepository resourceRepository;

    public List<Resource> getAllResources() {
        return resourceRepository.findAll();
    }

    public Resource getResourceById(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));
    }

    public Resource createResource(Resource resource) {
        validateRequiredFields(resource);
        return resourceRepository.save(resource);
    }

    public Resource updateResource(Long id, Resource resource) {
        Resource existingResource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(id));

        validateRequiredFields(resource);

        existingResource.setName(resource.getName());
        existingResource.setType(resource.getType());
        existingResource.setCapacity(resource.getCapacity());
        existingResource.setLocation(resource.getLocation());
        existingResource.setAvailabilityWindows(resource.getAvailabilityWindows());
        existingResource.setStatus(resource.getStatus());
        existingResource.setDescription(resource.getDescription());

        return resourceRepository.save(existingResource);
    }

    public void deleteResource(Long id) {
        if (!resourceRepository.existsById(id)) {
            throw new ResourceNotFoundException(id);
        }
        resourceRepository.deleteById(id);
    }

    public List<Resource> searchByType(String type) {
        return resourceRepository.findByType(type);
    }

    public List<Resource> searchByStatus(String status) {
        return resourceRepository.findByStatus(status);
    }

    public List<Resource> searchByLocation(String location) {
        return resourceRepository.findByLocation(location);
    }

    public List<Resource> searchByCapacity(Integer minCapacity) {
        if (minCapacity == null) {
            throw new IllegalArgumentException("Minimum capacity is required");
        }
        return resourceRepository.findByCapacityGreaterThanEqual(minCapacity);
    }

    private void validateRequiredFields(Resource resource) {
        if (resource == null) {
            throw new IllegalArgumentException("Resource payload is required");
        }

        if (isBlank(resource.getName())) {
            throw new IllegalArgumentException("Name is required");
        }

        if (isBlank(resource.getType())) {
            throw new IllegalArgumentException("Type is required");
        }

        if (isBlank(resource.getLocation())) {
            throw new IllegalArgumentException("Location is required");
        }

        if (isBlank(resource.getStatus())) {
            throw new IllegalArgumentException("Status is required");
        }

        if (!"ACTIVE".equals(resource.getStatus()) && !"OUT_OF_SERVICE".equals(resource.getStatus())) {
            throw new IllegalArgumentException("Status must be ACTIVE or OUT_OF_SERVICE");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.trim().isEmpty();
    }
}
