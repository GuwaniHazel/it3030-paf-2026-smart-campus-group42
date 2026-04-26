package com.sliit.smart_campus.service;

import com.sliit.smart_campus.entity.Comment;
import com.sliit.smart_campus.entity.NotificationType;
import com.sliit.smart_campus.entity.Ticket;
import com.sliit.smart_campus.repository.CommentRepository;
import com.sliit.smart_campus.repository.TicketRepository;
import com.sliit.smart_campus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommentService {

    private final CommentRepository commentRepository;
    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }
    
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id).orElse(null);
    }
    
    @Transactional
    public Comment createComment(Comment comment) {
        Comment savedComment = commentRepository.save(comment);
        notifyRelevantParties(savedComment);
        return savedComment;
    }
    
    @Transactional
    public Comment addComment(Comment comment) {
        Comment savedComment = commentRepository.save(comment);
        notifyRelevantParties(savedComment);
        return savedComment;
    }
    
    public void deleteComment(Long id) {
        commentRepository.deleteById(id);
    }
    
    public List<Comment> getCommentsByTicketId(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }
    
    public List<Comment> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }

    private void notifyRelevantParties(Comment comment) {
        ticketRepository.findById(comment.getTicketId()).ifPresent(ticket -> {
            // 1. Notify Student (Ticket Creator)
            userRepository.findByEmail(ticket.getStudentEmail()).ifPresent(student -> {
                if (!student.getUsername().equals(comment.getUsername())) {
                    notificationService.createNotification(
                        student,
                        "New Comment on Ticket",
                        "A new comment was added to your ticket: " + ticket.getTitle(),
                        NotificationType.TICKET_UPDATE,
                        "/tickets/" + ticket.getId()
                    );
                }
            });

            // 2. Notify Assigned Staff
            if (ticket.getAssignedTo() != null) {
                userRepository.findByUsername(ticket.getAssignedTo()).ifPresent(staff -> {
                    if (!staff.getUsername().equals(comment.getUsername())) {
                        notificationService.createNotification(
                            staff,
                            "New Comment on Ticket",
                            "A new comment was added to ticket: " + ticket.getTitle(),
                            NotificationType.TICKET_UPDATE,
                            "/tickets/" + ticket.getId()
                        );
                    }
                });
            }
        });
    }
}
