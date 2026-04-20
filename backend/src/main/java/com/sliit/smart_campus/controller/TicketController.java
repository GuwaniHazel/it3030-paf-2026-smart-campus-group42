package com.sliit.smart_campus.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.sliit.smart_campus.model.TicketModel;
import com.sliit.smart_campus.service.TicketService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/tickets")
@CrossOrigin
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketModel> createTicket(@Valid @RequestBody TicketModel ticketModel) {
        TicketModel savedTicket = ticketService.createTicket(ticketModel);
        return ResponseEntity.ok(savedTicket);
    }

    @PostMapping("/upload")
    public ResponseEntity<TicketModel> createTicketWithFile(
            @RequestParam(value = "file", required = false) MultipartFile file,
            @RequestParam("data") String data) {

        try {
            ObjectMapper mapper = new ObjectMapper();
            TicketModel ticket = mapper.readValue(data, TicketModel.class);

            String fileName = null;

            if (file != null && !file.isEmpty()) {
                fileName = System.currentTimeMillis() + "_" + file.getOriginalFilename();
                Path uploadPath = Paths.get("uploads");

                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }

                Path filePath = uploadPath.resolve(fileName);
                Files.write(filePath, file.getBytes());
            }

            ticket.setAttachment(fileName);

            TicketModel saved = ticketService.createTicket(ticket);
            return ResponseEntity.ok(saved);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<TicketModel>> getAllTickets() {
        return ResponseEntity.ok(ticketService.getAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TicketModel> getTicketById(@PathVariable Long id) {
        TicketModel ticket = ticketService.getTicketById(id);

        if (ticket == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(ticket);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TicketModel> updateTicket(
            @PathVariable Long id,
            @Valid @RequestBody TicketModel updatedTicket) {

        TicketModel existing = ticketService.getTicketById(id);

        if (existing == null) {
            return ResponseEntity.notFound().build();
        }

        existing.setTitle(updatedTicket.getTitle());
        existing.setCategory(updatedTicket.getCategory());
        existing.setDescription(updatedTicket.getDescription());
        existing.setPriority(updatedTicket.getPriority());
        existing.setStatus(updatedTicket.getStatus());
        existing.setResourceName(updatedTicket.getResourceName());
        existing.setLocation(updatedTicket.getLocation());
        existing.setPreferredContact(updatedTicket.getPreferredContact());
        existing.setCreatedBy(updatedTicket.getCreatedBy());
        existing.setStudentId(updatedTicket.getStudentId());
        existing.setStudentEmail(updatedTicket.getStudentEmail());
        existing.setAssignedTo(updatedTicket.getAssignedTo());
        existing.setResolutionNote(updatedTicket.getResolutionNote());
        existing.setAttachment(updatedTicket.getAttachment());

        return ResponseEntity.ok(ticketService.createTicket(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTicket(@PathVariable Long id) {
        ticketService.deleteTicket(id);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/assign")
    public ResponseEntity<TicketModel> assignTicket(
            @PathVariable Long id,
            @RequestParam String assignedTo) {

        TicketModel updated = ticketService.assignTicket(id, assignedTo);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TicketModel> updateStatus(
            @PathVariable Long id,
            @RequestParam String status) {

        TicketModel updated = ticketService.updateTicketStatus(id, status);

        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }
}