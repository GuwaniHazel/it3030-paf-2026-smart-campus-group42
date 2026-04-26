package com.sliit.smart_campus.controller;

import com.sliit.smart_campus.entity.Comment;
import com.sliit.smart_campus.service.CommentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'STAFF')")
    public ResponseEntity<Comment> addComment(@RequestBody Comment comment) {
        return ResponseEntity.ok(commentService.addComment(comment));
    }

    @GetMapping("/{ticketId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN', 'STAFF')")
    public ResponseEntity<List<Comment>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(ticketId));
    }
}