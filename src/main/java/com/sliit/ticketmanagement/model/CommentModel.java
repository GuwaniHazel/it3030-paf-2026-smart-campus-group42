package com.sliit.ticketmanagement.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
public class CommentModel {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long ticketId;

    private String user;

    @Column(length = 1000)
    private String message;

    private LocalDateTime createdAt;

    public CommentModel() {}

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // getters setters

    public Long getId() { return id; }

    public Long getTicketId() { return ticketId; }
    public void setTicketId(Long ticketId) { this.ticketId = ticketId; }

    public String getUser() { return user; }
    public void setUser(String user) { this.user = user; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getCreatedAt() { return createdAt; }
}