package com.sliit.smart_campus.controller;

import com.sliit.smart_campus.model.CommentModel;
import com.sliit.smart_campus.service.CommentService;
import org.springframework.http.ResponseEntity;
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
    public ResponseEntity<CommentModel> addComment(@RequestBody CommentModel comment) {
        return ResponseEntity.ok(commentService.addComment(comment));
    }

    @GetMapping("/{ticketId}")
    public ResponseEntity<List<CommentModel>> getComments(@PathVariable Long ticketId) {
        return ResponseEntity.ok(commentService.getCommentsByTicket(ticketId));
    }
}