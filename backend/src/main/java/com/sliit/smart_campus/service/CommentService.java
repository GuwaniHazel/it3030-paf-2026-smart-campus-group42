package com.sliit.smart_campus.service;

import com.sliit.smart_campus.model.CommentModel;
import com.sliit.smart_campus.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    public CommentModel addComment(CommentModel comment) {
        return commentRepository.save(comment);
    }

    public List<CommentModel> getCommentsByTicket(Long ticketId) {
        return commentRepository.findByTicketId(ticketId);
    }
}