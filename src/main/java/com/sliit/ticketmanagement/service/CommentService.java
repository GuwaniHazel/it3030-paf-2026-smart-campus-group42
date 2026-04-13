package com.sliit.ticketmanagement.service;

import com.sliit.ticketmanagement.model.CommentModel;
import com.sliit.ticketmanagement.repository.CommentRepository;
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