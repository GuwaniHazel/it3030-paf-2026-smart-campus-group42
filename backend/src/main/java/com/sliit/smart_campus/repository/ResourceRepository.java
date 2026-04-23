package com.sliit.smart_campus.repository;

import com.sliit.smart_campus.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends JpaRepository<Resource, Long> {

    List<Resource> findByType(String type);

    List<Resource> findByStatus(String status);

    List<Resource> findByLocation(String location);

    List<Resource> findByCapacityGreaterThanEqual(Integer capacity);
}
