package com.sliit.smart_campus;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;

@SpringBootApplication(scanBasePackages = {
        "com.sliit.smart_campus",   // tickets, resources, comments, etc.
        "backend.backend"           // booking module
})
@EntityScan(basePackages = {
        "com.sliit.smart_campus.entity",
        "backend.backend.booking.model"
})
@EnableJpaRepositories(basePackages = {
        "com.sliit.smart_campus.repository",
        "backend.backend.booking.repository"
})
public class SmartCampusApplication {

	public static void main(String[] args) {
		SpringApplication.run(SmartCampusApplication.class, args);
	}

}
