package com.sliit.smart_campus.service;

import com.sliit.smart_campus.entity.Comment;
import com.sliit.smart_campus.repository.CommentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class CommentService {
    @Autowired
    private CommentRepository commentRepository;
    
    public List<Comment> getAllComments() {
        return commentRepository.findAll();
    }
    
    public Comment getCommentById(Long id) {
        return commentRepository.findById(id).orElse(null);
    }
    
    public Comment createComment(Comment comment) {
        return commentRepository.save(comment);
    }
    
    public Comment addComment(Comment comment) {
        return commentRepository.save(comment);
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
}
