package com.sliit.ticketmanagement.repository;

import com.sliit.ticketmanagement.model.CommentModel;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<CommentModel, Long> {

    List<CommentModel> findByTicketId(Long ticketId);
}