package com.sliit.smart_campus.service;

import com.sliit.smart_campus.entity.NotificationType;
import com.sliit.smart_campus.entity.Ticket;
import com.sliit.smart_campus.entity.User;
import com.sliit.smart_campus.repository.TicketRepository;
import com.sliit.smart_campus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public List<Ticket> getAllTickets() {
        return ticketRepository.findAll();
    }

    public Ticket getTicketById(Long id) {
        return ticketRepository.findById(id).orElse(null);
    }

    @Transactional
    public Ticket createTicket(Ticket ticket) {
        Ticket savedTicket = ticketRepository.save(ticket);
        
        // Notify assigned staff if present
        if (savedTicket.getAssignedTo() != null && !savedTicket.getAssignedTo().isEmpty()) {
            userRepository.findByUsername(savedTicket.getAssignedTo()).ifPresent(staff -> {
                notificationService.createNotification(
                    staff,
                    "New Ticket Assigned",
                    "A new ticket has been assigned to you: " + savedTicket.getTitle(),
                    NotificationType.TICKET_UPDATE,
                    "/tickets/" + savedTicket.getId()
                );
            });
        }
        
        return savedTicket;
    }

    public void deleteTicket(Long id) {
        ticketRepository.deleteById(id);
    }

    @Transactional
    public Ticket assignTicket(Long id, String assignedTo) {
        Ticket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket != null) {
            String oldAssignee = ticket.getAssignedTo();
            ticket.setAssignedTo(assignedTo);
            Ticket updatedTicket = ticketRepository.save(ticket);

            // Notify new assignee
            userRepository.findByUsername(assignedTo).ifPresent(staff -> {
                notificationService.createNotification(
                    staff,
                    "Ticket Assigned",
                    "Ticket '" + updatedTicket.getTitle() + "' has been assigned to you.",
                    NotificationType.TICKET_UPDATE,
                    "/tickets/" + updatedTicket.getId()
                );
            });

            // Notify old assignee if exists
            if (oldAssignee != null && !oldAssignee.equals(assignedTo)) {
                userRepository.findByUsername(oldAssignee).ifPresent(oldStaff -> {
                    notificationService.createNotification(
                        oldStaff,
                        "Ticket Unassigned",
                        "Ticket '" + updatedTicket.getTitle() + "' has been unassigned from you.",
                        NotificationType.TICKET_UPDATE,
                        "/tickets/" + updatedTicket.getId()
                    );
                });
            }

            return updatedTicket;
        }
        return null;
    }

    @Transactional
    public Ticket updateTicketStatus(Long id, String status) {
        Ticket ticket = ticketRepository.findById(id).orElse(null);
        if (ticket != null) {
            ticket.setStatus(status);
            Ticket updatedTicket = ticketRepository.save(ticket);

            // Notify student
            userRepository.findByEmail(updatedTicket.getStudentEmail()).ifPresent(student -> {
                notificationService.createNotification(
                    student,
                    "Ticket Status Update",
                    "The status of your ticket '" + updatedTicket.getTitle() + "' has been updated to " + status,
                    NotificationType.TICKET_UPDATE,
                    "/tickets/" + updatedTicket.getId()
                );
            });

            // Notify assigned staff
            if (updatedTicket.getAssignedTo() != null) {
                userRepository.findByUsername(updatedTicket.getAssignedTo()).ifPresent(staff -> {
                    notificationService.createNotification(
                        staff,
                        "Ticket Status Update",
                        "The status of ticket '" + updatedTicket.getTitle() + "' has been updated to " + status,
                        NotificationType.TICKET_UPDATE,
                        "/tickets/" + updatedTicket.getId()
                    );
                });
            }

            return updatedTicket;
        }
        return null;
    }
}