package com.sliit.smart_campus.repository;

import com.sliit.smart_campus.model.CommentModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<CommentModel, Long> {

    List<CommentModel> findByTicketId(Long ticketId);
}